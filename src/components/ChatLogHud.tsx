import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Volume2, VolumeX, Radio, Sparkles, TerminalSquare } from 'lucide-react';
import { ChatMessage } from '../types';
import { playMicActivateChime, playStartupChime, playToolChime } from '../utils/audioSfx';

interface ChatLogHudProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isProcessing: boolean;
  isListening: boolean;
  onToggleListening: () => void;
  voiceActive: boolean;
  onToggleVoiceActive: () => void;
  audioEnergyLevel: number;
  isMediaPlaying: boolean;
}

export const ChatLogHud: React.FC<ChatLogHudProps> = ({
  messages,
  onSendMessage,
  isProcessing,
  isListening,
  onToggleListening,
  voiceActive,
  onToggleVoiceActive,
  audioEnergyLevel,
  isMediaPlaying,
}) => {
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Support Right Ctrl keyboard shortcut for Push-to-Talk as described in PDF
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ControlRight' && !isListening) {
        onToggleListening();
        playMicActivateChime();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ControlRight' && isListening) {
        onToggleListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isListening, onToggleListening]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="bg-[#0b0f19]/95 border border-cyan-900/60 rounded-xl p-4 sm:p-5 backdrop-blur-xl shadow-2xl flex flex-col h-[560px]">
      {/* HUD Header replicating Episode 15 Tkinter GUI */}
      <div className="border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-code text-sm font-bold text-[#00E5FF] tracking-wider uppercase flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-[#00E5FF]"></span>
              JARVIS NEURAL COMMAND HUD
            </h2>
            <p className="font-code text-[11px] text-[#70829B] mt-0.5">
              Autonomous Vision, UI Generator & Audio Engine • Pulse of AI
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Voice Output Toggle */}
            <button
              onClick={onToggleVoiceActive}
              className={`p-1.5 rounded-lg border text-xs font-code flex items-center gap-1.5 transition-all cursor-pointer ${
                voiceActive
                  ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title="Toggle JARVIS Speech Response"
            >
              {voiceActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{voiceActive ? 'VOICE ON' : 'MUTED'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Mode Bar: Push to Talk vs Hands Free */}
        <div className="mt-2.5 px-3 py-1.5 rounded bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs font-code">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span className={isMediaPlaying ? 'text-amber-300' : 'text-emerald-300'}>
              {isMediaPlaying
                ? 'PUSH-TO-TALK ARMED: Hold [Right Ctrl] or Click Mic'
                : 'HANDS-FREE VOICE DETECT ACTIVE (RMS > 450)'}
            </span>
          </div>

          {/* Audio Energy RMS Meter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500">RMS:</span>
            <div className="w-16 bg-slate-800 h-2 rounded overflow-hidden flex">
              <div
                className={`h-full transition-all duration-75 ${
                  audioEnergyLevel > 45 ? 'bg-cyan-400' : 'bg-slate-600'
                }`}
                style={{ width: `${Math.min(100, audioEnergyLevel * 1.5)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scrolled Chat Display replicating Episode 15 ScrolledText */}
      <div className="flex-1 overflow-y-auto bg-[#111827] rounded-lg p-3 sm:p-4 border border-slate-800 font-code text-xs space-y-3.5 select-text">
        {messages.map((msg) => {
          if (msg.role === 'user') {
            return (
              <div key={msg.id} className="text-[#38BDF8] leading-relaxed">
                <span className="font-bold text-sky-400 mr-2">YOU:</span>
                <span>{msg.text}</span>
              </div>
            );
          } else if (msg.role === 'jarvis') {
            return (
              <div key={msg.id} className="text-[#4ADE80] leading-relaxed">
                <span className="font-bold text-emerald-400 mr-2">JARVIS:</span>
                <span>{msg.text}</span>
              </div>
            );
          } else if (msg.role === 'tool') {
            return (
              <div
                key={msg.id}
                className="text-[#FBBF24] italic bg-slate-950/60 p-2.5 rounded border border-amber-900/40 text-[11px]"
              >
                <div className="font-bold flex items-center gap-1 text-amber-300">
                  <TerminalSquare className="w-3.5 h-3.5" />
                  <span>TOOL EXECUTED: [{msg.toolExecution?.name || 'SYSTEM_CALL'}]</span>
                </div>
                <div className="mt-1 text-slate-300 font-sans not-italic">{msg.text}</div>
                {msg.generatedTool && (
                  <div className="mt-1.5 font-mono text-[10px] text-cyan-400">
                    → Artifact: {msg.generatedTool.name} (Mounted in Sandbox Viewport)
                  </div>
                )}
              </div>
            );
          } else {
            // System message
            return (
              <div key={msg.id} className="text-[#94A3B8] text-[11px] italic">
                <span className="text-slate-500 mr-1.5">[SYSTEM]</span>
                <span>{msg.text}</span>
              </div>
            );
          }
        })}

        {isProcessing && (
          <div className="text-cyan-400 animate-pulse flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-ping"></span>
            <span>JARVIS ANSWERING...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Frame & Voice Controller */}
      <form onSubmit={handleSubmit} className="mt-3 flex items-center gap-2">
        {/* Push to talk / Mic button */}
        <button
          type="button"
          onClick={() => {
            playMicActivateChime();
            onToggleListening();
          }}
          className={`p-3 rounded-lg border font-bold transition-all cursor-pointer flex items-center justify-center shrink-0 ${
            isListening
              ? 'bg-rose-600 border-rose-500 text-white animate-pulse shadow-lg shadow-rose-950/60'
              : 'bg-[#1E293B] hover:bg-slate-700 border-slate-700 text-cyan-400'
          }`}
          title="Push to talk or toggle voice recognition"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Text Entry Box */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Speak or enter directive (e.g. 'mere liye modern calculator banao', 'system vitals', 'skip ad')..."
          className="flex-1 bg-[#1E293B] text-[#F8FAFC] font-code text-xs px-3.5 py-3 rounded-lg border border-slate-700/80 focus:border-[#00E5FF] focus:outline-none transition-all placeholder:text-slate-500"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={isProcessing || !inputText.trim()}
          className="px-5 py-3 bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-50 text-white font-code font-bold text-xs rounded-lg transition-all cursor-pointer shrink-0 shadow-md"
        >
          SEND
        </button>
      </form>
    </div>
  );
};
