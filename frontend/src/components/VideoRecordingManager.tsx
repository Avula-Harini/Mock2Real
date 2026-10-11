import React, { useRef, useState, useEffect } from 'react';
import {
  Video,
  Play,
  Square,
  Download,
  RotateCcw,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle2,
  Clock,
  Film,
  HardDrive,
  Trash2,
} from 'lucide-react';
import { RecordedVideoItem } from '../types/history';

export interface VideoRecordingManagerProps {
  questionId: string;
  questionNumber: number;
  questionTitle: string;
  isAnswering: boolean;
  recordingItem?: RecordedVideoItem | null;
  onSaveRecording?: (item: RecordedVideoItem) => void;
  onDeleteRecording?: (questionId: string) => void;
  className?: string;
}

export const VideoRecordingManager: React.FC<VideoRecordingManagerProps> = ({
  questionId,
  questionNumber,
  questionTitle,
  isAnswering,
  recordingItem,
  onSaveRecording,
  onDeleteRecording,
  className = '',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const videoElemRef = useRef<HTMLVideoElement>(null);

  // Generate object URL for video preview if blob is present and no url yet
  const [videoUrl, setVideoUrl] = useState<string | null>(recordingItem?.blobUrl || null);

  useEffect(() => {
    if (recordingItem?.blob) {
      const url = URL.createObjectURL(recordingItem.blob);
      setVideoUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (recordingItem?.blobUrl) {
      setVideoUrl(recordingItem.blobUrl);
    } else {
      setVideoUrl(null);
    }
  }, [recordingItem?.blob, recordingItem?.blobUrl]);

  const handleDownload = () => {
    if (!videoUrl && !recordingItem?.blob) return;
    setDownloading(true);

    try {
      const a = document.createElement('a');
      a.href = videoUrl || (recordingItem?.blob ? URL.createObjectURL(recordingItem.blob) : '');
      a.download = `Mock2Real_Q${questionNumber}_${questionId.replace(/[^a-z0-9]/gi, '_')}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download video error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const handlePlayToggle = () => {
    if (!videoElemRef.current) return;
    if (isPlaying) {
      videoElemRef.current.pause();
      setIsPlaying(false);
    } else {
      videoElemRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Playback error:', err);
      });
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 KB';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (secs?: number) => {
    if (!secs) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#4F46E5] flex items-center justify-center shrink-0">
            <Film className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Question {questionNumber} Answer Video</span>
              {isAnswering ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                  RECORDING NOW
                </span>
              ) : videoUrl ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  SAVED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                  Ready to Record
                </span>
              )}
            </h4>
            <p className="text-[11px] text-slate-500">
              Webcam video synchronized with microphone audio during answer session
            </p>
          </div>
        </div>

        {/* Action buttons if video recorded */}
        {videoUrl && !isAnswering && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handlePlayToggle}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isPlaying ? 'Pause' : 'Play Recording'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border border-slate-200"
              title="Download recording as .webm file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Video</span>
            </button>

            {onDeleteRecording && (
              <button
                type="button"
                onClick={() => onDeleteRecording(questionId)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Discard this question's recording"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Video preview area or status indicator */}
      {isAnswering ? (
        <div className="mt-3 p-4 rounded-xl bg-rose-50/70 border border-rose-200 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <span className="font-semibold">
              Capturing video and microphone audio for Question {questionNumber}...
            </span>
          </div>
          <span className="text-[11px] text-rose-600 font-mono">
            Click 'Stop Answer' when done
          </span>
        </div>
      ) : videoUrl ? (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          {/* Video player */}
          <div className="md:col-span-2 relative rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center">
            <video
              ref={videoElemRef}
              src={videoUrl}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              muted={isMuted}
              controls
              className="w-full h-full object-cover"
            />
          </div>

          {/* Metadata pill */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-600">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-[#4F46E5]" />
              Recording Details
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Duration:</span>
              <span className="font-mono font-medium text-slate-800">{formatDuration(recordingItem?.durationSeconds)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">File Size:</span>
              <span className="font-mono font-medium text-slate-800">{formatFileSize(recordingItem?.sizeBytes)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-500">Format:</span>
              <span className="font-mono text-slate-700">{recordingItem?.mimeType || 'video/webm'}</span>
            </div>
            <div className="pt-1 text-[10px] text-slate-400 leading-tight">
              Stored locally in IndexedDB. Use Download Video to export.
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 py-3 px-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-slate-400" />
            <span>No video recorded yet for Question {questionNumber}.</span>
          </div>
          <span className="text-[11px] text-indigo-600 font-medium">
            Starts automatically when you click 'Start Answer'
          </span>
        </div>
      )}
    </div>
  );
};
