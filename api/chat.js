/* global process */
// Vercel Serverless Function for Claude API (Anthropic)
// This keeps your API key secure on the server
const CHAT_RATE_LIMIT_WINDOW_MS = Number(process.env.CHAT_RATE_LIMIT_WINDOW_MS || 60000);
const CHAT_RATE_LIMIT_MAX = Number(process.env.CHAT_RATE_LIMIT_MAX || 30);
const chatRateLimit = new Map();

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || 'unknown';
}

function isRateLimited(store, key, windowMs, maxRequests) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || now - current.windowStart > windowMs) {
    store.set(key, { windowStart: now, count: 1 });
    return false;
  }

  current.count += 1;
  if (current.count > maxRequests) {
    return true;
  }

  store.set(key, current);
  return false;
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Client-Key');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }


  // Optional shared client key guard (enable by setting API_CLIENT_KEY)
  if (process.env.API_CLIENT_KEY) {
    const clientKey = req.headers['x-client-key'];
    if (clientKey !== process.env.API_CLIENT_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  // Basic per-IP rate limiting
  const clientIp = getClientIp(req);
  if (isRateLimited(chatRateLimit, clientIp, CHAT_RATE_LIMIT_WINDOW_MS, CHAT_RATE_LIMIT_MAX)) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  // Parse body if needed
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const { messages, context } = body || {};

  // Debug logging
  console.log('=== /api/chat request ===');
  console.log('Context:', JSON.stringify(context, null, 2));

  // Check for API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not configured');
    return res.status(200).json({
      message: getFallbackResponse(context),
      success: true,
      fallback: true
    });
  }

  // Build messages for Claude - it handles alternation automatically
  let finalMessages = messages;
  if (!finalMessages || !Array.isArray(finalMessages) || finalMessages.length === 0) {
    finalMessages = [{ role: 'user', content: context?.trigger || 'Say something encouraging!' }];
  }

  // Claude requires messages to start with 'user' role
  if (finalMessages[0]?.role !== 'user') {
    finalMessages = [{ role: 'user', content: context?.trigger || 'Hello!' }, ...finalMessages];
  }

  // Determine language for response
  const lang = context?.language || 'en';
  const isChineseMode = lang === 'zh' || lang === 'yue';

  // System prompt for the AI companion - language-aware
  const systemPrompt = isChineseMode
    ? `你是一个温暖、友好的AI伙伴，陪伴新加坡老人玩大脑训练游戏。

个性和语言：
- 用简单、亲切的中文说话，像家人一样温暖
- 回复要简短（最多1-2句话）- 老人更喜欢简洁、清晰的信息
- 用简单的词语，要有耐心，不要催促他们
- 可以偶尔用新加坡式的表达，但要自然

背景信息：
- 当前游戏：${context?.game || '主菜单'}
- 玩家名字：${context?.playerName || '朋友'}
- 游戏状态：${context?.state || '空闲'}
- 分数/进度：${context?.score || '无'}

回复例子：
- 鼓励："很好！继续加油！"
- 提示："不急，慢慢来。"
- 庆祝："太棒了！你完成了！"
- 安慰："没关系，再试一次就好。"
- 提醒："记得喝点水哦！"

重要 - TTS兼容性：
- 绝对不要使用表情符号 - 文字转语音会逐字读出
- 绝对不要使用星号包裹的动作词如*鼓掌*或*欢呼* - TTS会读出来
- 绝对不要使用特殊字符或符号
- 只写自然朗读时听起来正常的纯文本
- 不要用括号表达如（笑）或（微笑）

重点：
- 真诚、温暖，不要太夸张
- 像真人一样说话
- 如果他们卡住了，轻轻提供帮助
- 真诚地庆祝他们的进步`
    : `You are a warm, friendly AI companion for elderly Singaporeans playing brain training games.

PERSONALITY & LANGUAGE:
- Speak in natural Singapore English - casual and warm, like talking to a family member
- Keep responses SHORT (1-2 sentences max) - elderly users prefer brief, clear messages
- Use simple words, be patient, never rush them
- You can occasionally use particles like "lah" or "ah" but don't overdo it - keep it natural, not stereotypical

CONTEXT AWARENESS:
- Current game: ${context?.game || 'main menu'}
- Player name: ${context?.playerName || 'friend'}
- Game state: ${context?.state || 'idle'}
- Score/Progress: ${context?.score || 'N/A'}

RESPONSE EXAMPLES:
- Encouragement: "Nice one! You're doing well."
- Hints: "No rush, take your time. Maybe try the top left?"
- Celebration: "Well done! You finished it! Want to rest or keep going?"
- Comfort: "It's okay, just try again. No pressure."
- Reminders: "Remember to drink some water!"

CRITICAL - TTS COMPATIBILITY:
- NEVER use emojis - they will be read aloud literally by text-to-speech
- NEVER use action words in asterisks like *clapping* or *cheering* - TTS reads them out
- NEVER use special characters or symbols
- Write ONLY plain text that sounds natural when read aloud
- No parenthetical expressions like (laughs) or (smiles)

IMPORTANT:
- Be genuine and warm, not over-the-top or exaggerated
- Sound like a real person, not a caricature
- Gently offer help if they seem stuck
- Celebrate their progress sincerely`;

  try {
    // Add 10 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 150,
        system: systemPrompt,
        messages: finalMessages
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      return res.status(200).json({
        message: getFallbackResponse(context),
        success: true,
        fallback: true
      });
    }

    const data = await response.json();
    const aiMessage = data.content?.[0]?.text || getFallbackResponse(context);

    return res.status(200).json({
      message: aiMessage,
      success: true
    });

  } catch (error) {
    console.error('Error calling Claude:', error);
    return res.status(200).json({
      message: getFallbackResponse(context),
      success: true,
      fallback: true
    });
  }
}

