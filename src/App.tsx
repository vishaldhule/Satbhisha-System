/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Hand,
  Settings2,
  Power,
  Zap,
  Sparkles,
  Layers,
  ArrowRight,
  Maximize2,
  Terminal,
  Activity,
  Bot,
  BrainCircuit,
  MessageSquare,
  Eye,
  Camera,
  Upload,
  Search,
  Radio,
  Database,
  Waves,
  ShieldCheck,
  FileText,
  Download,
} from 'lucide-react';
import { ArcReactorVisualizer } from './components/ArcReactorVisualizer';
import { BackgroundHandService } from './components/BackgroundHandService';
import { SystemDiagnosticsDrawer } from './components/SystemDiagnosticsDrawer';
import { GeneratedToolModal } from './components/GeneratedToolModal';
import { GhostWritingModal } from './components/GhostWritingModal';
import { PresentationViewerModal, PresentationPayload } from './components/PresentationViewerModal';
import { DedicatedChatPanel } from './components/DedicatedChatPanel';
import { SearchScannerModule } from './components/SearchScannerModule';
import { DeviceManagerModule } from './components/DeviceManagerModule';
import { PersonalMemoryModule } from './components/PersonalMemoryModule';
import { VoiceConsoleModule } from './components/VoiceConsoleModule';
import { ApiDiagnosticsModule } from './components/ApiDiagnosticsModule';
import { ScreenVisionModule } from './components/ScreenVisionModule';
import { JarvisInstallationHub } from './components/JarvisInstallationHub';
import { TacticalHologramFuiView } from './components/TacticalHologramFuiView';
import { HologramProjectionModal } from './components/HologramProjectionModal';
import { SystemHardware, MediaState, GeneratedTool, ChatMessage, MemoryItem, HologramPayload } from './types';
import { HandTrackerConfig, DEFAULT_HAND_CONFIG } from './utils/handTracker';
import { voiceManager } from './utils/voiceManager';
import {
  playStartupChime,
  playToolChime,
  playMicActivateChime,
  playPurgeSfx,
} from './utils/audioSfx';

