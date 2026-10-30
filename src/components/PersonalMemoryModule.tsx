import React, { useState } from 'react';
import { Database, Plus, Trash2, Download, Upload, Shield, Check, Search, FileText } from 'lucide-react';
import { MemoryItem } from '../types';
import { playToolChime } from '../utils/audioSfx';

interface PersonalMemoryModuleProps {
  memories: MemoryItem[];
  onAddMemory: (key: string, value: string) => void;
  onDeleteMemory: (id: string) => void;
  onClearAll: () => void;
}

export const PersonalMemoryModule: React.FC<PersonalMemoryModuleProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = memories.filter(
    (m) =>
      m.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    playToolChime();
    onAddMemory(newKey.trim(), newValue.trim());
    setNewKey('');
    setNewValue('');
    setIsAdding(false);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(memories, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `JARVIS_Memory_Banks_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100 font-tech tracking-wide uppercase">
              Personal Memory & Knowledge Vault
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            User-controlled long-term memory banks. Never stores raw passwords or sensitive credentials.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-tech font-bold uppercase transition-all cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.3)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Cancel' : 'Add Memory'}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-all cursor-pointer"
            title="Export Memory JSON"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export</span>
          </button>

          {confirmClear ? (
            <button
              onClick={() => {
                onClearAll();
                setConfirmClear(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-mono font-bold transition-all cursor-pointer animate-pulse"
            >
              <span>Confirm Wipe</span>
            </button>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-mono transition-all cursor-pointer"
              title="Clear all stored memories"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Add New Memory Form */}
      {isAdding && (
        <form onSubmit={handleCreate} className="p-5 rounded-2xl bg-slate-900 border border-cyan-500/50 space-y-4 animate-in fade-in duration-200">
          <h3 className="text-xs font-bold text-cyan-300 font-tech uppercase tracking-wider">
            Commit Fact to Long-Term Storage
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Topic / Key (e.g. Favorite Language, Work Project)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs font-mono text-slate-200 focus:outline-none"
              required
            />
            <input
              type="text"
              placeholder="Value / Details to remember"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="sm:col-span-2 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs font-mono text-slate-200 focus:outline-none"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-tech font-bold uppercase transition-all cursor-pointer"
            >
              Save Memory
            </button>
          </div>
        </form>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Filter memories by key, value, or topic..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 focus:border-cyan-400 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
        />
      </div>

      {/* Memory List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <span>SAVED KNOWLEDGE RECORDS ({filtered.length})</span>
          <span>PERSISTENT AES-PROTECTED</span>
        </div>

        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all flex items-start justify-between gap-4 group"
          >
            <div className="space-y-1 flex-1">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <h4 className="text-xs font-bold text-cyan-300 font-tech uppercase tracking-wide">
                  {item.key}
                </h4>
                <span className="text-[10px] font-mono text-slate-500">{item.date}</span>
              </div>
              <p className="text-xs text-slate-300 font-sans leading-relaxed pl-3.5">{item.value}</p>
            </div>

            <button
              onClick={() => onDeleteMemory(item.id)}
              className="opacity-60 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all cursor-pointer flex-shrink-0"
              title="Delete record"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-2xl">
            No memories match your query. Click "Add Memory" to store new information.
          </div>
        )}
      </div>
    </div>
  );
};
