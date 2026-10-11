import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  Scan,
  FlipHorizontal,
  SlidersHorizontal,
  Volume2,
} from 'lucide-react';

interface WebcamPreviewProps {
  stream: MediaStream | null;
  hasCamera: boolean;
  hasMic: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
  isAnswering: boolean;
  answerSeconds: number;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onOpenDeviceSettings: () => void;
}

export const WebcamPreview: React.FC<WebcamPreviewProps> = ({
  stream,
  hasCamera,
  hasMic,
  isCameraOn,
  isMicOn,
  isAnswering,
  answerSeconds,
  onToggleCamera,
  onToggleMic,
  onOpenDeviceSettings,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMirrored, setIsMirrored] = useState(true);
  const [showFramingGuide, setShowFramingGuide] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [liveVolume, setLiveVolume] = useState<number>(0);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream && isCameraOn) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.warn('Video play interrupted:', err);
      });
    }
  }, [stream, isCameraOn]);

  // Audio wave visualizer canvas
  useEffect(() => {
    if (!stream || !hasMic || !isMicOn) {
      setLiveVolume(0);
      return;
    }

    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const audioTracks = stream.getAudioTracks();

      if (audioTracks.length > 0) {
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const drawAudioBars = () => {
          analyser.getByteFrequencyData(dataArray);

          // Calculate average volume
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setLiveVolume(Math.min(100, Math.round((avg / 120) * 100)));

          // Draw on canvas if available
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              const barCount = 14;
              const barWidth = canvas.width / barCount - 2;

              for (let i = 0; i < barCount; i++) {
                const val = dataArray[i % dataArray.length] || 0;
                const barHeight = Math.max(3, (val / 255) * canvas.height);
                const x = i * (barWidth + 2);
                const y = canvas.height - barHeight;

                ctx.fillStyle = isAnswering ? '#ef4444' : '#6366f1';
                ctx.beginPath();
                ctx.roundRect(x, y, barWidth, barHeight, 2);
                ctx.fill();
              }
            }
          }

          animationFrameRef.current = requestAnimationFrame(drawAudioBars);
        };

        drawAudioBars();
      }
    } catch (e) {
      console.warn('Audio visualization initialisation:', e);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [stream, hasMic, isMicOn, isAnswering]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl flex flex-col justify-between transition-all group ${
        isAnswering ? 'ring-2 ring-rose-500/80 shadow-rose-950/20' : ''
      }`}
      style={{ aspectRatio: '16 / 10' }}
    >
      {/* Video Stream or Avatar Placeholder */}
      <div className="absolute inset-0 z-0 bg-slate-950 flex items-center justify-center overflow-hidden">
        {hasCamera && isCameraOn && stream ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-transform duration-200 ${
              isMirrored ? 'scale-x-[-1]' : 'scale-x-100'
            }`}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-slate-800 to-indigo-950 flex items-center justify-center text-indigo-300 font-bold text-2xl border border-indigo-700/60 shadow-inner">
                M2R
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-amber-400 border-2 border-slate-900" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">
                {!isCameraOn ? 'Webcam Paused' : 'Simulation Avatar Active'}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {!isCameraOn
                  ? 'Your camera is temporarily turned off'
                  : 'Live preview fallback mode is active'}
              </p>
            </div>
            {!hasCamera && (
              <button
                type="button"
                onClick={onOpenDeviceSettings}
                className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-4"
              >
                Configure hardware camera
              </button>
            )}
          </div>
        )}

        {/* Professional Framing Guide Overlay */}
        {showFramingGuide && (
          <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
            {/* Rule of thirds grid */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-white/10" />
              <div className="border-r border-white/10" />
              <div />
            </div>
            {/* Head & eye level silhouette guide */}
            <div className="w-48 h-56 rounded-[45%] border-2 border-dashed border-sky-400/40 relative flex items-center justify-center">
              <div className="absolute top-16 w-32 border-t border-sky-400/40" />
              <span className="text-[10px] text-sky-300/80 uppercase font-mono tracking-wider absolute top-12 bg-slate-950/70 px-1 rounded">
                Eye Level
              </span>
            </div>
          </div>
        )}

        {/* Ambient bottom gradient for controls readability */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none z-10" />
      </div>

      {/* Top Overlay Bar */}
      <div className="relative z-20 flex items-center justify-between p-3.5">
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {isAnswering ? (
            <div className="flex items-center gap-2 bg-rose-950/90 border border-rose-500/50 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg shadow-rose-950/30">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
              </span>
              <span className="text-xs font-semibold text-rose-100 tracking-wide">
                REC {formatTimer(answerSeconds)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 backdrop-blur-md px-2.5 py-1 rounded-md">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="text-xs font-medium text-slate-200">Mock2Real Video Studio</span>
            </div>
          )}
        </div>

        {/* Live Audio Level & Waveform Mini Canvas */}
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/80 backdrop-blur-md px-2.5 py-1 rounded-md">
          <Volume2
            className={`w-3.5 h-3.5 ${
              !isMicOn
                ? 'text-rose-400'
                : liveVolume > 20
                ? 'text-emerald-400'
                : 'text-slate-400'
            }`}
          />
          {hasMic && isMicOn ? (
            <canvas ref={canvasRef} width={60} height={14} className="h-3 w-14 rounded" />
          ) : (
            <span className="text-[11px] text-slate-400">
              {!isMicOn ? 'Mic Muted' : 'Mic Ready'}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="relative z-20 flex items-center justify-between p-3.5">
        <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-md">
          {/* Mic Toggle */}
          <button
            type="button"
            onClick={onToggleMic}
            className={`p-2 rounded-lg transition-colors ${
              isMicOn
                ? 'text-slate-200 hover:text-white hover:bg-slate-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800/80'
            }`}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
            aria-label={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          {/* Camera Toggle */}
          <button
            type="button"
            onClick={onToggleCamera}
            className={`p-2 rounded-lg transition-colors ${
              isCameraOn
                ? 'text-slate-200 hover:text-white hover:bg-slate-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800/80'
            }`}
            title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
            aria-label={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isCameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
          </button>

          {/* Mirror toggle */}
          <button
            type="button"
            onClick={() => setIsMirrored(!isMirrored)}
            className={`p-2 rounded-lg transition-colors ${
              isMirrored
                ? 'text-blue-400 bg-blue-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Mirror video"
            aria-label="Mirror video"
          >
            <FlipHorizontal className="w-4 h-4" />
          </button>

          {/* Framing Guide Toggle */}
          <button
            type="button"
            onClick={() => setShowFramingGuide(!showFramingGuide)}
            className={`p-2 rounded-lg transition-colors ${
              showFramingGuide
                ? 'text-blue-400 bg-blue-950/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle eye-level framing guide"
            aria-label="Toggle eye-level framing guide"
          >
            <Scan className="w-4 h-4" />
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md p-1 rounded-xl border border-slate-700/80 shadow-md">
          <button
            type="button"
            onClick={onOpenDeviceSettings}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Device settings & permissions"
            aria-label="Device settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Toggle fullscreen preview"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
