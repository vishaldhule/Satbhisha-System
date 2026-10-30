import React, { useState, useEffect } from 'react';
import { Laptop, Smartphone, Lightbulb, Thermometer, Radio, Power, RefreshCw, CheckCircle2, Shield, AlertCircle } from 'lucide-react';
import { playToolChime } from '../utils/audioSfx';

interface DeviceItem {
  id: string;
  name: string;
  category: 'pc' | 'mobile' | 'smart_home' | 'iot';
  location: string;
  status: 'online' | 'offline' | 'busy';
  ipAddress: string;
  batteryLevel?: number;
  lastActive: string;
  state: Record<string, any>;
}

export const DeviceManagerModule: React.FC = () => {
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/devices');
      const data = await res.json();
      if (data.devices) {
        setDevices(data.devices);
      }
    } catch (e) {
      console.warn('Failed to fetch devices:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleDeviceCommand = async (deviceId: string, command: string, value?: any) => {
    playToolChime();
    try {
      const res = await fetch('/api/devices/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, command, value }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setActionMessage(data.message);
        setTimeout(() => setActionMessage(null), 3000);
        fetchDevices();
      }
    } catch (err: any) {
      setActionMessage(`Command error: ${err.message}`);
    }
  };

  const getDeviceIcon = (category: string) => {
    switch (category) {
      case 'pc':
        return <Laptop className="w-5 h-5 text-cyan-400" />;
      case 'mobile':
        return <Smartphone className="w-5 h-5 text-emerald-400" />;
      case 'smart_home':
        return <Lightbulb className="w-5 h-5 text-amber-400" />;
      case 'iot':
        return <Thermometer className="w-5 h-5 text-purple-400" />;
      default:
        return <Radio className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <h2 className="text-lg font-bold text-slate-100 font-tech tracking-wide uppercase">
              Multi-Device & Smart Environment Grid
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Zero-friction IoT routing and authorized hardware control across Home, Office, and Mobile nodes.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchDevices}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-slate-300 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Grid</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Grid of registered devices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((device) => {
          const isPowerOn = device.state?.power === 'on';
          return (
            <div
              key={device.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    {getDeviceIcon(device.category)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 font-tech uppercase">{device.name}</h3>
                    <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400 mt-0.5">
                      <span>{device.location}</span>
                      <span>•</span>
                      <span className="text-slate-500">{device.ipAddress}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md uppercase font-bold flex items-center gap-1 ${
                    device.status === 'online'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'online' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                  {device.status}
                </span>
              </div>

              {/* Status details & metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-slate-800/80">
                <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 block">LAST TELEMETRY</span>
                  <span className="text-slate-300 font-bold">{device.lastActive}</span>
                </div>
                {device.batteryLevel !== undefined ? (
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block">BATTERY CELL</span>
                    <span className="text-emerald-400 font-bold">{device.batteryLevel}% [NOMINAL]</span>
                  </div>
                ) : device.state?.temperature !== undefined ? (
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block">AMBIENT TEMP</span>
                    <span className="text-cyan-300 font-bold">{device.state.temperature}°C (71.6°F)</span>
                  </div>
                ) : (
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block">CONTROL LINK</span>
                    <span className="text-cyan-400 font-bold">ENCRYPTED // TLS</span>
                  </div>
                )}
              </div>

              {/* Action controls */}
              <div className="flex items-center justify-between pt-2">
                {device.category === 'smart_home' ? (
                  <div className="flex items-center space-x-2 w-full justify-between">
                    <button
                      onClick={() => handleDeviceCommand(device.id, 'toggle_power')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-tech font-bold uppercase transition-all cursor-pointer ${
                        isPowerOn
                          ? 'bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isPowerOn ? 'Lights: ON' : 'Lights: OFF'}</span>
                    </button>
                    <button
                      onClick={() =>
                        handleDeviceCommand(
                          device.id,
                          'set_color',
                          device.state?.color === '#00E5FF' ? '#A855F7' : '#00E5FF'
                        )
                      }
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 border border-slate-700 cursor-pointer"
                    >
                      Cycle Neon
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDeviceCommand(device.id, 'ping')}
                    className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Radio className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Send Diagnostic Ping</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Architecture Notice */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold uppercase font-tech">
          <Shield className="w-4 h-4" />
          <span>Device Security Protocol</span>
        </div>
        <p>
          Commands are routed through verified local adapters and Home Assistant bridges. Irreversible or high-privilege
          system actions require explicit voice authentication from the primary user.
        </p>
      </div>
    </div>
  );
};
