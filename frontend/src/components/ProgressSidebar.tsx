import React from 'react';
import {
  CheckCircle2,
  Circle,
  Radio,
  BarChart2,
  ChevronRight,
} from 'lucide-react';
import { InterviewQuestion } from '../types/interview';

interface ProgressSidebarProps {
  questions: InterviewQuestion[];
  currentIndex: number;
  isAnswering: boolean;
  totalElapsedTime: number;
  onSelectQuestion: (index: number) => void;
  onViewReport: () => void;
}

export const ProgressSidebar: React.FC<ProgressSidebarProps> = ({
  questions,
  currentIndex,
  isAnswering,
  totalElapsedTime,
  onSelectQuestion,
  onViewReport,
}) => {
  const answeredCount = questions.filter((q) => q.status === 'answered').length;
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  const formatSeconds = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder.toString().padStart(2, '0')}s`;
  };

  const totalAnsweredSeconds = questions.reduce(
    (acc, q) => acc + (q.recordedDurationSeconds || 0),
    0
  );
  const avgAnswerTime =
    answeredCount > 0 ? Math.round(totalAnsweredSeconds / answeredCount) : 0;

  return (
    <aside className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col justify-between text-slate-900 h-full">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Session Progress</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {answeredCount} of {questions.length} questions completed
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-[#4F46E5]">
            {progressPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
            <div
              className="h-full bg-[#4F46E5] transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(4, progressPercent)}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>Question {currentIndex + 1} active</span>
            <span>{questions.length - answeredCount} remaining</span>
          </div>
        </div>

        {/* Question List */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {questions.map((q, idx) => {
            const isActive = idx === currentIndex;
            const isCurrentlyRecording = isActive && isAnswering;
            const isAnswered = q.status === 'answered';

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => !isAnswering && onSelectQuestion(idx)}
                disabled={isAnswering}
                className={`w-full text-left p-3 rounded-xl transition-all border flex items-start justify-between gap-2.5 ${
                  isActive
                    ? 'bg-indigo-50/80 border-indigo-300 shadow-xs'
                    : isAnswered
                    ? 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/70 hover:border-slate-300'
                    : 'bg-white border-slate-100 opacity-70 hover:opacity-100 hover:bg-slate-50'
                } ${isAnswering ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  {/* Status Indicator Icon */}
                  <div className="mt-0.5 shrink-0">
                    {isCurrentlyRecording ? (
                      <span className="relative flex h-3.5 w-3.5 mt-0.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600" />
                      </span>
                    ) : isAnswered ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : isActive ? (
                      <Radio className="w-4 h-4 text-[#4F46E5] animate-pulse" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-300" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                      <span className="font-semibold text-slate-700">Q{idx + 1}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{q.category.split(' ')[0]}</span>
                    </div>
                    <p
                      className={`text-xs font-semibold truncate mt-0.5 ${
                        isActive ? 'text-[#4F46E5]' : 'text-slate-800'
                      }`}
                    >
                      {q.title}
                    </p>
                  </div>
                </div>

                {/* Duration or status tag */}
                <div className="shrink-0 text-right">
                  {isCurrentlyRecording ? (
                    <span className="text-[10px] font-mono text-rose-600 font-bold uppercase animate-pulse">
                      REC
                    </span>
                  ) : isAnswered && q.recordedDurationSeconds ? (
                    <span className="text-[11px] font-mono text-emerald-600 font-medium">
                      {q.recordedDurationSeconds}s
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-slate-400">
                      ~{q.recommendedMinutes}m
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Session Stats Widget */}
      <div className="pt-4 border-t border-slate-100 space-y-3 mt-4">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">
              Elapsed Time
            </span>
            <p className="text-sm font-mono font-bold text-slate-800 mt-0.5">
              {formatSeconds(totalElapsedTime)}
            </p>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">
              Avg Answer
            </span>
            <p className="text-sm font-mono font-bold text-slate-800 mt-0.5">
              {avgAnswerTime > 0 ? `${avgAnswerTime}s` : '--'}
            </p>
          </div>
        </div>

        {/* View Evaluation Report Preview button */}
        <button
          type="button"
          onClick={onViewReport}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition-colors cursor-pointer"
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Evaluation Report Preview</span>
          <ChevronRight className="w-3 h-3 ml-auto text-indigo-600" />
        </button>
      </div>
    </aside>
  );
};
