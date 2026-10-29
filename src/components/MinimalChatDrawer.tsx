import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Send,
  ChevronUp,
  ChevronDown,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
} from 'lucide-react';
import { ChatMessage } from '../types';
import { playMicActivateChime, playToolChime } from '../utils/audioSfx';

interface MinimalChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isProcessing: boolean;
  isListening: boolean;
  onToggleListening: () => void;
  voiceActive: boolean;
  onToggleVoiceActive: () => void;
  audioEnergyLevel: number;
  persona: 'friday' | 'jarvis';
  onTogglePersona: (persona: 'friday' | 'jarvis') => void;
}

export const MinimalChatDrawer: React.FC<MinimalChatProps> = ({
  messages,
  onSendMessage,
  isProcessing,
  isListening,
  onToggleListening,
  voiceActive,
  onToggleVoiceActive,
  audioEnergyLevel,
  persona,
  onTogglePersona,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const latestMessage = messages[messages.length - 1];

  useEffect(() => {
    if (isExpanded) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 select-none">
      <div className="bg-[#050b18]/95 border border-cyan-800/80 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.2)] backdrop-blur-xl overflow-hidden transition-all duration-300">
        {/* Expanded Transcript Drawer */}
        {isExpanded && (
          <div className="max-h-80 overflow-y-auto p-4 border-b border-slate-800 space-y-3 font-code text-xs select-text">
            {messages.map((msg) => (
              <div key={msg.id} className="leading-relaxed">
                {msg.role === 'user' ? (
                  <span className="text-sky-400 font-semibold mr-1.5">YOU:</span>
                ) : msg.role === 'jarvis' ? (
                  <span className="text-emerald-400 font-semibold mr-1.5">
                    {persona === 'friday' ? 'F.R.I.D.A.Y.:' : 'J.A.R.V.I.S.:'}
                  </span>
                ) : msg.role === 'tool' ? (
                  <span className="text-amber-400 font-semibold mr-1.5">[TOOL]:</span>
                ) : (
                  <span className="text-slate-500 font-semibold mr-1.5">[SYS]:</span>
                )}
                <span className="text-slate-200">{msg.text}</span>
              </div>
            ))}
            {isProcessing && (
              <div className="text-cyan-400 animate-pulse text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>{persona === 'friday' ? 'F.R.I.D.A.Y.' : 'J.A.R.V.I.S.'} is synthesizing answer & action...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>
        )}

        {/* Minimal 1-Line HUD Pill & Directive Input */}
        <div className="px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-3">
          {/* Persona quick switch badge */}
          <button
            onClick={() => {
              playToolChime();
              onTogglePersona(persona === 'friday' ? 'jarvis' : 'friday');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[10px] font-tech uppercase font-bold tracking-wider text-cyan-300 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            title="Switch Voice Persona between F.R.I.D.A.Y. (Female) and J.A.R.V.I.S. (Male)"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                persona === 'friday' ? 'bg-cyan-400' : 'bg-amber-400'
              }`}
            />
            <span>{persona === 'friday' ? 'F.R.I.D.A.Y. (Female)' : 'J.A.R.V.I.S. (Male)'}</span>
          </button>

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={() => {
              playMicActivateChime();
              onToggleListening();
            }}
            className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700/80'
            }`}
            title="Click to speak"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>

          {/* Real-time Neon Equalizer waveform */}
          <div className="hidden md:flex items-center gap-0.5 h-4 px-1 shrink-0">
            {[40, 70, 30, 90, 50, 80, 20].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-cyan-400/80 rounded-full transition-all duration-75"
                style={{
                  height: isListening
                    ? `${Math.max(4, (audioEnergyLevel / 100) * 16)}px`
                    : isProcessing
                    ? `${(h / 100) * 16}px`
                    : '4px',
                }}
              />
            ))}
          </div>

          {/* Quick Directive / Question Form */}
          <form onSubmit={handleSubmit} className="flex-1 min-w-0 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                latestMessage
                  ? `${persona === 'friday' ? 'F.R.I.D.A.Y.' : 'J.A.R.V.I.S.'}: "${latestMessage.text.slice(0, 45)}${latestMessage.text.length > 45 ? '...' : ''}"`
                  : "Ask anything, give work, or control PC..."
              }
              className="w-full bg-slate-900/80 border border-slate-800/80 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="p-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white rounded-lg cursor-pointer shrink-0"
              title="Send directive"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Controls: Audio mute & Drawer expand */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onToggleVoiceActive}
              className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                voiceActive
                  ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-400'
                  : 'bg-slate-900 border-slate-800 text-slate-600'
              }`}
              title={voiceActive ? 'Voice Audio Output ON' : 'Voice Audio Output Muted'}
            >
              {voiceActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 cursor-pointer transition-all"
              title={isExpanded ? 'Collapse Transcript' : 'Expand Transcript'}
            >
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
