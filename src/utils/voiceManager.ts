/**
 * VoicePlaybackManager
 * Strict Singleton Voice Manager for J.A.R.V.I.S.
 * 
 * Rules enforced:
 * 1. ONLY ONE active audio output at any given time.
 * 2. Request IDs & Session IDs prevent duplicate or overlapping speech requests.
 * 3. Immediate cancellation of prior audio on new requests or user stop.
 * 4. Proper cleanup of Object URLs to prevent memory leaks.
 * 5. Exclusive voice: Avni (ElevenLabs ID: VG7gYikNQ71LJ52W9fAD) via backend proxy.
 * 6. Visualizer integration via Web Audio API AnalyserNode.
 */

type VoiceStateListener = (isSpeaking: boolean, energyLevel: number) => void;

class VoicePlaybackManager {
  private currentAudio: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  private currentRequestId: number = 0;
  private isSpeaking: boolean = false;
  private listeners: Set<VoiceStateListener> = new Set();
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private animationFrameId: number | null = null;
  private abortController: AbortController | null = null;

  constructor() {
    // Single instance setup
  }

  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    listener(this.isSpeaking, 0);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(isSpeaking: boolean, energy: number = 0) {
    this.isSpeaking = isSpeaking;
    this.listeners.forEach((fn) => {
      try {
        fn(isSpeaking, energy);
      } catch (e) {
        console.error('Error notifying voice listener:', e);
      }
    });
  }

  public stop(): void {
    this.currentRequestId++; // Invalidate any in-flight fetch requests

    if (this.abortController) {
      try {
        this.abortController.abort();
      } catch {}
      this.abortController = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = '';
      } catch {}
      this.currentAudio = null;
    }

    if (this.currentAudioUrl) {
      try {
        URL.revokeObjectURL(this.currentAudioUrl);
      } catch {}
      this.currentAudioUrl = null;
    }

    this.notify(false, 0);
  }

  public async speak(text: string): Promise<boolean> {
    if (!text || !text.trim()) return false;

    // Immediately cancel and stop any currently active speech or pending fetch
    this.stop();

    const requestId = ++this.currentRequestId;
    this.abortController = new AbortController();

    try {
      this.notify(true, 15); // Signal that speech synthesis is initiating

      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
        signal: this.abortController.signal,
      });

      // If a newer request was triggered while fetching, discard this result
      if (requestId !== this.currentRequestId) {
        return false;
      }

      if (!response.ok) {
        console.warn('Voice API response not ok:', response.status);
        this.stop();
        return false;
      }

      const contentType = response.headers.get('content-type') || '';
      let audioBlob: Blob;

      if (contentType.includes('application/json')) {
        const json = await response.json();
        if (json.audioBase64) {
          const byteCharacters = atob(json.audioBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          audioBlob = new Blob([byteArray], { type: 'audio/mpeg' });
        } else {
          this.stop();
          return false;
        }
      } else {
        audioBlob = await response.blob();
      }

      // Check again if superseded while reading body
      if (requestId !== this.currentRequestId) {
        return false;
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      this.currentAudioUrl = audioUrl;

      const audio = new Audio(audioUrl);
      this.currentAudio = audio;

      // Setup audio analyzer for waveform animation
      this.setupAudioAnalysis(audio);

      return new Promise<boolean>((resolve) => {
        audio.onended = () => {
          if (requestId === this.currentRequestId) {
            this.stop();
            resolve(true);
          }
        };

        audio.onerror = () => {
          if (requestId === this.currentRequestId) {
            console.warn('Audio playback error on audio element');
            this.stop();
            resolve(false);
          }
        };

        audio.play().catch((err) => {
          console.warn('Playback play() call failed (user gesture required?):', err);
          if (requestId === this.currentRequestId) {
            this.stop();
            resolve(false);
          }
        });
      });
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        // User interrupted or newer request arrived; nominal behavior
        return false;
      }
      console.warn('Voice playback exception:', err);
      if (requestId === this.currentRequestId) {
        this.stop();
      }
      return false;
    }
  }

  private setupAudioAnalysis(audio: HTMLAudioElement) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      // Recreate analyser
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 128;

      // Note: createMediaElementSource can only be called once per HTMLMediaElement
      const source = this.audioContext.createMediaElementSource(audio);
      source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      this.sourceNode = source;

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

      const updateEnergy = () => {
        if (!this.analyser || !this.isSpeaking) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.floor(avg * 1.2));

        this.notify(true, normalized);
        this.animationFrameId = requestAnimationFrame(updateEnergy);
      };

      this.animationFrameId = requestAnimationFrame(updateEnergy);
    } catch (e) {
      // AudioContext cross-origin or autoplay restrictions fallback
      console.debug('AudioContext analyzer setup note:', e);
    }
  }

  public getStatus() {
    return {
      isSpeaking: this.isSpeaking,
      voice: 'Avni (ElevenLabs)',
      voiceId: 'VG7gYikNQ71LJ52W9fAD',
    };
  }
}

export const voiceManager = new VoicePlaybackManager();
