/**
 * VoicePlaybackManager
 * Strict Singleton Voice Manager for J.A.R.V.I.S.
 * 
 * Rules enforced:
 * 1. ONLY ONE active audio output at any given time.
 * 2. Immediate cancellation of prior audio on new requests or user stop.
 * 3. Primary: Avni (ElevenLabs ID: VG7gYikNQ71LJ52W9fAD) via backend proxy.
 * 4. Automatic Web Speech API Fallback: If ElevenLabs is unavailable or unconfigured,
 *    instantly uses the browser's native speech synthesis (Hindi/English female voice)
 *    so the user is NEVER left in silence.
 * 5. Synchronous Visualizer & Energy Level updates for the Arc Reactor and HUD.
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
  private fallbackIntervalId: any = null;
  private abortController: AbortController | null = null;
  private onEndCallbacks: Set<() => void> = new Set();

  constructor() {
    // Single instance setup
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Pre-warm voices list
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.getVoices();
    }
  }

  public subscribe(listener: VoiceStateListener): () => void {
    this.listeners.add(listener);
    listener(this.isSpeaking, 0);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public onSpeechEnded(callback: () => void): () => void {
    this.onEndCallbacks.add(callback);
    return () => {
      this.onEndCallbacks.delete(callback);
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

    if (!isSpeaking) {
      // Fire speech ended callbacks for continuous voice loop
      this.onEndCallbacks.forEach((cb) => {
        try {
          cb();
        } catch {}
      });
    }
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

    if (this.fallbackIntervalId) {
      clearInterval(this.fallbackIntervalId);
      this.fallbackIntervalId = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
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

  // Prepares clean conversational text suitable for speech synthesis
  private cleanTextForSpeech(text: string): string {
    if (!text) return '';
    let cleaned = text;

    // Remove markdown code blocks and inline code
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

    // Remove markdown headers, bold, italics, links, images
    cleaned = cleaned.replace(/#+\s/g, '');
    cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
    cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
    cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
    cleaned = cleaned.replace(/_([^_]+)_/g, '$1');

    // Remove URLs
    cleaned = cleaned.replace(/https?:\/\/\S+/g, '');

    // Remove JSON-like brackets
    cleaned = cleaned.replace(/\{[^}]+\}/g, '');

    // Trim excess whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();

    return cleaned;
  }

  public async speak(rawText: string, context?: any): Promise<boolean> {
    const text = this.cleanTextForSpeech(rawText);
    if (!text) return false;

    // Immediately cancel and stop any currently active speech or pending fetch
    this.stop();

    const requestId = ++this.currentRequestId;
    this.abortController = new AbortController();

    // Client-side sentiment evaluation
    const lower = text.toLowerCase();
    let sentimentType: 'excited' | 'tactical' | 'warm_friendly' | 'analytical' | 'reassuring' = 'reassuring';
    if (context?.isSeriousMode || /(?:alert|warning|threat|breach|critical|danger|tactical|combat|purge|emergency|fail|error)\b/i.test(lower)) {
      sentimentType = 'tactical';
    } else if (/(?:congratulations|breakthrough|incredible|awesome|brilliant|deployed|activated|hologram|synthesized|quantum|launch|revolution)\b/i.test(lower) || /(!{2,}|✨|🚀|⚡)/.test(text)) {
      sentimentType = 'excited';
    } else if (context?.isGreeting || /(?:hello|hey|hi|good morning|good evening|namaste|welcome|boss|sir|dost|bhai|kya haal)\b/i.test(lower)) {
      sentimentType = 'warm_friendly';
    } else if (/(?:temperature|celsius|fahrenheit|barometer|humidity|function|code|matrix|algorithm|data|telemetry)\b/i.test(lower)) {
      sentimentType = 'analytical';
    }

    try {
      this.notify(true, 25); // Signal that speech synthesis is initiating

      // Try Backend Avni / Gemini TTS with dynamic sentiment context
      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.slice(0, 1000),
          context: { ...context, sentiment: sentimentType }
        }),
        signal: this.abortController.signal,
      });

      // If a newer request was triggered while fetching, discard this result
      if (requestId !== this.currentRequestId) {
        return false;
      }

      if (response.ok) {
        const contentType = response.headers.get('content-type') || '';

        // Check if server returned raw audio buffer (ElevenLabs)
        if (contentType.includes('audio/')) {
          const audioBlob = await response.blob();
          if (requestId === this.currentRequestId && audioBlob.size > 200) {
            return this.playAudioBlob(audioBlob, requestId);
          }
        }

        // Check if server returned base64 audio
        if (contentType.includes('application/json')) {
          const json = await response.json();
          if (json.audioBase64) {
            const byteCharacters = atob(json.audioBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const audioBlob = new Blob([byteArray], { type: json.mimeType || 'audio/mpeg' });
            if (requestId === this.currentRequestId && audioBlob.size > 200) {
              return this.playAudioBlob(audioBlob, requestId);
            }
          }
        }
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return false;
      }
      console.warn('Backend TTS attempt failed, falling back to Web Speech:', err);
    }

    // GUARANTEED FALLBACK: Browser native Web Speech API with Dynamic Sentiment Pitch & Rate
    if (requestId === this.currentRequestId) {
      return this.speakWithWebSpeech(text, requestId, sentimentType);
    }

    return false;
  }

  // Play audio buffer through HTMLAudioElement with AnalyserNode
  private async playAudioBlob(audioBlob: Blob, requestId: number): Promise<boolean> {
    const audioUrl = URL.createObjectURL(audioBlob);
    this.currentAudioUrl = audioUrl;

    const audio = new Audio(audioUrl);
    this.currentAudio = audio;

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
          console.warn('Audio element error, falling back to Web Speech');
          resolve(this.speakWithWebSpeech(audio.src, requestId));
        }
      };

      audio.play().catch((err) => {
        console.warn('Audio play() failed (autoplay lock?), using Web Speech:', err);
        if (requestId === this.currentRequestId) {
          resolve(this.speakWithWebSpeech(this.currentAudioUrl || '', requestId));
        }
      });
    });
  }

  // Web Speech API Native Synthesizer (Instant, Free, Zero-Failure) with Sentiment Modulation
  private speakWithWebSpeech(text: string, requestId: number, sentimentType: string = 'reassuring'): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        this.stop();
        resolve(false);
        return;
      }

      try {
        window.speechSynthesis.cancel();

        // Detect if text contains Hindi words or Devanagari script
        const isHindi = /[\u0900-\u097F]|(?:kaise|kya|batao|karo|banao|hai|hoon|yaar|bhai|sir|ji|theek|samjhao|likho|dikhao|mausam|samay|waqt)/i.test(text);

        const utterance = new SpeechSynthesisUtterance(text);

        // Dynamically adjust pitch and rate based on conversational sentiment
        if (sentimentType === 'excited') {
          utterance.rate = 1.08;
          utterance.pitch = 1.15;
        } else if (sentimentType === 'warm_friendly') {
          utterance.rate = 1.02;
          utterance.pitch = 1.10;
        } else if (sentimentType === 'tactical') {
          utterance.rate = 1.05;
          utterance.pitch = 0.98;
        } else if (sentimentType === 'analytical') {
          utterance.rate = 1.03;
          utterance.pitch = 1.04;
        } else {
          utterance.rate = 1.02;
          utterance.pitch = 1.07;
        }

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          let chosenVoice = null;

          if (isHindi) {
            // Find Hindi voice
            chosenVoice = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')) ||
                          voices.find(v => v.lang === 'en-IN' && v.name.toLowerCase().includes('female')) ||
                          voices.find(v => v.lang === 'en-IN');
          }

          if (!chosenVoice) {
            // Find natural female English voice (Avni persona)
            chosenVoice = voices.find(v => v.lang === 'en-IN' && v.name.toLowerCase().includes('female')) ||
                          voices.find(v => v.lang === 'en-IN') ||
                          voices.find(v => v.name.includes('Google UK English Female') || v.name.includes('Google US English Female')) ||
                          voices.find(v => v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('heera')) ||
                          voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) ||
                          voices.find(v => v.lang.startsWith('en'));
          }

          if (chosenVoice) {
            utterance.voice = chosenVoice;
          }
        }

        // Simulate waveform energy levels during Web Speech synthesis
        let energyStep = 0;
        this.fallbackIntervalId = setInterval(() => {
          if (requestId !== this.currentRequestId) {
            clearInterval(this.fallbackIntervalId);
            return;
          }
          energyStep++;
          const simulatedEnergy = 40 + Math.floor(Math.sin(energyStep * 0.4) * 35) + Math.floor(Math.random() * 15);
          this.notify(true, simulatedEnergy);
        }, 80);

        utterance.onend = () => {
          if (this.fallbackIntervalId) clearInterval(this.fallbackIntervalId);
          if (requestId === this.currentRequestId) {
            this.stop();
            resolve(true);
          }
        };

        utterance.onerror = (e) => {
          if (this.fallbackIntervalId) clearInterval(this.fallbackIntervalId);
          if (requestId === this.currentRequestId) {
            console.warn('SpeechSynthesis error:', e);
            this.stop();
            resolve(false);
          }
        };

        // Resume in case speech was paused in Chrome background
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('Speech synthesis initiation failed:', err);
        if (this.fallbackIntervalId) clearInterval(this.fallbackIntervalId);
        this.stop();
        resolve(false);
      }
    });
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
      console.debug('AudioContext analyzer setup note:', e);
    }
  }

  public getStatus() {
    return {
      isSpeaking: this.isSpeaking,
      voice: 'Avni (ElevenLabs + WebSpeech Fallback)',
      voiceId: 'VG7gYikNQ71LJ52W9fAD',
    };
  }
}

export const voiceManager = new VoicePlaybackManager();
