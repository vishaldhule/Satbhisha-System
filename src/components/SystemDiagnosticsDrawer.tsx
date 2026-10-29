import React, { useState } from 'react';
import {
  X,
  Activity,
  Cpu,
  Power,
  Sliders,
  Box,
  BrainCircuit,
  Volume2,
  Sun,
  Shield,
  Layers,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { SystemHardware, GeneratedTool, MemoryItem } from '../types';
import { HandTrackerConfig, DEFAULT_HAND_CONFIG } from '../utils/handTracker';
import { playToolChime, playPurgeSfx } from '../utils/audioSfx';

interface SystemDiagnosticsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  hardware: SystemHardware;
  onPurgeRam: () => void;
  isPurging: boolean;
  handConfig: HandTrackerConfig;
  onUpdateHandConfig: (config: HandTrackerConfig) => void;
  handEnabled: boolean;
  onToggleHand: () => void;
  savedTools: GeneratedTool[];
  onOpenTool: (tool: GeneratedTool) => void;
  memories: MemoryItem[];
}

export const SystemDiagnosticsDrawer: React.FC<SystemDiagnosticsDrawerProps> = ({
  isOpen,
  onClose,
  hardware,
  onPurgeRam,
  isPurging,
  handConfig,
  onUpdateHandConfig,
  handEnabled,
  onToggleHand,
  savedTools,
  onOpenTool,
  memories,
}) => {
  const [activeTab, setActiveTab] = useState<'hardware' | 'hand' | 'tools' | 'memory'>('hardware');

  if (!isOpen) return null;

  const applyPreset = (preset: 'balanced' | 'precision' | 'gaming') => {
    playToolChime();
    if (preset === 'balanced') {
      onUpdateHandConfig({ ...DEFAULT_HAND_CONFIG });
    } else if (preset === 'precision') {
      onUpdateHandConfig({
        speedMultiplier: 0.9,
        smoothing: 0.82,
        deadzone: 0.016,
        pinchThreshold: 0.08,
        clickCooldownMs: 350,
        acceleration: 1.0,
        isMirrored: true,
      });
    } else if (preset === 'gaming') {
      onUpdateHandConfig({
        speedMultiplier: 1.5,
        smoothing: 0.52,
        deadzone: 0.008,
        pinchThreshold: 0.11,
        clickCooldownMs: 220,
        acceleration: 1.1,
        isMirrored: true,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md h-full bg-slate-950/95 border-l border-cyan-500/30 flex flex-col shadow-2xl p-6 overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-tech font-bold uppercase tracking-wider text-slate-100">
                Diagnostic & Systems Engine
              </h2>
              <p className="text-[10px] font-mono text-slate-400">Background Services Telemetry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-900 rounded-lg my-4 text-xs font-tech">
          <button
            onClick={() => setActiveTab('hardware')}
            className={`py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'hardware'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hardware
          </button>
          <button
            onClick={() => setActiveTab('hand')}
            className={`py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'hand'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hand Tune
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'tools'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tools ({savedTools.length})
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            className={`py-1.5 rounded-md transition-all cursor-pointer ${
              activeTab === 'memory'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Memory
          </button>
        </div>

        {/* Tab 1: Hardware Telemetry */}
        {activeTab === 'hardware' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">CPU Core</span>
                <div className="text-xl font-bold font-code text-cyan-400 tabular-nums">
                  {hardware.cpu.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500">{hardware.cpuTemp}°C • Fan: {hardware.coolingFanRpm} RPM</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">RAM Active</span>
                <div className="text-xl font-bold font-code text-sky-400 tabular-nums">
                  {hardware.ram.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500">{hardware.ramUsedGb}GB / {hardware.ramTotalGb}GB</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">GPU Load</span>
                <div className="text-xl font-bold font-code text-amber-400 tabular-nums">
                  {hardware.gpu.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-500">{hardware.gpuTemp}°C Temp</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Arc Core Power</span>
                <div className="text-xl font-bold font-code text-emerald-400 tabular-nums">
                  {hardware.battery}%
                </div>
                <div className="text-[10px] text-slate-500">Palladium Matrix Steady</div>
              </div>
            </div>

            {/* RAM Purge Trigger */}
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-rose-300 font-tech uppercase">Ghost Killer RAM Purge</h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  {hardware.ghostTasksKilled} background memory leaks eliminated
                </p>
              </div>
              <button
                onClick={onPurgeRam}
                disabled={isPurging}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-tech text-xs uppercase font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-rose-900/50"
              >
                <Power className="w-3.5 h-3.5" />
                {isPurging ? 'Purging...' : 'Execute Purge'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Hand Sensitivity Calibration */}
        {activeTab === 'hand' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <span className="text-xs font-bold font-tech text-slate-200 uppercase">
                  Optical Mouse Control
                </span>
                <p className="text-[10px] font-mono text-slate-400">Headless 60 FPS Tracking</p>
              </div>
              <button
                onClick={onToggleHand}
                className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold uppercase transition-all cursor-pointer ${
                  handEnabled
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {handEnabled ? 'Active' : 'Disabled'}
              </button>
            </div>

            {/* Presets */}
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Quick Presets</span>
              <div className="grid grid-cols-3 gap-2 mt-1">
                <button
                  onClick={() => applyPreset('balanced')}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/40 text-[10px] font-tech text-slate-300 uppercase cursor-pointer"
                >
                  Balanced
                </button>
                <button
                  onClick={() => applyPreset('precision')}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/40 text-[10px] font-tech text-slate-300 uppercase cursor-pointer"
                >
                  Precision
                </button>
                <button
                  onClick={() => applyPreset('gaming')}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/40 text-[10px] font-tech text-slate-300 uppercase cursor-pointer"
                >
                  Rapid
                </button>
              </div>
            </div>

            {/* Speed Multiplier Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span>Speed Multiplier</span>
                <span className="text-cyan-400">{handConfig.speedMultiplier.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="2.5"
                step="0.1"
                value={handConfig.speedMultiplier}
                onChange={(e) =>
                  onUpdateHandConfig({ ...handConfig, speedMultiplier: parseFloat(e.target.value) })
                }
                className="w-full mt-1 accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Smoothing Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span>Motion Smoothing</span>
                <span className="text-cyan-400">{(handConfig.smoothing * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.92"
                step="0.02"
                value={handConfig.smoothing}
                onChange={(e) =>
                  onUpdateHandConfig({ ...handConfig, smoothing: parseFloat(e.target.value) })
                }
                className="w-full mt-1 accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Tremor Deadzone Slider */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span>Tremor Deadzone</span>
                <span className="text-cyan-400">{(handConfig.deadzone * 1000).toFixed(0)}</span>
              </div>
              <input
                type="range"
                min="0.002"
                max="0.030"
                step="0.002"
                value={handConfig.deadzone}
                onChange={(e) =>
                  onUpdateHandConfig({ ...handConfig, deadzone: parseFloat(e.target.value) })
                }
                className="w-full mt-1 accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Pinch Threshold */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span>Pinch Click Distance</span>
                <span className="text-cyan-400">{Math.round(handConfig.pinchThreshold * 200)}px</span>
              </div>
              <input
                type="range"
                min="0.06"
                max="0.22"
                step="0.01"
                value={handConfig.pinchThreshold}
                onChange={(e) =>
                  onUpdateHandConfig({ ...handConfig, pinchThreshold: parseFloat(e.target.value) })
                }
                className="w-full mt-1 accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Mirror Toggle */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-mono text-slate-300">Mirror Horizontal Movement</span>
              <input
                type="checkbox"
                checked={handConfig.isMirrored}
                onChange={(e) => onUpdateHandConfig({ ...handConfig, isMirrored: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Direct Real OS Desktop Mouse Controller Bridge */}
            <div className="mt-4 p-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-cyan-300 font-bold font-tech uppercase">
                <span>🖥️ Real PC OS Mouse Driver</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400">Bridge Active</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal font-sans">
                Controls the real operating system hardware mouse cursor across Windows / macOS / Linux outside the browser (in Chrome, Word, Desktop, Games).
              </p>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 select-all font-code">
                pip install pyautogui opencv-python mediapipe
                <br />
                python public/jarvis_desktop_mouse.py
              </div>
              <a
                href="/jarvis_desktop_mouse.py"
                download="jarvis_desktop_mouse.py"
                className="block text-center py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-tech text-xs uppercase font-bold transition-all"
              >
                📥 Download jarvis_desktop_mouse.py
              </a>
            </div>

            {/* Pulse of AI - Episode 3: Voice AI Assistant Brain (brain.py) */}
            <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-emerald-300 font-bold font-tech uppercase">
                <span>🧠 Episode 3: Neural Brain (brain.py)</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400">Pulse of AI</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal font-sans">
                Official Pulse of AI Episode 3 setup by Swayam Dhawale. High-speed streaming chat loop using Google GenAI SDK, Natural Hinglish persona, and 2-sentence crisp responses.
              </p>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 select-all font-code">
                pip install google-genai python-dotenv
                <br />
                python brain.py
              </div>
              <a
                href="/brain.py"
                download="brain.py"
                className="block text-center py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-tech text-xs uppercase font-bold transition-all"
              >
                📥 Download brain.py
              </a>
            </div>

            {/* Pulse of AI - Episode 6: Autonomous Website Control */}
            <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-sky-500/30 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-sky-300 font-bold font-tech uppercase">
                <span>🌐 Episode 6: Autonomous Web Core</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-400">Pulse of AI</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal font-sans">
                By Swayam Dhawale. Integrates Gemini Live multimodal voice brain with autonomous browser launching, bidirectional PCM streaming &amp; 70+ languages.
              </p>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 select-all font-code">
                pip install google-genai pyaudio python-dotenv
                <br />
                python jarvis_ep6.py
              </div>
              <a
                href="/jarvis_ep6.py"
                download="jarvis_ep6.py"
                className="block text-center py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-tech text-xs uppercase font-bold transition-all"
              >
                📥 Download jarvis_ep6.py
              </a>
            </div>

            {/* Pulse of AI - Episode 09: Deep PC Diagnostics & Hardware Telemetry */}
            <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-amber-500/30 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-amber-300 font-bold font-tech uppercase">
                <span>🌡️ Episode 09: Silicon Thermals &amp; HUD</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400">Pulse of AI</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal font-sans">
                By Swayam Dhawale. Silicon probing with WMI CPU thermal readings, NVIDIA SMI GPU extraction, and futuristic terminal HUD telemetry.
              </p>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 select-all font-code">
                pip install pycaw screen-brightness-control psutil WMI rich python-dotenv
                <br />
                python hardware_control.py
              </div>
              <a
                href="/hardware_control.py"
                download="hardware_control.py"
                className="block text-center py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-tech text-xs uppercase font-bold transition-all"
              >
                📥 Download hardware_control.py
              </a>
            </div>

            {/* Pulse of AI - Episode 11: Deep Kernel Task Purge & App Terminator */}
            <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-rose-500/30 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-rose-300 font-bold font-tech uppercase">
                <span>⚡ Episode 11: Deep Task Purge Protocol</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-950 text-rose-400">Pulse of AI</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal font-sans">
                By Swayam Dhawale. Win32 kernel-level recursive process tree termination (_kernel_force_kill), UWP application launching, and updater daemon purging with reclaimed RAM calculation.
              </p>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 select-all font-code">
                pip install google-genai pyaudio psutil rich websockets python-dotenv
                <br />
                python agent.py
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="/software_control.py"
                  download="software_control.py"
                  className="block text-center py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-tech text-[11px] uppercase font-bold transition-all"
                >
                  📥 software_control.py
                </a>
                <a
                  href="/agent.py"
                  download="agent.py"
                  className="block text-center py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-tech text-[11px] uppercase font-bold transition-all"
                >
                  📥 agent.py (Part 11)
                </a>
              </div>
            </div>

            {/* Pulse of AI - Episode 13: Hands-Free YouTube & Media Core */}
            <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-cyan-500/30 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-cyan-300 font-bold font-tech uppercase">
                <span>🎬 Episode 13: Hands-Free YouTube Core</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400">Pulse of AI</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal font-sans">
                By Swayam Dhawale // Stark OS Master Blueprint. Complete hands-free YouTube control: Short scrolling (up/down), Shift+N video skipping, 10s forward/rewind seeking (L/J keys), fullscreen/theater toggle (F/T), and Push-to-Talk audio ducking during playback.
              </p>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 select-all font-code">
                pip install google-genai pywin32 pyautogui winsdk psutil rich keyboard
                <br />
                python jarvis_ep13.py
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="/jarvis_ep13.py"
                  download="jarvis_ep13.py"
                  className="block text-center py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-tech text-[11px] uppercase font-bold transition-all"
                >
                  📥 jarvis_ep13.py
                </a>
                <a
                  href="/software_control.py"
                  download="software_control.py"
                  className="block text-center py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 font-tech text-[11px] uppercase font-bold transition-all"
                >
                  📥 software_control.py
                </a>
              </div>
            </div>

            {/* Pulse of AI - Episode 14: Screen Vision & AI Eyes */}
            <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-emerald-500/30 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-emerald-300 font-bold font-tech uppercase">
                <span>👁️ Episode 14: Real-Life Eyes & Screen Vision</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400">Pulse of AI</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal font-sans">
                By Swayam Dhawale. Multimodal screen perception engine. Real-time capture of desktop, Chrome windows, and active apps via `screen_vision.py` with Gemini Flash grounding to answer "Ye screen par kya hai", inspect code, diagnose errors, and find UI elements.
              </p>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 select-all font-code">
                pip install google-genai pillow pyautogui rich websockets
                <br />
                python screen_vision.py
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="/screen_vision.py"
                  download="screen_vision.py"
                  className="block text-center py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-tech text-[11px] uppercase font-bold transition-all"
                >
                  📥 screen_vision.py
                </a>
                <a
                  href="/agent.py"
                  download="agent.py"
                  className="block text-center py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-tech text-[11px] uppercase font-bold transition-all"
                >
                  📥 agent.py (Part 14)
                </a>
              </div>
            </div>

            {/* Pulse of AI - Episode 15: Autonomous App & Game Generator */}
            <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-purple-500/30 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-purple-300 font-bold font-tech uppercase">
                <span>💻 Episode 15: Autonomous App & Game Coder</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-400">Pulse of AI</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal font-sans">
                By Swayam Dhawale. Voice-driven agentic software synthesis. Listens to instructions (e.g. &apos;JARVIS, mere liye calculator banao&apos;), synthesizes Tkinter/Pygame GUI scripts on the fly with Gemini Flash, fixes geometry formatting bugs, saves into `generated_tools/`, and launches applications in isolated subprocesses.
              </p>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 select-all font-code">
                pip install google-genai python-dotenv
                <br />
                python code_generator.py
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="/code_generator.py"
                  download="code_generator.py"
                  className="block text-center py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-tech text-[11px] uppercase font-bold transition-all"
                >
                  📥 code_generator.py
                </a>
                <a
                  href="/agent.py"
                  download="agent.py"
                  className="block text-center py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-tech text-[11px] uppercase font-bold transition-all"
                >
                  📥 agent.py (Part 15)
                </a>
              </div>
            </div>

            {/* Pulse of AI - Episode 16: Cyberpunk Mini-Dock & Dual-Terminal Engine */}
            <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-cyan-500/40 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-cyan-300 font-bold font-tech uppercase">
                <span>⚡ Episode 16: Mini-Dock & Dual-Terminal Engine</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400">Pulse of AI</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal font-sans">
                By Swayam Dhawale. Omni-Input Dual-Terminal Pipeline and ultra-lightweight Cyberpunk Mini-Dock. Concurrent transmission via microphone, PowerShell/CMD terminal (`sys.stdin.readline`), or translucent floating HUD. Features synced live typewriter streaming and instant collapsing into an unobtrusive 450x85 desktop dock.
              </p>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 select-all font-code">
                pip install google-genai pyaudio winsound keyboard websockets rich
                <br />
                python agent.py
              </div>
              <a
                href="/agent.py"
                download="agent.py"
                className="block text-center py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-tech text-xs uppercase font-bold transition-all"
              >
                📥 Download agent.py (Episode 16 Master)
              </a>
            </div>

            {/* Pulse of AI - Episode 17: Hands-Free Ghost Writing & App Automator */}
            <div className="mt-3 p-3 rounded-xl bg-slate-900 border border-emerald-500/40 text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-emerald-300 font-bold font-tech uppercase">
                <span>✍️ Episode 17: Hands-Free Ghost Writing & Automator</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400">Pulse of AI</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal font-sans">
                By Swayam Dhawale. Autonomous application dispatcher and high-speed ghost typing engine (<code className="text-emerald-400">app_automator.py</code>). Launches Notepad, Word, or PowerPoint, verifies active window handle with safety lock, and simulates human typing bursts. Enforces Rule 24 word count clarification and bilingual Hindi/English synthesis.
              </p>
              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300 select-all font-code">
                pip install pyautogui pygetwindow pyperclip pywin32 google-genai
                <br />
                python agent.py
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href="/app_automator.py"
                  download="app_automator.py"
                  className="block text-center py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-tech text-[11px] uppercase font-bold transition-all"
                >
                  📥 app_automator.py
                </a>
                <a
                  href="/agent.py"
                  download="agent.py"
                  className="block text-center py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-tech text-[11px] uppercase font-bold transition-all"
                >
                  📥 agent.py (EP 17)
                </a>
                <a
                  href="/skill_synthesizer.py"
                  download="skill_synthesizer.py"
                  className="block text-center py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-tech text-[10px] uppercase font-bold transition-all"
                >
                  📥 skill_synthesizer.py
                </a>
                <a
                  href="/llm_router.py"
                  download="llm_router.py"
                  className="block text-center py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-tech text-[10px] uppercase font-bold transition-all"
                >
                  📥 llm_router.py
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Generated Tools Vault */}
        {activeTab === 'tools' && (
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Autonomous Software Arsenal ({savedTools.length})
            </span>
            {savedTools.map((t) => (
              <div
                key={t.id}
                onClick={() => {
                  onOpenTool(t);
                  onClose();
                }}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all hover:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-200 font-tech">{t.name}</h4>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 uppercase font-mono">
                    {t.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{t.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Neural Memory Bank */}
        {activeTab === 'memory' && (
          <div className="space-y-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase">
              Mark-XXXIX Persistent Storage ({memories.length})
            </span>
            {memories.map((m) => (
              <div key={m.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] font-mono text-cyan-400 uppercase">{m.key}</span>
                <p className="text-xs text-slate-200 mt-0.5">{m.value}</p>
                <span className="text-[9px] text-slate-500 block mt-1">{m.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
