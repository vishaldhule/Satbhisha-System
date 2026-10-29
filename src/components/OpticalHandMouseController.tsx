import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  MousePointer,
  Hand,
  Maximize2,
  Minimize2,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Activity,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { HolographicVirtualCursor } from './HolographicVirtualCursor';
import { playToolChime, playMicActivateChime } from '../utils/audioSfx';

interface HandControllerProps {
  onStatusChange?: (status: string) => void;
  isFloating?: boolean;
}

export const OpticalHandMouseController: React.FC<HandControllerProps> = ({
  onStatusChange,
  isFloating = false,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [gestureName, setGestureName] = useState<string>('STANDBY');
  const [isPinching, setIsPinching] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [sensitivity, setSensitivity] = useState(1.8);
  const [smoothing, setSmoothing] = useState(0.4);
  const [isMirrored, setIsMirrored] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [testScore, setTestScore] = useState(0);

  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handsModelRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);

  // Smooth position tracking refs
  const smoothXRef = useRef(window.innerWidth / 2);
  const smoothYRef = useRef(window.innerHeight / 2);
  const prevPinchRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const lastClickTimeRef = useRef(0);

  // Initialize Camera & MediaPipe Hands
  const startHandTracking = async () => {
    try {
      setGestureName('INITIALIZING OPTICAL LINK...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setHasPermission(true);
      setIsActive(true);
      playToolChime();

      // Check if MediaPipe Hands is loaded globally
      if ((window as any).Hands) {
        setupMediaPipeModel();
      } else {
        // Fallback to fast optical canvas detection while MediaPipe initializes
        setGestureName('MEDIA PIPE LOADING... (OPTICAL FALLBACK ENGAGED)');
        runOpticalLoopFallback();
      }
    } catch (err: any) {
      console.error('Camera access failed:', err);
      setHasPermission(false);
      setGestureName('CAMERA ACCESS DENIED');
    }
  };

  const stopHandTracking = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsActive(false);
    setCursorPos({ x: -100, y: -100 });
    setGestureName('STANDBY');
  };

  // Setup Google MediaPipe Hands
  const setupMediaPipeModel = () => {
    try {
      const hands = new (window as any).Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65,
      });

      hands.onResults(onHandResults);
      handsModelRef.current = hands;

      // Start processing loop
      const processFrame = async () => {
        if (videoRef.current && videoRef.current.readyState >= 2 && handsModelRef.current) {
          try {
            await handsModelRef.current.send({ image: videoRef.current });
          } catch (e) {
            // Catch transient frame drop
          }
        }
        if (streamRef.current && streamRef.current.active) {
          animFrameRef.current = requestAnimationFrame(processFrame);
        }
      };

      processFrame();
      setGestureName('HAND TRACKING ACTIVE');
      onStatusChange?.('Optical Hand Mouse Active');
    } catch (e) {
      console.warn('MediaPipe init warning:', e);
      runOpticalLoopFallback();
    }
  };

  // Fallback optical processing if MediaPipe script is delayed
  const runOpticalLoopFallback = () => {
    const loop = () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video.videoWidth || 320;
          canvas.height = video.videoHeight || 240;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // If MediaPipe became available in meantime, switch
          if ((window as any).Hands && !handsModelRef.current) {
            setupMediaPipeModel();
            return;
          }
        }
      }
      if (streamRef.current && streamRef.current.active) {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };
    animFrameRef.current = requestAnimationFrame(loop);
  };

  // MediaPipe Hand Detection Results Callback
  const onHandResults = (results: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = results.image.width || 640;
    canvas.height = results.image.height || 480;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];

      // Draw hand skeleton if enabled
      if (showSkeleton) {
        drawFuturisticSkeleton(ctx, landmarks, canvas.width, canvas.height);
      }

      // Compute Gestures & Virtual Mouse Position
      processHandGestures(landmarks, canvas.width, canvas.height);
    } else {
      setGestureName('SCANNING FOR HAND...');
      setIsPinching(false);
    }

    ctx.restore();
  };

  // Futuristic Hologram Skeleton Drawing
  const drawFuturisticSkeleton = (
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    width: number,
    height: number
  ) => {
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8], // Index
      [0, 9], [9, 10], [10, 11], [11, 12], // Middle
      [0, 13], [13, 14], [14, 15], [15, 16], // Ring
      [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
      [5, 9], [9, 13], [13, 17], // Palm
    ];

    // Draw connection cyber-lines
    ctx.strokeStyle = isPinching ? 'rgba(251, 191, 36, 0.7)' : 'rgba(6, 182, 212, 0.6)';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';

    connections.forEach(([i, j]) => {
      const p1 = landmarks[i];
      const p2 = landmarks[j];
      const x1 = isMirrored ? (1 - p1.x) * width : p1.x * width;
      const y1 = p1.y * height;
      const x2 = isMirrored ? (1 - p2.x) * width : p2.x * width;
      const y2 = p2.y * height;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // Draw joint nodes
    landmarks.forEach((p: any, idx: number) => {
      const x = isMirrored ? (1 - p.x) * width : p.x * width;
      const y = p.y * height;

      ctx.beginPath();
      const isFingertip = [4, 8, 12, 16, 20].includes(idx);
      const radius = isFingertip ? 5 : 3;
      ctx.arc(x, y, radius, 0, Math.PI * 2);

      if (idx === 8) {
        // Index Tip (Pointer Core)
        ctx.fillStyle = isPinching ? '#fbbf24' : '#00e5ff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else if (idx === 4) {
        // Thumb Tip
        ctx.fillStyle = isPinching ? '#f59e0b' : '#38bdf8';
      } else {
        ctx.fillStyle = '#06b6d4';
      }
      ctx.fill();
    });
  };

  // Hand Gestures & Virtual Mouse Control
  const processHandGestures = (landmarks: any[], width: number, height: number) => {
    // Key landmarks:
    // 0: Wrist, 4: Thumb Tip, 8: Index Tip, 12: Middle Tip, 16: Ring Tip, 20: Pinky Tip
    const wrist = landmarks[0];
    const thumb = landmarks[4];
    const index = landmarks[8];
    const middle = landmarks[12];
    const ring = landmarks[16];
    const pinky = landmarks[20];

    // Distance between Index and Thumb (Pinch Detection)
    const pinchDist = Math.hypot(index.x - thumb.x, index.y - thumb.y);

    // Distance between Middle and Thumb (Right Click)
    const midPinchDist = Math.hypot(middle.x - thumb.x, middle.y - thumb.y);

    // Check if fingers are extended relative to knuckle (joint - 2)
    const isIndexExtended = index.y < landmarks[6].y;
    const isMiddleExtended = middle.y < landmarks[10].y;
    const isRingExtended = ring.y < landmarks[14].y;
    const isPinkyExtended = pinky.y < landmarks[18].y;

    // Check Fist (all fingers folded towards wrist)
    const isFist = !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended;

    // Check Open Palm (all 5 extended)
    const isOpenPalm = isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended;

    // Check Two Fingers Up (Index + Middle extended, others down) -> SCROLL
    const isScrollGesture = isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended && pinchDist > 0.08;

    // Normalize coordinates for mouse pointer
    // Use Index fingertip as the primary pointer
    let normX = isMirrored ? 1.0 - index.x : index.x;
    let normY = index.y;

    // Apply sensitivity scaling centered around 0.5
    normX = (normX - 0.5) * sensitivity + 0.5;
    normY = (normY - 0.5) * sensitivity + 0.5;

    // Clamp between 0 and 1
    normX = Math.max(0.01, Math.min(0.99, normX));
    normY = Math.max(0.01, Math.min(0.99, normY));

    // Convert to screen pixels
    const targetX = normX * window.innerWidth;
    const targetY = normY * window.innerHeight;

    // Apply Exponential Moving Average (EMA) smoothing
    smoothXRef.current = smoothXRef.current * (1 - smoothing) + targetX * smoothing;
    smoothYRef.current = smoothYRef.current * (1 - smoothing) + targetY * smoothing;

    const curX = smoothXRef.current;
    const curY = smoothYRef.current;

    // Gesture State Logic
    if (isFist) {
      setGestureName('POINTER FROZEN (FIST)');
      setIsPinching(false);
    } else if (isScrollGesture) {
      setGestureName('SCROLLING MODE (TWO FINGERS)');
      setIsPinching(false);
      setCursorPos({ x: curX, y: curY });

      // Calculate scroll delta based on middle finger movement
      if (lastScrollYRef.current !== 0) {
        const delta = (index.y - lastScrollYRef.current) * 1200;
        if (Math.abs(delta) > 10) {
          window.scrollBy({ top: delta, behavior: 'auto' });
        }
      }
      lastScrollYRef.current = index.y;
    } else {
      lastScrollYRef.current = 0;

      // Check Pinch gesture (Threshold ~ 0.055)
      const currentPinching = pinchDist < 0.055;
      setIsPinching(currentPinching);
      setCursorPos({ x: curX, y: curY });

      if (currentPinching) {
        setGestureName('PINCH CLICK / DRAGGING');

        // Trigger Click event on pinch down
        if (!prevPinchRef.current) {
          const now = Date.now();
          if (now - lastClickTimeRef.current > 250) {
            triggerDomClick(curX, curY);
            lastClickTimeRef.current = now;
          }
        }
      } else if (isOpenPalm) {
        setGestureName('FREE ROAM (REPULSOR PALM)');
      } else {
        setGestureName('CURSOR TRACKING');
      }
      prevPinchRef.current = currentPinching;
    }
  };

  // Simulate real DOM click and interaction at target coordinates
  const triggerDomClick = (x: number, y: number) => {
    try {
      playToolChime();

      // Temporarily hide pointer to get underlying element
      const targetElement = document.elementFromPoint(x, y) as HTMLElement | null;

      if (targetElement) {
        // Dispatch standard mouse events
        const mousedown = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          view: window,
        });
        const mouseup = new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          view: window,
        });
        const click = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          view: window,
        });

        targetElement.dispatchEvent(mousedown);
        targetElement.dispatchEvent(mouseup);
        targetElement.click();
        targetElement.focus();
      }
    } catch (e) {
      console.warn('DOM click dispatch error:', e);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopHandTracking();
    };
  }, []);

  return (
    <>
      {/* Floating Holographic Virtual Cursor rendered globally over the whole viewport */}
      <HolographicVirtualCursor
        x={cursorPos.x}
        y={cursorPos.y}
        isPinching={isPinching}
        gesture={gestureName}
        enabled={isActive}
      />

      {/* Main Optical Controller Widget */}
      <div
        className={`bg-slate-950/95 border border-cyan-800/80 rounded-xl overflow-hidden backdrop-blur-xl shadow-2xl transition-all ${
          isFloating
            ? 'fixed bottom-5 right-5 z-[9000] w-80 max-w-[90vw] border-cyan-500/70 shadow-[0_0_30px_rgba(6,182,212,0.25)]'
            : 'w-full'
        }`}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isActive ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'
              }`}
            />
            <h3 className="font-tech text-xs tracking-wider uppercase font-semibold text-slate-100 flex items-center gap-1.5">
              <Hand className="w-3.5 h-3.5 text-cyan-400" /> Optical Hand Mouse & PC Control
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 text-slate-400 hover:text-cyan-300 rounded cursor-pointer transition-all"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Content Body */}
        {!isMinimized && (
          <div className="p-4 flex flex-col gap-4">
            {/* Camera Viewport & Skeleton Overlay */}
            <div className="relative aspect-[4/3] w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
              {/* Hidden/Active Webcam Video */}
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${
                  isMirrored ? '-scale-x-100' : ''
                } ${isActive ? 'block' : 'hidden'}`}
                playsInline
                muted
              />

              {/* Holographic Canvas Skeleton Overlay */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
              />

              {/* Off state notice */}
              {!isActive && (
                <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-slate-500 font-mono text-xs">
                  <Camera className="w-8 h-8 text-slate-600" />
                  <span>Optical Hand Sensor is Offline</span>
                  <span className="text-[10px] text-slate-600">
                    Click 'Engage Hand Control' below to grant camera access.
                  </span>
                </div>
              )}

              {/* Live Gesture Badge */}
              {isActive && (
                <div className="absolute top-2 left-2 z-20 bg-slate-950/80 border border-cyan-800/80 px-2.5 py-1 rounded text-[10px] font-mono text-cyan-300 flex items-center gap-1.5 backdrop-blur-md">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isPinching ? 'bg-amber-400 animate-ping' : 'bg-cyan-400'
                    }`}
                  />
                  <span>{gestureName}</span>
                </div>
              )}

              {/* Coordinates */}
              {isActive && (
                <div className="absolute bottom-2 right-2 z-20 bg-slate-950/80 border border-slate-800 px-2 py-0.5 rounded text-[9px] font-mono text-slate-400">
                  X: {Math.round(cursorPos.x)} Y: {Math.round(cursorPos.y)}
                </div>
              )}
            </div>

            {/* Main Toggle Button */}
            <button
              onClick={() => {
                if (isActive) {
                  stopHandTracking();
                } else {
                  startHandTracking();
                }
              }}
              className={`w-full py-2.5 px-4 rounded-lg font-tech font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                isActive
                  ? 'bg-rose-950/80 hover:bg-rose-900 border border-rose-500 text-rose-200'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-950/40'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>{isActive ? 'DISENGAGE OPTICAL HAND CONTROL' : 'ENGAGE OPTICAL HAND CONTROL'}</span>
            </button>

            {/* Gestures Quick Guide */}
            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex flex-col gap-1.5 text-xs font-mono">
              <span className="text-[11px] font-tech text-cyan-400 uppercase font-semibold">
                Gestures Reference Matrix
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-cyan-400 font-bold">👆 Index:</span> Move Cursor
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">👌 Pinch:</span> Click / Drag
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sky-400 font-bold">✌️ 2-Fingers:</span> Scroll Screen
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-rose-400 font-bold">✊ Fist:</span> Lock Pointer
                </div>
              </div>
            </div>

            {/* Interactive Target Playground */}
            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-tech text-slate-300 uppercase font-semibold">
                  Hand Click Testing Zone
                </span>
                <span className="font-code text-cyan-400 text-xs">
                  Clicks: {testScore}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setTestScore((s) => s + 1);
                    playMicActivateChime();
                  }}
                  className="p-2.5 bg-slate-800 hover:bg-cyan-600 active:scale-95 text-slate-200 hover:text-white rounded text-[11px] font-mono border border-slate-700 transition-all cursor-pointer"
                >
                  Target A
                </button>
                <button
                  onClick={() => {
                    setTestScore((s) => s + 5);
                    playMicActivateChime();
                  }}
                  className="p-2.5 bg-slate-800 hover:bg-amber-600 active:scale-95 text-slate-200 hover:text-white rounded text-[11px] font-mono border border-slate-700 transition-all cursor-pointer"
                >
                  Target B (+5)
                </button>
                <button
                  onClick={() => {
                    setTestScore(0);
                    playToolChime();
                  }}
                  className="p-2.5 bg-slate-800 hover:bg-rose-600 active:scale-95 text-slate-200 hover:text-white rounded text-[11px] font-mono border border-slate-700 transition-all cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Calibration Sliders */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
              {/* Sensitivity */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Pointer Reach Sensitivity</span>
                  <span className="font-code text-cyan-400">{sensitivity}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.1"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              {/* Smoothing */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Jitter Dampening (EMA)</span>
                  <span className="font-code text-cyan-400">{Math.round(smoothing * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={smoothing}
                  onChange={(e) => setSmoothing(Number(e.target.value))}
                  className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded cursor-pointer"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-[11px]">
                  <input
                    type="checkbox"
                    checked={isMirrored}
                    onChange={(e) => setIsMirrored(e.target.checked)}
                    className="accent-cyan-500 rounded"
                  />
                  Mirror Camera
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-[11px]">
                  <input
                    type="checkbox"
                    checked={showSkeleton}
                    onChange={(e) => setShowSkeleton(e.target.checked)}
                    className="accent-cyan-500 rounded"
                  />
                  Hologram Skeleton
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
