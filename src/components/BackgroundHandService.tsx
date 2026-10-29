import React, { useEffect, useRef, useState } from 'react';
import {
  OpticalHandTracker,
  HandTrackerConfig,
  DEFAULT_HAND_CONFIG,
} from '../utils/handTracker';
import { HolographicVirtualCursor } from './HolographicVirtualCursor';
import { playToolChime } from '../utils/audioSfx';
import { Hand, Camera, Eye, EyeOff, MousePointer } from 'lucide-react';

interface BackgroundHandServiceProps {
  enabled: boolean;
  onToggleEnabled: () => void;
  config?: HandTrackerConfig;
  onNotify?: (text: string) => void;
}

export const BackgroundHandService: React.FC<BackgroundHandServiceProps> = ({
  enabled,
  onToggleEnabled,
  config = DEFAULT_HAND_CONFIG,
  onNotify,
}) => {
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isPinching, setIsPinching] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [gesture, setGesture] = useState<string>('STANDBY');
  const [handDetected, setHandDetected] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showMiniPip, setShowMiniPip] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const processCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackerRef = useRef<OpticalHandTracker>(new OpticalHandTracker());
  const animFrameRef = useRef<number | null>(null);
  const isPinchingRef = useRef(false);
  const lastClickTimeRef = useRef(0);
  const lastBackendSyncRef = useRef(0);
  const prevYRef = useRef(0);
  const configRef = useRef<HandTrackerConfig>(config);
  const lastHoveredElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  // Start or stop optical loop when enabled prop changes
  useEffect(() => {
    if (enabled) {
      startCamera();
    } else {
      stopCamera();
      setCursorPos({ x: -100, y: -100 });
      setHandDetected(false);
      setIsPinching(false);
      setIsScrolling(false);
    }

    return () => {
      stopCamera();
    };
  }, [enabled]);

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

      playToolChime();
      setGesture('ACTIVE');
      onNotify?.('Real PC Mouse Control engaged. Your hand coordinates drive the mouse pointer directly.');
      startTrackingLoop();
    } catch (err: any) {
      console.warn('Background hand tracker camera error:', err);
      setCameraError(err.message || 'Camera permission denied');
      setGesture('ERROR');
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
  };

  const startTrackingLoop = () => {
    const loop = () => {
      const video = videoRef.current;
      const canvas = processCanvasRef.current;

      if (video && canvas && video.readyState >= 2) {
        const result = trackerRef.current.processFrame(video, canvas, configRef.current);

        if (result.detected) {
          const screenX = result.fingertipX * window.innerWidth;
          const screenY = result.fingertipY * window.innerHeight;

          setCursorPos({ x: screenX, y: screenY });
          setIsPinching(result.isPinching);
          setGesture(result.gesture);
          setHandDetected(true);

          // 1. Dispatch Real DOM Mouse Events for natural hover and interaction
          dispatchRealDomMovement(screenX, screenY);

          // 2. Sync coordinates with backend PC mouse bridge
          const now = Date.now();
          if (now - lastBackendSyncRef.current > 40) {
            lastBackendSyncRef.current = now;
            syncBackendMouse('move', screenX, screenY);
          }

          // 3. Detect Scrolling Gesture (only in top/bottom edge zones to prevent erratic jumping)
          const isEdgeScrollUp = screenY < 35;
          const isEdgeScrollDown = screenY > window.innerHeight - 35;

          if ((isEdgeScrollUp || isEdgeScrollDown) && !result.isPinching) {
            setIsScrolling(true);
            const scrollDir = isEdgeScrollUp ? -10 : 10;
            window.scrollBy({ top: scrollDir, behavior: 'auto' });
            syncBackendMouse('scroll', screenX, screenY, isEdgeScrollUp ? 2 : -2);
          } else {
            setIsScrolling(false);
          }
          prevYRef.current = screenY;

          // 4. Handle Pinch Down & Real Click Dispatch (Debounced & Hysteresis-Protected)
          if (result.isPinching && !isPinchingRef.current) {
            handleRealMouseClick(screenX, screenY);
          }

          isPinchingRef.current = result.isPinching;

          // Optional Mini PIP canvas draw
          if (pipCanvasRef.current) {
            const pipCtx = pipCanvasRef.current.getContext('2d');
            if (pipCtx) {
              pipCanvasRef.current.width = 160;
              pipCanvasRef.current.height = 120;
              pipCtx.drawImage(canvas, 0, 0, 160, 120);

              // Draw detected point on PIP
              const px = (configRef.current.isMirrored ? (1 - result.fingertipX) : result.fingertipX) * 160;
              const py = result.fingertipY * 120;
              pipCtx.beginPath();
              pipCtx.arc(px, py, 6, 0, Math.PI * 2);
              pipCtx.fillStyle = result.isPinching ? '#f59e0b' : '#00e5ff';
              pipCtx.shadowColor = result.isPinching ? '#f59e0b' : '#00e5ff';
              pipCtx.shadowBlur = 8;
              pipCtx.fill();
            }
          }
        } else {
          setHandDetected(false);
          setIsPinching(false);
          setIsScrolling(false);
          setGesture('SEARCHING FOR HAND');
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  // Dispatch real native mouse movement to DOM elements under the cursor
  const dispatchRealDomMovement = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (el) {
      if (lastHoveredElementRef.current && lastHoveredElementRef.current !== el) {
        lastHoveredElementRef.current.dispatchEvent(
          new MouseEvent('mouseleave', { clientX: x, clientY: y, bubbles: true })
        );
      }
      lastHoveredElementRef.current = el;

      el.dispatchEvent(
        new MouseEvent('mousemove', { clientX: x, clientY: y, bubbles: true, cancelable: true })
      );
      el.dispatchEvent(
        new PointerEvent('pointermove', { clientX: x, clientY: y, bubbles: true, cancelable: true })
      );
    }
  };

  // Dispatch real click onto target element and sync with OS
  const handleRealMouseClick = (x: number, y: number) => {
    const now = Date.now();
    if (now - lastClickTimeRef.current < configRef.current.clickCooldownMs) return;
    lastClickTimeRef.current = now;

    playToolChime();

    // 1. Send click command to backend OS mouse controller
    syncBackendMouse('click', x, y);

    // 2. Dispatch real full synthetic mouse event chain on DOM element
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (el) {
      el.focus();

      // Pointer down
      el.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          button: 0,
        })
      );

      // Mouse down
      el.dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          button: 0,
        })
      );

      // Mouse up
      el.dispatchEvent(
        new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          button: 0,
        })
      );

      // Pointer up
      el.dispatchEvent(
        new PointerEvent('pointerup', {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          button: 0,
        })
      );

      // Native click event
      el.click();
    }
  };

  // Sync mouse events to backend PC mouse API
  const syncBackendMouse = (
    action: 'move' | 'click' | 'scroll',
    x: number,
    y: number,
    scrollAmount = 0
  ) => {
    fetch('/api/pc/mouse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, x, y, scrollAmount }),
    }).catch(() => {});
  };

  return (
    <>
      {/* Hidden processing video and canvas elements */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="hidden absolute -top-[9999px] -left-[9999px] pointer-events-none opacity-0"
      />
      <canvas
        ref={processCanvasRef}
        className="hidden absolute -top-[9999px] -left-[9999px] pointer-events-none opacity-0"
      />

      {/* Holographic Virtual Laser Arrow Pointer that follows hand across screen */}
      <HolographicVirtualCursor
        x={cursorPos.x}
        y={cursorPos.y}
        isPinching={isPinching}
        gesture={gesture}
        enabled={enabled && handDetected}
        isScrolling={isScrolling}
      />

      {/* Subtle Floating Bottom-Left Indicator Pill */}
      {enabled && (
        <div className="fixed bottom-4 left-4 z-40 flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-full border backdrop-blur-md text-[11px] font-mono flex items-center gap-2 shadow-lg transition-all ${
              handDetected
                ? isPinching
                  ? 'bg-amber-950/80 border-amber-500/80 text-amber-300 shadow-amber-500/20'
                  : 'bg-cyan-950/80 border-cyan-500/80 text-cyan-300 shadow-cyan-500/20'
                : 'bg-slate-900/80 border-slate-700 text-slate-400'
            }`}
          >
            <MousePointer
              className={`w-3.5 h-3.5 ${
                handDetected ? (isPinching ? 'text-amber-400 animate-bounce' : 'text-cyan-400') : 'text-slate-500'
              }`}
            />
            <span className="font-tech tracking-wider uppercase">
              {handDetected
                ? isPinching
                  ? 'PINCH CLICK DISPATCH'
                  : isScrolling
                  ? 'SCROLLING'
                  : 'PC MOUSE LINK ACTIVE'
                : 'LOOKING FOR HAND'}
            </span>
            <button
              onClick={() => setShowMiniPip(!showMiniPip)}
              title={showMiniPip ? 'Hide Camera PIP' : 'Show Camera PIP'}
              className="ml-1 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {showMiniPip ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Optional discreet Mini PIP preview */}
          {showMiniPip && (
            <div className="rounded-xl overflow-hidden border border-cyan-500/50 bg-black/90 p-1 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <canvas ref={pipCanvasRef} className="w-32 h-24 rounded bg-slate-950 object-cover" />
              <div className="text-[9px] text-center font-mono text-cyan-400 mt-1">
                {gesture}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
