export class SoundManager {
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private muted: boolean = false;

  constructor() {
    this.loadSounds();
  }

  private loadSounds(): void {
    try {
      this.sounds.hit = new Audio('/sounds/hit.mp3');
      this.sounds.success = new Audio('/sounds/success.mp3');
      this.sounds.background = new Audio('/sounds/background.mp3');
      
      // Set volumes
      this.sounds.hit.volume = 0.3;
      this.sounds.success.volume = 0.5;
      this.sounds.background.volume = 0.2;
      this.sounds.background.loop = true;
    } catch (error) {
      console.log('Could not load sounds:', error);
    }
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
    if (!this.muted && this.sounds.background) {
      this.sounds.background.play().catch(() => {});
    }
  }

  stopBackground(): void {
    if (this.sounds.background) {
      this.sounds.background.pause();
      this.sounds.background.currentTime = 0;
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