export default function App() {
  // Navigation Section: 'core' | 'chat' | 'search' | 'vision' | 'voice' | 'devices' | 'memory' | 'diagnostics' | 'installer' | 'fui'
  const [activeSection, setActiveSection] = useState<
    'core' | 'chat' | 'search' | 'vision' | 'voice' | 'devices' | 'memory' | 'diagnostics' | 'installer' | 'fui'
  >('core');

  // Background Optical Hand Mouse Tracking
  const [handEnabled, setHandEnabled] = useState(false);
  const [handConfig, setHandConfig] = useState<HandTrackerConfig>(() => {
    try {
      const saved = localStorage.getItem('jarvis_hand_config_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.speedMultiplier > 2.5) parsed.speedMultiplier = 1.1;
        if (parsed.smoothing < 0.2) parsed.smoothing = 0.7;
        return { ...DEFAULT_HAND_CONFIG, ...parsed };
      }
      return DEFAULT_HAND_CONFIG;
    } catch {
      return DEFAULT_HAND_CONFIG;
    }
  });

  // UI Drawers & Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeModalTool, setActiveModalTool] = useState<GeneratedTool | null>(null);
  const [activeWebsiteModal, setActiveWebsiteModal] = useState<{ url: string; siteName: string } | null>(null);
  const [activeGhostDocument, setActiveGhostDocument] = useState<{
    appName: string;
    topic: string;
    wordCount: number;
    content: string;
  } | null>(null);
  const [activePresentation, setActivePresentation] = useState<PresentationPayload | null>(null);
  const [activeHologram, setActiveHologram] = useState<HologramPayload | null>(null);
  const [isHologramModalOpen, setIsHologramModalOpen] = useState(false);

  // Core System Hardware State
  const [hardware, setHardware] = useState<SystemHardware>({
    cpu: 24.8,
    ram: 42.1,
    ramTotalGb: 32,
    ramUsedGb: 13.5,
    gpu: 31.4,
    gpuTemp: 52,
    cpuTemp: 48,
    volume: 70,
    brightness: 80,
    battery: 94,
    batteryCharging: true,
    coolingFanRpm: 1850,
    networkSpeedMbps: 680,
    activeProcesses: 142,
    ghostTasksKilled: 19,
  });

  // Media State
  const [media, setMedia] = useState<MediaState>({
    isPlaying: false,
    title: 'AC/DC - Back In Black (Stark Industries Mix)',
    artist: 'AC/DC',
    duration: '4:15',
    position: '1:42',
    volume: 70,
    videoMode: 'standard',
    isAdPlaying: false,
    adSkippedCount: 14,
  });

  // Tools & Memories
  const [savedTools, setSavedTools] = useState<GeneratedTool[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);

  // Commands & Dialogues
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceActive, setVoiceActive] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnergyLevel, setAudioEnergyLevel] = useState(15);
  const [lastActionBadge, setLastActionBadge] = useState<string | null>(null);

  // Audio & Speech Recognition Refs
  const recognitionRef = useRef<any>(null);

  // Save hand config
  useEffect(() => {
    try {
      localStorage.setItem('jarvis_hand_config_v3', JSON.stringify(handConfig));
    } catch {}
  }, [handConfig]);

  // Subscribe to Singleton VoicePlaybackManager
  useEffect(() => {
    const unsubscribe = voiceManager.subscribe((speaking, energy) => {
      setIsSpeaking(speaking);
      if (speaking) {
        setAudioEnergyLevel(energy);
      }
    });
    return () => unsubscribe();
  }, []);

  // Initial Boot Sequence
  useEffect(() => {
    fetch('/api/jarvis/tools')
      .then((r) => r.json())
      .then((d) => {
        if (d.tools) setSavedTools(d.tools);
      })
      .catch(() => {});

    fetch('/api/jarvis/memory')
      .then((r) => r.json())
      .then((d) => {
        if (d.memories) setMemories(d.memories);
      })
      .catch(() => {});

    const hour = new Date().getHours();
    let greeting = 'Good evening, sir.';
    if (hour >= 5 && hour < 12) {
      greeting = 'Good morning, sir.';
    } else if (hour >= 12 && hour < 17) {
      greeting = 'Good afternoon, sir.';
    }

    setMessages([
      {
        id: 'init_welcome',
        role: 'jarvis',
        text: `All protocols online. ${greeting} J.A.R.V.I.S. Personal AI Operating System is active. Single-voice pipeline configured with Avni (ElevenLabs). How may I assist you today?`,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);

    // Background hardware polling
    const timer = setInterval(() => {
      fetch('/api/jarvis/telemetry')
        .then((r) => r.json())
        .then((data) => {
          if (data.hardware) setHardware((prev) => ({ ...prev, ...data.hardware }));
          if (data.media) setMedia((prev) => ({ ...prev, ...data.media }));
        })
        .catch(() => {});
    }, 6000);

    return () => clearInterval(timer);
  }, []);

  // Strict Single-Voice Speech (Avni ElevenLabs via backend)
  const speakResponse = async (text: string) => {
    if (!voiceActive || !text) return;
    await voiceManager.speak(text);
  };

  const handleStopSpeech = () => {
    voiceManager.stop();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Toggle Speech Recognition with Instant Barge-In Audio Interruption
  const toggleListening = () => {
    // Interruption lock: stop speaking whenever user starts listening or talks
    handleStopSpeech();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not available in this browser. Please use the text input.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        playMicActivateChime();
      };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) handleSendMessage(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch {
        setIsListening(false);
      }
    }
  };

  // Main Unified Message Sender (Handles Text, Voice, and Attached Images)
  const handleSendMessage = async (rawText: string, imageBase64?: string) => {
    if ((!rawText.trim() && !imageBase64) || isProcessing) return;

    // Barge-in: immediately silence prior audio
    handleStopSpeech();

    const userText = rawText.trim() || 'Analyze attached visual frame';
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString(),
      image: imageBase64,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);

    try {
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: historyPayload,
          imageBase64: imageBase64 || undefined,
        }),
      });

      const data = await res.json();

      // Tool executions handling
      if (data.toolExecutions && data.toolExecutions.length > 0) {
        for (const exec of data.toolExecutions) {
          playToolChime();
          const badgeText = `Executed: ${exec.name}`;
          setLastActionBadge(badgeText);

          // Launch website in modal & browser
          if (exec.result?.url) {
            setActiveWebsiteModal({
              url: exec.result.url,
              siteName: exec.result.siteName || 'Target Website',
            });
            try {
              window.open(exec.result.url, '_blank', 'noopener,noreferrer');
            } catch {}
          }

          // Episode 17: Ghost Typing in Notepad/Word
          if (exec.name === 'create_document_and_write' && exec.result?.documentContent) {
            setActiveGhostDocument({
              appName: exec.result.appName || 'Notepad',
              topic: exec.result.topic || 'Future Technology',
              wordCount: exec.result.wordCount || 100,
              content: exec.result.documentContent,
            });
            setLastActionBadge(`Ghost-Typing in ${exec.result.appName}`);
          }

          // Episode 18 & 19: Autonomous Presentation Launcher
          if (exec.name === 'generate_presentation') {
            const topic = exec.args?.topic || 'Future Technology';
            setActivePresentation({
              main_title: `${topic.toUpperCase()} ARCHITECTURE`,
              subtitle: 'Autonomous Operational Blueprint & Deployment Paradigm • Pulse of AI',
              topic,
              slides: [
                {
                  layout: 'split_image_right',
                  badge: 'FOUNDATION',
                  heading: 'SYSTEM PHILOSOPHY & OBJECTIVES',
                  summary: `The integration of modern ${topic} represents an epochal leap toward autonomous agentic workflows. By removing deterministic friction and executing parallel sub-second routines, modern platforms achieve unprecedented scalability.`,
                  image_prompt: `Futuristic cyberpunk neural interface for ${topic}, holographic glowing lines, deep obsidian background`,
                  items: [
                    { title: 'Zero-Latency Telemetry', desc: 'Bidirectional data telemetry pipelines actively monitor throughput and system health while running parallel inference loops.' },
                    { title: 'Autonomous Delegation', desc: 'Sub-processes execute asynchronously without blocking critical user threads, ensuring continuous deterministic responsiveness.' },
                    { title: 'Deterministic Safety', desc: 'Hardware safety rails and active memory locks ensure runtime stability even under intensive model inference spikes.' }
                  ]
                },
                {
                  layout: 'cards',
                  badge: 'PILLARS',
                  heading: 'CORE COMPUTATIONAL PILLARS',
                  summary: 'Three foundational pillars anchor the infrastructure, spanning multi-tier neural models, persistent hardware telemetry, and automated presentation workflows.',
                  items: [
                    { title: 'Distributed Neural Routing', desc: 'Intelligent multi-model fallback cascades requests across high-speed edge clusters, dynamically mitigating rate limits.' },
                    { title: 'Physical Desktop Grounding', desc: 'Native OS integration directly binds mouse, keyboard, and COM automation layers for seamless workspace manipulation.' },
                    { title: 'Self-Evolving Capability Core', desc: 'Tri-core skill synthesizer continuously inspects operational deficiencies, writing and executing new tools on demand.' }
                  ]
                },
                {
                  layout: 'timeline',
                  badge: 'ROADMAP',
                  heading: 'STRATEGIC EXECUTION TIMELINE',
                  summary: 'A structured phase-by-phase rollout engineered to transition experimental concepts into hardened enterprise deployment.',
                  items: [
                    { title: 'Phase 1: Sensory Integration', desc: 'Full deployment of local visual processing and audio streaming loops.' },
                    { title: 'Phase 2: Dynamic Skill Synthesis', desc: 'Autonomous runtime Python tool generation and live hot-reloading.' },
                    { title: 'Phase 3: Deep App Orchestration', desc: 'Hands-free control of Word, PowerPoint, and system utilities.' },
                    { title: 'Phase 4: Autonomous Horizon', desc: 'Self-supervised edge execution and persistent agentic autonomy.' }
                  ]
                },
                {
                  layout: 'flowchart',
                  badge: 'PIPELINE',
                  heading: 'OPERATIONAL INGESTION PIPELINE',
                  summary: 'Visualizing the deterministic data journey from raw multimodal sensor ingestion down to physical OS execution.',
                  items: [
                    { title: 'Ingestion & Detection', desc: 'Real-time audio and visual streams are sampled and threshold-verified via RMS energy calculation.' },
                    { title: 'Reflex Classification', desc: 'Commands are parsed via zero-latency sub-10ms pattern matchers before escalating to cloud LLMs.' },
                    { title: 'Physical Dispatch', desc: 'OS-level automation handles PowerPoint, desktop tools, and document synthesizers with verified window handles.' }
                  ]
                }
              ]
            });
            setLastActionBadge(`PPT Generated for "${topic}"`);
          }

          // Memory update
          if (exec.name === 'memory_manager') {
            fetch('/api/jarvis/memory')
              .then((r) => r.json())
              .then((d) => {
                if (d.memories) setMemories(d.memories);
              })
              .catch(() => {});
          }
        }
      }

      // Handle dynamic tool generator
      if (data.generatedToolArtifact) {
        setSavedTools((prev) => [
          data.generatedToolArtifact,
          ...prev.filter((t) => t.id !== data.generatedToolArtifact.id),
        ]);
        setActiveModalTool(data.generatedToolArtifact);
        setLastActionBadge(`Generated: ${data.generatedToolArtifact.name}`);
      }

      // Speech & Text response
      if (data.text) {
        const jarvisMsg: ChatMessage = {
          id: `jarvis_${Date.now()}`,
          role: 'jarvis',
          text: data.text,
          timestamp: new Date().toLocaleTimeString(),
          toolExecution: data.toolExecutions?.[0],
          generatedTool: data.generatedToolArtifact,
          hologram: data.hologram || undefined,
        };
        setMessages((prev) => [...prev, jarvisMsg]);
        speakResponse(data.text);
      }

      // Automatic Hologram Projector trigger
      if (data.hologram) {
        setActiveHologram(data.hologram);
        setIsHologramModalOpen(true);
        setLastActionBadge(`Hologram: ${data.hologram.title || data.hologram.type.toUpperCase()}`);
      }
    } catch (err: any) {
      console.error('Chat processing error:', err);
      const fallbackTxt = 'Neural link refreshed. Standing by for instructions, sir.';
      const fallbackMsg: ChatMessage = {
        id: `jarvis_${Date.now()}`,
        role: 'jarvis',
        text: fallbackTxt,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      speakResponse(fallbackTxt);
    } finally {
      setIsProcessing(false);
    }
  };

  // Memory management handlers
  const handleAddMemory = async (key: string, value: string) => {
    try {
      const res = await fetch('/api/jarvis/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      const data = await res.json();
      if (data.memory) {
        setMemories((prev) => [data.memory, ...prev]);
        setLastActionBadge(`Committed: ${key}`);
      }
    } catch (e) {
      console.warn('Memory save failed:', e);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await fetch(`/api/jarvis/memory/${id}`, { method: 'DELETE' });
      setMemories((prev) => prev.filter((m) => m.id !== id));
      setLastActionBadge('Memory Deleted');
    } catch (e) {
      console.warn('Memory delete failed:', e);
    }
  };

  const handleClearAllMemories = () => {
    setMemories([]);
    setLastActionBadge('All Memory Banks Cleared');
  };

  interface NavItem {
    id: 'core' | 'chat' | 'search' | 'vision' | 'voice' | 'devices' | 'memory' | 'diagnostics' | 'installer' | 'fui';
    label: string;
    icon: any;
    badge?: number | string;
    highlight?: boolean;
  }

  const navItems: NavItem[] = [
    { id: 'core', label: 'Core', icon: Activity },
    { id: 'chat', label: 'Chat', icon: MessageSquare, badge: messages.length },
    { id: 'fui', label: 'Tactical FUI (EP 24)', icon: Eye, badge: '3D HUD', highlight: true },
    { id: 'search', label: 'Search & URL', icon: Search },
    { id: 'vision', label: 'Vision & Eyes', icon: Eye },
    { id: 'installer', label: 'Installer (EP 19)', icon: Download, badge: 'NEW' },
    { id: 'voice', label: 'Voice (Avni)', icon: Waves, highlight: isSpeaking },
    { id: 'devices', label: 'Devices', icon: Radio },
    { id: 'memory', label: 'Memory', icon: Database },
    { id: 'diagnostics', label: 'Diagnostics', icon: ShieldCheck },
  ];

  return (
    <div className="relative h-screen w-screen bg-[#030712] text-slate-100 flex flex-col overflow-hidden select-none">
      {/* Background Cyberpunk Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,229,255,0.12),rgba(3,7,18,0.98))]" />

      {/* Background Headless Optical Hand Mouse Tracking Service */}
      <BackgroundHandService
        enabled={handEnabled}
        onToggleEnabled={() => setHandEnabled(!handEnabled)}
        config={handConfig}
        onNotify={(txt) => setLastActionBadge(txt)}
      />

      {/* TOP BAR: Clean Modern J.A.R.V.I.S. Architecture */}
      <header className="relative z-30 flex-shrink-0 w-full px-4 sm:px-6 py-3 flex items-center justify-between border-b border-cyan-500/15 bg-[#071225]/80 backdrop-blur-xl">
        {/* Left: Brand & Status */}
        <div
          onClick={() => setActiveSection('core')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block" />
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute inset-0 animate-ping" />
          </div>
          <div>
            <h1 className="text-xs font-tech font-bold uppercase tracking-wider text-slate-100 group-hover:text-cyan-300 transition-colors">
              J.A.R.V.I.S. • NEURAL OPERATING SYSTEM
            </h1>
            <span className="text-[10px] font-mono text-cyan-400/90 block">
              Pulse of AI • Swayam Dhawale Architecture
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden lg:flex items-center space-x-1 p-1 rounded-2xl bg-slate-900/90 border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  playToolChime();
                  setActiveSection(item.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-tech font-bold uppercase transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.highlight ? 'text-cyan-400 animate-pulse' : ''}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge !== 0 && item.badge !== '' && (
                  <span className="text-[10px] font-mono px-1 rounded bg-slate-800 text-cyan-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Quick Status, Voice Stop & Drawer Controls */}
        <div className="flex items-center gap-2">
          {/* Hand Tracking Toggle */}
          <button
            onClick={() => {
              setHandEnabled(!handEnabled);
              playToolChime();
              setLastActionBadge(!handEnabled ? '🖐️ Hand Mouse ON' : '🖐️ Hand Mouse OFF');
            }}
            className={`hidden sm:flex px-2.5 py-1.5 rounded-xl border text-xs font-tech font-bold items-center gap-1.5 transition-all cursor-pointer ${
              handEnabled
                ? 'bg-cyan-950/70 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Hand Mouse Controller"
          >
            <Hand className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Hand Mouse</span>
          </button>

          {/* Voice Stop Button if actively speaking */}
          {isSpeaking && (
            <button
              onClick={handleStopSpeech}
              className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold transition-all cursor-pointer animate-pulse"
              title="Stop Avni Voice Playback"
            >
              Stop Voice
            </button>
          )}

          {/* Mute toggle */}
          <button
            onClick={() => setVoiceActive(!voiceActive)}
            className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            title={voiceActive ? 'Mute AI Voice' : 'Unmute AI Voice'}
          >
            {voiceActive ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* System Settings & Diagnostics Drawer */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-tech flex items-center gap-1.5 transition-all cursor-pointer"
            title="System Diagnostics Drawer"
          >
            <Settings2 className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Diagnostics</span>
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT: Zero-Overlap Section Switcher */}
      <main className="relative z-20 flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Section 1: CORE / HOME (Arc Reactor Visualizer + Vitals) */}
        {activeSection === 'core' && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto max-w-4xl mx-auto w-full text-center my-auto space-y-6">
            {/* Centerpiece: Mark-85 Arc Reactor */}
            <div className="relative flex flex-col items-center">
              <ArcReactorVisualizer
                status={isProcessing ? 'processing' : isListening ? 'listening' : 'idle'}
                audioLevel={isSpeaking ? audioEnergyLevel : isListening ? 80 : 15}
                persona="friday"
                outputPower={hardware.battery}
                onClick={() => {
                  playStartupChime();
                  handleSendMessage('Status report and system health, Boss');
                }}
              />

              {/* Status Indicator */}
              <div className="mt-5 flex flex-col items-center gap-2">
                {isProcessing ? (
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono animate-pulse">
                    <BrainCircuit className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Neural core processing instructions across Gemini & Groq...</span>
                  </div>
                ) : isSpeaking ? (
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-400 text-cyan-300 text-xs font-mono shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                    <Waves className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span>Avni (ElevenLabs) Speaking...</span>
                  </div>
                ) : lastActionBadge ? (
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono shadow-lg animate-in fade-in duration-300">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lastActionBadge}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>Cognitive Pipeline Nominal • Ready for Commands</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 max-w-xl">
              <button
                onClick={() => {
                  setActiveSection('chat');
                  handleSendMessage('JARVIS, future technology par 100 words ka proposal likho');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-xs font-mono text-cyan-300 transition-all cursor-pointer flex items-center gap-1.5 shadow"
              >
                <span>✍️ Tech Proposal (EP 17)</span>
              </button>

              <button
                onClick={() => setActiveSection('installer')}
                className="px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/60 text-xs font-mono text-cyan-300 transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.2)]"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>📥 Install EP 19 Suite</span>
              </button>

              <button
                onClick={() => {
                  handleSendMessage('AI par presentation banao');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-xs font-mono text-cyan-300 transition-all cursor-pointer flex items-center gap-1.5 shadow"
              >
                <span>📊 Visual PPT Deck (EP 19)</span>
              </button>

              <button
                onClick={() => handleSendMessage('Purge background tasks and optimize RAM')}
                className="px-3 py-1.5 rounded-xl bg-slate-900/70 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/50 text-xs font-mono text-rose-300 transition-all cursor-pointer flex items-center gap-1.5 shadow"
              >
                <Power className="w-3 h-3 text-rose-400" />
                <span>⚡ Purge RAM</span>
              </button>

              <button
                onClick={() => setActiveSection('search')}
                className="px-3 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-xs font-mono text-slate-300 transition-all cursor-pointer flex items-center gap-1.5 shadow"
              >
                <Search className="w-3 h-3 text-cyan-400" />
                <span>Deep URL Scanner</span>
              </button>
            </div>
          </div>
        )}

        {/* Section 2: DEDICATED CHAT PANEL (Full Height, Independent Scroll, Fixed Composer) */}
        {activeSection === 'chat' && (
          <DedicatedChatPanel
            messages={messages}
            onSendMessage={handleSendMessage}
            onClearHistory={() => setMessages([])}
            isProcessing={isProcessing}
            isListening={isListening}
            onToggleListening={toggleListening}
            voiceActive={voiceActive}
            onToggleVoiceActive={() => setVoiceActive(!voiceActive)}
            isSpeaking={isSpeaking}
            onStopSpeech={handleStopSpeech}
            onSpeakText={speakResponse}
            onOpenGeneratedTool={(tool) => setActiveModalTool(tool)}
            onOpenHologram={(holo) => {
              setActiveHologram(holo);
              setIsHologramModalOpen(true);
            }}
          />
        )}

        {/* Section 2B: EPISODE 24 TACTICAL FUI 3D HOLOGRAPHIC VIEWPORT */}
        {activeSection === 'fui' && (
          <TacticalHologramFuiView
            hardware={hardware}
            onSendChatCommand={(cmd) => handleSendMessage(cmd)}
            onOpenWeatherHologram={() => {
              handleSendMessage('Delhi ka weather kaisa hai, live hologram dikhao');
            }}
            onOpenChronoHologram={() => {
              handleSendMessage('Current local time and atomic chrono');
            }}
            onOpenBrainHologram={() => {
              setActiveHologram({
                type: 'brain',
                title: 'CYBERNETIC NEURAL SYNAPSE & BRAIN CORE',
                videoUrl: '/assets/aistudio/cd4583679b7ac465097f39a77fda01ab_7890910b.mp4',
              });
              setIsHologramModalOpen(true);
            }}
            onOpenEarthHologram={() => {
              setActiveHologram({
                type: 'earth',
                title: 'GLOBAL PLANETARY SURVEILLANCE & AUTONOMOUS SWARM',
                videoUrl: '/assets/aistudio/From_Klickpin.com-_Peaceful_worship_room_inspiration_for_modern_homes_with_ideas_people_actually_use_to_save_for_Sunday-pin-id-622693086024257591_cdb71ca2.mp4',
              });
              setIsHologramModalOpen(true);
            }}
          />
        )}

        {/* Section 3: SEARCH & DEEP URL SCANNER */}
        {activeSection === 'search' && (
          <SearchScannerModule
            onSendToChat={(txt) => {
              setActiveSection('chat');
              handleSendMessage(txt);
            }}
          />
        )}

        {/* Section 4: VISION & EYES */}
        {activeSection === 'vision' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full">
            <ScreenVisionModule
              onAnalyzeScreen={async (prompt, imageBase64) => {
                setActiveSection('chat');
                await handleSendMessage(prompt, imageBase64);
              }}
              isAnalyzing={isProcessing}
            />
          </div>
        )}

        {/* Section 5: VOICE CONSOLE (Avni ElevenLabs) */}
        {activeSection === 'voice' && (
          <VoiceConsoleModule
            isListening={isListening}
            onToggleListening={toggleListening}
            isSpeaking={isSpeaking}
            audioEnergyLevel={audioEnergyLevel}
            onStopSpeech={handleStopSpeech}
            onTestSpeech={speakResponse}
          />
        )}

        {/* Section 6: CONNECTED DEVICES & SMART HOME */}
        {activeSection === 'devices' && <DeviceManagerModule />}

        {/* Section 7: PERSONAL MEMORY VAULT */}
        {activeSection === 'memory' && (
          <PersonalMemoryModule
            memories={memories}
            onAddMemory={handleAddMemory}
            onDeleteMemory={handleDeleteMemory}
            onClearAll={handleClearAllMemories}
          />
        )}

        {/* Section 8: DIAGNOSTICS & API BRIDGES */}
        {activeSection === 'diagnostics' && <ApiDiagnosticsModule />}

        {/* Section 9: INSTALLER & EPISODE 19 CODE PACK */}
        {activeSection === 'installer' && (
          <JarvisInstallationHub
            onLaunchPresentation={(deck) => setActivePresentation(deck)}
            onNotify={(msg) => setLastActionBadge(msg)}
          />
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR (Visible on smaller screens so controls are always accessible) */}
      <nav className="lg:hidden flex-shrink-0 flex items-center justify-around py-2 border-t border-slate-800 bg-[#071225] z-30">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                playToolChime();
                setActiveSection(item.id);
              }}
              className={`flex flex-col items-center justify-center p-1.5 transition-all cursor-pointer ${
                isActive ? 'text-cyan-400 font-bold scale-110' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] font-tech uppercase mt-0.5">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>

      {/* MODALS & DRAWERS */}
      {/* 1. System Diagnostics Drawer */}
      <SystemDiagnosticsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        hardware={hardware}
        onPurgeRam={() => handleSendMessage('Purge background tasks and optimize RAM, JARVIS')}
        isPurging={isProcessing}
        handConfig={handConfig}
        onUpdateHandConfig={(c) => setHandConfig(c)}
        handEnabled={handEnabled}
        onToggleHand={() => setHandEnabled(!handEnabled)}
        savedTools={savedTools}
        onOpenTool={(tool) => setActiveModalTool(tool)}
        memories={memories}
      />

      {/* 2. Generated Tool Modal */}
      {activeModalTool && (
        <GeneratedToolModal
          tool={activeModalTool}
          isOpen={!!activeModalTool}
          onClose={() => setActiveModalTool(null)}
        />
      )}

      {/* 3. Ghost Writing Holographic Window (Episode 17) */}
      {activeGhostDocument && (
        <GhostWritingModal
          documentData={activeGhostDocument}
          isOpen={!!activeGhostDocument}
          onClose={() => setActiveGhostDocument(null)}
        />
      )}

      {/* 4. Episode 18 & 19 Presentation Viewer */}
      {activePresentation && (
        <PresentationViewerModal
          presentation={activePresentation}
          isOpen={!!activePresentation}
          onClose={() => setActivePresentation(null)}
        />
      )}

      {/* 5. Episode 24 & Multimodal Hologram Projection Modal */}
      <HologramProjectionModal
        isOpen={isHologramModalOpen}
        onClose={() => setIsHologramModalOpen(false)}
        hologram={activeHologram}
        onSendChatCommand={(cmd) => handleSendMessage(cmd)}
      />
    </div>
  );
}
