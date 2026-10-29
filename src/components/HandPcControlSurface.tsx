import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Hand,
  Volume2,
  Sun,
  RotateCcw,
  Zap,
  Power,
  Play,
  Activity,
  Sliders,
  Settings2,
  Crosshair,
  Gauge,
  Check,
  Shield,
  Layers,
} from 'lucide-react';
import {
  OpticalHandTracker,
  HandTrackerConfig,
  DEFAULT_HAND_CONFIG,
} from '../utils/handTracker';
import { HolographicVirtualCursor } from './HolographicVirtualCursor';
import { playToolChime, playMicActivateChime, playPurgeSfx } from '../utils/audioSfx';

interface HandPcControlProps {
  onNotify?: (text: string) => void;
  systemVolume: number;
  systemBrightness: number;
  onSetVolume: (val: number) => void;
  onSetBrightness: (val: number) => void;
}

export const HandPcControlSurface: React.FC<HandPcControlProps> = ({
  onNotify,
  systemVolume,
  systemBrightness,
  onSetVolume,
  onSetBrightness,
}) => {
  // State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isPinching, setIsPinching] = useState(false);
  const [gesture, setGesture] = useState<string>('OPTICAL SENSOR OFFLINE');
  const [activeApp, setActiveApp] = useState<'desktop' | 'draw' | 'config'>('desktop');
  const [clickCount, setClickCount] = useState(0);
  const [hoveredTarget, setHoveredTarget] = useState<string | null>(null);

  // Configuration Panel State
  const [config, setConfig] = useState<HandTrackerConfig>(() => {
    try {
      const saved = localStorage.getItem('jarvis_hand_config');
      return saved ? { ...DEFAULT_HAND_CONFIG, ...JSON.parse(saved) } : DEFAULT_HAND_CONFIG;
    } catch {
      return DEFAULT_HAND_CONFIG;
    }
  });

  const [activePreset, setActivePreset] = useState<'custom' | 'balanced' | 'precision' | 'gaming'>('balanced');
  const [livePinchDist, setLivePinchDist] = useState(0);
  const [liveConfidence, setLiveConfidence] = useState(0);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const processCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackerRef = useRef<OpticalHandTracker>(new OpticalHandTracker());
  const animFrameRef = useRef<number | null>(null);
  const isPinchingRef = useRef(false);
  const isDraggingSliderRef = useRef<'volume' | 'brightness' | null>(null);
  const lastClickTimeRef = useRef(0);
  const configRef = useRef<HandTrackerConfig>(config);

  // Keep configRef in sync
  useEffect(() => {
    configRef.current = config;
    try {
      localStorage.setItem('jarvis_hand_config', JSON.stringify(config));
    } catch {}
  }, [config]);

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setGesture('CONNECTING WEBCAM...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraActive(true);
      playToolChime();
      setGesture('HAND TRACKER ACTIVE: SHOW HAND');
      onNotify?.('Optical Hand Tracking Engine Online. Move your hand to guide cursor.');
      startProcessingLoop();
    } catch (err: any) {
      console.error('Camera initialization failed:', err);
      setCameraError(err.message || 'Camera permission denied or camera busy.');
      setGesture('CAMERA ACCESS REQUIRED');
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // High frequency 60 FPS Optical Hand Processing Loop
  const startProcessingLoop = () => {
    const loop = () => {
      if (
        videoRef.current &&
        processCanvasRef.current &&
        videoRef.current.readyState >= 2
      ) {
        const result = trackerRef.current.processFrame(
          videoRef.current,
          processCanvasRef.current,
          configRef.current
        );

        if (result.detected) {
          const screenX = result.fingertipX * window.innerWidth;
          const screenY = result.fingertipY * window.innerHeight;

          setCursorPos({ x: screenX, y: screenY });
          setIsPinching(result.isPinching);
          setGesture(result.gesture);
          setLivePinchDist(result.pinchDistance);
          setLiveConfidence(result.confidence);

          // Handle real-time hand drawing
          if (activeApp === 'draw') {
            drawOnAir(screenX, screenY, result.isPinching);
          }

          // Handle Pinch Down & Click Event
          if (result.isPinching && !isPinchingRef.current) {
            handlePinchClick(screenX, screenY);
          }

          // Handle Pinch Release
          if (!result.isPinching && isPinchingRef.current) {
            isDraggingSliderRef.current = null;
          }

          // Handle Slider Dragging while pinching
          if (result.isPinching && isDraggingSliderRef.current) {
            handleSliderDrag(screenX);
          }

          isPinchingRef.current = result.isPinching;
        } else {
          setGesture('WAITING FOR HAND (HOLD HAND IN FRONT OF CAMERA)');
          setIsPinching(false);
          setLiveConfidence(0);
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  // Air Drawing Canvas
  const drawOnAir = (x: number, y: number, pinching: boolean) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const localX = x - rect.left;
    const localY = y - rect.top;

    if (localX >= 0 && localX <= rect.width && localY >= 0 && localY <= rect.height) {
      ctx.beginPath();
      ctx.arc(localX, localY, pinching ? 6 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = pinching ? '#00e5ff' : '#0284c7';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 8;
      ctx.fill();
    }
  };

  // Pinch Click Simulation
  const handlePinchClick = (x: number, y: number) => {
    const now = Date.now();
    if (now - lastClickTimeRef.current < configRef.current.clickCooldownMs) return;
    lastClickTimeRef.current = now;

    playToolChime();
    setClickCount((c) => c + 1);

    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (el) {
      el.focus();
      el.click();

      const mouseEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        view: window,
      });
      el.dispatchEvent(mouseEvent);
    }
  };

  const handleSliderDrag = (screenX: number) => {
    const ratio = Math.max(0, Math.min(100, Math.round((screenX / window.innerWidth) * 100)));
    if (isDraggingSliderRef.current === 'volume') {
      onSetVolume(ratio);
    } else if (isDraggingSliderRef.current === 'brightness') {
      onSetBrightness(ratio);
    }
  };

  const clearDrawing = () => {
    const canvas = drawCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      playPurgeSfx();
    }
  };

  // Apply Presets
  const applyPreset = (preset: 'balanced' | 'precision' | 'gaming') => {
    playToolChime();
    setActivePreset(preset);

    if (preset === 'balanced') {
      setConfig({
        speedMultiplier: 2.2,
        smoothing: 0.35,
        deadzone: 0.008,
        pinchThreshold: 0.12,
        clickCooldownMs: 220,
        acceleration: 1.2,
        isMirrored: config.isMirrored,
      });
      onNotify?.('Calibrated to Balanced Reflex preset.');
    } else if (preset === 'precision') {
      setConfig({
        speedMultiplier: 1.5,
        smoothing: 0.55,
        deadzone: 0.015,
        pinchThreshold: 0.1,
        clickCooldownMs: 260,
        acceleration: 1.0,
        isMirrored: config.isMirrored,
      });
      onNotify?.('Calibrated to Precision & Art mode (high stability).');
    } else if (preset === 'gaming') {
      setConfig({
        speedMultiplier: 3.2,
        smoothing: 0.18,
        deadzone: 0.003,
        pinchThreshold: 0.15,
        clickCooldownMs: 180,
        acceleration: 1.8,
        isMirrored: config.isMirrored,
      });
      onNotify?.('Calibrated to Rapid Action / Gaming mode (high velocity).');
    }
  };

  const resetToDefaults = () => {
    playPurgeSfx();
    setConfig(DEFAULT_HAND_CONFIG);
    setActivePreset('balanced');
    onNotify?.('Reset all sensitivity thresholds to factory defaults.');
  };

  return (
    <>
      {/* Global Holographic Laser Cursor following the hand */}
      <HolographicVirtualCursor
        x={cursorPos.x}
        y={cursorPos.y}
        isPinching={isPinching}
        gesture={gesture}
        enabled={isCameraActive}
      />

      <div className="flex flex-col gap-5 w-full">
        {/* Minimal High-Tech Top HUD Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/90 border border-cyan-900/40 rounded-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isCameraActive ? 'bg-cyan-400 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <div>
              <h2 className="font-tech text-sm font-bold tracking-wider text-slate-100 uppercase flex items-center gap-2">
                <Hand className="w-4 h-4 text-cyan-400" />
                Optical Neural Hand-PC Controller
              </h2>
              <span className="font-mono text-xs text-cyan-400/90">{gesture}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Speed Readout / Config shortcut */}
            <button
              onClick={() => setActiveApp(activeApp === 'config' ? 'desktop' : 'config')}
              className={`px-3 py-1.5 text-xs font-tech font-bold uppercase rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                activeApp === 'config'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sensitivity & Thresholds</span>
            </button>

            {/* Camera Switch */}
            <button
              onClick={() => {
                if (isCameraActive) stopCamera();
                else startCamera();
              }}
              className={`px-3 py-1.5 text-xs font-tech font-bold uppercase rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                isCameraActive
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                  : 'bg-cyan-600 border-cyan-500 text-white shadow-md'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{isCameraActive ? 'Disable Camera' : 'Engage Camera'}</span>
            </button>
          </div>
        </div>

        {/* Main 2-Panel Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left 4 Cols: Compact Optical Hand Feed & Live Telemetry */}
          <div className="lg:col-span-4 bg-slate-950/90 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between text-xs font-tech font-semibold text-slate-300 uppercase">
              <span>Optical Vision Feed</span>
              <span className="font-mono text-cyan-400 text-[10px]">60 FPS TRACKING</span>
            </div>

            {/* Video + Process Canvas */}
            <div className="relative aspect-[4/3] w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${config.isMirrored ? '-scale-x-100' : ''}`}
                playsInline
                muted
              />

              <canvas ref={processCanvasRef} className="hidden" />

              {/* Target Bounding Box */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none border border-cyan-500/20 flex items-center justify-center">
                  <div className="w-48 h-48 border border-dashed border-cyan-400/30 rounded-lg flex items-center justify-center">
                    <span className="text-[10px] font-mono text-cyan-400/40 uppercase">
                      Target Area
                    </span>
                  </div>
                </div>
              )}

              {/* Offline notice */}
              {!isCameraActive && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-4 text-center text-xs font-mono text-slate-400 gap-2">
                  <Camera className="w-8 h-8 text-slate-600" />
                  <span>{cameraError || 'Camera stream is stopped.'}</span>
                  <button
                    onClick={startCamera}
                    className="mt-2 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-tech uppercase cursor-pointer"
                  >
                    Grant Camera Access
                  </button>
                </div>
              )}

              {/* Real-time Pinch Distance Gauge Overlay */}
              {isCameraActive && (
                <div className="absolute bottom-2 left-2 right-2 bg-slate-950/80 border border-slate-800/80 px-2.5 py-1.5 rounded-md flex items-center justify-between text-[10px] font-mono backdrop-blur-sm">
                  <span className="text-slate-400">Pinch Gap:</span>
                  <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all duration-75 ${
                        isPinching ? 'bg-amber-400' : 'bg-cyan-400'
                      }`}
                      style={{ width: `${Math.min(100, livePinchDist * 500)}%` }}
                    />
                  </div>
                  <span className={isPinching ? 'text-amber-400 font-bold' : 'text-cyan-400'}>
                    {isPinching ? 'CLICK' : livePinchDist.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Hand Instructions */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-xs font-mono flex flex-col gap-1.5">
              <span className="text-[10px] font-tech text-cyan-400 uppercase font-semibold">
                Gestures Reference
              </span>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Move Hand:</span>
                <span className="text-cyan-400 font-bold">Moves Cursor</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Pinch (Thumb + Index):</span>
                <span className="text-amber-400 font-bold">Click / Drag</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>Hover over Targets:</span>
                <span className="text-emerald-400 font-bold">Highlight Element</span>
              </div>
            </div>
          </div>

          {/* Right 8 Cols: Interactive Workspace OR Configuration Panel */}
          <div className="lg:col-span-8 bg-slate-950/90 border border-cyan-900/40 rounded-xl p-5 flex flex-col gap-4">
            {/* View Mode Switcher */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveApp('desktop')}
                  className={`px-3 py-1.5 text-xs font-tech uppercase font-semibold rounded-lg transition-all cursor-pointer ${
                    activeApp === 'desktop'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Virtual PC Desktop
                </button>
                <button
                  onClick={() => setActiveApp('draw')}
                  className={`px-3 py-1.5 text-xs font-tech uppercase font-semibold rounded-lg transition-all cursor-pointer ${
                    activeApp === 'draw'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Air Drawing Canvas
                </button>
                <button
                  onClick={() => setActiveApp('config')}
                  className={`px-3 py-1.5 text-xs font-tech uppercase font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeApp === 'config'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Settings2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sensitivity Panel</span>
                </button>
              </div>

              <div className="text-xs font-mono text-cyan-400">
                Clicks Executed: <span className="font-bold">{clickCount}</span>
              </div>
            </div>

            {/* Sub-view 1: Virtual PC Desktop */}
            {activeApp === 'desktop' && (
              <div className="flex flex-col gap-4">
                {/* Target Buttons Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'btn_1', title: 'System Vitals', icon: Activity, color: 'text-cyan-400' },
                    { id: 'btn_2', title: 'RAM Purge', icon: Power, color: 'text-rose-400' },
                    { id: 'btn_3', title: 'Skip Ad', icon: Zap, color: 'text-emerald-400' },
                    { id: 'btn_4', title: 'Media Toggle', icon: Play, color: 'text-amber-400' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => {
                        playMicActivateChime();
                        onNotify?.(`Triggered action: ${btn.title}`);
                      }}
                      onMouseEnter={() => setHoveredTarget(btn.id)}
                      onMouseLeave={() => setHoveredTarget(null)}
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-xs font-tech font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        hoveredTarget === btn.id
                          ? 'bg-cyan-950/60 border-cyan-400 scale-[1.03] shadow-lg shadow-cyan-950/60'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      <btn.icon className={`w-5 h-5 ${btn.color}`} />
                      <span>{btn.title}</span>
                    </button>
                  ))}
                </div>

                {/* Hand-Draggable Sliders (Volume & Brightness) */}
                <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col gap-3">
                  <span className="text-xs font-tech uppercase text-slate-300 font-semibold">
                    Hand-Controlled System Rails
                  </span>

                  {/* Volume Slider */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-400 font-mono">
                        <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> Master Volume
                      </span>
                      <span className="font-mono text-cyan-400 font-bold">{systemVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={systemVolume}
                      onChange={(e) => onSetVolume(Number(e.target.value))}
                      onMouseDown={() => (isDraggingSliderRef.current = 'volume')}
                      className="w-full accent-cyan-400 bg-slate-800 h-2 rounded cursor-pointer"
                    />
                  </div>

                  {/* Brightness Slider */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-400 font-mono">
                        <Sun className="w-3.5 h-3.5 text-amber-400" /> Display Luminance
                      </span>
                      <span className="font-mono text-amber-400 font-bold">{systemBrightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={systemBrightness}
                      onChange={(e) => onSetBrightness(Number(e.target.value))}
                      onMouseDown={() => (isDraggingSliderRef.current = 'brightness')}
                      className="w-full accent-amber-400 bg-slate-800 h-2 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sub-view 2: Air Drawing Canvas */}
            {activeApp === 'draw' && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Draw with your Index finger in the air. Pinch to draw thick line!</span>
                  <button
                    onClick={clearDrawing}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear Canvas
                  </button>
                </div>
                <canvas
                  ref={drawCanvasRef}
                  width={640}
                  height={320}
                  className="w-full h-80 bg-[#020617] border border-cyan-900/60 rounded-xl cursor-crosshair shadow-inner"
                />
              </div>
            )}

            {/* Sub-view 3: Comprehensive Configuration & Sensitivity Panel */}
            {activeApp === 'config' && (
              <div className="flex flex-col gap-4 text-xs">
                {/* Presets Bar */}
                <div className="flex flex-col gap-1.5">
                  <span className="font-tech uppercase text-cyan-400 font-semibold tracking-wider">
                    Quick Calibration Presets
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => applyPreset('balanced')}
                      className={`p-2.5 rounded-lg border font-mono text-xs flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                        activePreset === 'balanced'
                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-bold">Balanced Reflex</span>
                      <span className="text-[10px] text-slate-400">Natural & Responsive</span>
                    </button>

                    <button
                      onClick={() => applyPreset('precision')}
                      className={`p-2.5 rounded-lg border font-mono text-xs flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                        activePreset === 'precision'
                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-bold">Precision & Art</span>
                      <span className="text-[10px] text-slate-400">Zero Tremor, Max Damping</span>
                    </button>

                    <button
                      onClick={() => applyPreset('gaming')}
                      className={`p-2.5 rounded-lg border font-mono text-xs flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                        activePreset === 'gaming'
                          ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="font-bold">Rapid Action</span>
                      <span className="text-[10px] text-slate-400">High Velocity, Fast Flicks</span>
                    </button>
                  </div>
                </div>

                {/* Fine-Tuning Slider Rails */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  {/* Speed Multiplier */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-slate-300 font-mono">
                      <span>Speed Multiplier</span>
                      <span className="text-cyan-400 font-bold">{config.speedMultiplier.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="4.0"
                      step="0.1"
                      value={config.speedMultiplier}
                      onChange={(e) => {
                        setConfig((prev) => ({ ...prev, speedMultiplier: Number(e.target.value) }));
                        setActivePreset('custom');
                      }}
                      className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500">
                      Cursor reach scale relative to physical hand motion.
                    </span>
                  </div>

                  {/* Motion Smoothing (EMA) */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-slate-300 font-mono">
                      <span>Motion Smoothing (EMA)</span>
                      <span className="text-cyan-400 font-bold">{Math.round(config.smoothing * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.08"
                      max="0.80"
                      step="0.02"
                      value={config.smoothing}
                      onChange={(e) => {
                        setConfig((prev) => ({ ...prev, smoothing: Number(e.target.value) }));
                        setActivePreset('custom');
                      }}
                      className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500">
                      Higher value = snappier reflex; Lower value = butter-smooth.
                    </span>
                  </div>

                  {/* Micro-Jitter Deadzone */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-slate-300 font-mono">
                      <span>Tremor Deadzone</span>
                      <span className="text-cyan-400 font-bold">{(config.deadzone * 1000).toFixed(0)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.000"
                      max="0.030"
                      step="0.002"
                      value={config.deadzone}
                      onChange={(e) => {
                        setConfig((prev) => ({ ...prev, deadzone: Number(e.target.value) }));
                        setActivePreset('custom');
                      }}
                      className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500">
                      Minimum threshold to eliminate involuntary hand tremor.
                    </span>
                  </div>

                  {/* Pinch Click Threshold */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-slate-300 font-mono">
                      <span>Pinch Click Threshold</span>
                      <span className="text-amber-400 font-bold">{(config.pinchThreshold * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.06"
                      max="0.22"
                      step="0.01"
                      value={config.pinchThreshold}
                      onChange={(e) => {
                        setConfig((prev) => ({ ...prev, pinchThreshold: Number(e.target.value) }));
                        setActivePreset('custom');
                      }}
                      className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500">
                      Distance between index and thumb to trigger click.
                    </span>
                  </div>

                  {/* Dynamic Acceleration */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-slate-300 font-mono">
                      <span>Velocity Acceleration</span>
                      <span className="text-cyan-400 font-bold">{config.acceleration.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="2.5"
                      step="0.1"
                      value={config.acceleration}
                      onChange={(e) => {
                        setConfig((prev) => ({ ...prev, acceleration: Number(e.target.value) }));
                        setActivePreset('custom');
                      }}
                      className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500">
                      Scales velocity dynamically during quick hand flicks.
                    </span>
                  </div>

                  {/* Click Debounce / Cooldown */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-slate-300 font-mono">
                      <span>Click Debounce Cooldown</span>
                      <span className="text-cyan-400 font-bold">{config.clickCooldownMs}ms</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="500"
                      step="20"
                      value={config.clickCooldownMs}
                      onChange={(e) => {
                        setConfig((prev) => ({ ...prev, clickCooldownMs: Number(e.target.value) }));
                        setActivePreset('custom');
                      }}
                      className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-500">
                      Buffer between clicks to prevent accidental double-taps.
                    </span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-slate-300 font-mono cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.isMirrored}
                      onChange={(e) => {
                        setConfig((prev) => ({ ...prev, isMirrored: e.target.checked }));
                      }}
                      className="accent-cyan-400 rounded"
                    />
                    Mirror Optical Feed (Intuitive Left/Right)
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetToDefaults}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded text-xs font-mono flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <RotateCcw className="w-3 h-3" /> Factory Defaults
                    </button>
                    <button
                      onClick={() => {
                        playToolChime();
                        setActiveApp('desktop');
                      }}
                      className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-tech uppercase font-bold cursor-pointer transition-all shadow-md"
                    >
                      Save & Return to Desktop
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
