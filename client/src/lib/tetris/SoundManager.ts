export class SoundManager {
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private muted: boolean = false;
  private audioContext: AudioContext | null = null;
  private backgroundMusic: { oscillator?: OscillatorNode; gainNode?: GainNode } = {};
  private musicTimeout: number | null = null;

  constructor() {
    this.loadSounds();
    this.initAudioContext();
  }

  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.log('Could not initialize audio context:', error);
    }
  }

  private loadSounds(): void {
    try {
      // Try to load custom background music if available
      this.sounds.background = new Audio('/sounds/tetris-theme.mp3');
      this.sounds.background.volume = 0.3;
      this.sounds.background.loop = true;
    } catch (error) {
      console.log('Custom music not found, using generated music');
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'square'): void {
    if (!this.audioContext || this.muted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  // Tetris theme melody (Korobeiniki) - simplified version
  private tetrisNotes = [
    // Main melody
    { freq: 659.25, duration: 500 }, // E5
    { freq: 493.88, duration: 250 }, // B4
    { freq: 523.25, duration: 250 }, // C5
    { freq: 587.33, duration: 500 }, // D5
    { freq: 523.25, duration: 250 }, // C5
    { freq: 493.88, duration: 250 }, // B4
    { freq: 440.00, duration: 500 }, // A4
    { freq: 440.00, duration: 250 }, // A4
    { freq: 523.25, duration: 250 }, // C5
    { freq: 659.25, duration: 500 }, // E5
    { freq: 587.33, duration: 250 }, // D5
    { freq: 523.25, duration: 250 }, // C5
    { freq: 493.88, duration: 750 }, // B4
    { freq: 523.25, duration: 250 }, // C5
    { freq: 587.33, duration: 500 }, // D5
    { freq: 659.25, duration: 500 }, // E5
    { freq: 523.25, duration: 500 }, // C5
    { freq: 440.00, duration: 500 }, // A4
    { freq: 440.00, duration: 500 }, // A4
    { freq: 0, duration: 250 }, // Rest
  ];

  private currentNoteIndex = 0;

  private playNextNote(): void {
    if (!this.audioContext || this.muted) return;

    const note = this.tetrisNotes[this.currentNoteIndex];
    
    if (note.freq > 0) {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(note.freq, this.audioContext.currentTime);
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + note.duration / 1000);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + note.duration / 1000);
    }

    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.tetrisNotes.length;
    
    this.musicTimeout = window.setTimeout(() => {
      this.playNextNote();
    }, note.duration);
  }

  playHit(): void {
    // Play a short hit sound
    this.playTone(220, 100, 'square');
  }

  playSuccess(): void {
    // Play a success chord
    this.playTone(440, 200, 'sine');
    setTimeout(() => this.playTone(554, 200, 'sine'), 50);
    setTimeout(() => this.playTone(659, 300, 'sine'), 100);
  }

  playBackground(): void {
    if (this.muted) return;
    
    // Try to play custom music first
    if (this.sounds.background) {
      this.sounds.background.play().catch(() => {
        // If custom music fails, fall back to generated music
        this.playGeneratedMusic();
      });
    } else {
      this.playGeneratedMusic();
    }
  }

  private playGeneratedMusic(): void {
    if (!this.audioContext) return;
    
    // Resume audio context if it was suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    this.currentNoteIndex = 0;
    this.playNextNote();
  }

  stopBackground(): void {
    // Stop custom music
    if (this.sounds.background) {
      this.sounds.background.pause();
      this.sounds.background.currentTime = 0;
    }
    
    // Stop generated music
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }

  toggleMute(): void {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBackground();
    } else {
      this.playBackground();
    }
  }

  isMuted(): boolean {
    return this.muted;
  }
}
