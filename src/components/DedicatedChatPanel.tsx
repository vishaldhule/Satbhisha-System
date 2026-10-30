import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Image,
  X,
  Volume2,
  VolumeX,
  Square,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Sparkles,
  Bot,
  User,
  Paperclip,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { ChatMessage, GeneratedTool, HologramPayload } from '../types';
import { playMicActivateChime, playToolChime } from '../utils/audioSfx';
import {
  CloudSun,
  Clock,
  Brain,
  Globe,
  Radio,
  Eye,
} from 'lucide-react';

interface DedicatedChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, imageBase64?: string) => Promise<void>;
  onClearHistory: () => void;
  isProcessing: boolean;
  isListening: boolean;
  onToggleListening: () => void;
  voiceActive: boolean;
  onToggleVoiceActive: () => void;
  isSpeaking: boolean;
  onStopSpeech: () => void;
  onSpeakText: (text: string) => void;
  onOpenGeneratedTool?: (tool: GeneratedTool) => void;
  onOpenHologram?: (hologram: HologramPayload) => void;
}

export const DedicatedChatPanel: React.FC<DedicatedChatPanelProps> = ({
  messages,
  onSendMessage,
  onClearHistory,
  isProcessing,
  isListening,
  onToggleListening,
  voiceActive,
  onToggleVoiceActive,
  isSpeaking,
  onStopSpeech,
  onSpeakText,
  onOpenGeneratedTool,
  onOpenHologram,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Handle send message
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || isProcessing) return;

    onSendMessage(inputText, selectedImage || undefined);
    setInputText('');
    setSelectedImage(null);
  };

  // Handle Image File selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
      playToolChime();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickActionChips = [
    { label: '🌤️ Delhi Weather Hologram', text: 'Delhi ka weather kaisa hai, hologram dikhao' },
    { label: '⏰ Atomic Time Hologram', text: 'Current time and atomic clock' },
    { label: '🧠 3D Neural Brain', text: 'Show 3D neural brain core' },
    { label: '🌍 Global Earth Swarm', text: 'Global surveillance earth swarm' },
    { label: '🚨 Tactical Serious Mode', text: 'Engage serious mode' },
    { label: '📊 Visual PPT Deck', text: 'AI par presentation banao' },
    { label: '✍️ Tech Proposal (100w)', text: 'JARVIS, future technology par 100 words ka proposal likho' },
  ];

  return (
    <div className="flex flex-col h-full min-h-0 w-full overflow-hidden bg-[#071225]/40 backdrop-blur-xl relative">
      {/* Top Chat Sub-Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-800 bg-[#0B0F19]/90">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block" />
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute inset-0 animate-ping" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 font-tech uppercase tracking-wider">
              J.A.R.V.I.S. Neural Dialogue Console
            </h3>
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 flex-wrap">
              <span>Voice: <strong className="text-cyan-400">Avni (ElevenLabs)</strong></span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-bold">⚡ Ultra-Fast Groq (Sub-1s)</span>
              <span className="text-slate-600">+</span>
              <span className="text-purple-400">Gemini Vision</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Voice Toggle */}
          <button
            onClick={onToggleVoiceActive}
            className={`p-2 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
              voiceActive
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-500'
            }`}
            title={voiceActive ? 'Voice output active' : 'Voice output muted'}
          >
            {voiceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Stop Speech */}
          {isSpeaking && (
            <button
              onClick={onStopSpeech}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-tech font-bold uppercase transition-all animate-pulse cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.5)]"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop Voice</span>
            </button>
          )}

          {/* Clear history */}
          <button
            onClick={onClearHistory}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-700 transition-all cursor-pointer"
            title="Clear conversation history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-6">
            <div className="w-16 h-16 rounded-3xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(0,229,255,0.2)]">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-200 font-tech uppercase tracking-wide">
                Ready for Instructions, Sir
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 font-sans">
                Ask questions, generate presentations, command desktop applications, analyze images, or converse
                naturally in Hindi, Hinglish, or English.
              </p>
            </div>

            {/* Quick Suggestions */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 max-w-lg">
              {quickActionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(chip.text)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-xs font-mono text-slate-300 transition-all cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'} group animate-in fade-in duration-200`}>
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 space-y-2 shadow-lg ${
                  isUser
                    ? 'bg-gradient-to-br from-cyan-600/30 to-blue-600/30 border border-cyan-500/40 text-slate-100'
                    : 'bg-[#0B0F19]/90 border border-slate-800 text-slate-200'
                }`}
              >
                {/* Header tag */}
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800/80 pb-1.5">
                  <div className="flex items-center space-x-1.5">
                    {isUser ? <User className="w-3 h-3 text-cyan-300" /> : <Bot className="w-3 h-3 text-emerald-400" />}
                    <span className="font-bold uppercase tracking-wider">{isUser ? 'YOU' : 'J.A.R.V.I.S.'}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {msg.timestamp && <span>{msg.timestamp}</span>}
                    <button
                      onClick={() => handleCopyMessage(msg.id, msg.text)}
                      className="opacity-0 group-hover:opacity-100 hover:text-cyan-400 transition-opacity cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    {!isUser && voiceActive && (
                      <button
                        onClick={() => onSpeakText(msg.text)}
                        className="opacity-0 group-hover:opacity-100 hover:text-cyan-400 transition-opacity cursor-pointer"
                        title="Read aloud in Avni voice"
                      >
                        <Volume2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Attached image preview in chat message */}
                {msg.image && (
                  <div className="rounded-xl overflow-hidden border border-cyan-500/30 max-h-60 max-w-sm">
                    <img src={msg.image} alt="Uploaded Frame" className="w-full h-auto object-cover" />
                  </div>
                )}

                {/* Message Body */}
                <div className="text-xs sm:text-sm font-sans leading-relaxed whitespace-pre-wrap select-text">
                  {msg.text}
                </div>

                {/* 3D Holographic Projection Launcher Card (Episode 24 & Live APIs) */}
                {msg.hologram && (
                  <div className="pt-2">
                    <button
                      onClick={() => onOpenHologram && onOpenHologram(msg.hologram!)}
                      className="w-full group/holo flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/80 via-blue-950/60 to-slate-900 border border-cyan-500/50 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all cursor-pointer text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 group-hover/holo:scale-110 transition-transform">
                          {msg.hologram.type === 'weather' && <CloudSun className="w-5 h-5 text-amber-300 animate-pulse" />}
                          {msg.hologram.type === 'chrono' && <Clock className="w-5 h-5 text-cyan-300 animate-spin" />}
                          {msg.hologram.type === 'brain' && <Brain className="w-5 h-5 text-purple-300 animate-pulse" />}
                          {msg.hologram.type === 'earth' && <Globe className="w-5 h-5 text-emerald-300 animate-pulse" />}
                          {msg.hologram.type === 'serious' && <Radio className="w-5 h-5 text-rose-400 animate-bounce" />}
                          {msg.hologram.type === 'reactor' && <Eye className="w-5 h-5 text-cyan-300 animate-pulse" />}
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 block tracking-wider">
                            ✨ Holographic Matrix Synthesized
                          </span>
                          <span className="text-xs font-tech font-bold text-slate-100">
                            {msg.hologram.title || `${msg.hologram.type.toUpperCase()} HOLOGRAM`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 text-xs font-mono font-bold group-hover/holo:bg-cyan-500 group-hover/holo:text-slate-950 transition-colors">
                        <span>PROJECT</span>
                        <span>⚡</span>
                      </div>
                    </button>
                  </div>
                )}

                {/* Tool Executions Badge */}
                {msg.toolExecutions && msg.toolExecutions.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    {msg.toolExecutions.map((t, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] font-mono px-2.5 py-1 rounded bg-slate-950/80 border border-slate-800 text-cyan-300 flex items-center justify-between"
                      >
                        <span className="font-bold">⚡ EXECUTED: {t.name}</span>
                        {t.result?.appName && <span className="text-slate-400">Target: {t.result.appName}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="rounded-2xl p-4 bg-[#0B0F19]/90 border border-cyan-500/40 text-cyan-300 flex items-center space-x-3 shadow-lg">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span className="text-xs font-mono tracking-wider">
                NEURAL CORE PROCESSING // CONSULTING GEMINI & GROQ...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Image Thumbnail Preview above composer */}
      {selectedImage && (
        <div className="flex-shrink-0 px-4 sm:px-6 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-cyan-500/50">
              <img src={selectedImage} alt="Attachment" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 font-tech">Attached Image Ready</span>
              <span className="text-[10px] text-slate-400 block font-mono">Gemini Vision inspection armed</span>
            </div>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Fixed Composer Bottom Container (Strict Architecture: NEVER overlaps messages or drawers) */}
      <div className="flex-shrink-0 relative w-full p-3 sm:p-4 bg-[#071225] border-t border-slate-800 shadow-2xl">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-5xl mx-auto w-full">
          {/* Hidden File Input for images */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Image Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer flex-shrink-0"
            title="Attach Screenshot or Photograph"
          >
            <Image className="w-4 h-4" />
          </button>

          {/* Microphone Button */}
          <button
            type="button"
            onClick={() => {
              playMicActivateChime();
              onToggleListening();
            }}
            className={`p-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0 ${
              isListening
                ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 border border-slate-800'
            }`}
            title={isListening ? 'Microphone Listening' : 'Speak to JARVIS'}
          >
            {isListening ? <Mic className="w-4 h-4 animate-bounce" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            placeholder={isListening ? 'Listening to your speech...' : 'Type instructions or questions in English or Hindi...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs sm:text-sm font-sans text-slate-100 placeholder-slate-600 focus:outline-none transition-all"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={isProcessing || (!inputText.trim() && !selectedImage)}
            className="px-4 sm:px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-tech font-bold text-xs uppercase transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,229,255,0.3)] cursor-pointer flex-shrink-0"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="hidden sm:inline">Transmit</span>
          </button>
        </form>
      </div>
    </div>
  );
};
