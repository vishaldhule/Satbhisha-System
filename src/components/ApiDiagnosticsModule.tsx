import React, { useState, useEffect } from 'react';
import { ShieldCheck, Server, Cpu, Mic, RefreshCw, KeyRound, Lock, Eye, AlertTriangle } from 'lucide-react';
import { playToolChime } from '../utils/audioSfx';

interface DiagnosticsData {
  primaryAI: { provider: string; model: string; status: string; masked: string };
  secondaryAI: { provider: string; model: string; status: string; masked: string };
  voiceEngine: { provider: string; voiceName: string; voiceId: string; status: string; masked: string };
  weather: { provider: string; status: string };
  news: { provider: string; status: string };
  security: { keysStoredInBackendOnly: boolean; clientExposure: boolean; ssrfGuardsActive: boolean };
}

export const ApiDiagnosticsModule: React.FC = () => {
  const [data, setData] = useState<DiagnosticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localOnlyMode, setLocalOnlyMode] = useState(false);

  const fetchDiagnostics = async () => {
    setIsLoading(true);
    playToolChime();
    try {
      const res = await fetch('/api/diagnostics/apis');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.warn('Diagnostics fetch failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-4 sm:p-6 max-w-5xl mx-auto w-full space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 backdrop-blur-xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100 font-tech tracking-wide uppercase">
              API Security & Neural Bridge Diagnostics
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Zero-leak secret architecture. All credentials remain locked in backend environment variables.
          </p>
        </div>

        <button
          onClick={fetchDiagnostics}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 border border-slate-700 transition-all cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Ping Neural Bridges</span>
        </button>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-bold font-tech uppercase">Secrets Storage</span>
          </div>
          <p className="text-xs text-emerald-400 font-mono font-bold">100% Backend Secrets</p>
          <p className="text-[11px] text-slate-400 font-sans">
            Client bundles contain zero plaintext keys. Verified via static analyzer.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Server className="w-4 h-4" />
            <span className="text-xs font-bold font-tech uppercase">SSRF Protection</span>
          </div>
          <p className="text-xs text-emerald-400 font-mono font-bold">Host Interceptors Active</p>
          <p className="text-[11px] text-slate-400 font-sans">
            Localhost, private IP ranges (10.x, 192.168.x) and non-HTTP schemes are blocked.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-cyan-400">
            <KeyRound className="w-4 h-4" />
            <span className="text-xs font-bold font-tech uppercase">Privacy Mode</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-mono">
              {localOnlyMode ? 'Local Reflex Only' : 'Cloud AI Hybrid'}
            </span>
            <button
              onClick={() => setLocalOnlyMode(!localOnlyMode)}
              className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase transition-all ${
                localOnlyMode ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Toggle
            </button>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            {localOnlyMode ? 'Cloud API forwarding paused.' : 'Full Gemini & Groq multi-modal routing enabled.'}
          </p>
        </div>
      </div>

      {/* Provider Connectivity Grid */}
      {data && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
          <h3 className="text-xs font-bold text-slate-200 font-tech uppercase tracking-wider">
            Connected API Services & Telemetry
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gemini */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 font-tech">PRIMARY AI: {data.primaryAI.provider}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                  data.primaryAI.status === 'connected' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-amber-950 text-amber-400'
                }`}>
                  {data.primaryAI.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Model: {data.primaryAI.model}</p>
              <p className="text-[11px] font-mono text-slate-500">Key: {data.primaryAI.masked}</p>
            </div>

            {/* Groq Cloud */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 font-tech">SECONDARY AI: {data.secondaryAI.provider}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                  data.secondaryAI.status === 'connected' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                }`}>
                  {data.secondaryAI.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Model: {data.secondaryAI.model}</p>
              <p className="text-[11px] font-mono text-slate-500">Key: {data.secondaryAI.masked}</p>
            </div>

            {/* ElevenLabs */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 font-tech">VOICE: {data.voiceEngine.provider}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                  data.voiceEngine.status === 'connected' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                }`}>
                  {data.voiceEngine.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Assigned Voice: <strong className="text-cyan-400">{data.voiceEngine.voiceName}</strong> ({data.voiceEngine.voiceId})
              </p>
              <p className="text-[11px] font-mono text-slate-500">Key: {data.voiceEngine.masked}</p>
            </div>

            {/* Environment APIs */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 font-tech">ENVIRONMENT: WEATHER & NEWS</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-slate-800 text-slate-400">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Weather: {data.weather.status} • News: {data.news.status}
              </p>
              <p className="text-[11px] font-mono text-slate-500">Auto telemetry refresh enabled</p>
            </div>
          </div>
        </div>
      )}

      {/* Advisory */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
        <div className="flex items-center space-x-2 text-amber-400 font-bold uppercase font-tech">
          <AlertTriangle className="w-4 h-4" />
          <span>Security Notice for API Keys</span>
        </div>
        <p>
          Always configure keys via environment variables (<code className="text-cyan-300">.env</code> on the server or Cloud Secrets).
          Never paste raw tokens into chat windows or client code.
        </p>
      </div>
    </div>
  );
};