// Fallback responses if API fails
function getFallbackResponse(context) {
  const lang = context?.language || 'en';
  const isChineseMode = lang === 'zh' || lang === 'yue';

  const fallbacksEn = {
    'menu': [
      "What game do you want to play today?",
      "So many games to choose from! Which one?",
      "Let's exercise our brain! Pick any game."
    ],
    'memory': [
      "Take your time, no rush!",
      "You're doing well! Keep going.",
      "Try flipping another card."
    ],
    'whack': [
      "Quick, tap the mole!",
      "You got this!",
      "Nice reflexes!"
    ],
    'math': [
      "You can do this!",
      "Take your time to calculate.",
      "Great job solving problems!"
    ],
    'sequence': [
      "Watch carefully!",
      "You've got good memory!",
      "Try to remember the pattern."
    ],
    'wordsearch': [
      "Look carefully at the letters.",
      "You're finding words well!",
      "Keep searching!"
    ],
    'numbersorting': [
      "Sort them carefully!",
      "You're getting faster!",
      "Nice ordering skills!"
    ],
    'quiz': [
      "Think carefully!",
      "No hurry, take your time.",
      "You know this one, just think!"
    ],
    'default': [
      "You're doing great!",
      "Keep going!",
      "Nice work!"
    ]
  };

  const fallbacksZh = {
    'menu': [
      "今天想玩什么游戏？",
      "这么多游戏可以选！想玩哪个？",
      "来锻炼大脑吧！选一个游戏。"
    ],
    'memory': [
      "慢慢来，不急！",
      "很好！继续加油。",
      "试试翻另一张牌。"
    ],
    'whack': [
      "快点打地鼠！",
      "你可以的！",
      "反应真快！"
    ],
    'math': [
      "你可以的！",
      "慢慢算，不急。",
      "算得真好！"
    ],
    'sequence': [
      "仔细看！",
      "记忆力真好！",
      "试着记住顺序。"
    ],
    'wordsearch': [
      "仔细看字母。",
      "找词找得好！",
      "继续找！"
    ],
    'numbersorting': [
      "仔细排序！",
      "越来越快了！",
      "排序能力真棒！"
    ],
    'quiz': [
      "仔细想想！",
      "不急，慢慢来。",
      "你知道答案的，想一想！"
    ],
    'default': [
      "做得很好！",
      "继续加油！",
      "真棒！"
    ]
  };

  const fallbacks = isChineseMode ? fallbacksZh : fallbacksEn;
  const responses = fallbacks[context?.game] || fallbacks.default;
  return responses[Math.floor(Math.random() * responses.length)];
}



