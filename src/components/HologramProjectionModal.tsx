import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  CloudSun,
  Clock,
  Brain,
  Globe,
  Radio,
  Zap,
  Wind,
  Droplets,
  Compass,
  Gauge,
  Sparkles,
  Volume2,
  VolumeX,
  Flame,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { HologramPayload, WeatherHologramData, ChronoHologramData } from '../types';
import { ArcReactorCanvas } from '../utils/arc_reactor';
import { jarvisAudio } from '../utils/sound_effects';

interface HologramProjectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  hologram: HologramPayload | null;
  onSendChatCommand?: (cmd: string) => void;
}

export const HologramProjectionModal: React.FC<HologramProjectionModalProps> = ({
  isOpen,
  onClose,
  hologram,
  onSendChatCommand,
}) => {
  const [activeTab, setActiveTab] = useState<'weather' | 'chrono' | 'brain' | 'earth' | 'reactor' | 'serious'>('weather');
  const [weatherData, setWeatherData] = useState<WeatherHologramData | null>(null);
  const [chronoData, setChronoData] = useState<ChronoHologramData | null>(null);
  const [targetCity, setTargetCity] = useState('Delhi');
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [is3DReactorActive, setIs3DReactorActive] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reactorRef = useRef<ArcReactorCanvas | null>(null);

  // Sync activeTab when new hologram is triggered from outside
  useEffect(() => {
    if (hologram) {
      setActiveTab(hologram.type);
      if (hologram.type === 'weather' && hologram.data) {
        setWeatherData(hologram.data as WeatherHologramData);
        if ((hologram.data as WeatherHologramData).city) {
          setTargetCity((hologram.data as WeatherHologramData).city);
        }
      } else if (hologram.type === 'chrono' && hologram.data) {
        setChronoData(hologram.data as ChronoHologramData);
      }
    }
  }, [hologram]);

  // Clock live ticker
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString();
      const dateStr = now.toDateString();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      setChronoData({
        localTime: timeStr,
        istTime: `${timeStr} IST`,
        utcTime: now.toUTCString(),
        date: dateStr,
        dayOfWeek: days[now.getDay()],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        uptimeHours: 42.6,
        cycleCounter: Math.floor(Date.now() / 1000) % 100000,
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Canvas Arc Reactor if active tab is reactor
  useEffect(() => {
    if (activeTab === 'reactor' && canvasRef.current) {
      if (!reactorRef.current) {
        reactorRef.current = new ArcReactorCanvas(canvasRef.current);
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
  }, [activeTab]);

  // Fetch Weather helper
  const handleRefreshWeather = async (cityToFetch: string) => {
    setIsLoadingWeather(true);
    jarvisAudio.playBeep(1400, 0.05);
    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(cityToFetch)}`);
      const json = await res.json();
      if (json.data) {
        setWeatherData(json.data);
        jarvisAudio.playPowerUp();
      }
    } catch (e) {
      console.warn('Weather fetch error:', e);
    } finally {
      setIsLoadingWeather(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Background Holographic Glow Grid */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.15),transparent_70%)]" />

      {/* Main Holographic Projection Container */}
      <div className="relative w-full max-w-5xl h-[88vh] max-h-[860px] rounded-2xl border border-cyan-500/40 bg-[#040814]/95 shadow-[0_0_50px_rgba(0,229,255,0.25)] flex flex-col overflow-hidden">
        {/* Hologram Corner Brackets */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-cyan-500/20 bg-[#071225]/90">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block" />
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute inset-0 animate-ping" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-tech font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <span>J.A.R.V.I.S. 3D HOLOGRAPHIC PROJECTION STAGE</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  EPISODE 24 FUI
                </span>
              </h2>
              <span className="text-[10px] font-mono text-cyan-400/80">
                Pulse of AI • Swayam Dhawale Architecture
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                jarvisAudio.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-500/30 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors cursor-pointer"
              title="Close Hologram Stage"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hologram Selector Pills */}
        <div className="flex-shrink-0 px-4 py-2 border-b border-slate-800 bg-[#060D1E] flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'weather', label: '🌤️ Weather Radar', icon: CloudSun, color: 'text-cyan-300' },
            { id: 'chrono', label: '⏱️ Chrono Matrix', icon: Clock, color: 'text-amber-300' },
            { id: 'brain', label: '🧠 Neural Brain Core', icon: Brain, color: 'text-purple-300' },
            { id: 'earth', label: '🌍 Global Earth Swarm', icon: Globe, color: 'text-emerald-300' },
            { id: 'reactor', label: '⚡ Arc Reactor MK-VII', icon: Radio, color: 'text-cyan-300' },
            { id: 'serious', label: '🚨 Tactical Crimson', icon: Flame, color: 'text-rose-400' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  jarvisAudio.playClick();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? tab.color : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Holographic Projection Viewport */}
        <div className="flex-1 min-h-0 relative overflow-hidden bg-gradient-to-b from-[#02050E] via-[#040A1A] to-[#02050E] flex flex-col">
          {/* ================================================================= */}
          {/* 1. WEATHER RADAR HOLOGRAM (Live API Key Data) */}
          {/* ================================================================= */}
          {activeTab === 'weather' && (
            <div className="h-full flex flex-col p-4 sm:p-6 overflow-y-auto space-y-4">
              {/* City Search Bar */}
              <div className="flex items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-2xl border border-cyan-500/25">
                <div className="flex items-center gap-2 flex-1">
                  <CloudSun className="w-5 h-5 text-cyan-400" />
                  <input
                    type="text"
                    value={targetCity}
                    onChange={(e) => setTargetCity(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRefreshWeather(targetCity)}
                    placeholder="Enter city (Delhi, Mumbai, New York, London)..."
                    className="bg-transparent border-none text-xs sm:text-sm font-mono text-cyan-300 outline-none w-full placeholder-slate-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRefreshWeather(targetCity)}
                    disabled={isLoadingWeather}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold shadow-[0_0_12px_rgba(0,229,255,0.3)] transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingWeather ? 'animate-spin' : ''}`} />
                    <span>Scan Weather</span>
                  </button>
                </div>
              </div>

              {/* Weather Hologram Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                {/* Main Temperature & Condition Sphere */}
                <div className="md:col-span-2 relative rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-6 flex flex-col justify-between overflow-hidden shadow-[0_0_30px_rgba(0,229,255,0.1)]">
                  {/* Holographic Radar Ring Overlay */}
                  <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full border border-cyan-500/20 pointer-events-none animate-[spin_20s_linear_infinite]" />
                  <div className="absolute -right-8 -top-8 w-56 h-56 rounded-full border border-dashed border-cyan-500/30 pointer-events-none animate-[spin_12s_linear_infinite_reverse]" />

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-cyan-400 tracking-widest uppercase">
                        ATMOSPHERIC TELEMETRY // SATELLITE RADAR
                      </span>
                      <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                        LIVE API FEED
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-4xl font-tech font-bold text-slate-100 mt-2">
                      {weatherData?.city || targetCity}
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
                      {weatherData?.region ? `${weatherData.region}, ` : ''}{weatherData?.country || 'Global Station'}
                    </span>
                  </div>

                  <div className="my-6 flex items-baseline gap-4">
                    <span className="text-5xl sm:text-7xl font-tech font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-100 to-white">
                      {weatherData ? `${weatherData.temp_c}°C` : '28°C'}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-lg font-tech text-cyan-400 font-bold">
                        {weatherData ? `${weatherData.temp_f}°F` : '82°F'}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Feels like {weatherData?.feelslike_c || 29}°C
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        {weatherData?.condition || 'Clear Sky / High Visibility'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      Coordinates: {weatherData?.lat || 28.6}° N, {weatherData?.lon || 77.2}° E
                    </span>
                  </div>
                </div>

                {/* Right Atmospheric Gauges */}
                <div className="space-y-3 flex flex-col justify-between">
                  {/* Humidity Gauge */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                        Humidity
                      </span>
                      <span className="text-cyan-300 font-bold">{weatherData?.humidity || 52}%</span>
                    </div>
                    <div className="w-full h-2 rounded bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded transition-all duration-500"
                        style={{ width: `${weatherData?.humidity || 52}%` }}
                      />
                    </div>
                  </div>

                  {/* Wind Vector */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Wind className="w-3.5 h-3.5 text-cyan-400" />
                        Wind Velocity
                      </span>
                      <span className="text-cyan-300 font-bold">{weatherData?.wind_kph || 14} km/h</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 block mt-1">
                      Direction: {weatherData?.wind_dir || 'NE Vector'}
                    </span>
                  </div>

                  {/* Pressure & UV */}
                  <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-purple-400" />
                        Barometer
                      </span>
                      <span className="text-purple-300 font-bold">{weatherData?.pressure_mb || 1012} hPa</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2">
                      <span>UV Index:</span>
                      <span className="text-amber-300 font-bold">{weatherData?.uv || 5.2} / 10</span>
                    </div>
                  </div>

                  {/* Voice Ask Chip */}
                  <button
                    onClick={() => {
                      if (onSendChatCommand) onSendChatCommand(`${targetCity} ka weather report do`);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Hear JARVIS Weather Speech</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 2. CHRONO ATOMIC ORBITAL MATRIX */}
          {/* ================================================================= */}
          {activeTab === 'chrono' && (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
              {/* Planetary Orbital Rings */}
              <div className="absolute w-[450px] h-[450px] rounded-full border border-amber-500/20 animate-[spin_30s_linear_infinite] pointer-events-none" />
              <div className="absolute w-[320px] h-[320px] rounded-full border border-dashed border-amber-500/30 animate-[spin_18s_linear_infinite_reverse] pointer-events-none" />
              <div className="absolute w-[200px] h-[200px] rounded-full border border-amber-500/40 pointer-events-none" />

              <div className="relative z-10 max-w-lg space-y-3">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-widest">
                  QUANTUM CHRONOMETER // ATOMIC OSCILLATION
                </span>

                <div className="text-5xl sm:text-7xl font-tech font-black text-amber-300 tracking-wider shadow-[0_0_30px_rgba(255,183,0,0.3)]">
                  {chronoData?.localTime || '14:30:45'}
                </div>

                <div className="text-sm font-mono text-slate-300 font-bold">
                  {chronoData?.dayOfWeek}, {chronoData?.date}
                </div>

                <div className="flex items-center justify-center gap-4 text-xs font-mono text-slate-400 pt-2">
                  <span>IST: {chronoData?.istTime || '14:30 IST'}</span>
                  <span>•</span>
                  <span>UTC: {new Date().toISOString().substring(11, 19)}</span>
                  <span>•</span>
                  <span>Timezone: {chronoData?.timezone || 'Asia/Kolkata'}</span>
                </div>

                <div className="pt-4 flex items-center justify-center gap-2">
                  <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
                    Cycle: #{chronoData?.cycleCounter || 4829}
                  </span>
                  <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
                    Uptime: {chronoData?.uptimeHours || 42.6} hrs
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 3. NEURAL CYBERNETIC BRAIN CORE (User Video 1) */}
          {/* ================================================================= */}
          {activeTab === 'brain' && (
            <div className="h-full flex flex-col md:flex-row items-center justify-between p-4 sm:p-6 gap-6 relative overflow-hidden">
              {/* Left Video Hologram Display */}
              <div className="flex-1 w-full h-full max-h-[550px] relative rounded-2xl overflow-hidden border border-purple-500/40 bg-black shadow-[0_0_40px_rgba(168,85,247,0.25)] flex items-center justify-center">
                <video
                  src="/assets/aistudio/cd4583679b7ac465097f39a77fda01ab_7890910b.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain filter contrast-125 saturate-125"
                />

                {/* Hologram CRT Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-70" />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-400/50 text-[10px] font-mono text-purple-300">
                  NEURAL SYNAPSE MATRIX 0x7F
                </div>
              </div>

              {/* Right Cognitive Telemetry */}
              <div className="w-full md:w-80 space-y-3 text-xs font-mono">
                <div className="p-4 rounded-xl border border-purple-500/30 bg-slate-900/70">
                  <span className="text-purple-400 font-bold block mb-1">COGNITIVE ARCHITECTURE</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    Multi-tier neural pipeline streaming real-time synaptic weights between Groq Cloud LPU (600ms latency), DeepSeek R1 reasoning, and Gemini 3.8 Flash Vision.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Synaptic Frequency:</span>
                    <span className="text-cyan-300 font-bold">2.8 GHz</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Inference Response:</span>
                    <span className="text-emerald-400 font-bold">608 ms (Sub-1s)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Attention Heads:</span>
                    <span className="text-purple-300 font-bold">64 Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Memory Vector Core:</span>
                    <span className="text-amber-300 font-bold">Synchronized</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onSendChatCommand) onSendChatCommand('Brain diagnostics report do');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-tech font-bold text-xs uppercase shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
                >
                  Run Deep Synapse Diagnostic
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 4. GLOBAL EARTH SURVEILLANCE & SWARM (User Video 2) */}
          {/* ================================================================= */}
          {activeTab === 'earth' && (
            <div className="h-full flex flex-col md:flex-row items-center justify-between p-4 sm:p-6 gap-6 relative overflow-hidden">
              {/* Left Video Hologram Display */}
              <div className="flex-1 w-full h-full max-h-[550px] relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-black shadow-[0_0_40px_rgba(16,185,129,0.25)] flex items-center justify-center">
                <video
                  src="/assets/aistudio/From_Klickpin.com-_Peaceful_worship_room_inspiration_for_modern_homes_with_ideas_people_actually_use_to_save_for_Sunday-pin-id-622693086024257591_cdb71ca2.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain filter contrast-125 saturate-125"
                />

                {/* Hologram CRT Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-70" />
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-400/50 text-[10px] font-mono text-emerald-300">
                  GLOBAL GEO-SURVEILLANCE // SWARM ACTIVE
                </div>
              </div>

              {/* Right Planetary Telemetry */}
              <div className="w-full md:w-80 space-y-3 text-xs font-mono">
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-slate-900/70">
                  <span className="text-emerald-400 font-bold block mb-1">AUTONOMOUS PLANETARY SWARM</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    Episode 21 autonomous browser swarm crawling live web indices, capturing visual screenshots, and streaming planetary telemetry directly into JARVIS neural core.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Orbital Satellites:</span>
                    <span className="text-emerald-300 font-bold">12 Locked</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Swarm Workers:</span>
                    <span className="text-cyan-300 font-bold">8 Node Processes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Data Stream Bus:</span>
                    <span className="text-emerald-400 font-bold">0x8840 ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Global Ping:</span>
                    <span className="text-amber-300 font-bold">12 ms</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onSendChatCommand) onSendChatCommand('Deploy autonomous web swarm on Quantum Computing');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-tech font-bold text-xs uppercase shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
                >
                  Deploy Web Swarm Now
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 5. 3D MATHEMATICAL ARC REACTOR (Episode 24 Core) */}
          {/* ================================================================= */}
          {activeTab === 'reactor' && (
            <div className="h-full flex flex-col items-center justify-center p-4 relative">
              <div className="absolute top-3 left-4 text-xs font-mono text-cyan-400 pointer-events-none">
                <div>CORE: <strong className="text-white">ARC MK-VII (NOMINAL)</strong></div>
                <div className="text-[10px] text-slate-400">OUTPUT: 3.2 GW // PHASE: LOCKED</div>
              </div>

              <div className="absolute top-3 right-4 flex items-center gap-2">
                <button
                  onClick={() => {
                    if (reactorRef.current) {
                      const enabled = reactorRef.current.toggle3D();
                      setIs3DReactorActive(enabled);
                    }
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border cursor-pointer ${
                    is3DReactorActive
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  3D TILT: {is3DReactorActive ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="w-full h-full max-h-[580px] flex items-center justify-center relative cursor-crosshair">
                <canvas ref={canvasRef} className="w-full h-full block" />
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 6. TACTICAL SERIOUS MODE (Tactical Crimson) */}
          {/* ================================================================= */}
          {activeTab === 'serious' && (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4 relative overflow-hidden bg-rose-950/20">
              <div className="w-20 h-20 rounded-3xl bg-rose-950/80 border border-rose-500 flex items-center justify-center shadow-[0_0_40px_rgba(244,63,94,0.4)] animate-pulse">
                <Flame className="w-10 h-10 text-rose-400" />
              </div>

              <div className="max-w-md space-y-2">
                <h3 className="text-2xl sm:text-3xl font-tech font-bold text-rose-400 uppercase tracking-widest">
                  TACTICAL SERIOUS MODE ENGAGED
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-sans">
                  High Cognitive Override Active. Background processes purged, audio barge-in threshold elevated to 3800 RMS, and multi-model router focused on deep technical execution.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    if (onSendChatCommand) onSendChatCommand('AI par 10-page executive dossier PDF generate karo');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold uppercase transition-all shadow-[0_0_15px_rgba(244,63,94,0.5)] cursor-pointer"
                >
                  Generate Executive Dossier
                </button>
                <button
                  onClick={() => {
                    if (onSendChatCommand) onSendChatCommand('Purge RAM and kill ghost tasks');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/40 font-mono text-xs font-bold transition-all cursor-pointer"
                >
                  Execute Tactical Purge
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
