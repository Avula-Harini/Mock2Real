import React, { useState, useEffect } from 'react';
import {
  History,
  Calendar,
  Clock,
  Award,
  Trash2,
  Eye,
  RotateCcw,
  Film,
  AlertTriangle,
  Download,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
  Play,
  FileText,
} from 'lucide-react';
import { SavedInterviewAttempt } from '../types/history';
import { getAllAttemptsFromDB, deleteAttemptFromDB, getVideoBlobFromDB } from '../utils/indexedDBHelper';
import { DailyImprovementChart } from './DailyImprovementChart';

export interface InterviewHistoryViewProps {
  onSelectAttemptForReport: (attempt: SavedInterviewAttempt) => void;
  onCompareAttempts: (attemptA: SavedInterviewAttempt, attemptB?: SavedInterviewAttempt) => void;
  onBackToStudio: () => void;
  currentAttempt?: SavedInterviewAttempt | null;
}

export const InterviewHistoryView: React.FC<InterviewHistoryViewProps> = ({
  onSelectAttemptForReport,
  onCompareAttempts,
  onBackToStudio,
}) => {
  const [attempts, setAttempts] = useState<SavedInterviewAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [activeVideoPreview, setActiveVideoPreview] = useState<{
    attemptId: string;
    questionId: string;
    blobUrl: string;
    title: string;
  } | null>(null);

  const loadAttempts = async () => {
    setLoading(true);
    try {
      const stored = await getAllAttemptsFromDB();
      setAttempts(stored);
    } catch (err) {
      console.error('Failed to load history from IndexedDB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttempts();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this interview attempt and its local video recordings?')) {
      return;
    }
    try {
      await deleteAttemptFromDB(id);
      setAttempts((prev) => prev.filter((a) => a.id !== id));
      setSelectedForComparison((prev) => prev.filter((item) => item !== id));
    } catch (err) {
      console.error('Failed to delete attempt:', err);
    }
  };

  const handleToggleComparisonSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedForComparison((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) {
        // Replace second item
        return [prev[0], id];
      }
      return [...prev, id];
    });
  };

  const handleTriggerCompare = () => {
    if (selectedForComparison.length === 2) {
      const attA = attempts.find((a) => a.id === selectedForComparison[0]);
      const attB = attempts.find((a) => a.id === selectedForComparison[1]);
      if (attA && attB) {
        onCompareAttempts(attA, attB);
      }
    }
  };

  const handlePreviewVideo = async (attempt: SavedInterviewAttempt, questionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const blob = await getVideoBlobFromDB(attempt.id, questionId);
      if (blob) {
        const url = URL.createObjectURL(blob);
        setActiveVideoPreview({
          attemptId: attempt.id,
          questionId,
          blobUrl: url,
          title: `${attempt.roleTitle} - Q${questionId}`,
        });
      } else {
        alert('Video recording not found or storage was cleared.');
      }
    } catch (err) {
      console.error('Failed to preview video:', err);
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    return `${mins} min${mins === 1 ? '' : 's'}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] font-mono">
              Session Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Interview History & Practice Attempts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review past mock interviews, re-open evaluation reports, replay recorded responses, and track your progression over time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedForComparison.length === 2 && (
            <button
              type="button"
              onClick={handleTriggerCompare}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Compare Selected (2)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBackToStudio}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Back to Studio</span>
          </button>
        </div>
      </div>

      {/* Local Storage Transparency Callout (Requirement 3.5 & 3.6) */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Local Device Storage Notice:</span> All interview attempts and video recordings are stored securely in your browser's local <span className="font-mono font-semibold">IndexedDB</span> storage. No videos or private answers are uploaded to external cloud servers without your explicit connection. Please note that clearing your browser cache or switching devices will reset this history.
        </div>
      </div>

      {/* Day-by-Day Improvement Analytics Dashboard */}
      <DailyImprovementChart
        attempts={attempts}
        onSelectAttempt={(att) => onSelectAttemptForReport(att)}
      />

      {/* Video Modal Preview if opened */}
      {activeVideoPreview && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Film className="w-4 h-4 text-[#4F46E5]" />
                {activeVideoPreview.title}
              </h3>
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(activeVideoPreview.blobUrl);
                  setActiveVideoPreview(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
              <video
                src={activeVideoPreview.blobUrl}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <a
                href={activeVideoPreview.blobUrl}
                download="interview_response.webm"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download Video
              </a>
            </div>
          </div>
        </div>
      )}

      {/* History List or Empty State */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <Clock className="w-8 h-8 animate-spin mx-auto text-[#4F46E5] mb-2" />
          <p className="text-sm font-medium">Loading your saved interview history...</p>
        </div>
      ) : attempts.length === 0 ? (
        <div className="py-16 px-6 bg-white border border-dashed border-slate-300 rounded-3xl text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
            <History className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            No Saved Interview Attempts Yet
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            When you complete an interview session and view the Final Report, your attempt and recorded responses are saved here for review and comparison.
          </p>
          <button
            type="button"
            onClick={onBackToStudio}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start an Interview Practice Now</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
            <span>{attempts.length} Attempt{attempts.length === 1 ? '' : 's'} recorded</span>
            <span className="italic">Select any 2 attempts to unlock side-by-side comparison</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {attempts.map((attempt) => {
              const isSelected = selectedForComparison.includes(attempt.id);
              const videoCount = attempt.videoRecordings ? Object.keys(attempt.videoRecordings).length : 0;

              return (
                <div
                  key={attempt.id}
                  className={`bg-white border rounded-2xl p-5 sm:p-6 transition-all duration-150 shadow-xs hover:border-indigo-300 flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                    isSelected ? 'ring-2 ring-[#4F46E5] border-transparent bg-indigo-50/20' : 'border-slate-200'
                  }`}
                >
                  {/* Left Column: Attempt metadata */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        {attempt.roleTitle}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-[#4F46E5] border border-indigo-100">
                        {attempt.verdict}
                      </span>
                      {attempt.isDemoMode && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          Demo Data
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {attempt.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatDuration(attempt.durationSeconds)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        {attempt.questionsAnsweredCount} of {attempt.totalQuestionsCount} questions
                      </span>
                      {videoCount > 0 && (
                        <span className="flex items-center gap-1.5 text-indigo-600 font-medium">
                          <Film className="w-3.5 h-3.5" />
                          {videoCount} Video Response{videoCount === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>

                    {/* Video thumbnails or replay links */}
                    {videoCount > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {Object.keys(attempt.videoRecordings || {}).map((qId, idx) => (
                          <button
                            key={qId}
                            type="button"
                            onClick={(e) => handlePreviewVideo(attempt, qId, e)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-700 text-[11px] font-medium transition-colors cursor-pointer border border-slate-200"
                            title="Replay candidate answer video"
                          >
                            <Play className="w-3 h-3 text-[#4F46E5]" />
                            <span>Replay Q{idx + 1}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Middle Column: Score Badge */}
                  <div className="flex items-center gap-4 shrink-0 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-extrabold text-[#4F46E5] font-mono leading-none">
                        {attempt.overallScore}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                        Score / 100
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    {/* Select for comparison checkbox/button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleComparisonSelect(attempt.id, e)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#4F46E5] text-white border-transparent shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>{isSelected ? 'Selected' : 'Compare'}</span>
                    </button>

                    {/* View Report */}
                    <button
                      type="button"
                      onClick={() => onSelectAttemptForReport(attempt)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] rounded-xl text-xs font-bold transition-colors cursor-pointer border border-indigo-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Report</span>
                    </button>

                    {/* Delete Attempt */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(attempt.id, e)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete attempt from local history"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
