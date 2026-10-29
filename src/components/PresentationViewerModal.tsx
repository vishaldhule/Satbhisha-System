import React, { useState, useEffect, useCallback } from 'react';

export interface SlideItem {
  title: string;
  desc: string;
}

export interface SlideData {
  layout: 'split_image_right' | 'split_image_left' | 'cards' | 'timeline' | 'flowchart';
  badge: string;
  heading: string;
  summary: string;
  image_prompt?: string;
  image_url?: string;
  items: SlideItem[];
}

export interface PresentationPayload {
  main_title: string;
  subtitle: string;
  topic: string;
  slides: SlideData[];
  created_at?: string;
}

interface PresentationViewerModalProps {
  presentation: PresentationPayload | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PresentationViewerModal: React.FC<PresentationViewerModalProps> = ({
  presentation,
  isOpen,
  onClose,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Total slides = Title Slide (index 0) + content slides
  const totalSlides = presentation ? 1 + presentation.slides.length : 0;

  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev < totalSlides - 1 ? prev + 1 : 0));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : totalSlides - 1));
  }, [totalSlides]);

  // Keyboard navigation & F5 fullscreen simulation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'F5') {
        e.preventDefault();
        setIsFullscreen((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, nextSlide, prevSlide, onClose]);

  // Auto-play timer
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying, nextSlide]);

  if (!isOpen || !presentation) return null;

  const isTitleSlide = currentSlideIndex === 0;
  const currentContentSlide = !isTitleSlide ? presentation.slides[currentSlideIndex - 1] : null;

  // Generate a reliable high-res tech visual for the slide
  const getSlideImage = (prompt?: string, seedIndex: number = 0) => {
    if (prompt && prompt.length > 5) {
      const clean = encodeURIComponent(prompt.slice(0, 100));
      return `https://image.pollinations.ai/prompt/${clean}?width=800&height=1080&nologo=true`;
    }
    const seeds = ['cyberpunk-ai', 'quantum-tech', 'neural-network', 'deep-matrix', 'holographic-data'];
    return `https://picsum.photos/seed/${seeds[seedIndex % seeds.length]}/800/1080`;
  };

  const handleDownloadDeck = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(presentation, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${presentation.topic.replace(/\s+/g, '_')}_Deck.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 transition-all ${
        isFullscreen ? 'bg-black p-0' : 'bg-black/85 backdrop-blur-md'
      }`}
    >
      <div
        className={`w-full flex flex-col rounded-2xl border border-cyan-500/40 bg-[#0B0F19] shadow-[0_0_50px_rgba(0,229,255,0.25)] overflow-hidden transition-all ${
          isFullscreen ? 'h-full max-w-none rounded-none border-none' : 'max-w-6xl max-h-[92vh]'
        }`}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-[#0B0F19]/90">
          <div className="flex items-center space-x-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 animate-ping" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-cyan-400 font-tech tracking-wider uppercase">
                ■ JARVIS PRESENTATION ENGINE // EPISODE 19
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Topic: <strong className="text-slate-200">{presentation.topic}</strong> • Widescreen 16:9 Deck
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Auto Play */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                isPlaying
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {isPlaying ? '⏸ PAUSE SHOW' : '▶ AUTO PLAY'}
            </button>

            {/* F5 Fullscreen Mode */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                isFullscreen
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
              title="Fullscreen Slideshow (F5)"
            >
              {isFullscreen ? '✕ EXIT F5' : '⛶ F5 FULLSCREEN'}
            </button>

            {/* Download Deck */}
            <button
              onClick={handleDownloadDeck}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 transition-all"
              title="Export Deck JSON"
            >
              📥 EXPORT
            </button>

            <a
              href="/ppt_engine.py"
              download="ppt_engine.py"
              className="hidden sm:inline-block px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all"
              title="Download ppt_engine.py Python script"
            >
              📥 ppt_engine.py
            </a>

            {/* Close */}
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 rounded-lg text-xs font-mono bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 16:9 Main Slide Stage */}
        <div className="relative flex-1 bg-[#0B0F19] flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
          <div className="w-full aspect-[16/9] max-h-[72vh] rounded-xl border border-slate-800 bg-[#0B0F19] shadow-2xl relative overflow-hidden flex flex-col p-6 sm:p-10 select-none">
            {/* Subtle background glow */}
            <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

            {/* SLIDE 1: TITLE SLIDE */}
            {isTitleSlide && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full items-center z-10">
                <div className="md:col-span-7 flex flex-col justify-center space-y-4">
                  <span className="inline-block px-3 py-1 rounded text-xs font-mono font-bold tracking-widest text-purple-400 bg-purple-950/60 border border-purple-500/40 uppercase w-fit">
                    EXECUTIVE INTELLIGENCE BRIEFING
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-100 font-tech tracking-tight leading-tight">
                    {presentation.main_title}
                  </h1>
                  <p className="text-base sm:text-lg text-slate-400 font-sans leading-relaxed">
                    {presentation.subtitle}
                  </p>
                  <div className="pt-4 flex items-center space-x-4 text-xs font-mono text-cyan-400">
                    <span className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span>AUTONOMOUS PRODUCTION DECK</span>
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">BY SWAYAM DHAWALE | PULSE OF AI</span>
                  </div>
                </div>

                <div className="md:col-span-5 h-full flex items-center justify-center">
                  <div className="w-full h-full max-h-[380px] rounded-xl overflow-hidden border border-cyan-500/30 shadow-[0_0_30px_rgba(0,229,255,0.15)] relative group">
                    <img
                      src={getSlideImage(presentation.slides[0]?.image_prompt, 0)}
                      alt="Title Concept Art"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-transparent to-transparent opacity-80" />
                    <div className="absolute bottom-3 left-3 right-3 text-[10px] font-mono text-cyan-300 truncate bg-black/60 px-2 py-1 rounded backdrop-blur">
                      AI GENERATION // {presentation.topic}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DYNAMIC CONTENT SLIDES (SLIDE 2+) */}
            {!isTitleSlide && currentContentSlide && (
              <div className="flex flex-col h-full z-10">
                {/* Slide Header */}
                <div className="mb-4 sm:mb-6">
                  <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-mono font-bold tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 uppercase">
                    {currentContentSlide.badge}
                  </span>
                  <h2 className="text-xl sm:text-3xl font-extrabold text-slate-100 font-tech uppercase tracking-wide mt-1">
                    {currentContentSlide.heading}
                  </h2>
                </div>

                {/* Content based on layout */}
                <div className="flex-1 overflow-hidden flex flex-col justify-center">
                  {/* Layout: split_image_right */}
                  {currentContentSlide.layout === 'split_image_right' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full items-center">
                      <div className="md:col-span-7 flex flex-col space-y-4 justify-center">
                        <p className="text-sm text-slate-300 leading-relaxed font-sans border-l-2 border-cyan-400/80 pl-3">
                          {currentContentSlide.summary}
                        </p>
                        <div className="space-y-3 pt-1">
                          {currentContentSlide.items.slice(0, 3).map((item, i) => (
                            <div key={i} className="text-xs">
                              <span className="text-cyan-300 font-bold font-mono tracking-wide">
                                • {item.title}:{' '}
                              </span>
                              <span className="text-slate-400 font-sans leading-normal">{item.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-5 h-full flex items-center justify-center">
                        <div className="w-full h-full max-h-[320px] rounded-xl overflow-hidden border border-cyan-500/30 relative shadow-[0_0_25px_rgba(0,229,255,0.12)]">
                          <img
                            src={getSlideImage(currentContentSlide.image_prompt, currentSlideIndex)}
                            alt={currentContentSlide.heading}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Layout: split_image_left */}
                  {currentContentSlide.layout === 'split_image_left' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full items-center">
                      <div className="md:col-span-5 h-full flex items-center justify-center">
                        <div className="w-full h-full max-h-[320px] rounded-xl overflow-hidden border border-purple-500/30 relative shadow-[0_0_25px_rgba(168,85,247,0.12)]">
                          <img
                            src={getSlideImage(currentContentSlide.image_prompt, currentSlideIndex)}
                            alt={currentContentSlide.heading}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-7 flex flex-col space-y-4 justify-center">
                        <p className="text-sm text-slate-300 leading-relaxed font-sans border-l-2 border-purple-400/80 pl-3">
                          {currentContentSlide.summary}
                        </p>
                        <div className="space-y-3 pt-1">
                          {currentContentSlide.items.slice(0, 3).map((item, i) => (
                            <div key={i} className="text-xs">
                              <span className="text-purple-300 font-bold font-mono tracking-wide">
                                • {item.title}:{' '}
                              </span>
                              <span className="text-slate-400 font-sans leading-normal">{item.desc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Layout: cards */}
                  {currentContentSlide.layout === 'cards' && (
                    <div className="flex flex-col h-full justify-between space-y-4">
                      <p className="text-sm text-slate-300 leading-relaxed font-sans">
                        {currentContentSlide.summary}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 items-stretch">
                        {currentContentSlide.items.slice(0, 3).map((item, i) => (
                          <div
                            key={i}
                            className="p-4 rounded-xl bg-[#141B2D] border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between shadow-lg"
                          >
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                                <h4 className="text-sm font-bold text-cyan-300 font-tech uppercase tracking-wide">
                                  {item.title}
                                </h4>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed font-sans">{item.desc}</p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                              METRIC {i + 1} // NOMINAL
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Layout: timeline */}
                  {currentContentSlide.layout === 'timeline' && (
                    <div className="flex flex-col h-full justify-center space-y-6">
                      <p className="text-sm text-slate-300 leading-relaxed font-sans">
                        {currentContentSlide.summary}
                      </p>
                      <div className="relative pt-6 pb-4">
                        {/* Connecting base bar */}
                        <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-700 -translate-y-1/2 z-0" />
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                          {currentContentSlide.items.slice(0, 4).map((item, i) => (
                            <div key={i} className="flex flex-col items-center text-center">
                              <div className="w-8 h-8 rounded-full bg-cyan-500 text-black font-bold font-mono text-xs flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.6)] mb-3">
                                0{i + 1}
                              </div>
                              <div className="p-3 rounded-lg bg-[#141B2D] border border-slate-800 w-full min-h-[90px] flex flex-col justify-center">
                                <span className="text-xs font-bold text-slate-200 font-tech uppercase">
                                  {item.title}
                                </span>
                                <p className="text-[11px] text-slate-400 leading-tight mt-1 line-clamp-3">
                                  {item.desc}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Layout: flowchart */}
                  {currentContentSlide.layout === 'flowchart' && (
                    <div className="flex flex-col h-full justify-center space-y-4">
                      <p className="text-sm text-slate-300 leading-relaxed font-sans">
                        {currentContentSlide.summary}
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-2">
                        {currentContentSlide.items.slice(0, 3).map((item, i) => (
                          <React.Fragment key={i}>
                            <div className="flex-1 p-4 rounded-xl bg-[#141B2D] border border-cyan-500/40 w-full shadow-lg">
                              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                                STAGE 0{i + 1}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-100 font-tech uppercase mt-0.5 mb-1.5">
                                {item.title}
                              </h4>
                              <p className="text-xs text-slate-400 font-sans leading-normal">{item.desc}</p>
                            </div>
                            {i < currentContentSlide.items.slice(0, 3).length - 1 && (
                              <div className="text-purple-400 font-bold text-lg select-none">
                                ➔
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Slide Navigation Bar */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0B0F19]/90 flex items-center justify-between">
          <button
            onClick={prevSlide}
            className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center space-x-1"
          >
            <span>◀ PREV</span>
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center space-x-2">
            {Array.from({ length: totalSlides }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`transition-all rounded-full ${
                  currentSlideIndex === idx
                    ? 'w-7 h-2.5 bg-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.8)]'
                    : 'w-2.5 h-2.5 bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Jump to slide ${idx + 1}`}
              />
            ))}
            <span className="text-xs font-mono text-slate-400 ml-2">
              {currentSlideIndex + 1} / {totalSlides}
            </span>
          </div>

          <button
            onClick={nextSlide}
            className="px-4 py-2 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-black font-tech transition-all flex items-center space-x-1 shadow-[0_0_15px_rgba(0,229,255,0.4)]"
          >
            <span>NEXT ▶</span>
          </button>
        </div>
      </div>
    </div>
  );
};
