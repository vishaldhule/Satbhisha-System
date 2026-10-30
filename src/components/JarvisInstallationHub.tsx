import React, { useState } from 'react';
import {
  Download,
  Terminal,
  Play,
  Check,
  Copy,
  ExternalLink,
  FileCode,
  ShieldAlert,
  Sparkles,
  Layers,
  Monitor,
  Cpu,
  ChevronRight,
  Code
} from 'lucide-react';
import { PresentationPayload } from './PresentationViewerModal';

interface ScriptItem {
  name: string;
  category: string;
  description: string;
  size: string;
  downloadUrl: string;
}

interface JarvisInstallationHubProps {
  onLaunchPresentation: (deck: PresentationPayload) => void;
  onNotify: (msg: string) => void;
}

export const JarvisInstallationHub: React.FC<JarvisInstallationHubProps> = ({
  onLaunchPresentation,
  onNotify,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [pptTopic, setPptTopic] = useState('Next-Generation Autonomous AI Systems');
  const [isGeneratingPpt, setIsGeneratingPpt] = useState(false);
  const [selectedScriptCode, setSelectedScriptCode] = useState<{ name: string; code: string } | null>(null);

  const scriptFiles: ScriptItem[] = [
    {
      name: 'requirements.txt',
      category: 'Dependencies',
      description: 'Pip package requirements for Episode 19 (python-pptx, pyautogui, google-genai, etc.)',
      size: '1.2 KB',
      downloadUrl: '/api/download/script/requirements.txt'
    },
    {
      name: 'install.bat',
      category: 'Windows 1-Click Installer',
      description: 'Automated Windows setup (checks Python, installs pip packages, sets up .env)',
      size: '2.4 KB',
      downloadUrl: '/api/download/script/install.bat'
    },
    {
      name: 'install.sh',
      category: 'Linux / Mac Installer',
      description: 'Automated bash setup script for Linux and macOS environments',
      size: '1.8 KB',
      downloadUrl: '/api/download/script/install.sh'
    },
    {
      name: 'setup_environment.py',
      category: 'Diagnostics & Audit',
      description: 'Neural environment diagnostic, audio verification and smoke-testing routine',
      size: '4.1 KB',
      downloadUrl: '/api/download/script/setup_environment.py'
    },
    {
      name: 'ppt_engine.py',
      category: 'Episode 19 Presentation Engine',
      description: 'Autonomous 5-layout visual deck generator with no-key free image fetching',
      size: '26 KB',
      downloadUrl: '/api/download/script/ppt_engine.py'
    },
    {
      name: 'agent.py',
      category: 'Episode 19 Live HUD Core',
      description: 'Gemini Live engine with Cyberpunk Tkinter HUD, dual-terminal, and push-to-talk',
      size: '35 KB',
      downloadUrl: '/api/download/script/agent.py'
    },
    {
      name: 'screen_vision.py',
      category: 'Episode 14 Vision & Eyes',
      description: 'Zero-latency screen vision, UI grounding, and automated YouTube ad skipper',
      size: '8.4 KB',
      downloadUrl: '/api/download/script/screen_vision.py'
    },
    {
      name: 'app_automator.py',
      category: 'Episode 17 Ghost Writer',
      description: 'Autonomous application composer and high-speed typing engine',
      size: '9.2 KB',
      downloadUrl: '/api/download/script/app_automator.py'
    },
    {
      name: 'hardware_control.py',
      category: 'Hardware Telemetry',
      description: 'Volume, brightness, battery, and temperature telemetry bridge',
      size: '6.8 KB',
      downloadUrl: '/api/download/script/hardware_control.py'
    },
    {
      name: 'software_control.py',
      category: 'Software Automation',
      description: 'Web navigation, process killer, and YouTube shorts / media controllers',
      size: '7.5 KB',
      downloadUrl: '/api/download/script/software_control.py'
    },
    {
      name: 'skill_synthesizer.py',
      category: 'Self-Evolution Core',
      description: 'Tri-core dynamic skill synthesizer with autonomous hot-reloading',
      size: '8.1 KB',
      downloadUrl: '/api/download/script/skill_synthesizer.py'
    },
    {
      name: 'llm_router.py',
      category: 'Multi-Model Fallback',
      description: 'Dynamic cloud reasoning router across Gemini, Groq, and OpenRouter',
      size: '6.2 KB',
      downloadUrl: '/api/download/script/llm_router.py'
    }
  ];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onNotify('Copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleGeneratePpt = async () => {
    if (!pptTopic.trim() || isGeneratingPpt) return;
    setIsGeneratingPpt(true);
    onNotify(`Synthesizing Episode 19 visual deck for "${pptTopic}"...`);

    try {
      const res = await fetch('/api/jarvis/generate-ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: pptTopic, slideCount: 5 }),
      });
      const data = await res.json();
      if (data.deck) {
        onNotify('Presentation synthesized successfully!');
        onLaunchPresentation(data.deck);
      } else {
        onNotify('Failed to synthesize deck.');
      }
    } catch (e) {
      console.error(e);
      onNotify('Generation failed. Retrying fallback...');
    } finally {
      setIsGeneratingPpt(false);
    }
  };

  const handleViewCode = async (filename: string) => {
    try {
      const res = await fetch(`/api/download/script/${filename}`);
      const text = await res.text();
      setSelectedScriptCode({ name: filename, code: text });
    } catch {
      onNotify(`Could not fetch code for ${filename}`);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-[#07152b] via-[#0b1b36] to-[#071225] p-5 shadow-[0_0_25px_rgba(0,229,255,0.1)]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                Episode 19 Release
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-purple-300 bg-purple-500/20 border border-purple-500/40">
                Pulse of AI • Swayam Dhawale
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-tech font-bold tracking-wider text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              JARVIS EPISODE 19 INSTALLATION & CODE SUITE
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 max-w-2xl">
              Complete automated production distribution for hands-free visual PowerPoint generation, Gemini Live Cyberpunk Tkinter HUD, zero-latency screen vision eyes, and multi-model failover.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/api/download/script/install.bat"
              download="install.bat"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download install.bat (Windows)</span>
            </a>
            <a
              href="/api/download/script/install.sh"
              download="install.sh"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>install.sh (Linux/Mac)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Grid: 1-Click Terminal Setup & Direct Web PPT Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: 1-Click Terminal Setup */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-tech font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Quick Terminal Installation
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Windows / Mac / Linux</span>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              To install all dependencies locally on your computer, run the following commands in PowerShell or Terminal:
            </p>

            <div className="space-y-3 font-mono text-xs">
              {/* Command 1 */}
              <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px] mb-0.5"># Step 1: Install Python dependencies</span>
                  <span className="text-cyan-300">pip install -r requirements.txt</span>
                </div>
                <button
                  onClick={() => handleCopy('pip install -r requirements.txt', 'pip')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
                  title="Copy command"
                >
                  {copiedKey === 'pip' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Command 2 */}
              <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px] mb-0.5"># Step 2: Launch Cyberpunk HUD & Live Assistant</span>
                  <span className="text-purple-300">python agent.py</span>
                </div>
                <button
                  onClick={() => handleCopy('python agent.py', 'agent')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-purple-300 transition-colors cursor-pointer"
                  title="Copy command"
                >
                  {copiedKey === 'agent' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Command 3 */}
              <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-3 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px] mb-0.5"># Step 3: Run standalone presentation engine</span>
                  <span className="text-amber-300">python ppt_engine.py</span>
                </div>
                <button
                  onClick={() => handleCopy('python ppt_engine.py', 'ppt')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                  title="Copy command"
                >
                  {copiedKey === 'ppt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Requires: Python 3.10+</span>
            <span className="text-cyan-400">100% Free AI Image Generation Built-In</span>
          </div>
        </div>

        {/* Card 2: Interactive Web PPT Deck Generator */}
        <div className="rounded-2xl border border-purple-500/30 bg-slate-900/60 p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-tech font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Episode 19 Live Presentation Generator
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                5 Visual Layouts
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Test the Episode 19 visual deck generator right in the browser. Powered by Gemini 3.8 Flash + Pollinations AI free image generation.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Presentation Topic</label>
                <input
                  type="text"
                  value={pptTopic}
                  onChange={(e) => setPptTopic(e.target.value)}
                  placeholder="e.g. Next-Gen Quantum Neural Networks"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-xs font-mono text-slate-100 placeholder-slate-500 outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {['Artificial General Intelligence', 'Cyberpunk OS Architecture', 'Space Exploration 2030', 'Zero-Latency Robotics'].map((sug) => (
                  <button
                    key={sug}
                    onClick={() => setPptTopic(sug)}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
                  >
                    + {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <button
              onClick={handleGeneratePpt}
              disabled={isGeneratingPpt}
              className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isGeneratingPpt
                  ? 'bg-purple-900/60 text-purple-300 border border-purple-500/50 cursor-wait'
                  : 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
              }`}
            >
              {isGeneratingPpt ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-purple-300 border-t-transparent animate-spin" />
                  <span>Synthesizing Multi-Layout Deck...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Generate & Launch Presentation Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Script Matrix & Direct Downloads */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-tech font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              Complete Source Code Catalog (Episodes 1 to 19)
            </h3>
            <p className="text-xs text-slate-400">
              Download individual Python modules or inspect source code directly.
            </p>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">12 Autonomous Modules</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {scriptFiles.map((file) => (
            <div
              key={file.name}
              className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                    {file.name}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{file.size}</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400/90 block mb-1.5">{file.category}</span>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {file.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleViewCode(file.name)}
                  className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  <Code className="w-3 h-3" />
                  <span>View</span>
                </button>
                <a
                  href={file.downloadUrl}
                  download={file.name}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-[10px] font-mono text-slate-200 transition-all cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Viewer Modal */}
      {selectedScriptCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl border border-cyan-500/40 bg-[#071225] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-slate-200">{selectedScriptCode.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(selectedScriptCode.code, 'modal-code')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'modal-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => setSelectedScriptCode(null)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-500/30 text-xs font-mono text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed">
              <pre>{selectedScriptCode.code}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
