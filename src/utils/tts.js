// Text-to-Speech utility using Browser Web Speech API
// Free and works on most modern browsers

class TTSPlayer {
  constructor() {
    this.synth = window.speechSynthesis;
    this.enabled = true;
    this.voice = null;
    this.language = 'en'; // 'en' or 'zh'
    this.rate = 0.85; // Slightly slower for elderly
    this.pitch = 1;
    this.volume = 1;
  }

  // Initialize and find best voice for language
  init(language = 'en') {
    this.language = language;
    this.loadVoice();
  }

  // Load the best available voice for the language
  loadVoice() {
    const voices = this.synth.getVoices();

    if (this.language === 'zh') {
      // Try to find Chinese voice
      this.voice = voices.find(v =>
        v.lang.includes('zh') ||
        v.lang.includes('cmn') ||
        v.name.toLowerCase().includes('chinese')
      ) || null;
    } else {
      // Find English voice, prefer Singapore/UK/US
      this.voice = voices.find(v =>
        v.lang === 'en-SG' ||
        v.name.toLowerCase().includes('singapore')
      ) || voices.find(v =>
        v.lang.startsWith('en')
      ) || null;
    }
  }

  // Speak text
  speak(text, options = {}) {
    if (!this.enabled || !text) return Promise.resolve();

    // Cancel any ongoing speech
    this.stop();

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);

      // Reload voices if not loaded yet (some browsers load async)
      if (!this.voice) {
        this.loadVoice();
      }

      if (this.voice) {
        utterance.voice = this.voice;
      }

      utterance.lang = this.language === 'zh' ? 'zh-CN' : 'en-US';
      utterance.rate = options.rate || this.rate;
      utterance.pitch = options.pitch || this.pitch;
      utterance.volume = options.volume || this.volume;

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      this.synth.speak(utterance);
    });
  }

  // Stop speaking
  stop() {
    this.synth.cancel();
  }

  // Pause speaking
  pause() {
    this.synth.pause();
  }

  // Resume speaking
  resume() {
    this.synth.resume();
  }

  // Check if currently speaking
  isSpeaking() {
    return this.synth.speaking;
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
    this.loadVoice();
  }

  // Set speech rate (0.5 to 2, default 0.85 for elderly)
  setRate(rate) {
    this.rate = Math.max(0.5, Math.min(2, rate));
  }

  // Get available voices
  getVoices() {
    return this.synth.getVoices();
  }
}

// Create singleton instance
const ttsPlayer = new TTSPlayer();

// Load voices when they become available (Chrome loads async)
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    ttsPlayer.loadVoice();
  };
}

export default ttsPlayer;
