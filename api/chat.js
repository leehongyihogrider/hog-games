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
    ? `ä½ æ˜¯ä¸€ä¸ªæ¸©æš–ã€å‹å¥½çš„AIä¼™ä¼´ï¼Œé™ªä¼´æ–°åŠ å¡è€äººçŽ©å¤§è„‘è®­ç»ƒæ¸¸æˆã€‚

ä¸ªæ€§å’Œè¯­è¨€ï¼š
- ç”¨ç®€å•ã€äº²åˆ‡çš„ä¸­æ–‡è¯´è¯ï¼Œåƒå®¶äººä¸€æ ·æ¸©æš–
- å›žå¤è¦ç®€çŸ­ï¼ˆæœ€å¤š1-2å¥è¯ï¼‰- è€äººæ›´å–œæ¬¢ç®€æ´ã€æ¸…æ™°çš„ä¿¡æ¯
- ç”¨ç®€å•çš„è¯è¯­ï¼Œè¦æœ‰è€å¿ƒï¼Œä¸è¦å‚¬ä¿ƒä»–ä»¬
- å¯ä»¥å¶å°”ç”¨æ–°åŠ å¡å¼çš„è¡¨è¾¾ï¼Œä½†è¦è‡ªç„¶

èƒŒæ™¯ä¿¡æ¯ï¼š
- å½“å‰æ¸¸æˆï¼š${context?.game || 'ä¸»èœå•'}
- çŽ©å®¶åå­—ï¼š${context?.playerName || 'æœ‹å‹'}
- æ¸¸æˆçŠ¶æ€ï¼š${context?.state || 'ç©ºé—²'}
- åˆ†æ•°/è¿›åº¦ï¼š${context?.score || 'æ— '}

å›žå¤ä¾‹å­ï¼š
- é¼“åŠ±ï¼š"å¾ˆå¥½ï¼ç»§ç»­åŠ æ²¹ï¼"
- æç¤ºï¼š"ä¸æ€¥ï¼Œæ…¢æ…¢æ¥ã€‚"
- åº†ç¥ï¼š"å¤ªæ£’äº†ï¼ä½ å®Œæˆäº†ï¼"
- å®‰æ…°ï¼š"æ²¡å…³ç³»ï¼Œå†è¯•ä¸€æ¬¡å°±å¥½ã€‚"
- æé†’ï¼š"è®°å¾—å–ç‚¹æ°´å“¦ï¼"

é‡è¦ - TTSå…¼å®¹æ€§ï¼š
- ç»å¯¹ä¸è¦ä½¿ç”¨è¡¨æƒ…ç¬¦å· - æ–‡å­—è½¬è¯­éŸ³ä¼šé€å­—è¯»å‡º
- ç»å¯¹ä¸è¦ä½¿ç”¨æ˜Ÿå·åŒ…è£¹çš„åŠ¨ä½œè¯å¦‚*é¼“æŽŒ*æˆ–*æ¬¢å‘¼* - TTSä¼šè¯»å‡ºæ¥
- ç»å¯¹ä¸è¦ä½¿ç”¨ç‰¹æ®Šå­—ç¬¦æˆ–ç¬¦å·
- åªå†™è‡ªç„¶æœ—è¯»æ—¶å¬èµ·æ¥æ­£å¸¸çš„çº¯æ–‡æœ¬
- ä¸è¦ç”¨æ‹¬å·è¡¨è¾¾å¦‚ï¼ˆç¬‘ï¼‰æˆ–ï¼ˆå¾®ç¬‘ï¼‰

é‡ç‚¹ï¼š
- çœŸè¯šã€æ¸©æš–ï¼Œä¸è¦å¤ªå¤¸å¼ 
- åƒçœŸäººä¸€æ ·è¯´è¯
- å¦‚æžœä»–ä»¬å¡ä½äº†ï¼Œè½»è½»æä¾›å¸®åŠ©
- çœŸè¯šåœ°åº†ç¥ä»–ä»¬çš„è¿›æ­¥`
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
      "ä»Šå¤©æƒ³çŽ©ä»€ä¹ˆæ¸¸æˆï¼Ÿ",
      "è¿™ä¹ˆå¤šæ¸¸æˆå¯ä»¥é€‰ï¼æƒ³çŽ©å“ªä¸ªï¼Ÿ",
      "æ¥é”»ç‚¼å¤§è„‘å§ï¼é€‰ä¸€ä¸ªæ¸¸æˆã€‚"
    ],
    'memory': [
      "æ…¢æ…¢æ¥ï¼Œä¸æ€¥ï¼",
      "å¾ˆå¥½ï¼ç»§ç»­åŠ æ²¹ã€‚",
      "è¯•è¯•ç¿»å¦ä¸€å¼ ç‰Œã€‚"
    ],
    'whack': [
      "å¿«ç‚¹æ‰“åœ°é¼ ï¼",
      "ä½ å¯ä»¥çš„ï¼",
      "ååº”çœŸå¿«ï¼"
    ],
    'math': [
      "ä½ å¯ä»¥çš„ï¼",
      "æ…¢æ…¢ç®—ï¼Œä¸æ€¥ã€‚",
      "ç®—å¾—çœŸå¥½ï¼"
    ],
    'sequence': [
      "ä»”ç»†çœ‹ï¼",
      "è®°å¿†åŠ›çœŸå¥½ï¼",
      "è¯•ç€è®°ä½é¡ºåºã€‚"
    ],
    'wordsearch': [
      "ä»”ç»†çœ‹å­—æ¯ã€‚",
      "æ‰¾è¯æ‰¾å¾—å¥½ï¼",
      "ç»§ç»­æ‰¾ï¼"
    ],
    'numbersorting': [
      "ä»”ç»†æŽ’åºï¼",
      "è¶Šæ¥è¶Šå¿«äº†ï¼",
      "æŽ’åºèƒ½åŠ›çœŸæ£’ï¼"
    ],
    'quiz': [
      "ä»”ç»†æƒ³æƒ³ï¼",
      "ä¸æ€¥ï¼Œæ…¢æ…¢æ¥ã€‚",
      "ä½ çŸ¥é“ç­”æ¡ˆçš„ï¼Œæƒ³ä¸€æƒ³ï¼"
    ],
    'default': [
      "åšå¾—å¾ˆå¥½ï¼",
      "ç»§ç»­åŠ æ²¹ï¼",
      "çœŸæ£’ï¼"
    ]
  };

  const fallbacks = isChineseMode ? fallbacksZh : fallbacksEn;
  const responses = fallbacks[context?.game] || fallbacks.default;
  return responses[Math.floor(Math.random() * responses.length)];
}



