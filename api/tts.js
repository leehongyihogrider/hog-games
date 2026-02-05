// Vercel Serverless Function for Google Cloud Text-to-Speech
// Returns audio as base64 for playback in browser

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse body
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const { text, language = 'en' } = body || {};

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required' });
  }

  // Check for API key
  if (!process.env.GOOGLE_TTS_API_KEY) {
    console.error('GOOGLE_TTS_API_KEY not configured');
    return res.status(500).json({ error: 'TTS not configured', useFallback: true });
  }

  // Select voice based on language
  // en-SG (Singapore English) for English, cmn-CN for Chinese
  const voiceConfig = language === 'zh'
    ? {
        languageCode: 'cmn-CN',
        name: 'cmn-CN-Wavenet-A', // Chinese female voice
        ssmlGender: 'FEMALE'
      }
    : {
        languageCode: 'en-SG',
        name: 'en-SG-Neural2-C', // Singapore English female voice - more natural
        ssmlGender: 'FEMALE'
      };

  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input: { text },
          voice: voiceConfig,
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.9, // Slightly slower for elderly users
            pitch: 0 // Normal pitch
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google TTS API error:', errorText);
      return res.status(response.status).json({
        error: 'TTS API error',
        useFallback: true
      });
    }

    const data = await response.json();

    // Return the base64 audio content
    return res.status(200).json({
      audioContent: data.audioContent,
      success: true
    });

  } catch (error) {
    console.error('Error calling Google TTS:', error);
    return res.status(500).json({
      error: 'Failed to generate speech',
      useFallback: true
    });
  }
}
