// Web Audio API Synthesizer replicating JARVIS Episode 15 & Mark-XXXIX SFX
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * JARVIS Episode 15 Startup Chime:
 * winsound.Beep(600, 70), (900, 70), (1400, 120)
 */
export function playStartupChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const tones = [
      { freq: 600, start: 0, duration: 0.08 },
      { freq: 900, start: 0.09, duration: 0.08 },
      { freq: 1400, start: 0.18, duration: 0.16 },
    ];

    tones.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.18, now + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration + 0.02);
    });
  } catch (e) {
    console.warn('Audio SFX not available:', e);
  }
}

/**
 * JARVIS Episode 15 Tool Execution Chime:
 * winsound.Beep(1200, 60), (1800, 80)
 */
export function playToolChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const tones = [
      { freq: 1200, start: 0, duration: 0.06 },
      { freq: 1800, start: 0.07, duration: 0.09 },
    ];

    tones.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + start);

      gain.gain.setValueAtTime(0, now + start);
      gain.gain.linearRampToValueAtTime(0.14, now + start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + start);
      osc.stop(now + start + duration + 0.02);
    });
  } catch (e) {
    console.warn('Audio SFX not available:', e);
  }
}

/**
 * Push to talk activate chirp
 */
export function playMicActivateChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  } catch (e) {
    // Ignore
  }
}

/**
 * RAM Purge & Ghost Killer SFX
 */
export function playPurgeSfx() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  } catch (e) {
    // Ignore
  }
}

/**
 * Play Raw WAV Base64 audio stream
 */
export async function playWavBase64(base64Data: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      const audio = new Audio(`data:audio/wav;base64,${base64Data}`);
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
      audio.play().catch(() => resolve());
    } catch {
      resolve();
    }
  });
}
