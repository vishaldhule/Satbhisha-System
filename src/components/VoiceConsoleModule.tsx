import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, Square, Sparkles, Shield, Activity, Waves } from 'lucide-react';
import { voiceManager } from '../utils/voiceManager';
import { playMicActivateChime, playToolChime } from '../utils/audioSfx';

interface VoiceConsoleModuleProps {
  isListening: boolean;
  onToggleListening: () => void;
  isSpeaking: boolean;
  audioEnergyLevel: number;
  onStopSpeech: () => void;
  onTestSpeech: (text: string) => void;
}

export const VoiceConsoleModule: React.FC<VoiceConsoleModuleProps> = ({
  isListening,
  onToggleListening,
  isSpeaking,
  audioEnergyLevel,
  onStopSpeech,
  onTestSpeech,
}) => {
  const quickTestPhrases = [
    'JARVIS, future technology par 100 words ka proposal likho',
    'Open notepad and write a 100-word essay on quantum computing',
    'AI par presentation banao (Episode 18/19)',
    'Hello J.A.R.V.I.S., kya haal hai?',
    'Clean RAM and optimize background tasks',
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <Waves className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-lg font-bold text-slate-100 font-tech tracking-wide uppercase">
              Single-Voice Neural Pipeline (Avni)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Strict single-stream audio playback manager. Exclusively bound to ElevenLabs Voice ID: <code className="text-cyan-300">VG7gYikNQ71LJ52W9fAD</code>.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>ZERO-OVERLAP ENFORCED</span>
        </div>
      </div>

      {/* Main Reactive Waveform Stage */}
      <div className="p-8 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
        {/* Glow halo */}
        <div className={`absolute w-64 h-64 rounded-full blur-[100px] pointer-events-none transition-all duration-500 ${
          isSpeaking ? 'bg-cyan-500/20' : isListening ? 'bg-emerald-500/20' : 'bg-slate-800/20'
        }`} />

        {/* Live Status Badge */}
        <div className="flex items-center space-x-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-cyan-400 animate-ping' : isListening ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
          <span className="text-xs font-tech font-bold uppercase tracking-widest text-slate-300">
            {isSpeaking ? 'AVNI (ELEVENLABS) SPEAKING...' : isListening ? 'LISTENING TO MICROPHONE...' : 'SYSTEM IDLE // READY'}
          </span>
        </div>

        {/* Dynamic Waveform Bars */}
        <div className="flex items-center justify-center space-x-1.5 sm:space-x-2 h-24 w-full max-w-md">
          {Array.from({ length: 24 }).map((_, i) => {
            const height = isSpeaking
              ? Math.max(12, Math.sin((i / 24) * Math.PI) * (audioEnergyLevel || 35) + Math.random() * 15)
              : isListening
              ? Math.max(8, Math.random() * 40 + 10)
              : 8;

            return (
              <div
                key={i}
                style={{ height: `${height}px` }}
                className={`w-1.5 sm:w-2 rounded-full transition-all duration-100 ${
                  isSpeaking
                    ? 'bg-gradient-to-t from-cyan-600 to-cyan-300 shadow-[0_0_8px_rgba(0,229,255,0.6)]'
                    : isListening
                    ? 'bg-gradient-to-t from-emerald-600 to-emerald-300'
                    : 'bg-slate-800'
                }`}
              />
            );
          })}
        </div>

        {/* Big Control Buttons */}
        <div className="flex items-center space-x-4 z-10 pt-2">
          {/* Microphone Push-to-Talk / Toggle */}
          <button
            onClick={() => {
              playMicActivateChime();
              onToggleListening();
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-tech font-bold text-xs uppercase transition-all shadow-xl cursor-pointer ${
              isListening
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-105'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {isListening ? <Mic className="w-4 h-4 animate-bounce" /> : <MicOff className="w-4 h-4" />}
            <span>{isListening ? 'Listening Active' : 'Start Mic'}</span>
          </button>

          {/* Instant Stop Voice Button */}
          <button
            onClick={() => {
              playToolChime();
              onStopSpeech();
            }}
            disabled={!isSpeaking}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-tech font-bold text-xs uppercase transition-all cursor-pointer ${
              isSpeaking
                ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse'
                : 'bg-slate-800/40 border border-slate-800 text-slate-500 opacity-60'
            }`}
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Stop Audio</span>
          </button>
        </div>
      </div>

      {/* Voice Configuration & Testing Card */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-200 font-tech uppercase tracking-wide">
              Assigned Voice Profile
            </h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-lg border border-cyan-500/30">
            Avni • Multilingual V2
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Voice Model</span>
            <span className="text-slate-200 font-bold">Eleven Multilingual v2</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Voice ID</span>
            <span className="text-cyan-400 font-bold truncate block">VG7gYikNQ71LJ52W9fAD</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] text-slate-500 block uppercase">Barge-In Interruption</span>
            <span className="text-emerald-400 font-bold">INSTANT ABORT LOCK</span>
          </div>
        </div>

        {/* Quick Voice Test Prompts */}
        <div className="space-y-2 pt-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase">
            Test Speech Generation (Click to hear Avni):
          </span>
          <div className="flex flex-wrap gap-2">
            {quickTestPhrases.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => onTestSpeech(phrase)}
                className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-300 transition-all cursor-pointer text-left"
              >
                🔊 {phrase}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
