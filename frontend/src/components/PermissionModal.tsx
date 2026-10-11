import React, { useEffect, useRef, useState } from 'react';
import { Camera, Mic, CheckCircle2, AlertCircle, X, Volume2 } from 'lucide-react';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  stream: MediaStream | null;
  hasCamera: boolean;
  hasMic: boolean;
  onRequestPermissions: () => Promise<void>;
  permissionError: string | null;
}

export const PermissionModal: React.FC<PermissionModalProps> = ({
  isOpen,
  onClose,
  stream,
  hasCamera,
  hasMic,
  onRequestPermissions,
  permissionError,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen && videoRef.current && stream && hasCamera) {
      videoRef.current.srcObject = stream;
    }
  }, [isOpen, stream, hasCamera]);

  // Audio meter
  useEffect(() => {
    if (!isOpen || !stream || !hasMic) {
      setAudioLevel(0);
      return;
    }

    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = audioContext;
      const audioTracks = stream.getAudioTracks();

      if (audioTracks.length > 0) {
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateMeter = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const average = sum / dataArray.length;
          const level = Math.min(100, Math.round((average / 128) * 100));
          setAudioLevel(level);
          animationFrameRef.current = requestAnimationFrame(updateMeter);
        };

        updateMeter();
      }
    } catch (e) {
      console.warn('Audio metering error in modal:', e);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isOpen, stream, hasMic]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 no-print print:hidden">
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div>
            <h3 className="text-base font-bold text-slate-900">Audio & Video Readiness Check</h3>
            <p className="text-xs text-slate-500 mt-0.5">Verify your camera framing and microphone input before starting.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close device check"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {permissionError && (
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Device Permission Notice</p>
                <p className="text-xs text-rose-700 mt-1">{permissionError}</p>
                <p className="text-xs text-slate-600 mt-2">
                  You can still practice in simulation mode if your browser restricts live camera access.
                </p>
              </div>
            </div>
          )}

          {/* Video Preview Box */}
          <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">
            {hasCamera && stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="text-sm font-semibold text-slate-200">Camera preview unavailable</p>
                <button
                  type="button"
                  onClick={onRequestPermissions}
                  className="px-4 py-2 text-xs font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Request Permissions Now
                </button>
              </div>
            )}

            {/* Video overlay badge */}
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-md text-xs border border-white/10">
              <span className={`w-2 h-2 rounded-full ${hasCamera ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-100 font-medium">{hasCamera ? 'Webcam Online' : 'Simulation Mode'}</span>
            </div>
          </div>

          {/* Device Checklist & Audio Meter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Camera Status */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Camera className="w-4 h-4 text-[#4F46E5]" />
                  <span>Video Input</span>
                </div>
                {hasCamera ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                  </span>
                ) : (
                  <span className="text-xs text-amber-600 font-medium">Simulation</span>
                )}
              </div>
              <p className="text-xs text-slate-500">Face forward, centered framing recommended.</p>
            </div>

            {/* Microphone Status & Live Meter */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Mic className="w-4 h-4 text-[#4F46E5]" />
                  <span>Microphone Input</span>
                </div>
                {hasMic ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Detected
                  </span>
                ) : (
                  <span className="text-xs text-amber-600 font-medium">Simulation</span>
                )}
              </div>

              {/* Audio meter bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1 font-sans">
                    <Volume2 className="w-3 h-3 text-slate-400" />
                    Input Level
                  </span>
                  <span>{audioLevel}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-75 rounded-full ${
                      audioLevel > 70
                        ? 'bg-rose-500'
                        : audioLevel > 20
                        ? 'bg-emerald-500'
                        : 'bg-[#4F46E5]'
                    }`}
                    style={{ width: `${Math.max(5, audioLevel)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <p className="text-xs text-slate-500">
            Audio/video streams stay private in your browser session.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            I'm Ready to Interview
          </button>
        </div>
      </div>
    </div>
  );
};
