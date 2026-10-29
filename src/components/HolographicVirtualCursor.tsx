import React from 'react';

interface HolographicCursorProps {
  x: number;
  y: number;
  isPinching: boolean;
  gesture: string;
  enabled: boolean;
  isScrolling?: boolean;
}

export const HolographicVirtualCursor: React.FC<HolographicCursorProps> = ({
  x,
  y,
  isPinching,
  gesture,
  enabled,
  isScrolling = false,
}) => {
  if (!enabled || x < 0 || y < 0) return null;

  return (
    <div
      className="fixed pointer-events-none z-[99999] select-none will-change-transform"
      style={{
        transform: `translate3d(${x - 2}px, ${y - 2}px, 0)`,
      }}
    >
      {/* Precision Hardware Mouse Arrow Pointer with Stark Arc Glow */}
      <div className="relative">
        {/* Pulsing glow backdrop */}
        <div
          className={`absolute -inset-1 rounded-full blur-md opacity-80 transition-all duration-150 ${
            isPinching
              ? 'bg-amber-400 scale-125'
              : isScrolling
              ? 'bg-emerald-400 scale-110'
              : 'bg-cyan-400 scale-100'
          }`}
        />

        {/* Real Mouse Arrow SVG with neon edge */}
        <svg
          width="26"
          height="32"
          viewBox="0 0 26 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`relative drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-transform duration-100 ${
            isPinching ? 'scale-90 rotate-[-4deg]' : 'scale-100'
          }`}
        >
          {/* Main Pointer Body */}
          <path
            d="M2 2L10.5 27L14.8 17.5L24 14.5L2 2Z"
            fill={isPinching ? '#f59e0b' : isScrolling ? '#10b981' : '#0891b2'}
            stroke={isPinching ? '#fbbf24' : isScrolling ? '#34d399' : '#38bdf8'}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Inner Core Highlight */}
          <path
            d="M4.5 5.5L10.5 21L13.5 15L19.5 13L4.5 5.5Z"
            fill={isPinching ? '#fef3c7' : '#e0f2fe'}
            opacity="0.9"
          />
        </svg>

        {/* Small Precision Targeting Ring when Hovering or Pinching */}
        <div
          className={`absolute -top-2 -left-2 w-8 h-8 rounded-full border border-dashed transition-all duration-200 ${
            isPinching
              ? 'border-amber-400 animate-ping opacity-75'
              : 'border-cyan-400/40 animate-[spin_6s_linear_infinite]'
          }`}
        />

        {/* Floating Real-Time Coordinate Tag */}
        <div className="absolute left-6 top-0 whitespace-nowrap bg-slate-950/95 border border-cyan-500/60 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 backdrop-blur-md shadow-xl flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isPinching ? 'bg-amber-400 animate-ping' : 'bg-cyan-400'
            }`}
          />
          <span className="font-semibold uppercase tracking-wider font-tech">
            {isPinching ? 'CLICK' : isScrolling ? 'SCROLL' : 'PC MOUSE'}
          </span>
          <span className="text-slate-400 font-sans text-[9px]">
            {Math.round(x)}, {Math.round(y)}
          </span>
        </div>
      </div>
    </div>
  );
};
