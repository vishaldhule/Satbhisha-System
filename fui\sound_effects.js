/**
* sound_effects.js
* High-Tech Web Audio API Synthesizer for JARVIS Holographic FUI
* Generates instant zero-latency sci-fi soundscapes natively without external MP3/WAV files.
* Built for Swayam Dhawale's JARVIS AI.
*/
class JarvisAudioSynthesizer {
constructor() {
this.audioCtx = null;
this.muted = false;
}
init() {
if (!this.audioCtx) {
const AudioContext = window.AudioContext || window.webkitAudioContext;
this.audioCtx = new AudioContext();
}
if (this.audioCtx.state === 'suspended') {
this.audioCtx.resume();
}
}
toggleMute() {
this.muted = !this.muted;
return this.muted;
}
playBeep(freq = 1200, duration = 0.04, type = 'sine') {
if (this.muted) return;
this.init();
try {
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
} catch (e) {}
}
playClick() {
if (this.muted) return;
this.init();
try {
const osc = this.audioCtx.createOscillator();
const gain = this.audioCtx.createGain();
osc.type = 'triangle';
osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
osc.frequency.exponentialRampToValueAtTime(200, this.audioCtx.currentTime + 0.03);
gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.03);
osc.connect(gain);
gain.connect(this.audioCtx.destination);
osc.start();
osc.stop(this.audioCtx.currentTime + 0.03);
} catch (e) {}
}
playTransmit() {
if (this.muted) return;
this.init();
try {
const now = this.audioCtx.currentTime;
const osc1 = this.audioCtx.createOscillator();
const osc2 = this.audioCtx.createOscillator();
const gain = this.audioCtx.createGain();
osc1.type = 'sine';
osc1.frequency.setValueAtTime(880, now);
osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.08);
osc2.type = 'sawtooth';
osc2.frequency.setValueAtTime(440, now);
osc2.frequency.exponentialRampToValueAtTime(880, now + 0.08);
gain.gain.setValueAtTime(0.1, now);
gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
osc1.connect(gain);
osc2.connect(gain);
gain.connect(this.audioCtx.destination);
osc1.start(now);
osc2.start(now);
osc1.stop(now + 0.09);
osc2.stop(now + 0.09);
} catch (e) {}
}
playAlert() {
if (this.muted) return;
this.init();
try {
const now = this.audioCtx.currentTime;
const osc = this.audioCtx.createOscillator();
const gain = this.audioCtx.createGain();
osc.type = 'sawtooth';
osc.frequency.setValueAtTime(420, now);
osc.frequency.setValueAtTime(840, now + 0.1);
osc.frequency.setValueAtTime(420, now + 0.2);
osc.frequency.setValueAtTime(840, now + 0.3);
gain.gain.setValueAtTime(0.15, now);
gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
osc.connect(gain);
gain.connect(this.audioCtx.destination);
osc.start(now);
osc.stop(now + 0.45);
} catch (e) {}
}
playPowerUp() {
if (this.muted) return;
this.init();
try {
const now = this.audioCtx.currentTime;
const chord = [330, 440, 554.37, 659.25, 880];
chord.forEach((freq, idx) => {
const osc = this.audioCtx.createOscillator();
const gain = this.audioCtx.createGain();
osc.type = 'sine';
osc.frequency.setValueAtTime(freq * 0.7, now);
osc.frequency.exponentialRampToValueAtTime(freq, now + 0.25 + idx * 0.05);
gain.gain.setValueAtTime(0.04, now + idx * 0.04);
gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5 + idx * 0.05);
osc.connect(gain);
gain.connect(this.audioCtx.destination);
osc.start(now + idx * 0.04);
osc.stop(now + 0.5 + idx * 0.05);
});
} catch (e) {}
}
playDataPacket() {
if (this.muted) return;
if (Math.random() > 0.4) return;
this.init();
try {
const now = this.audioCtx.currentTime;
const osc = this.audioCtx.createOscillator();
const gain = this.audioCtx.createGain();
osc.type = 'sine';
osc.frequency.setValueAtTime(2400 + Math.random() * 800, now);
gain.gain.setValueAtTime(0.015, now);
gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
osc.connect(gain);
gain.connect(this.audioCtx.destination);
osc.start(now);
osc.stop(now + 0.015);
} catch (e) {}
}
}
window.jarvisAudio = new JarvisAudioSynthesizer();