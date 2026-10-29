import React, { useState } from 'react';
import { X, Play, Code, Maximize2, ExternalLink, RefreshCw } from 'lucide-react';
import { GeneratedTool } from '../types';

interface GeneratedToolModalProps {
  tool: GeneratedTool | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GeneratedToolModal: React.FC<GeneratedToolModalProps> = ({
  tool,
  isOpen,
  onClose,
}) => {
  const [activeView, setActiveView] = useState<'sandbox' | 'code'>('sandbox');
  const [refreshKey, setRefreshKey] = useState(0);

  if (!isOpen || !tool) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[85vh] bg-slate-950 border border-cyan-500/40 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <div>
              <h3 className="text-sm font-tech font-bold text-slate-100 uppercase tracking-wider">
                {tool.name}
              </h3>
              <p className="text-[10px] font-mono text-slate-400">Autonomous Tool Runtime Sandbox</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex p-0.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-tech">
              <button
                onClick={() => setActiveView('sandbox')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'sandbox' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                <Play className="w-3 h-3" /> Live App
              </button>
              <button
                onClick={() => setActiveView('code')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeView === 'code' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                <Code className="w-3 h-3" /> Source
              </button>
            </div>

            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              title="Reload App"
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 bg-slate-950 p-3 overflow-hidden relative">
          {activeView === 'sandbox' ? (
            <iframe
              key={refreshKey}
              srcDoc={tool.code}
              title={tool.name}
              sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
              className="w-full h-full rounded-xl border border-slate-800 bg-slate-900 shadow-inner"
            />
          ) : (
            <pre className="w-full h-full p-4 rounded-xl border border-slate-800 bg-slate-950 text-cyan-300 font-code text-xs overflow-auto select-all leading-relaxed">
              <code>{tool.code}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
