import React from 'react';
import { Cpu, MemoryStick, Flame, Zap, Volume2, Sun, ShieldAlert, Activity, Wifi } from 'lucide-react';
import { SystemHardware } from '../types';
import { playPurgeSfx, playToolChime } from '../utils/audioSfx';

interface TelemetryProps {
  hardware: SystemHardware;
  onUpdateHardware: (partial: Partial<SystemHardware>) => void;
  onPurgeRam: () => void;
  isPurging: boolean;
}

export const LiveTelemetryDashboard: React.FC<TelemetryProps> = ({
  hardware,
  onUpdateHardware,
  onPurgeRam,
  isPurging,
}) => {
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onUpdateHardware({ volume: val });
  };

  const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    onUpdateHardware({ brightness: val });
  };

  const triggerGhostPurge = () => {
    playPurgeSfx();
    onPurgeRam();
  };

  return (
    <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-5">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="font-tech text-sm tracking-wider uppercase font-semibold text-slate-200">
            Hardware & Core Telemetry
          </h3>
        </div>
        <div className="text-xs font-code text-cyan-400/80 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
          REALTIME 1000Hz
        </div>
      </div>

      {/* Grid of vitals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* CPU Load */}
        <div className="bg-slate-900/60 border border-slate-800/60 p-3 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> CPU Load
            </span>
            <span className="font-code text-slate-300">{hardware.cpuTemp}°C</span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-code text-2xl font-bold text-slate-100 tabular-nums">
              {hardware.cpu.toFixed(1)}
            </span>
            <span className="text-xs font-code text-slate-400">%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, hardware.cpu)}%` }}
            />
          </div>
        </div>

        {/* RAM Usage */}
        <div className="bg-slate-900/60 border border-slate-800/60 p-3 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <MemoryStick className="w-3.5 h-3.5 text-sky-400" /> RAM Alloc
            </span>
            <span className="font-code text-slate-300">{hardware.ramUsedGb}G / {hardware.ramTotalGb}G</span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-code text-2xl font-bold text-slate-100 tabular-nums">
              {hardware.ram.toFixed(1)}
            </span>
            <span className="text-xs font-code text-slate-400">%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                hardware.ram > 80 ? 'bg-amber-500' : 'bg-sky-500'
              }`}
              style={{ width: `${Math.min(100, hardware.ram)}%` }}
            />
          </div>
        </div>

        {/* GPU & Fan */}
        <div className="bg-slate-900/60 border border-slate-800/60 p-3 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" /> GPU Core
            </span>
            <span className="font-code text-slate-300">{hardware.coolingFanRpm} RPM</span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-code text-2xl font-bold text-slate-100 tabular-nums">
              {hardware.gpu.toFixed(1)}
            </span>
            <span className="text-xs font-code text-slate-400">%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, hardware.gpu)}%` }}
            />
          </div>
        </div>

        {/* Battery / Power */}
        <div className="bg-slate-900/60 border border-slate-800/60 p-3 rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> Cell Power
            </span>
            <span className="font-code text-emerald-400 text-[10px]">
              {hardware.batteryCharging ? 'AC CHARGING' : 'INTERNAL'}
            </span>
          </div>
          <div className="flex items-baseline gap-1 my-1">
            <span className="font-code text-2xl font-bold text-slate-100 tabular-nums">
              {hardware.battery}
            </span>
            <span className="text-xs font-code text-slate-400">%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${hardware.battery}%` }}
            />
          </div>
        </div>
      </div>

      {/* Control Rail: Master Volume, Brightness, and RAM Purge Button */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
        {/* Master Volume */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> Master Volume
            </span>
            <span className="font-code text-cyan-400">{hardware.volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={hardware.volume}
            onChange={handleVolumeChange}
            className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Brightness */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Luminance
            </span>
            <span className="font-code text-amber-400">{hardware.brightness}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={hardware.brightness}
            onChange={handleBrightnessChange}
            className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Ghost Killer & RAM Purge */}
        <div className="flex items-center">
          <button
            onClick={triggerGhostPurge}
            disabled={isPurging}
            className="w-full h-full py-2.5 px-4 bg-gradient-to-r from-rose-950/80 to-slate-900 border border-rose-500/40 hover:border-rose-400 text-rose-200 text-xs font-tech font-semibold uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 hover:bg-rose-900/30 transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{isPurging ? 'PURGING ROGUE TASKS...' : 'RAM PURGE & GHOST KILLER'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
