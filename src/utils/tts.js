// Text-to-Speech utility using Google Cloud TTS (Neural) with browser fallback
// Google Cloud TTS provides natural-sounding Singapore English voices

class TTSPlayer {
  constructor() {
    this.enabled = true;
    this.language = 'en'; // 'en' or 'zh'
    this.audioElement = null;
    this.useCloudTTS = true; // Try cloud first, fallback to browser

    // Browser TTS fallback
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voice = null;
    this.rate = 0.85;
  }

  // Initialize
  init(language = 'en') {
    this.language = language;
    this.loadBrowserVoice();
  }

  // Load browser voice as fallback
  loadBrowserVoice() {
    if (!this.synth) return;

    const voices = this.synth.getVoices();
    if (this.language === 'yue') {
      // Cantonese - look for yue or zh-HK voices
      this.voice = voices.find(v =>
        v.lang.includes('yue') || v.lang === 'zh-HK'
      ) || voices.find(v => v.lang.includes('zh')) || null;
    } else if (this.language === 'zh') {
      // Mandarin
      this.voice = voices.find(v =>
        v.lang.includes('zh') || v.lang.includes('cmn')
      ) || null;
    } else {
      // English - prefer Singapore English if available
      this.voice = voices.find(v =>
        v.lang === 'en-SG' || v.name.toLowerCase().includes('singapore')
      ) || voices.find(v => v.lang.startsWith('en')) || null;
    }
  }

  // Speak text using Google Cloud TTS
  async speak(text, options = {}) {
    if (!this.enabled || !text) return;

    // Stop any ongoing speech
    this.stop();

    // Try Google Cloud TTS first
    if (this.useCloudTTS) {
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            language: this.language
          })
        });

        const data = await response.json();

        if (data.success && data.audioContent) {
          // Play the audio
          return this.playAudioBase64(data.audioContent);
        }

        // If API says use fallback, switch to browser TTS
        if (data.useFallback) {
          console.log('Google TTS unavailable, using browser fallback');
          return this.speakBrowserFallback(text, options);
        }
      } catch (error) {
        console.error('Google TTS error:', error);
        // Fall back to browser TTS
        return this.speakBrowserFallback(text, options);
      }
    }

    // Use browser TTS if cloud is disabled
    return this.speakBrowserFallback(text, options);
  }

  // Play base64 encoded audio
  playAudioBase64(base64Audio) {
    return new Promise((resolve, reject) => {
      try {
        // Create audio element
        this.audioElement = new Audio();
        this.audioElement.src = `data:audio/mp3;base64,${base64Audio}`;

        this.audioElement.onended = () => {
          this.audioElement = null;
          resolve();
        };

        this.audioElement.onerror = (e) => {
          console.error('Audio playback error:', e);
          this.audioElement = null;
          reject(e);
        };

        this.audioElement.play().catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Browser TTS fallback
  speakBrowserFallback(text, options = {}) {
    if (!this.synth) return Promise.resolve();

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);

      if (!this.voice) {
        this.loadBrowserVoice();
      }

      if (this.voice) {
        utterance.voice = this.voice;
      }

      // Map language to browser TTS locale
      const langMap = { 'zh': 'zh-CN', 'yue': 'zh-HK', 'en': 'en-US' };
      utterance.lang = langMap[this.language] || 'en-US';
      utterance.rate = options.rate || this.rate;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      this.synth.speak(utterance);
    });
  }

  // Stop speaking
  stop() {
    // Stop audio element
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
      this.audioElement = null;
    }

    // Stop browser TTS
    if (this.synth) {
      this.synth.cancel();
    }
  }

  // Check if currently speaking
  isSpeaking() {
    return !!(this.audioElement && !this.audioElement.paused) ||
           (this.synth && this.synth.speaking);
  }

  // Enable/disable TTS
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  // Toggle TTS
  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stop();
    }
    return this.enabled;
  }

  // Set language
  setLanguage(lang) {
    this.language = lang;
    this.loadBrowserVoice();
  }

  // Set whether to use cloud TTS
  setUseCloudTTS(useCloud) {
    this.useCloudTTS = useCloud;
  }
}

// Create singleton instance
const ttsPlayer = new TTSPlayer();

// Load browser voices when they become available (Chrome loads async)
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    ttsPlayer.loadBrowserVoice();
  };
}

export default ttsPlayer;
