import React, { useState, useEffect } from 'react';
import { FileText, Copy, Check, Download, X, Terminal, Sparkles } from 'lucide-react';
import { playToolChime } from '../utils/audioSfx';

interface GhostWritingModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentData: {
    appName: string;
    topic: string;
    wordCount: number;
    content: string;
  } | null;
}

export const GhostWritingModal: React.FC<GhostWritingModalProps> = ({
  isOpen,
  onClose,
  documentData,
}) => {
  const [typedChars, setTypedChars] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !documentData?.content) {
      setTypedChars(0);
      setIsTyping(false);
      return;
    }

    setTypedChars(0);
    setIsTyping(true);

    const fullText = documentData.content;
    const totalLen = fullText.length;
    // Ghost typing speeds: burst chunks for rapid typing
    const step = Math.max(3, Math.floor(totalLen / 60));

    const interval = setInterval(() => {
      setTypedChars((prev) => {
        const next = prev + step;
        if (next >= totalLen) {
          clearInterval(interval);
          setIsTyping(false);
          return totalLen;
        }
        return next;
      });
    }, 25);

    return () => clearInterval(interval);
  }, [isOpen, documentData]);

  if (!isOpen || !documentData) return null;

  const displayedContent = documentData.content.slice(0, typedChars);

  const handleCopy = () => {
    navigator.clipboard.writeText(documentData.content);
    setCopied(true);
    playToolChime();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([documentData.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentData.topic.toLowerCase().replace(/\s+/g, '_')}_brief.txt`;
    a.click();
    URL.revokeObjectURL(url);
    playToolChime();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-950 border border-cyan-500/50 rounded-2xl shadow-2xl shadow-cyan-950/80 flex flex-col overflow-hidden">
        {/* Top OS Window Chrome Header */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-tech font-bold uppercase tracking-wider text-cyan-300">
                  {documentData.appName.toUpperCase()} // HANDS-FREE GHOST TYPING
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-mono">
                  {isTyping ? '⚡ GHOST TYPING ACTIVE' : '✔ COMPLETE'}
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                Pulse of AI • Episode 17 Protocol • Topic: {documentData.topic} ({documentData.wordCount} words)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Copy to Clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Download as .txt"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area with typing animation */}
        <div className="p-4 bg-slate-950 max-h-[60vh] overflow-y-auto font-mono text-xs text-slate-200 select-text leading-relaxed whitespace-pre-wrap">
          {displayedContent}
          {isTyping && (
            <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
          )}
        </div>

        {/* Footer Status Bar */}
        <div className="px-4 py-2 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Target: {documentData.appName}</span>
            <span>•</span>
            <span>Words: ~{documentData.wordCount}</span>
          </div>
          <span className="text-cyan-400 font-tech">EPISODE 17 // NO KEYBOARD TOUCHED</span>
        </div>
      </div>
    </div>
  );
};
