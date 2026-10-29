import React, { useState } from 'react';
import { Terminal, Database, ListTree, Send, CheckCircle2, Clock, Trash2, Plus } from 'lucide-react';
import { MemoryItem } from '../types';
import { playToolChime } from '../utils/audioSfx';

interface PlannerTerminalProps {
  memories: MemoryItem[];
  onAddMemory: (key: string, value: string) => Promise<void>;
  onDeleteMemory: (id: string) => Promise<void>;
  onRunPlan: (goal: string) => Promise<void>;
  isPlanning: boolean;
  onRunCommand: (cmd: string) => Promise<string>;
}

export const TaskPlannerTerminal: React.FC<PlannerTerminalProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory,
  onRunPlan,
  isPlanning,
  onRunCommand,
}) => {
  const [activeTab, setActiveTab] = useState<'planner' | 'memory' | 'terminal'>('planner');
  const [goalInput, setGoalInput] = useState('');
  const [planSteps, setPlanSteps] = useState<{ step: string; status: 'pending' | 'running' | 'completed' }[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'MARK-XXXIX KERNEL v39.4.1 (Linux x86_64)',
    'Initialized Stark Autonomous Pipeline & Pulse of AI Multimodal Core.',
    'Type commands like "vitals", "status", "purge", or shell commands...',
  ]);

  const handleStartPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim() || isPlanning) return;
    playToolChime();

    // Generate atomic staged steps
    setPlanSteps([
      { step: `Deconstructing objective: ${goalInput}`, status: 'running' },
      { step: 'Auditing hardware resources & network parameters', status: 'pending' },
      { step: 'Generating target payloads and script dependencies', status: 'pending' },
      { step: 'Executing runtime isolation tests & committing artifacts', status: 'pending' },
    ]);

    await onRunPlan(goalInput);

    // Update statuses
    setPlanSteps([
      { step: `Deconstructed objective: ${goalInput}`, status: 'completed' },
      { step: 'Audited hardware resources & network parameters', status: 'completed' },
      { step: 'Generated target payloads and script dependencies', status: 'completed' },
      { step: 'Execution verified and committed to storage', status: 'completed' },
    ]);
  };

  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newVal.trim()) return;
    playToolChime();
    await onAddMemory(newKey, newVal);
    setNewKey('');
    setNewVal('');
  };

  const handleTerminalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim();
    if (!cmd) return;
    setTerminalLogs((prev) => [...prev, `$ ${cmd}`]);
    setTerminalInput('');

    const output = await onRunCommand(cmd);
    setTerminalLogs((prev) => [...prev, output]);
  };

  return (
    <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-4">
      {/* Header with Tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="font-tech text-sm tracking-wider uppercase font-semibold text-slate-200">
            Mark-XXXIX Agentic Planner & Terminal Core
          </h3>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3 py-1 rounded cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'planner' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
            }`}
          >
            <ListTree className="w-3.5 h-3.5" /> Task Planner
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`px-3 py-1 rounded cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'memory' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Neural Memory ({memories.length})
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-1 rounded cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'terminal' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> Dev Shell
          </button>
        </div>
      </div>

      {/* Tab 1: Task Planner */}
      {activeTab === 'planner' && (
        <div className="flex flex-col gap-3">
          <form onSubmit={handleStartPlan} className="flex gap-2">
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="Enter complex multi-step objective (e.g. 'Audit system security, purge orphan RAM, and synthesize financial tracker')..."
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isPlanning || !goalInput.trim()}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-tech font-semibold text-xs tracking-wider uppercase rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              {isPlanning ? 'Planning...' : 'Dispatch Plan'}
            </button>
          </form>

          {/* Staged Execution Steps */}
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col gap-2 min-h-[140px]">
            <span className="text-[11px] font-tech text-cyan-400 tracking-wider uppercase font-semibold">
              Autonomous Milestone Execution Queue
            </span>
            {planSteps.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-xs font-mono">
                No active task plan in queue. Enter a goal above to orchestrate.
              </div>
            ) : (
              planSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-slate-950/80 border border-slate-800/80 text-xs font-mono"
                >
                  <span className="text-slate-300 flex items-center gap-2">
                    <span className="text-cyan-400">0{idx + 1}.</span> {step.step}
                  </span>
                  <span className="text-[10px] uppercase font-tech px-2 py-0.5 rounded">
                    {step.status === 'completed' ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> VERIFIED
                      </span>
                    ) : step.status === 'running' ? (
                      <span className="text-amber-400 flex items-center gap-1 animate-pulse">
                        <Clock className="w-3 h-3" /> EXECUTING
                      </span>
                    ) : (
                      <span className="text-slate-500">QUEUED</span>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Neural Memory Bank */}
      {activeTab === 'memory' && (
        <div className="flex flex-col gap-3">
          <form onSubmit={handleCreateMemory} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Memory Key (e.g. Preferred Language)"
              className="bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
            />
            <input
              type="text"
              value={newVal}
              onChange={(e) => setNewVal(e.target.value)}
              placeholder="Value / Details"
              className="bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-tech font-semibold text-xs tracking-wider uppercase rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Commit Memory
            </button>
          </form>

          <div className="max-h-[220px] overflow-y-auto flex flex-col gap-2">
            {memories.map((mem) => (
              <div
                key={mem.id}
                className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-tech text-cyan-400 font-semibold">{mem.key}</span>
                    <span className="text-[10px] font-mono text-slate-500">· {mem.date}</span>
                  </div>
                  <span className="text-slate-300 font-mono text-[11px]">{mem.value}</span>
                </div>
                <button
                  onClick={() => onDeleteMemory(mem.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                  title="Purge Memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Dev Shell Terminal */}
      {activeTab === 'terminal' && (
        <div className="flex flex-col gap-2">
          <div className="bg-black/90 p-3 rounded-lg border border-slate-800 font-code text-xs text-cyan-400 h-[180px] overflow-y-auto flex flex-col gap-1">
            {terminalLogs.map((log, i) => (
              <div key={i} className="leading-relaxed break-all">
                {log}
              </div>
            ))}
          </div>
          <form onSubmit={handleTerminalSubmit} className="flex gap-2">
            <span className="font-code text-xs text-cyan-500 flex items-center pl-2">$</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              placeholder="Enter terminal command (e.g. 'vitals', 'purge', 'help', 'date')..."
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs font-code text-slate-200 focus:outline-none"
            />
          </form>
        </div>
      )}
    </div>
  );
};
