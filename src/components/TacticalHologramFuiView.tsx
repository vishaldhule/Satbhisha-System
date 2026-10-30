import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  Send,
  CloudSun,
  Clock,
  Brain,
  Globe,
  Maximize2,
  Minimize2,
  Square,
  Play
} from 'lucide-react';
import { ArcReactorCanvas } from '../utils/arc_reactor';
import { jarvisAudio } from '../utils/sound_effects';
import { SystemHardware, MediaState } from '../types';

interface TacticalHologramFuiViewProps {
  hardware: SystemHardware;
  onSendChatCommand: (cmd: string) => void;
  onOpenWeatherHologram: () => void;
  onOpenChronoHologram: () => void;
  onOpenBrainHologram: () => void;
  onOpenEarthHologram: () => void;
}

export const TacticalHologramFuiView: React.FC<TacticalHologramFuiViewProps> = ({
  hardware,
  onSendChatCommand,
  onOpenWeatherHologram,
  onOpenChronoHologram,
  onOpenBrainHologram,
  onOpenEarthHologram,
}) => {
  const [currentMode, setCurrentMode] = useState<'normal' | 'serious'>('normal');
  const [centerDisplayMode, setCenterDisplayMode] = useState<'reactor' | 'brain' | 'earth' | 'weather'>('reactor');
  const [is3DTilt, setIs3DTilt] = useState(true);
  const [isSfxMuted, setIsSfxMuted] = useState(false);
  const [isBargeInActive, setIsBargeInActive] = useState(true);
  const [inputText, setInputText] = useState('');
  const [missionTimeStr, setMissionTimeStr] = useState('');
  const [logs, setLogs] = useState<Array<{ id: string; time: string; tag: string; text: string }>>([
    { id: '1', time: '14:30:00', tag: 'SYSTEM INIT', text: 'JARVIS Multimodal Neural HUD Online. EP 24 Active.' },
    { id: '2', time: '14:30:01', tag: 'BRIDGE', text: 'Ultra-Fast Groq Cloud LPU + Gemini Vision bridge online (12ms ping).' },
  ]);
  const [packetLines, setPacketLines] = useState<Array<{ id: string; time: string; p: string; h1: string; h2: string }>>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const oscCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const reactorRef = useRef<ArcReactorCanvas | null>(null);
  const oscAnimationRef = useRef<number | null>(null);

  // Real-time mission time clock
  useEffect(() => {
    let animId: number;
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
      setMissionTimeStr(`${timeStr} IST`);
      animId = requestAnimationFrame(updateTime);
    };
    animId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Hex packet generator
  useEffect(() => {
    const protocols = ['SYNC_ACK', 'TELEMETRY_TX', 'NEURAL_PULSE', 'BUFFER_DRAIN', 'SYS_VITALS', 'DMA_BURST'];
    const hexChars = '0123456789ABCDEF';
    const getRandomHex = (len: number) => {
      let s = '0x';
      for (let i = 0; i < len; i++) s += hexChars[Math.floor(Math.random() * 16)];
      return s;
    };

    const interval = setInterval(() => {
      const p = protocols[Math.floor(Math.random() * protocols.length)];
      const h1 = getRandomHex(6);
      const h2 = getRandomHex(4);
      const now = new Date();
      const timeStr = now.toISOString().substring(14, 23);

      setPacketLines((prev) => [
        ...prev.slice(-18),
        { id: String(Date.now() + Math.random()), time: timeStr, p, h1, h2 },
      ]);
    }, 450);

    return () => clearInterval(interval);
  }, []);

  // Initialize Arc Reactor Canvas
  useEffect(() => {
    if (centerDisplayMode === 'reactor' && canvasRef.current) {
      if (!reactorRef.current) {
        reactorRef.current = new ArcReactorCanvas(canvasRef.current);
        reactorRef.current.setMode(currentMode);
      }
    } else {
      if (reactorRef.current) {
        reactorRef.current.destroy();
        reactorRef.current = null;
      }
    }
    return () => {
      if (reactorRef.current) {
        reactorRef.current.destroy();
        reactorRef.current = null;
      }
    };
  }, [centerDisplayMode, currentMode]);

  // Audio Oscilloscope loop
  useEffect(() => {
    let oscPhase = 0;
    const drawOscilloscope = () => {
      const canvas = oscCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = (canvas.width = canvas.offsetWidth);
      const h = (canvas.height = canvas.offsetHeight);
      ctx.clearRect(0, 0, w, h);

      oscPhase += 0.08;
      const color = currentMode === 'serious' ? '#FF1744' : '#00E5FF';

      // Center baseline
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Dynamic Waveform
      ctx.beginPath();
      const amp = h * 0.32;
      for (let x = 0; x < w; x++) {
        const freq = 0.035;
        const y = h / 2 + Math.sin(x * freq + oscPhase) * Math.cos(x * 0.015 - oscPhase * 0.5) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.stroke();

      oscAnimationRef.current = requestAnimationFrame(drawOscilloscope);
    };

    oscAnimationRef.current = requestAnimationFrame(drawOscilloscope);
    return () => {
      if (oscAnimationRef.current) cancelAnimationFrame(oscAnimationRef.current);
    };
  }, [currentMode]);

  const handleToggleSeriousMode = () => {
    const next = currentMode === 'normal' ? 'serious' : 'normal';
    setCurrentMode(next);
    if (reactorRef.current) {
      reactorRef.current.setMode(next);
    }
    if (next === 'serious') {
      jarvisAudio.playAlert();
      appendLog('TACTICAL SERIOUS MODE ENGAGED. HIGH COGNITIVE OVERRIDE ACTIVE.', 'SERIOUS');
    } else {
      jarvisAudio.playPowerUp();
      appendLog('TACTICAL SERIOUS MODE DISENGAGED. NOMINAL PROTOCOLS RESTORED.', 'SYSTEM');
    }
  };

  const appendLog = (text: string, tag = 'SYSTEM') => {
    const time = new Date().toTimeString().split(' ')[0];
    setLogs((prev) => [...prev, { id: String(Date.now()), time, tag, text }]);
    jarvisAudio.playDataPacket();
  };

  const handleTransmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const clean = inputText.trim();
    appendLog(clean, 'YOU (CMD)');
    jarvisAudio.playTransmit();
    onSendChatCommand(clean);
    setInputText('');
  };

  const isSerious = currentMode === 'serious';
  const themeCyan = isSerious ? '#FF1744' : '#00E5FF';
  const themeBorder = isSerious ? 'border-rose-500/40' : 'border-cyan-500/30';
  const themeGlow = isSerious ? 'shadow-[0_0_25px_rgba(255,23,68,0.25)]' : 'shadow-[0_0_25px_rgba(0,229,255,0.15)]';

  return (
    <div className={`h-full w-full flex flex-col overflow-hidden bg-[#02040a] text-slate-100 font-sans select-none relative ${isSerious ? 'serious-active' : ''}`}>
      {/* Scanline CRT overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-65 z-20" />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.85)] z-20" />

      {/* Frame Corner Reticles */}
      <div className={`absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 pointer-events-none z-30 ${isSerious ? 'border-rose-500' : 'border-cyan-400'}`} />
      <div className={`absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 pointer-events-none z-30 ${isSerious ? 'border-rose-500' : 'border-cyan-400'}`} />
      <div className={`absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 pointer-events-none z-30 ${isSerious ? 'border-rose-500' : 'border-cyan-400'}`} />
      <div className={`absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 pointer-events-none z-30 ${isSerious ? 'border-rose-500' : 'border-cyan-400'}`} />

      {/* TOP HEADER HUD */}
      <header className={`flex-shrink-0 h-12 px-4 sm:px-6 flex items-center justify-between border-b backdrop-blur-xl z-30 ${themeBorder} bg-[#050A14]/90`}>
        {/* Left branding */}
        <div className="flex items-center gap-3">
          <span className={`text-lg font-black ${isSerious ? 'text-rose-500' : 'text-amber-400'}`}>⚡</span>
          <div>
            <h1 className="text-xs font-tech font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
              <span className={isSerious ? 'text-rose-400' : 'text-cyan-300'}>JARVIS TACTICAL FUI</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SYS v4.2
              </span>
            </h1>
            <span className="text-[9px] font-mono text-slate-400 block -mt-0.5">
              // FOUNDER: SWAYAM DHAWALE (PULSE OF AI)
            </span>
          </div>
        </div>

        {/* Center Clock & Bridge Status */}
        <div className="hidden md:flex items-center gap-3 font-mono text-xs">
          <span className="text-amber-300 font-bold">{missionTimeStr || '14:30:00.000 IST'}</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            NEURAL BRIDGE ONLINE
          </span>
          <span className="text-[10px] text-cyan-400">12ms</span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* 3D Tilt button */}
          <button
            onClick={() => {
              jarvisAudio.playClick();
              if (reactorRef.current) {
                const en = reactorRef.current.toggle3D();
                setIs3DTilt(en);
              }
            }}
            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold border cursor-pointer ${
              is3DTilt ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50' : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            3D TILT: {is3DTilt ? 'ON' : 'OFF'}
          </button>

          {/* Sound FX Mute */}
          <button
            onClick={() => {
              const muted = jarvisAudio.toggleMute();
              setIsSfxMuted(muted);
            }}
            className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 text-[10px] font-mono font-bold cursor-pointer"
          >
            {isSfxMuted ? 'SFX: MUTED' : 'SFX: ON'}
          </button>

          {/* Serious Mode Toggle Button */}
          <button
            onClick={handleToggleSeriousMode}
            className={`px-3 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSerious
                ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(255,23,68,0.6)] animate-pulse'
                : 'bg-slate-900 border border-rose-500/50 text-rose-400 hover:bg-rose-950/40'
            }`}
          >
            <span>⚡</span>
            <span>{isSerious ? 'SERIOUS ACTIVE' : 'SERIOUS MODE'}</span>
          </button>
        </div>
      </header>

      {/* MAIN 3-COLUMN TACTICAL VIEWPORT */}
      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-hidden z-10">
        {/* =================================================================== */}
        {/* LEFT COLUMN: SYSTEM TELEMETRY & CONTROLS (3 Cols) */}
        {/* =================================================================== */}
        <aside className={`lg:col-span-3 rounded-xl border bg-[#080E1A]/80 backdrop-blur-md p-3 flex flex-col justify-between overflow-y-auto ${themeBorder} ${themeGlow}`}>
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-cyan-500/15">
              <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-400">NEURAL TELEMETRY</span>
              <span className="text-[9px] font-mono text-amber-400">SYSTEM VITALS</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* CPU */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>CPU UTILIZATION</span>
                  <span className="text-slate-200 font-bold">{Math.round(hardware.cpu)}%</span>
                </div>
                <div className="w-full h-1.5 rounded bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${isSerious ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-cyan-400 to-sky-400'}`}
                    style={{ width: `${Math.min(100, hardware.cpu)}%` }}
                  />
                </div>
              </div>

              {/* RAM */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>MEMORY ALLOCATION</span>
                  <span className="text-slate-200 font-bold">{Math.round(hardware.ram)}%</span>
                </div>
                <div className="w-full h-1.5 rounded bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${isSerious ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-cyan-400 to-purple-400'}`}
                    style={{ width: `${Math.min(100, hardware.ram)}%` }}
                  />
                </div>
              </div>

              {/* Core Thermal */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>CORE THERMAL</span>
                  <span className="text-slate-200 font-bold">{hardware.cpuTemp}°C</span>
                </div>
                <div className="w-full h-1.5 rounded bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${hardware.cpuTemp > 65 ? 'bg-rose-500' : 'bg-cyan-400'}`}
                    style={{ width: `${Math.min(100, (hardware.cpuTemp / 90) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Battery */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>POWER CELL / BATTERY</span>
                  <span className="text-slate-200 font-bold">{hardware.battery}%</span>
                </div>
                <div className="w-full h-1.5 rounded bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: `${hardware.battery}%` }} />
                </div>
              </div>

              {/* Holographic Fast Triggers */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <span className="text-[10px] font-mono text-cyan-400 block mb-1">PROJECT HOLOGRAMS:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      jarvisAudio.playPowerUp();
                      onOpenWeatherHologram();
                    }}
                    className="p-1.5 rounded bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold transition-all cursor-pointer text-left flex items-center gap-1"
                  >
                    <CloudSun className="w-3 h-3 text-cyan-400" />
                    <span>Live Weather</span>
                  </button>
                  <button
                    onClick={() => {
                      jarvisAudio.playPowerUp();
                      onOpenChronoHologram();
                    }}
                    className="p-1.5 rounded bg-amber-950/60 hover:bg-amber-900/70 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold transition-all cursor-pointer text-left flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Chrono Clock</span>
                  </button>
                  <button
                    onClick={() => {
                      jarvisAudio.playPowerUp();
                      onOpenBrainHologram();
                    }}
                    className="p-1.5 rounded bg-purple-950/60 hover:bg-purple-900/70 border border-purple-500/40 text-purple-300 text-[10px] font-mono font-bold transition-all cursor-pointer text-left flex items-center gap-1"
                  >
                    <Brain className="w-3 h-3 text-purple-400" />
                    <span>Neural Brain</span>
                  </button>
                  <button
                    onClick={() => {
                      jarvisAudio.playPowerUp();
                      onOpenEarthHologram();
                    }}
                    className="p-1.5 rounded bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold transition-all cursor-pointer text-left flex items-center gap-1"
                  >
                    <Globe className="w-3 h-3 text-emerald-400" />
                    <span>Earth Swarm</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Engine Badges */}
          <div className="pt-2 border-t border-slate-800 text-[9.5px] font-mono space-y-1">
            <span className="text-slate-500 block text-[9px]">ACTIVE ENGINES:</span>
            <div className="text-emerald-400">✔ Ultra-Fast Groq LPU (Sub-1s)</div>
            <div className="text-cyan-300">✔ Gemini Multimodal Vision</div>
            <div className="text-purple-300">✔ DeepSeek R1 Hybrid Reasoning</div>
            <div className="text-amber-300">✔ Live Weather Satellite API</div>
          </div>
        </aside>

        {/* =================================================================== */}
        {/* CENTER STAGE: 3D HOLOGRAPHIC VIEWPORT (6 Cols) */}
        {/* =================================================================== */}
        <section className={`lg:col-span-6 rounded-xl border bg-black/80 backdrop-blur-md relative flex flex-col justify-between overflow-hidden cursor-crosshair ${themeBorder} ${themeGlow}`}>
          {/* Top Stage Bar */}
          <div className="absolute top-2 left-3 right-3 flex items-center justify-between text-xs font-mono z-20 pointer-events-none">
            <div className="flex flex-col">
              <span className="text-slate-300 font-bold">
                CORE: <strong className={isSerious ? 'text-rose-400' : 'text-cyan-400'}>ARC MK-VII (NOMINAL)</strong>
              </span>
              <span className="text-[10px] text-slate-500">OUTPUT: 3.2 GW // PHASE: LOCKED</span>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 pointer-events-auto">
              {[
                { id: 'reactor', label: 'Arc Reactor' },
                { id: 'brain', label: 'Neural Brain' },
                { id: 'earth', label: 'Earth Swarm' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    jarvisAudio.playClick();
                    setCenterDisplayMode(m.id as any);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                    centerDisplayMode === m.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Holographic Stage Render */}
          <div className="flex-1 w-full h-full flex items-center justify-center relative overflow-hidden">
            {/* View A: Mathematical Arc Reactor Canvas */}
            {centerDisplayMode === 'reactor' && (
              <canvas ref={canvasRef} className="w-full h-full block" />
            )}

            {/* View B: Neural Brain Video Hologram (User Video 1) */}
            {centerDisplayMode === 'brain' && (
              <div className="w-full h-full relative flex items-center justify-center p-4">
                <video
                  src="/assets/aistudio/cd4583679b7ac465097f39a77fda01ab_7890910b.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full max-h-[460px] object-contain filter contrast-125 saturate-125"
                />
                <div className="absolute bottom-4 left-4 px-2 py-1 rounded bg-black/80 border border-purple-500/40 text-[10px] font-mono text-purple-300">
                  3D CYBERNETIC NEURAL BRAIN // SYNAPSE OVERLAY
                </div>
              </div>
            )}

            {/* View C: Earth Swarm Video Hologram (User Video 2) */}
            {centerDisplayMode === 'earth' && (
              <div className="w-full h-full relative flex items-center justify-center p-4">
                <video
                  src="/assets/aistudio/From_Klickpin.com-_Peaceful_worship_room_inspiration_for_modern_homes_with_ideas_people_actually_use_to_save_for_Sunday-pin-id-622693086024257591_cdb71ca2.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full max-h-[460px] object-contain filter contrast-125 saturate-125"
                />
                <div className="absolute bottom-4 left-4 px-2 py-1 rounded bg-black/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                  GLOBAL EARTH SURVEILLANCE &amp; AUTONOMOUS SWARM
                </div>
              </div>
            )}
          </div>

          {/* Bottom Stage Coordinates */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[9px] font-mono text-slate-500 pointer-events-none z-20">
            <span>COORDINATES: 28.6139° N, 77.2090° E</span>
            <span>AZIMUTH: 184.2° // ELEVATION: 41.8°</span>
            <span className="text-cyan-400">3D PARALLAX ACTIVE</span>
          </div>
        </section>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: DATA STREAM & AUTONOMOUS TOOLS MATRIX (3 Cols) */}
        {/* =================================================================== */}
        <aside className={`lg:col-span-3 rounded-xl border bg-[#080E1A]/80 backdrop-blur-md p-3 flex flex-col justify-between overflow-y-auto ${themeBorder} ${themeGlow}`}>
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-cyan-500/15">
              <span className="text-[11px] font-mono font-bold tracking-wider text-cyan-400">PACKET DATA FLOW</span>
              <span className="text-[9px] font-mono text-amber-400">SYSTEM BUS 0x8840</span>
            </div>

            {/* Live Hex Stream Box */}
            <div className="h-28 rounded bg-[#02060c] border border-cyan-500/20 p-2 font-mono text-[9px] overflow-hidden flex flex-col justify-end space-y-1">
              {packetLines.map((pkt) => (
                <div key={pkt.id} className="truncate">
                  <span className="text-slate-600">[{pkt.time}]</span>{' '}
                  <span className="text-sky-400">{pkt.p}</span>{' '}
                  <span className="text-cyan-300">{pkt.h1}</span> -&gt;{' '}
                  <span className="text-amber-400">{pkt.h2}</span>
                </div>
              ))}
            </div>

            {/* Autonomous Tools Grid */}
            <div className="pt-3">
              <span className="text-[10px] font-mono font-bold text-cyan-300 block mb-2 uppercase">
                AUTONOMOUS TOOLS MATRIX
              </span>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                {[
                  { name: 'Weather Radar', cmd: 'Delhi ka weather report do' },
                  { name: 'Chrono Time', cmd: 'Time aur date batao' },
                  { name: 'Neural Brain', cmd: 'Tumhara neural brain dikhao' },
                  { name: 'Earth Swarm', cmd: 'Global surveillance earth dikhao' },
                  { name: 'PowerPoint (EP19)', cmd: 'AI par presentation banao' },
                  { name: 'PDF Dossier', cmd: 'Quantum computing par 5-page PDF generate karo' },
                  { name: 'Purge RAM', cmd: 'Purge background tasks and optimize RAM' },
                  { name: 'Serious Mode', cmd: 'Serious mode jao' },
                ].map((tool, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      jarvisAudio.playClick();
                      onSendChatCommand(tool.cmd);
                    }}
                    className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-left transition-all truncate cursor-pointer"
                  >
                    {tool.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500 text-center">
            Episode 24 Tactical FUI • Pulse of AI
          </div>
        </aside>
      </main>

      {/* BOTTOM HUD: AUDIO OSCILLOSCOPE, LOGS TERMINAL, COMMAND INPUT */}
      <footer className={`flex-shrink-0 h-44 px-3 pb-3 grid grid-cols-1 md:grid-cols-12 gap-3 z-30`}>
        {/* Oscilloscope Card (3 Cols) */}
        <div className={`md:col-span-3 rounded-xl border bg-[#080E1A]/90 p-2.5 flex flex-col justify-between ${themeBorder}`}>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="font-bold text-cyan-400">AUDIO WAVEFORM</span>
            <span className="text-slate-500">PCM 16k/24k</span>
          </div>
          <canvas ref={oscCanvasRef} className="w-full h-20 block rounded" />
          <div className="flex items-center justify-between text-[9px] font-mono pt-1 border-t border-slate-800">
            <span className="text-slate-400">VOICE PROTOCOL:</span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
              {isBargeInActive ? 'HANDS-FREE VAD' : 'PTT ACTIVE'}
            </span>
          </div>
        </div>

        {/* Neural Terminal & Command Input (9 Cols) */}
        <div className={`md:col-span-9 rounded-xl border bg-[#080E1A]/90 p-2.5 flex flex-col justify-between ${themeBorder}`}>
          <div className="flex items-center justify-between text-[10px] font-mono pb-1 border-b border-slate-800/80">
            <span className="font-bold text-cyan-400">NEURAL DIALOGUE STREAM // OMNI-INPUT CONSOLE</span>
            <span className="text-slate-500">SUB-1S ENGINE</span>
          </div>

          {/* Logs stream */}
          <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1 py-1 max-h-20">
            {logs.slice(-5).map((l) => (
              <div key={l.id} className="truncate">
                <span className="text-slate-500">[{l.time}]</span>{' '}
                <span className="text-amber-400 font-bold">{l.tag}:</span>{' '}
                <span className="text-slate-200">{l.text}</span>
              </div>
            ))}
          </div>

          {/* Command Bar */}
          <form onSubmit={handleTransmit} className="flex items-center gap-2 pt-1.5 border-t border-slate-800">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Transmit directive to JARVIS or command hologram (e.g. 'Delhi weather', 'time', 'brain', 'earth')..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-400 text-xs font-mono text-slate-100 placeholder-slate-600 outline-none"
            />
            <button
              type="submit"
              className={`px-4 py-1.5 rounded-lg font-mono font-bold text-xs uppercase transition-all cursor-pointer ${
                isSerious
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_12px_rgba(255,23,68,0.5)]'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
              }`}
            >
              Transmit
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};
