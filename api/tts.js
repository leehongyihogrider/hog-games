/* global process */
// Vercel Serverless Function for Google Cloud Text-to-Speech
// Returns audio as base64 for playback in browser
const TTS_RATE_LIMIT_WINDOW_MS = Number(process.env.TTS_RATE_LIMIT_WINDOW_MS || 60000);
const TTS_RATE_LIMIT_MAX = Number(process.env.TTS_RATE_LIMIT_MAX || 20);
const ttsRateLimit = new Map();

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

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
  if (isRateLimited(ttsRateLimit, clientIp, TTS_RATE_LIMIT_WINDOW_MS, TTS_RATE_LIMIT_MAX)) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  // Parse body
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
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
  // Using Chirp 3 HD for highest quality (1M chars free tier!)
  const voiceConfigs = {
    'zh': {
      languageCode: 'cmn-CN',
      name: 'cmn-CN-Chirp3-HD-Aoede', // Mandarin Chirp HD voice
      ssmlGender: 'FEMALE'
    },
    'yue': {
      languageCode: 'yue-HK',
      name: 'yue-HK-Chirp3-HD-Aoede', // Cantonese Chirp HD voice
      ssmlGender: 'FEMALE'
    },
    'en': {
      languageCode: 'en-AU',
      name: 'en-AU-Chirp-HD-O', // Australian English - warm, friendly female voice
      ssmlGender: 'FEMALE'
    }
  };
  const voiceConfig = voiceConfigs[language] || voiceConfigs['en'];

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


