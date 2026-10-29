import React, { useState, useRef } from 'react';
import { Eye, Camera, Upload, Crosshair, CheckCircle2, RefreshCw } from 'lucide-react';
import { playToolChime } from '../utils/audioSfx';

interface ScreenVisionProps {
  onAnalyzeScreen: (prompt: string, imageBase64?: string) => Promise<void>;
  isAnalyzing: boolean;
}

export const ScreenVisionModule: React.FC<ScreenVisionProps> = ({
  onAnalyzeScreen,
  isAnalyzing,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [visionPrompt, setVisionPrompt] = useState('Inspect this screen and identify any errors, terminal outputs, or UI elements.');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Toggle Webcam
  const toggleWebcam = async () => {
    if (isWebcamActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsWebcamActive(true);
      } catch (err) {
        console.warn('Webcam permission not granted or device unavailable:', err);
      }
    }
  };

  // Capture frame from webcam
  const captureWebcamFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      playToolChime();
    }
  };

  // Capture Screen
  const captureDisplayScreen = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new (window as any).ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(bitmap, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      track.stop();
      playToolChime();
    } catch (e) {
      console.warn('Display screen capture cancelled or unavailable:', e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        playToolChime();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExecuteVision = async () => {
    if (isAnalyzing) return;
    playToolChime();
    await onAnalyzeScreen(visionPrompt, selectedImage || undefined);
  };

  return (
    <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-5 backdrop-blur-md shadow-xl flex flex-col gap-4">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <h3 className="font-tech text-sm tracking-wider uppercase font-semibold text-slate-200">
            Screen Vision AI & Grounding Engine (Episode 10-11)
          </h3>
        </div>
        <span className="font-code text-cyan-400 text-xs flex items-center gap-1.5">
          <Crosshair className="w-3.5 h-3.5" /> ZERO-LATENCY VISION
        </span>
      </div>

      {/* Action buttons: Screen Capture, Webcam Live, File Upload */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={captureDisplayScreen}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          Grab Active Screen
        </button>

        <button
          onClick={toggleWebcam}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all border ${
            isWebcamActive
              ? 'bg-rose-950/60 border-rose-500/60 text-rose-300'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          {isWebcamActive ? 'Stop Optical Stream' : 'Enable Optical Stream'}
        </button>

        {isWebcamActive && (
          <button
            onClick={captureWebcamFrame}
            className="px-3 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/50 text-cyan-300 rounded-lg text-xs font-mono cursor-pointer transition-all"
          >
            Snap Current Optical Frame
          </button>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 rounded-lg text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          Upload Image / Document
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Live Video / Captured Image Container */}
      <div className="relative min-h-[220px] bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
        {/* Optical video element */}
        <video
          ref={videoRef}
          className={`w-full max-h-[260px] object-cover ${isWebcamActive ? 'block' : 'hidden'}`}
          muted
        />

        {/* Selected / captured preview */}
        {!isWebcamActive && selectedImage && (
          <div className="relative w-full h-full max-h-[260px] flex items-center justify-center bg-black/60">
            <img
              src={selectedImage}
              alt="Screen inspection"
              className="max-h-[260px] object-contain"
            />
            <div className="absolute top-2 right-2 bg-slate-950/80 px-2 py-1 rounded text-[10px] font-code text-cyan-400 border border-cyan-800">
              FRAME READY FOR GEMINI
            </div>
          </div>
        )}

        {/* Empty placeholder */}
        {!isWebcamActive && !selectedImage && (
          <div className="flex flex-col items-center justify-center gap-2 text-slate-500 text-xs font-mono p-6 text-center">
            <Crosshair className="w-8 h-8 text-slate-600" />
            <span>No optical frame loaded. Click 'Grab Active Screen' or 'Upload Image'.</span>
            <span className="text-[10px] text-slate-600">
              JARVIS will run multimodal neural inspection via gemini-3.8-flash.
            </span>
          </div>
        )}

        {/* Loading overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 z-10">
            <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
            <span className="font-tech text-xs tracking-wider text-cyan-300 uppercase">
              Executing Deep Vision OCR & Grounding Inspection...
            </span>
          </div>
        )}
      </div>

      {/* Prompt and inspect trigger */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={visionPrompt}
          onChange={(e) => setVisionPrompt(e.target.value)}
          placeholder="What would you like JARVIS to inspect on this display?"
          className="flex-1 bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
        />
        <button
          onClick={handleExecuteVision}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-tech font-semibold text-xs tracking-wider uppercase rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {isAnalyzing ? 'Analyzing...' : 'Analyze Display'}
        </button>
      </div>
    </div>
  );
};
