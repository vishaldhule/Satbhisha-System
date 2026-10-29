import React, { useState } from 'react';
import {
  ListChecks,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  Trash2,
  Sparkles,
  HelpCircle,
  Terminal,
  Shield,
  Zap,
  Volume2,
  Sun,
  Flame,
  Power,
  BrainCircuit,
  MessageSquare,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { playToolChime, playMicActivateChime, playPurgeSfx } from '../utils/audioSfx';

export interface WorkTask {
  id: string;
  title: string;
  category: 'work' | 'code' | 'pc' | 'research';
  priority: 'urgent' | 'high' | 'normal';
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  steps?: string[];
}

interface TaskWorkManagerProps {
  onExecuteWork: (directive: string) => Promise<void>;
  isProcessing: boolean;
  persona: 'friday' | 'jarvis';
  onTogglePersona: (newPersona: 'friday' | 'jarvis') => void;
  onPurgeRam: () => void;
}

export const TaskWorkManager: React.FC<TaskWorkManagerProps> = ({
  onExecuteWork,
  isProcessing,
  persona,
  onTogglePersona,
  onPurgeRam,
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'intel' | 'system'>('tasks');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'urgent' | 'high' | 'normal'>('high');
  const [newTaskCategory, setNewTaskCategory] = useState<'work' | 'code' | 'pc' | 'research'>('work');
  const [intelQuestion, setIntelQuestion] = useState('');

  // Default Initial Work Tasks
  const [tasks, setTasks] = useState<WorkTask[]>([
    {
      id: 'task_1',
      title: 'Analyze PC thermal performance and purge orphan memory allocations',
      category: 'pc',
      priority: 'high',
      status: 'completed',
      createdAt: '09:00 AM',
      steps: ['Audit CPU and RAM vitals', 'Terminate 14 background rogue threads', 'Reclaim 640MB memory'],
    },
    {
      id: 'task_2',
      title: 'Synthesize interactive multi-window scientific matrix calculator',
      category: 'code',
      priority: 'urgent',
      status: 'completed',
      createdAt: '09:30 AM',
      steps: ['Generate HTML5 responsive matrix architecture', 'Rectify geometry specs', 'Deploy sandbox instance'],
    },
    {
      id: 'task_3',
      title: 'Deploy optical hand tracking and gesture-based PC mouse controller',
      category: 'pc',
      priority: 'urgent',
      status: 'in_progress',
      createdAt: '10:00 AM',
      steps: ['Engage high-speed 60 FPS computer vision engine', 'Initialize pinch click and air-drawing canvas'],
    },
    {
      id: 'task_4',
      title: 'Autonomous daily research & intelligence briefing compilation',
      category: 'research',
      priority: 'normal',
      status: 'pending',
      createdAt: '10:15 AM',
      steps: ['Query global news & tech telemetry', 'Generate executive summary for user'],
    },
  ]);

  // Handle adding new task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    playToolChime();
    const task: WorkTask = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      category: newTaskCategory,
      priority: newTaskPriority,
      status: 'pending',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      steps: [
        `Deconstruct: ${newTaskTitle.trim()}`,
        'Initialize resource pipelines',
        'Verify deliverables and commit to memory',
      ],
    };

    setTasks([task, ...tasks]);
    setNewTaskTitle('');
  };

  // Toggle task status
  const handleToggleTaskStatus = (id: string) => {
    playToolChime();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'completed' ? 'pending' : t.status === 'pending' ? 'in_progress' : 'completed';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  // Delete task
  const handleDeleteTask = (id: string) => {
    playPurgeSfx();
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Auto-Execute task with JARVIS
  const handleAutoRunTask = async (task: WorkTask) => {
    playMicActivateChime();
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: 'in_progress' } : t))
    );
    await onExecuteWork(`Execute and manage this work task: "${task.title}". Provide actionable results.`);
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: 'completed' } : t))
    );
  };

  // Submit Intel Question
  const handleAskQuestion = async (q: string) => {
    if (!q.trim() || isProcessing) return;
    playMicActivateChime();
    await onExecuteWork(q);
  };

  return (
    <div className="bg-slate-950/90 border border-cyan-900/40 rounded-xl p-5 backdrop-blur-md shadow-2xl flex flex-col gap-5">
      {/* Top Header & Persona Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-tech text-base tracking-wider uppercase font-bold text-slate-100 flex items-center gap-2">
              Autonomous Work & Task Tactical Hub
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                IRON MAN AI
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Proactive task orchestration, deep knowledge answering & PC administration
            </p>
          </div>
        </div>

        {/* AI Voice Persona Switcher: F.R.I.D.A.Y. (Female) vs J.A.R.V.I.S. (Male) */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              playToolChime();
              onTogglePersona('friday');
              onExecuteWork('Switch to F.R.I.D.A.Y. tactical audio persona');
            }}
            className={`px-3 py-1.5 text-xs font-tech font-bold uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              persona === 'friday'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
            <span>F.R.I.D.A.Y. (Female)</span>
          </button>

          <button
            onClick={() => {
              playToolChime();
              onTogglePersona('jarvis');
              onExecuteWork('Switch to J.A.R.V.I.S. classical audio persona');
            }}
            className={`px-3 py-1.5 text-xs font-tech font-bold uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              persona === 'jarvis'
                ? 'bg-gradient-to-r from-amber-600 to-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
            <span>J.A.R.V.I.S. (Male)</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs: Tasks | Deep Intelligence | PC Controls */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-tech uppercase font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListChecks className="w-3.5 h-3.5" /> Work & Task Board ({tasks.length})
        </button>

        <button
          onClick={() => setActiveTab('intel')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-tech uppercase font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'intel'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" /> Intel & Question Answering
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-tech uppercase font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'system'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" /> Rapid PC Action Deck
        </button>
      </div>

      {/* TAB 1: Work & Task Board */}
      {activeTab === 'tasks' && (
        <div className="flex flex-col gap-4">
          {/* New Task Creation Form */}
          <form onSubmit={handleAddTask} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Assign work or task to JARVIS/FRIDAY (e.g. 'Draft research on fusion reactors', 'Organize project schedule')..."
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 rounded px-2.5 py-2"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
              </select>

              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 rounded px-2.5 py-2"
              >
                <option value="work">Work</option>
                <option value="code">Code</option>
                <option value="pc">PC</option>
                <option value="research">Research</option>
              </select>

              <button
                type="submit"
                disabled={!newTaskTitle.trim()}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-tech uppercase font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Assign Task
              </button>
            </div>
          </form>

          {/* Tasks List */}
          <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col gap-2 ${
                  task.status === 'completed'
                    ? 'bg-slate-950/40 border-slate-800/80 opacity-70'
                    : task.status === 'in_progress'
                    ? 'bg-cyan-950/30 border-cyan-500/50 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => handleToggleTaskStatus(task.id)}
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
                        task.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-400 text-black'
                          : 'border-slate-600 hover:border-cyan-400'
                      }`}
                    >
                      {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div className="flex flex-col gap-1">
                      <span
                        className={`font-mono text-xs font-semibold ${
                          task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                        <span className="uppercase text-cyan-400 font-semibold">{task.category}</span>
                        <span>·</span>
                        <span
                          className={`uppercase font-semibold ${
                            task.priority === 'urgent'
                              ? 'text-rose-400'
                              : task.priority === 'high'
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span>·</span>
                        <span>{task.createdAt}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => handleAutoRunTask(task)}
                        disabled={isProcessing}
                        className="px-2.5 py-1 bg-cyan-600/30 hover:bg-cyan-600/60 border border-cyan-500/40 text-cyan-300 rounded text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                        title="Let JARVIS/FRIDAY execute this task autonomously"
                      >
                        <Play className="w-3 h-3" /> Auto-Execute
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sub-steps */}
                {task.steps && task.steps.length > 0 && (
                  <div className="pl-6 pt-1 flex flex-wrap gap-2">
                    {task.steps.map((st, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-1"
                      >
                        <ArrowRight className="w-2.5 h-2.5 text-cyan-500" />
                        {st}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Intel & Deep Question Answering */}
      {activeTab === 'intel' && (
        <div className="flex flex-col gap-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskQuestion(intelQuestion);
              setIntelQuestion('');
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={intelQuestion}
              onChange={(e) => setIntelQuestion(e.target.value)}
              placeholder="Ask JARVIS / F.R.I.D.A.Y. anything (e.g. quantum physics, system architecture, programming, philosophy)..."
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!intelQuestion.trim() || isProcessing}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-tech uppercase font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" /> Ask Intelligence
            </button>
          </form>

          {/* Quick Intelligence Presets */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-tech text-cyan-400 uppercase font-semibold">
              Tactical Deep Queries (1-Click)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {[
                'Explain how an Arc Reactor palladium core theoretically produces clean zero-point energy.',
                'Analyze my current PC telemetry and suggest top performance optimizations.',
                'Explain the difference between quantum entanglement and quantum teleportation in plain terms.',
                'Write an automated Python script to monitor CPU temperature and alert me when it exceeds 75°C.',
                'How can I structure my day to maximize productive focus hours and eliminate workflow friction?',
                'What are the most powerful AI coding and automation workflows in 2026?',
              ].map((query, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskQuestion(query)}
                  className="p-2.5 rounded-lg bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 text-slate-300 text-left transition-all cursor-pointer flex items-center justify-between gap-2"
                >
                  <span className="line-clamp-1">{query}</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Rapid PC Action Deck */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => {
              onPurgeRam();
              onExecuteWork('Purge rogue processes and optimize physical RAM');
            }}
            className="p-4 rounded-xl bg-slate-900/60 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/60 text-slate-200 flex flex-col items-center gap-2 text-xs font-tech font-bold uppercase transition-all cursor-pointer"
          >
            <Power className="w-5 h-5 text-rose-400" />
            <span>Ghost Killer RAM Purge</span>
          </button>

          <button
            onClick={() => onExecuteWork('skip this ad')}
            className="p-4 rounded-xl bg-slate-900/60 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/60 text-slate-200 flex flex-col items-center gap-2 text-xs font-tech font-bold uppercase transition-all cursor-pointer"
          >
            <Zap className="w-5 h-5 text-emerald-400" />
            <span>Autonomous YouTube Ad Skip</span>
          </button>

          <button
            onClick={() => onExecuteWork('Calibrate system volume to 75% and check diagnostics')}
            className="p-4 rounded-xl bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/60 text-slate-200 flex flex-col items-center gap-2 text-xs font-tech font-bold uppercase transition-all cursor-pointer"
          >
            <Volume2 className="w-5 h-5 text-cyan-400" />
            <span>Calibrate Audio Master</span>
          </button>

          <button
            onClick={() => onExecuteWork('Tell me current system temperatures and diagnostics')}
            className="p-4 rounded-xl bg-slate-900/60 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/60 text-slate-200 flex flex-col items-center gap-2 text-xs font-tech font-bold uppercase transition-all cursor-pointer"
          >
            <Flame className="w-5 h-5 text-amber-400" />
            <span>Hardware Diagnostics</span>
          </button>
        </div>
      )}
    </div>
  );
};
