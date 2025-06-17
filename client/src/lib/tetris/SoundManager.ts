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
    // We'll use Web Audio API for all sounds now
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
    if (!this.muted && this.sounds.hit) {
      this.sounds.hit.currentTime = 0;
      this.sounds.hit.play().catch(() => {});
    }
  }

  playSuccess(): void {
    if (!this.muted && this.sounds.success) {
      this.sounds.success.currentTime = 0;
      this.sounds.success.play().catch(() => {});
    }
  }

  playBackground(): void {
    if (!this.muted && this.audioContext) {
      // Resume audio context if it was suspended
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      this.currentNoteIndex = 0;
      this.playNextNote();
    }
  }

  stopBackground(): void {
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
