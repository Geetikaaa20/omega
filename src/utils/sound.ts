/**
 * Retro 8-bit Sound Synthesizer using standard Web Audio API
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  constructor() {
    // Check localStorage preference
    try {
      const stored = localStorage.getItem('retro_arcade_muted');
      if (stored !== null) {
        this.isMuted = stored === 'true';
      }
    } catch {
      this.isMuted = false;
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('retro_arcade_muted', String(muted));
    } catch {}
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Play a simple frequency sweep or tone
  public playTone(
    startFreq: number,
    endFreq: number,
    durationMs: number,
    type: OscillatorType = 'square',
    gainPeak = 0.1
  ) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(10, startFreq), now);
      if (endFreq !== startFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(10, endFreq), now + durationMs / 1000);
      }

      gain.gain.setValueAtTime(gainPeak, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + durationMs / 1000);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  public playCoin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  public playJump() {
    this.playTone(150, 600, 150, 'triangle', 0.14);
  }

  public playHit() {
    this.playTone(140, 40, 180, 'sawtooth', 0.15);
  }

  public playBounce() {
    this.playTone(320, 480, 80, 'sine', 0.1);
  }

  public playScore() {
    this.playTone(520, 880, 120, 'square', 0.1);
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const notes = [440, 392, 349, 293, 220];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, freq * 0.9, 140, 'sawtooth', 0.12);
        }, idx * 120);
      });
    } catch {}
  }

  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const notes = [261, 329, 392, 523, 659, 784];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playTone(freq, freq, 100, 'square', 0.1);
        }, idx * 80);
      });
    } catch {}
  }

  public playRotate() {
    this.playTone(400, 480, 60, 'triangle', 0.08);
  }

  public playDrop() {
    this.playTone(280, 160, 90, 'square', 0.12);
  }

  public playSquirt() {
    this.playTone(300, 650, 100, 'sine', 0.12);
  }

  public playOvenDing() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now); // A6 bell
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
    } catch {}
  }

  public playPlop() {
    this.playTone(550, 880, 60, 'sine', 0.14);
  }

  public playSprinkle() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const freqs = [1200, 1500, 1800, 2100];
      freqs.forEach((f, idx) => {
        setTimeout(() => {
          this.playTone(f, f + 100, 30, 'triangle', 0.05);
        }, idx * 25);
      });
    } catch {}
  }

  public playTrash() {
    this.playTone(180, 80, 150, 'sawtooth', 0.1);
  }

  public playBite() {
    this.playTone(320, 180, 50, 'square', 0.12);
  }

  public playCheer() {
    this.playVictory();
  }
}

export const sound = new SoundEngine();
