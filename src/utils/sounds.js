// Sound utility using Web Audio API for game feedback sounds

class SoundPlayer {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
  }

  // Initialize audio context (needed for some browsers)
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // Play a tone with specific frequency and duration
  playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.enabled) return;

    this.init();

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Success/Correct sound - pleasant chime
  playSuccess() {
    this.init();
    // Play two notes in sequence for a pleasant chime
    this.playTone(523.25, 0.1, 'sine', 0.3); // C5
    setTimeout(() => this.playTone(659.25, 0.15, 'sine', 0.3), 80); // E5
  }

  // Error/Wrong sound - lower buzz
  playError() {
    this.init();
    this.playTone(200, 0.2, 'sawtooth', 0.2);
  }

  // Click/Tap sound - short click
  playClick() {
    this.init();
    this.playTone(800, 0.05, 'square', 0.15);
  }

  // Card flip sound
  playFlip() {
    this.init();
    this.playTone(400, 0.08, 'sine', 0.2);
  }

  // Match found sound
  playMatch() {
    this.init();
    this.playTone(523.25, 0.1, 'sine', 0.3); // C5
    setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.3), 100); // E5
    setTimeout(() => this.playTone(783.99, 0.2, 'sine', 0.3), 200); // G5
  }

  // Victory fanfare - 3 note sequence
  playVictory() {
    this.init();
    this.playTone(523.25, 0.15, 'sine', 0.3); // C5
    setTimeout(() => this.playTone(659.25, 0.15, 'sine', 0.3), 150); // E5
    setTimeout(() => this.playTone(783.99, 0.15, 'sine', 0.3), 300); // G5
    setTimeout(() => this.playTone(1046.50, 0.3, 'sine', 0.3), 450); // C6
  }

  // Whack/Hit sound
  playWhack() {
    this.init();
    this.playTone(150, 0.1, 'square', 0.25);
  }

  // Pop-up sound (mole appearing)
  playPopUp() {
    this.init();
    this.playTone(600, 0.08, 'sine', 0.15);
  }

  // Color sequence tones - different frequency for each color
  playColorTone(colorIndex) {
    this.init();
    const frequencies = [523.25, 659.25, 783.99, 880.00, 1046.50, 1174.66]; // C5, E5, G5, A5, C6, D6
    const frequency = frequencies[colorIndex % frequencies.length];
    this.playTone(frequency, 0.2, 'sine', 0.3);
  }

  // Selection sound (for number sorting, word search)
  playSelect() {
    this.init();
    this.playTone(700, 0.06, 'sine', 0.2);
  }

  // Deselect sound
  playDeselect() {
    this.init();
    this.playTone(500, 0.06, 'sine', 0.15);
  }

  // Word found sound
  playWordFound() {
    this.init();
    this.playTone(659.25, 0.1, 'sine', 0.3); // E5
    setTimeout(() => this.playTone(783.99, 0.1, 'sine', 0.3), 100); // G5
    setTimeout(() => this.playTone(1046.50, 0.2, 'sine', 0.3), 200); // C6
  }

  // Number placed correctly
  playNumberCorrect() {
    this.init();
    this.playTone(880, 0.1, 'sine', 0.25);
  }

  // Streak milestone sound
  playStreak() {
    this.init();
    this.playTone(1046.50, 0.1, 'sine', 0.3);
    setTimeout(() => this.playTone(1318.51, 0.15, 'sine', 0.3), 100);
  }

  // Star earned sound
  playStar() {
    this.init();
    this.playTone(1046.50, 0.15, 'triangle', 0.25);
  }

  // Dramatic level completion victory - confetti and fanfare
  playLevelVictory() {
    this.init();
    // Enhanced fanfare with more notes and longer duration
    this.playTone(523.25, 0.2, 'sine', 0.35); // C5
    setTimeout(() => this.playTone(659.25, 0.2, 'sine', 0.35), 200); // E5
    setTimeout(() => this.playTone(783.99, 0.2, 'sine', 0.35), 400); // G5
    setTimeout(() => this.playTone(1046.50, 0.4, 'sine', 0.35), 600); // C6
    setTimeout(() => this.playTone(1318.51, 0.5, 'sine', 0.35), 1000); // E6
  }

  // ULTRA dramatic game completion - trumpets and celebration
  playGameCompletion() {
    this.init();
    // Triumphant trumpet fanfare with multiple layers
    // Main melody
    this.playTone(523.25, 0.3, 'triangle', 0.4); // C5
    setTimeout(() => this.playTone(659.25, 0.3, 'triangle', 0.4), 300); // E5
    setTimeout(() => this.playTone(783.99, 0.3, 'triangle', 0.4), 600); // G5
    setTimeout(() => this.playTone(1046.50, 0.4, 'triangle', 0.4), 900); // C6

    // Harmony layer (slightly delayed)
    setTimeout(() => this.playTone(659.25, 0.3, 'sine', 0.3), 150); // E5
    setTimeout(() => this.playTone(783.99, 0.3, 'sine', 0.3), 450); // G5
    setTimeout(() => this.playTone(1046.50, 0.3, 'sine', 0.3), 750); // C6
    setTimeout(() => this.playTone(1318.51, 0.4, 'sine', 0.3), 1050); // E6

    // Final triumphant blast
    setTimeout(() => {
      this.playTone(1046.50, 0.3, 'triangle', 0.45); // C6
      this.playTone(1318.51, 0.3, 'triangle', 0.45); // E6
    }, 1300);
    setTimeout(() => {
      this.playTone(1568.00, 0.6, 'triangle', 0.5); // G6 - final note
    }, 1600);
  }

  // Enable/disable sounds
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  // Toggle sounds on/off
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

// Create a singleton instance
const soundPlayer = new SoundPlayer();

export default soundPlayer;
