import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  ChevronDown,
  Minimize2,
  Maximize2,
  Trash2,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  Zap,
  ExternalLink,
  RotateCcw,
  Eye,
  Camera,
  Upload,
} from 'lucide-react';
import { ChatMessage, GeneratedTool } from '../types';
import { playMicActivateChime, playToolChime } from '../utils/audioSfx';

interface HolographicChatBoxProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string, imageBase64?: string) => Promise<void>;
  onClearHistory: () => void;
  isProcessing: boolean;
  isListening: boolean;
  onToggleListening: () => void;
  voiceActive: boolean;
  onToggleVoiceActive: () => void;
  audioEnergyLevel: number;
  persona: 'friday' | 'jarvis';
  onSpeakMessage: (text: string) => void;
  onOpenGeneratedTool?: (tool: GeneratedTool) => void;
  onCaptureScreen?: () => void;
  onUploadImage?: () => void;
}

export const HolographicChatBox: React.FC<HolographicChatBoxProps> = ({
  isOpen,
  onToggleOpen,
  messages,
  onSendMessage,
  onClearHistory,
  isProcessing,
  isListening,
  onToggleListening,
  voiceActive,
  onToggleVoiceActive,
  audioEnergyLevel,
  persona,
  onSpeakMessage,
  onOpenGeneratedTool,
  onCaptureScreen,
  onUploadImage,
}) => {
  const [inputText, setInputText] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isCompact, setIsCompact] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto scroll to bottom on new message
  useEffect(() => {
    if (isOpen && !isCompact) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isProcessing, isCompact]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isCompact]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <>
      {/* 1. FLOATING MINIMIZED PILL (Always visible when minimized) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={() => {
              playToolChime();
              onToggleOpen();
            }}
            className="group relative flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-cyan-500/40 hover:border-cyan-400 text-slate-100 backdrop-blur-xl shadow-2xl shadow-cyan-950/60 transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Open Talking Chat Box & Full History"
          >
            <div className="relative flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-cyan-400 group-hover:rotate-6 transition-transform" />
              {isProcessing && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs font-tech font-bold uppercase tracking-wider text-cyan-300">
                Chat &amp; History
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {messages.length} messages • Click to Expand
              </span>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-[10px] font-mono font-bold text-cyan-300">
              {messages.length}
            </span>
          </button>
        </div>
      )}

      {/* 2. EXPANDED / MINI-DOCK HOLOGRAPHIC CHAT WINDOW (EPISODE 16) */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-slate-950/95 border border-cyan-500/40 backdrop-blur-2xl shadow-2xl shadow-cyan-950/80 overflow-hidden ${
            isCompact
              ? 'bottom-4 right-4 sm:right-6 w-[95vw] sm:w-[460px] h-[98px] rounded-2xl border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
              : isFullScreen
              ? 'inset-4 sm:inset-10 rounded-3xl'
              : 'bottom-4 right-4 sm:right-6 w-[95vw] sm:w-[480px] h-[580px] max-h-[85vh] rounded-3xl'
          }`}
        >
          {/* Top Window Bar: Stark Cyber Header */}
          <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]" />
              <div>
                <h3 className="text-xs font-tech font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                  <span>{persona === 'friday' ? 'F.R.I.D.A.Y.' : 'J.A.R.V.I.S.'} NEURAL CONSOLE</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400 font-mono">
                    {isCompact ? 'MINI-DOCK' : `${messages.length} LOGS`}
                  </span>
                </h3>
                {!isCompact && (
                  <p className="text-[10px] font-mono text-slate-400">
                    Dual-Mode Voice &amp; Keyboard Station • Pulse of AI
                  </p>
                )}
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1.5 text-slate-400">
              {/* Episode 16: Mini-Dock Toggle Button */}
              <button
                onClick={() => {
                  playToolChime();
                  setIsCompact(!isCompact);
                }}
                className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-cyan-950 border border-cyan-500/30 text-[10px] font-tech font-bold text-cyan-300 hover:text-cyan-200 transition-all cursor-pointer"
                title={isCompact ? 'Expand to Full Neural HUD' : 'Collapse into Cyberpunk Mini-Dock'}
              >
                {isCompact ? '[+] EXPAND' : '[—] COMPACT'}
              </button>

              {!isCompact && (
                <>
                  {/* Voice Mute / Unmute */}
                  <button
                    onClick={onToggleVoiceActive}
                    className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-cyan-300 transition-colors cursor-pointer"
                    title={voiceActive ? 'Voice Audio Output ON' : 'Voice Audio Output Muted'}
                  >
                    {voiceActive ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                  </button>

                  {/* Clear History */}
                  <button
                    onClick={() => {
                      if (confirm('Clear talking chat history log, sir?')) {
                        onClearHistory();
                        playToolChime();
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-950/50 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Clear Chat History"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Toggle Full Screen */}
                  <button
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="hidden sm:inline-flex p-1.5 rounded-lg hover:bg-slate-800 hover:text-cyan-300 transition-colors cursor-pointer"
                    title={isFullScreen ? 'Restore Size' : 'Maximize Window'}
                  >
                    {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                </>
              )}

              {/* Minimize / Close Window */}
              <button
                onClick={() => {
                  playToolChime();
                  onToggleOpen();
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer flex items-center gap-1"
                title="Minimize Console"
              >
                <ChevronDown className="w-4 h-4" />
                {!isCompact && <span className="text-[10px] font-mono font-bold pr-1">Minimize</span>}
              </button>
            </div>
          </div>

          {/* Chat Transcript Area (Scrollable Talking History - Hidden in Mini-Dock Mode) */}
          {!isCompact && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 select-text">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <MessageSquare className="w-8 h-8 text-slate-600 mb-2 opacity-50" />
                  <p className="text-xs font-mono">No prior conversation records in local memory.</p>
                  <p className="text-[10px] font-mono text-slate-600 mt-1">
                    Type a command, speak into the mic, or click a suggestion below.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  const isJarvis = msg.role === 'jarvis';
                  const isSystem = msg.role === 'system';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      {/* Role Header & Timestamp */}
                      <div className="flex items-center gap-2 px-1 text-[10px] font-mono text-slate-400">
                        {isUser ? (
                          <>
                            <span>{msg.timestamp}</span>
                            <span className="text-cyan-400 font-bold flex items-center gap-1">
                              <User className="w-3 h-3" /> YOU
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <Bot className="w-3 h-3" /> {persona === 'friday' ? 'F.R.I.D.A.Y.' : 'J.A.R.V.I.S.'}
                            </span>
                            <span>{msg.timestamp}</span>
                          </>
                        )}
                      </div>

                      {/* Speech Bubble */}
                      <div
                        className={`relative group max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-sans leading-relaxed shadow-md ${
                          isUser
                            ? 'bg-cyan-950/40 border border-cyan-500/40 text-cyan-100 rounded-tr-none'
                            : isSystem
                            ? 'bg-rose-950/30 border border-rose-500/40 text-rose-200'
                            : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                        }`}
                      >
                        <p>{msg.text}</p>

                        {/* Optical Image Preview for Multimodal Vision (EP 14) */}
                        {msg.imagePreview && (
                          <div className="mt-2.5 rounded-xl overflow-hidden border border-cyan-500/40 bg-black/70 shadow-lg">
                            <img
                              src={msg.imagePreview}
                              alt="Optical Capture"
                              className="w-full max-h-48 object-cover rounded-lg"
                            />
                            <div className="px-2.5 py-1 bg-slate-950/90 text-[10px] font-mono text-cyan-400 flex items-center justify-between border-t border-cyan-500/20">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3 text-cyan-400" /> Optical Sensor Feed
                              </span>
                              <span className="text-[9px] text-slate-400">EP 14 Multimodal Vision</span>
                            </div>
                          </div>
                        )}

                        {/* Tool Execution Badge */}
                        {msg.toolExecution && (
                          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
                            <Zap className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span>{msg.toolExecution.result?.message || `Executed ${msg.toolExecution.name}`}</span>
                          </div>
                        )}

                        {/* Generated Tool launch chip */}
                        {msg.generatedTool && (
                          <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-cyan-400 font-bold">
                              🚀 {msg.generatedTool.name}
                            </span>
                            {onOpenGeneratedTool && (
                              <button
                                onClick={() => onOpenGeneratedTool(msg.generatedTool!)}
                                className="px-2 py-0.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-tech font-bold uppercase transition-all cursor-pointer flex items-center gap-1 shadow"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                                <span>Open Applet</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Replay voice button for AI messages */}
                        {isJarvis && (
                          <button
                            onClick={() => onSpeakMessage(msg.text)}
                            title="Speak this response aloud"
                            className="opacity-0 group-hover:opacity-100 transition-opacity absolute -right-7 top-2 p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 cursor-pointer"
                          >
                            <Volume2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Neural Synthesis Pulse */}
              {isProcessing && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs font-mono animate-pulse w-fit">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>{persona === 'friday' ? 'F.R.I.D.A.Y.' : 'J.A.R.V.I.S.'} is synthesizing directive...</span>
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          )}

          {/* Quick Directive Suggestion Chips (Hidden in Mini-Dock Mode) */}
          {!isCompact && (
            <div className="px-3 py-1.5 border-t border-slate-800/80 bg-slate-900/40 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono scrollbar-none">
              {/* EP 16 Mini Dock Toggle */}
              <button
                onClick={() => setIsCompact(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 shrink-0 transition-all cursor-pointer flex items-center gap-1"
                title="Collapse into Mini Dock Mode"
              >
                <span>[—] Mini-Dock (EP 16)</span>
              </button>

              {/* EP 15 Code Generator Chips */}
              <button
                onClick={() => onSendMessage('Generate and run a modern scientific calculator GUI')}
                className="px-2.5 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900/80 border border-purple-500/50 text-purple-300 shrink-0 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                title="Synthesize Python Tkinter Calculator (EP 15)"
              >
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>💻 Coder: Calculator (EP 15)</span>
              </button>

              <button
                onClick={() => onSendMessage('Generate an interactive space pong arcade game')}
                className="px-2.5 py-1 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-500/50 text-indigo-300 shrink-0 transition-all cursor-pointer flex items-center gap-1"
                title="Synthesize Arcade Game (EP 15)"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>🎮 Coder: Space Pong</span>
              </button>

              {/* EP 17 Ghost Typing & Writing Chips */}
              <button
                onClick={() => onSendMessage('JARVIS, future technology par 100 words ka proposal likho')}
                className="px-2.5 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/50 text-cyan-300 shrink-0 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                title="Hands-Free Ghost Typing (EP 17)"
              >
                <span>✍️ Future Tech Proposal (100w EP 17)</span>
              </button>

              <button
                onClick={() => onSendMessage('Notepad kholo aur AI ethics par 150 words ka essay likho')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/40 text-emerald-300 shrink-0 transition-all cursor-pointer flex items-center gap-1"
                title="Compose AI Ethics essay in Notepad (EP 17)"
              >
                <span>📝 Notepad: AI Ethics (EP 17)</span>
              </button>

              {/* EP 14 Screen Vision Chips */}
              <button
                onClick={() => {
                  if (onCaptureScreen) {
                    onCaptureScreen();
                  } else {
                    onSendMessage('Ye screen par kya hai? Read and explain my screen.');
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 shrink-0 transition-all cursor-pointer flex items-center gap-1 shadow-sm shadow-emerald-950/40"
                title="Capture active screen & read display"
              >
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>👁️ Read Screen (EP 14)</span>
              </button>

              {onUploadImage && (
                <button
                  onClick={onUploadImage}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-500/40 text-cyan-300 shrink-0 transition-all cursor-pointer flex items-center gap-1"
                  title="Upload image for inspection"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>📷 Upload Image</span>
                </button>
              )}

              <button
                onClick={() => onSendMessage('open chrome and search vishal')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 shrink-0 transition-all cursor-pointer"
              >
                🔍 Search "vishal"
              </button>
              <button
                onClick={() => onSendMessage('Terminate and close Google Chrome')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-rose-300 shrink-0 transition-all cursor-pointer"
              >
                🛑 Close Chrome
              </button>
              <button
                onClick={() => onSendMessage('Deep background task purge and kill updater daemons')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-rose-300 shrink-0 transition-all cursor-pointer"
              >
                ⚡ Deep Purge (EP 11)
              </button>
              <button
                onClick={() => onSendMessage('Skip to next YouTube Short')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 shrink-0 transition-all cursor-pointer"
              >
                ⏭️ Next Short (EP 13)
              </button>
              <button
                onClick={() => onSendMessage('Report full silicon vitals and temperatures')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-500/40 text-amber-300 shrink-0 transition-all cursor-pointer"
              >
                🌡️ Vitals (EP 09)
              </button>
              <button
                onClick={() => onSendMessage('Enable optical hand tracking mouse controller')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 shrink-0 transition-all cursor-pointer"
              >
                🖐️ Hand Mouse
              </button>
              <button
                onClick={() => onSendMessage('Skip this YouTube ad')}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/40 text-emerald-300 shrink-0 transition-all cursor-pointer"
              >
                🎯 Skip Ad
              </button>
            </div>
          )}

          {/* Bottom Chat Input Form Deck (Available in both Full and Mini-Dock mode) */}
          <div className="p-2.5 bg-slate-900/95 border-t border-slate-800 flex flex-col gap-2">
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              {/* Eye Screen Vision Button (EP 14) */}
              <button
                type="button"
                onClick={() => {
                  playToolChime();
                  if (onCaptureScreen) {
                    onCaptureScreen();
                  } else {
                    onSendMessage('Ye screen par kya hai? Read and explain my screen.');
                  }
                }}
                title="Capture and Read Screen (EP 14 Vision)"
                className="p-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center justify-center bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/40 shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>

              {/* Upload Image Button */}
              {onUploadImage && (
                <button
                  type="button"
                  onClick={onUploadImage}
                  title="Upload image for AI Eyes to inspect"
                  className="p-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center justify-center bg-slate-800 hover:bg-cyan-950 text-cyan-400 border border-cyan-500/30"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Microphone Button */}
              <button
                type="button"
                onClick={() => {
                  playMicActivateChime();
                  onToggleListening();
                }}
                title={isListening ? 'Stop Listening' : 'Speak to AI'}
                className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                  isListening
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/50 animate-pulse'
                    : 'bg-slate-800 text-cyan-400 hover:bg-cyan-950 border border-cyan-500/30'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isListening
                    ? 'Listening to speech...'
                    : isCompact
                    ? 'Command input (Terminal/HUD sync)...'
                    : 'Type command or say "ye screen par kya hai"...'
                }
                disabled={isProcessing}
                className="flex-1 bg-slate-950/90 border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors"
              />

              {/* Send / Transmit Directive Button (EP 16 TRANSMIT) */}
              <button
                type="submit"
                disabled={!inputText.trim() || isProcessing}
                className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-tech font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
                title="Transmit Directive"
              >
                <span className="hidden sm:inline">TRANSMIT</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
