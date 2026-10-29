import React, { useEffect, useState } from 'react';

interface ArcReactorProps {
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  audioLevel?: number; // 0 to 100
  persona?: 'friday' | 'jarvis';
  onClick?: () => void;
  outputPower?: number; // 0 to 100%
}

export const ArcReactorVisualizer: React.FC<ArcReactorProps> = ({
  status,
  audioLevel = 0,
  persona = 'friday',
  onClick,
  outputPower = 100,
}) => {
  const [rotation, setRotation] = useState(0);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    let animId: number;
    let t = 0;
    const animate = () => {
      t += 0.05;
      setRotation((prev) => (prev + (status === 'processing' ? 2.5 : status === 'speaking' ? 1.5 : 0.6)) % 360);
      setPulse(Math.sin(t) * 0.5 + 0.5);
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [status]);

  // Color scheme based on persona and status
  const isSpeaking = status === 'speaking';
  const isListening = status === 'listening';
  const isProcessing = status === 'processing';

  // Neon theme
  const coreCyan = persona === 'friday' ? '#06b6d4' : '#00e5ff';
  const coreGlow = isSpeaking
    ? '#10b981' // Green on speak
    : isProcessing
    ? '#f59e0b' // Amber on process
    : isListening
    ? '#00e5ff' // Electric cyan on listen
    : '#0284c7'; // Stark Blue on idle

  const scale = 1 + (isListening ? (audioLevel / 100) * 0.12 : isSpeaking ? pulse * 0.08 : pulse * 0.03);

  return (
    <div
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer select-none group"
      style={{ width: '240px', height: '240px' }}
      title="Click to trigger Arc Reactor Diagnostic Surge"
    >
      {/* 1. Outer Neon Holographic Aura */}
      <div
        className="absolute inset-0 rounded-full transition-all duration-300 blur-2xl opacity-50"
        style={{
          backgroundColor: coreGlow,
          transform: `scale(${scale * 1.3})`,
        }}
      />

      {/* 2. Cybernetic Tick Rings & Quantum Particles */}
      <svg
        viewBox="0 0 240 240"
        className="w-full h-full relative z-10 transition-transform duration-100 ease-out"
        style={{ transform: `scale(${scale})` }}
      >
        <defs>
          <radialGradient id="reactorGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="25%" stopColor={coreGlow} stopOpacity="0.85" />
            <stop offset="65%" stopColor={coreCyan} stopOpacity="0.35" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0" />
          </radialGradient>

          <filter id="neonBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Hexagonal Shield Ring */}
        <circle
          cx="120"
          cy="120"
          r="112"
          fill="none"
          stroke={coreGlow}
          strokeWidth="1"
          strokeDasharray="3 9"
          strokeOpacity="0.4"
          className="animate-[spin_60s_linear_infinite]"
        />

        {/* Segmented Heavy Armour Ring */}
        <circle
          cx="120"
          cy="120"
          r="104"
          fill="none"
          stroke={coreGlow}
          strokeWidth="2.5"
          strokeDasharray="24 8 4 8"
          strokeOpacity="0.7"
          style={{ transformOrigin: 'center', transform: `rotate(${rotation}deg)` }}
        />

        {/* Counter-rotating High-Precision Compass Ring */}
        <circle
          cx="120"
          cy="120"
          r="92"
          fill="none"
          stroke={coreCyan}
          strokeWidth="1.5"
          strokeDasharray="2 12"
          strokeOpacity="0.8"
          style={{ transformOrigin: 'center', transform: `rotate(${-rotation * 1.4}deg)` }}
        />

        {/* Stark Energy Radial Spokes (10 Electromagnetic Coils) */}
        {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 120 + Math.cos(rad) * 44;
          const y1 = 120 + Math.sin(rad) * 44;
          const x2 = 120 + Math.cos(rad) * 88;
          const y2 = 120 + Math.sin(rad) * 88;
          return (
            <g key={deg}>
              {/* Copper Coil Bar */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={coreGlow}
                strokeWidth="4"
                strokeLinecap="round"
                strokeOpacity="0.75"
                filter="url(#neonBlur)"
              />
              {/* Inner metallic notch */}
              <circle
                cx={x2}
                cy={y2}
                r="3"
                fill={coreCyan}
                fillOpacity="0.9"
              />
            </g>
          );
        })}

        {/* Inner Reactor Shroud (Dark Titanium Plate) */}
        <circle
          cx="120"
          cy="120"
          r="54"
          fill="#030712"
          stroke={coreGlow}
          strokeWidth="3"
          strokeOpacity="0.9"
        />

        {/* Tri-Arc Palladium Housing (Mark-85 pattern) */}
        <circle
          cx="120"
          cy="120"
          r="42"
          fill="none"
          stroke={coreCyan}
          strokeWidth="2"
          strokeDasharray="55 25"
          strokeOpacity="0.9"
          style={{ transformOrigin: 'center', transform: `rotate(${rotation * 2}deg)` }}
        />

        {/* Radiant Arc Nucleus */}
        <circle
          cx="120"
          cy="120"
          r="30"
          fill="url(#reactorGlowGrad)"
          filter="url(#neonBlur)"
        />

        {/* Central Pure Fusion White Core */}
        <circle
          cx="120"
          cy="120"
          r={14 + (isSpeaking ? pulse * 5 : 0)}
          fill="#ffffff"
          opacity={0.95}
        />

        {/* Precision Coordinate Crosshairs */}
        <line x1="120" y1="12" x2="120" y2="28" stroke={coreGlow} strokeWidth="2" />
        <line x1="120" y1="212" x2="120" y2="228" stroke={coreGlow} strokeWidth="2" />
        <line x1="12" y1="120" x2="28" y2="120" stroke={coreGlow} strokeWidth="2" />
        <line x1="212" y1="120" x2="228" y2="120" stroke={coreGlow} strokeWidth="2" />
      </svg>

      {/* Floating Status & Output Power Readout */}
      <div className="absolute -bottom-8 flex flex-col items-center">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-tech text-xs tracking-widest uppercase font-bold text-cyan-300">
            {persona === 'friday' ? 'F.R.I.D.A.Y.' : 'J.A.R.V.I.S.'} ARC CORE: {outputPower}%
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
          {status === 'speaking'
            ? 'AUDIO MATRIX DISPATCH'
            : status === 'listening'
            ? 'NEURAL AUDIO SENSOR ARMED'
            : status === 'processing'
            ? 'QUANTUM REASONING ACTIVE'
            : 'SYSTEM AT PEAK NOMINAL'}
        </span>
      </div>
    </div>
  );
};
