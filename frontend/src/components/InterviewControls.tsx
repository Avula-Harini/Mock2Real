import React from 'react';
import {
  Play,
  Square,
  ChevronRight,
  ChevronLeft,
  Flag,
  RotateCcw,
} from 'lucide-react';

interface InterviewControlsProps {
  interviewStatus: 'idle' | 'in_progress' | 'completed';
  isAnswering: boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
  isLastQuestion: boolean;
  onStartInterview: () => void;
  onStartAnswer: () => void;
  onStopAnswer: () => void;
  onNextQuestion: () => void;
  onPrevQuestion: () => void;
  onEndInterview: () => void;
  onResetInterview: () => void;
}

export const InterviewControls: React.FC<InterviewControlsProps> = ({
  interviewStatus,
  isAnswering,
  canGoNext,
  canGoPrev,
  isLastQuestion,
  onStartInterview,
  onStartAnswer,
  onStopAnswer,
  onNextQuestion,
  onPrevQuestion,
  onEndInterview,
  onResetInterview,
}) => {
  if (interviewStatus === 'idle') {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Ready to begin your practice?</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ensure your webcam and microphone are active. You can answer each question at your own pace.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onStartInterview}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-indigo-500/20 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Interview Session</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 lg:p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Side: Navigation between questions */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-start">
          <button
            type="button"
            onClick={onPrevQuestion}
            disabled={!canGoPrev || isAnswering}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-slate-200 cursor-pointer"
            title="Previous Question"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            type="button"
            onClick={onNextQuestion}
            disabled={!canGoNext || isAnswering}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-slate-200 cursor-pointer"
            title="Next Question"
          >
            <span className="hidden sm:inline">{isLastQuestion ? 'Review Summary' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Core Recording Action Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
          {!isAnswering ? (
            <button
              type="button"
              onClick={onStartAnswer}
              className="flex items-center justify-center gap-2.5 px-7 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-600/25 transition-all duration-150 active:scale-95 group w-full sm:w-auto cursor-pointer"
            >
              <span className="w-3 h-3 rounded-full bg-white group-hover:scale-110 transition-transform" />
              <span>Start Answer</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStopAnswer}
              className="flex items-center justify-center gap-2.5 px-7 py-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-500 font-bold text-sm rounded-xl shadow-md shadow-rose-950/10 transition-all duration-150 active:scale-95 animate-pulse w-full sm:w-auto cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
              <span>Stop Answer</span>
            </button>
          )}
        </div>

        {/* Right Side: End Interview & Reset */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onResetInterview}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
            title="Restart interview session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onEndInterview}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-rose-700 bg-slate-50 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200 hover:border-rose-200 cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>End Interview</span>
          </button>
        </div>
      </div>
    </div>
  );
};
