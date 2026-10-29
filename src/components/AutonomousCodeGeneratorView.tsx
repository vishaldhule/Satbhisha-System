import React, { useState, useEffect } from 'react';
import { Play, Code, Box, Sparkles, RefreshCw, Copy, Check, ExternalLink, Download } from 'lucide-react';
import { GeneratedTool } from '../types';
import { playToolChime } from '../utils/audioSfx';

interface CodeGeneratorViewProps {
  currentTool: GeneratedTool | null;
  savedTools: GeneratedTool[];
  onSelectTool: (tool: GeneratedTool) => void;
  onGenerateCode: (prompt: string, category: 'utility' | 'game' | 'dashboard' | 'finance') => Promise<void>;
  isGenerating: boolean;
}

export const AutonomousCodeGeneratorView: React.FC<CodeGeneratorViewProps> = ({
  currentTool,
  savedTools,
  onSelectTool,
  onGenerateCode,
  isGenerating,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'library'>('preview');
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'utility' | 'game' | 'dashboard' | 'finance'>('utility');
  const [copied, setCopied] = useState(false);

  // Selected tool to display
  const activeTool = currentTool || savedTools[0];

  const handleRunPreset = async (presetPrompt: string, cat: 'utility' | 'game' | 'dashboard' | 'finance') => {
    setCustomPrompt(presetPrompt);
    setSelectedCategory(cat);
    await onGenerateCode(presetPrompt, cat);
    setActiveTab('preview');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim() || isGenerating) return;
    await onGenerateCode(customPrompt, selectedCategory);
    setActiveTab('preview');
  };

  const handleCopyCode = () => {
    if (activeTool?.code) {
      navigator.clipboard.writeText(activeTool.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadCode = () => {
    if (!activeTool) return;
    const blob = new Blob([activeTool.code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTool.name.toLowerCase().replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-950/90 border border-cyan-900/40 rounded-xl p-5 backdrop-blur-md shadow-2xl flex flex-col gap-4">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-tech text-base tracking-wider uppercase font-semibold text-slate-100 flex items-center gap-2">
              Autonomous App & Game Generator
              <span className="text-[10px] font-code px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                EPISODE 15 CORE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Agentic real-time software synthesis • Isolated sandbox execution
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3 h-3" /> Live Sandbox
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3 h-3" /> Code Inspector
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'library'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box className="w-3 h-3" /> Tool Vault ({savedTools.length})
          </button>
        </div>
      </div>

      {/* Synthesis Input Bar */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. 'JARVIS, mere liye modern multi-window style calculator banao' or 'Space arcade game'..."
              className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-500 rounded-lg py-2.5 pl-3 pr-20 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            <div className="absolute right-2 top-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="bg-slate-800 text-slate-300 text-[11px] font-mono rounded px-2 py-1 border border-slate-700 focus:outline-none"
              >
                <option value="utility">Utility</option>
                <option value="game">Game</option>
                <option value="dashboard">Dashboard</option>
                <option value="finance">Finance</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={isGenerating || !customPrompt.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-tech font-semibold text-xs tracking-wider uppercase rounded-lg flex items-center gap-1.5 shadow-lg shadow-cyan-950/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isGenerating ? 'Synthesizing...' : 'Synthesize Tool'}
          </button>
        </div>

        {/* Quick Episode 15 & Mark-XXXIX Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-400">
          <span className="text-[11px] font-mono text-slate-500 shrink-0">Presets:</span>
          <button
            type="button"
            onClick={() =>
              handleRunPreset('JARVIS, mere liye modern multi-window style calculator banao', 'utility')
            }
            className="px-2.5 py-1 rounded bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-700/60 text-slate-300 text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer"
          >
            Multi-Window Calculator
          </button>
          <button
            type="button"
            onClick={() =>
              handleRunPreset('Retro Asteroid Interceptor Game with particle explosions and score multiplier', 'game')
            }
            className="px-2.5 py-1 rounded bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-700/60 text-slate-300 text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer"
          >
            Retro Asteroid Interceptor
          </button>
          <button
            type="button"
            onClick={() =>
              handleRunPreset('Real-time Crypto & Stock Asset Matrix with live price ticker and candlestick simulation', 'finance')
            }
            className="px-2.5 py-1 rounded bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-700/60 text-slate-300 text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer"
          >
            Crypto Matrix HUD
          </button>
          <button
            type="button"
            onClick={() =>
              handleRunPreset('Mark-XXXIX Starboost Physics & Gravitational Orbital Sandbox', 'game')
            }
            className="px-2.5 py-1 rounded bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-700/60 text-slate-300 text-[11px] font-mono whitespace-nowrap transition-all cursor-pointer"
          >
            Starboost Orbital Sim
          </button>
        </div>
      </form>

      {/* Main Content Area Based on Active Tab */}
      <div className="relative min-h-[380px] bg-slate-950 border border-slate-800/80 rounded-lg overflow-hidden flex flex-col">
        {/* Active Tool Sub-Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900/80 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-tech uppercase text-cyan-400 font-semibold tracking-wide">
              {activeTool ? activeTool.name : 'No Active Tool'}
            </span>
            <span className="text-slate-500 font-mono text-[11px]">
              [{activeTool?.category || 'utility'}]
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'code' && (
              <>
                <button
                  onClick={handleCopyCode}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleDownloadCode}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Download className="w-3 h-3" /> Save File
                </button>
              </>
            )}
            <span className="text-[10px] font-code text-slate-500">
              AUTONOMOUS SUBPROCESS: ISOLATED
            </span>
          </div>
        </div>

        {/* Tab 1: Live Iframe Sandbox Preview */}
        {activeTab === 'preview' && (
          <div className="relative flex-1 w-full h-[380px] bg-[#020617]">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/80 backdrop-blur-sm z-20">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                <span className="font-tech text-sm tracking-widest text-cyan-300 uppercase">
                  Synthesizing Application Binary & Rectifying Geometry Specs...
                </span>
                <span className="font-code text-xs text-slate-500">
                  Pulse of AI Episode 15 Engine Active
                </span>
              </div>
            ) : activeTool ? (
              <iframe
                title={activeTool.name}
                srcDoc={activeTool.code}
                sandbox="allow-scripts allow-forms allow-same-origin"
                className="w-full h-full border-none bg-[#020617]"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 font-mono text-xs">
                No tool loaded. Enter a prompt or choose a preset above.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Code Inspector */}
        {activeTab === 'code' && (
          <div className="flex-1 p-4 bg-slate-950 overflow-auto font-mono text-xs text-slate-300 leading-relaxed max-h-[380px]">
            <pre className="text-cyan-300/90 whitespace-pre-wrap selection:bg-cyan-900 selection:text-white">
              {activeTool?.code || '// No source code available'}
            </pre>
          </div>
        )}

        {/* Tab 3: Generated Tools Vault */}
        {activeTab === 'library' && (
          <div className="flex-1 p-4 bg-slate-950 overflow-y-auto max-h-[380px] flex flex-col gap-2.5">
            {savedTools.map((tool) => (
              <div
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool);
                  setActiveTab('preview');
                  playToolChime();
                }}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  activeTool?.id === tool.id
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-100'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-tech font-semibold text-xs tracking-wide">
                      {tool.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {tool.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">{tool.description}</p>
                </div>
                <button className="px-2.5 py-1 text-xs font-mono bg-cyan-600/30 hover:bg-cyan-600/60 text-cyan-300 rounded border border-cyan-500/40 transition-all">
                  Launch
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
