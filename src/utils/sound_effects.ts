/**
 * sound_effects.ts
 * Web Audio API Synthesizer for JARVIS Holographic FUI & HUD
 * Zero-latency native procedural SFX without relying on external network assets.
 */

export class JarvisAudioSynthesizer {
  private audioCtx: AudioContext | null = null;
  public muted: boolean = false;

  public init() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // Crisp digital HUD beep
  public playBeep(freq = 1200, duration = 0.04, type: OscillatorType = 'sine') {
    if (this.muted) return;
    this.init();
    try {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch {}
  }

  // Double chirp for interactive selections
  public playChirp() {
    if (this.muted) return;
    this.playBeep(1800, 0.03, 'sine');
    setTimeout(() => this.playBeep(2400, 0.04, 'sine'), 45);
  }

  // Quick tactile UI click
  public playClick() {
    if (this.muted) return;
    this.playBeep(1400, 0.02, 'sine');
  }

  // Subtle tick for fast incoming packets
  public playPacketTick() {
    if (this.muted) return;
    this.playBeep(850, 0.015, 'triangle');
  }

  // Data packet audio blip
  public playDataPacket() {
    if (this.muted) return;
    this.playBeep(920, 0.02, 'triangle');
  }

  // Transmit beam audio chirp
  public playTransmit() {
    if (this.muted) return;
    this.playBeep(1600, 0.03, 'sine');
    setTimeout(() => this.playBeep(2100, 0.04, 'sine'), 40);
  }

  // Power Up sweep when toggling modes or booting hologram
  public playPowerUp() {
    if (this.muted) return;
    this.init();
    try {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, this.audioCtx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.07, this.audioCtx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.4);
    } catch {}
  }

  // Serious / Red Alert alarm pulse
  public playAlert() {
    if (this.muted) return;
    this.init();
    try {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);
      osc.frequency.setValueAtTime(659, this.audioCtx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.25);
    } catch {}
  }

  // Hologram activation sound
  public playHologramIgnite() {
    if (this.muted) return;
    this.init();
    try {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, this.audioCtx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.09, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.25);
    } catch {}
  }
}

export const jarvisAudio = new JarvisAudioSynthesizer();
