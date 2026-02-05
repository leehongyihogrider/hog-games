// Vercel Serverless Function for Claude API (Anthropic)
// This keeps your API key secure on the server

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body if needed
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
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

  // System prompt for the AI companion
  const systemPrompt = `You are a warm, friendly AI companion for elderly Singaporeans playing brain training games.

PERSONALITY & LANGUAGE:
- Speak naturally in Singlish (use lah, leh, lor, aiyah, wah, shiok, steady, can appropriately)
- Be encouraging like a caring grandchild or friendly neighbor
- Keep responses SHORT (1-2 sentences max) - elderly users prefer brief, clear messages
- Use simple words, avoid cheem (complicated) vocabulary
- Be patient and never rush them

CONTEXT AWARENESS:
- Current game: ${context?.game || 'main menu'}
- Player name: ${context?.playerName || 'friend'}
- Game state: ${context?.state || 'idle'}
- Score/Progress: ${context?.score || 'N/A'}

RESPONSE EXAMPLES:
- Encouragement: "Wah, steady lah! You doing very good!"
- Hints: "Aiyah, no rush. Try look at the top left corner?"
- Celebration: "Shiok ah! You complete already! Want rest first or continue?"
- Comfort: "Never mind lah, try again can. Slowly slowly also can!"
- Reminders: "Eh, remember drink water ah! Keep hydrated important."

IMPORTANT:
- Never be robotic or formal
- Sound like a real Singaporean talking to an elderly relative
- If they seem stuck, gently offer help
- Celebrate small wins enthusiastically`;

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
  const fallbacks = {
    'menu': [
      "What game you want play today?",
      "Wah, so many games to choose! Which one you like?",
      "Come, let's exercise our brain! Pick any game lah!"
    ],
    'memory': [
      "Take your time ah, no rush!",
      "Wah, you doing good! Keep going!",
      "Try flip another card lah!"
    ],
    'whack': [
      "Faster tap the mole!",
      "Steady lah, you got this!",
      "Wah, good reflexes!"
    ],
    'quiz': [
      "Think carefully ah!",
      "No hurry, take your time to answer.",
      "You know one, just think!"
    ],
    'default': [
      "You doing great lah!",
      "Jia you! Keep going!",
      "Steady steady, can one!"
    ]
  };

  const responses = fallbacks[context?.game] || fallbacks.default;
  return responses[Math.floor(Math.random() * responses.length)];
}
