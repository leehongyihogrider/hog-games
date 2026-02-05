// Vercel Serverless Function for SEA-LION API
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

  // If no messages, create a default based on context/trigger
  let finalMessages = messages;
  if (!finalMessages || !Array.isArray(finalMessages) || finalMessages.length === 0) {
    // Use context as the trigger message
    finalMessages = [{ role: 'user', content: context?.trigger || 'Say something encouraging!' }];
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
    const response = await fetch('https://api.sea-lion.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SEALION_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: 'aisingapore/Gemma-SEA-LION-v4-27B-IT',
        messages: [
          { role: 'system', content: systemPrompt },
          ...finalMessages
        ],
        max_completion_tokens: 100, // Keep responses short
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SEA-LION API error:', errorText);
      return res.status(response.status).json({
        error: 'AI service error',
        fallback: getFallbackResponse(context)
      });
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content || getFallbackResponse(context);

    return res.status(200).json({
      message: aiMessage,
      success: true
    });

  } catch (error) {
    console.error('Error calling SEA-LION:', error);
    return res.status(500).json({
      error: 'Failed to get AI response',
      fallback: getFallbackResponse(context)
    });
  }
}

// Fallback responses if API fails
function getFallbackResponse(context) {
  const fallbacks = {
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
