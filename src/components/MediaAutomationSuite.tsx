import React, { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, ShieldCheck, Film, Maximize2, Radio, Volume2, FastForward, Rewind } from 'lucide-react';
import { MediaState } from '../types';
import { playToolChime } from '../utils/audioSfx';

interface MediaSuiteProps {
  media: MediaState;
  onControlMedia: (action: string) => void;
  onSkipAd: () => void;
  onSeek: (action: 'forward' | 'rewind') => void;
  onNavigateShorts: (direction: 'next' | 'previous') => void;
  onToggleView: (mode: 'fullscreen' | 'theater') => void;
}

export const MediaAutomationSuite: React.FC<MediaSuiteProps> = ({
  media,
  onControlMedia,
  onSkipAd,
  onSeek,
  onNavigateShorts,
  onToggleView,
}) => {
  const [activeTab, setActiveTab] = useState<'controller' | 'youtube' | 'adskipper'>('controller');

  return (
    <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400" />
          <h3 className="font-tech text-sm tracking-wider uppercase font-semibold text-slate-200">
            Hands-Free Media & YouTube Automation Deck
          </h3>
        </div>
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('controller')}
            className={`px-2.5 py-1 rounded cursor-pointer transition-all ${
              activeTab === 'controller' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
            }`}
          >
            Audio Deck
          </button>
          <button
            onClick={() => setActiveTab('youtube')}
            className={`px-2.5 py-1 rounded cursor-pointer transition-all ${
              activeTab === 'youtube' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-400'
            }`}
          >
            YouTube Suite
          </button>
          <button
            onClick={() => setActiveTab('adskipper')}
            className={`px-2.5 py-1 rounded cursor-pointer transition-all ${
              activeTab === 'adskipper' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400'
            }`}
          >
            Ad Neutralizer
          </button>
        </div>
      </div>

      {/* Mode Status Pill Notice */}
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/60 text-xs">
        <span className="text-slate-300 flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              media.isPlaying ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
          />
          {media.isPlaying
            ? '[MEDIA PLAYING] Push-to-Talk Armed: Hold [Right Ctrl] or click Mic to speak'
            : '[MEDIA IDLE/PAUSED] Hands-Free Voice Mode Active: Speak freely'}
        </span>
        <span className="font-code text-slate-500 text-[10px]">
          AUTO-DUCKING ENABLED
        </span>
      </div>

      {/* Main Tab 1: Now Playing Deck */}
      {activeTab === 'controller' && (
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-lg bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-tech text-cyan-400 tracking-wider uppercase">
                Active Audio Stream
              </span>
              <h4 className="font-semibold text-slate-100 text-sm tracking-wide">
                {media.title}
              </h4>
              <span className="text-xs text-slate-400">{media.artist}</span>
            </div>

            <div className="flex items-center gap-2 font-code text-xs text-slate-400">
              <span className="tabular-nums">{media.position}</span>
              <span>/</span>
              <span className="tabular-nums">{media.duration}</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                playToolChime();
                onControlMedia('previous');
              }}
              className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-200 transition-all cursor-pointer"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                playToolChime();
                onControlMedia('play_pause');
              }}
              className="p-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/50 transition-all cursor-pointer"
              title="Play / Pause"
            >
              {media.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <button
              onClick={() => {
                playToolChime();
                onControlMedia('next');
              }}
              className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-200 transition-all cursor-pointer"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Tab 2: YouTube Autonomous Controls */}
      {activeTab === 'youtube' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => {
              playToolChime();
              onNavigateShorts('next');
            }}
            className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-600/50 flex flex-col items-center gap-1.5 text-xs text-slate-200 transition-all cursor-pointer"
          >
            <Film className="w-4 h-4 text-cyan-400" />
            <span>Next Short / Reel</span>
          </button>

          <button
            onClick={() => {
              playToolChime();
              onSeek('forward');
            }}
            className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-600/50 flex flex-col items-center gap-1.5 text-xs text-slate-200 transition-all cursor-pointer"
          >
            <FastForward className="w-4 h-4 text-cyan-400" />
            <span>Fast Forward 10s</span>
          </button>

          <button
            onClick={() => {
              playToolChime();
              onSeek('rewind');
            }}
            className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-600/50 flex flex-col items-center gap-1.5 text-xs text-slate-200 transition-all cursor-pointer"
          >
            <Rewind className="w-4 h-4 text-cyan-400" />
            <span>Rewind 10s</span>
          </button>

          <button
            onClick={() => {
              playToolChime();
              onToggleView('fullscreen');
            }}
            className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-600/50 flex flex-col items-center gap-1.5 text-xs text-slate-200 transition-all cursor-pointer"
          >
            <Maximize2 className="w-4 h-4 text-cyan-400" />
            <span>Fullscreen Mode</span>
          </button>
        </div>
      )}

      {/* Main Tab 3: Autonomous YouTube Ad Skipper */}
      {activeTab === 'adskipper' && (
        <div className="p-4 rounded-lg bg-slate-900/60 border border-emerald-900/40 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="font-tech text-xs tracking-wider uppercase font-semibold text-emerald-200">
                  Autonomous Ad Neutralizer (Part 14)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Continuous optical & DOM inspection with zero-latency bypass
                </p>
              </div>
            </div>
            <div className="font-code text-right">
              <span className="text-xl font-bold text-emerald-400 tabular-nums">
                {media.adSkippedCount}
              </span>
              <span className="text-[10px] text-slate-500 block uppercase">Ads Neutralized</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span className="text-xs text-slate-300 font-mono">
              Voice trigger: "JARVIS, skip this ad"
            </span>
            <button
              onClick={() => {
                playToolChime();
                onSkipAd();
              }}
              className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-200 text-xs font-mono rounded cursor-pointer transition-all"
            >
              Trigger Instant Bypass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
