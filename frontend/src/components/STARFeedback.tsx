import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Target,
  Layers,
  ChevronRight,
  TrendingUp,
  Brain,
  HelpCircle,
  AlertCircle,
  FileText,
  Compass,
  CheckSquare,
  Zap,
  Flame,
} from 'lucide-react';
import {
  STARFeedbackData,
  STARSectionFeedback,
  STARSectionKey,
  STARRating,
} from '../types/star';
import { DEMO_STAR_FEEDBACK_DATA } from '../data/mockSTARFeedback';

export interface STARFeedbackProps {
  /**
   * Real STAR evaluation data passed from the backend (Member 3 / Member 4).
   * When null or undefined and isDemoMode is false, displays "Analysis pending".
   */
  data?: STARFeedbackData | null;
  /**
   * If true, displays clearly labelled sample scores for UI testing and demonstration.
   */
  isDemoMode?: boolean;
  /**
   * Optional callback triggered when demo mode is toggled.
   */
  onToggleDemoMode?: (enabled: boolean) => void;
  /**
   * Whether to display the interactive demo mode toggle switch in the UI.
   * Defaults to true.
   */
  showDemoToggle?: boolean;
  /**
   * Custom CSS classes for the container.
   */
  className?: string;
  /**
   * Context description (e.g., "Full Interview Aggregate" or "Question 1 Focus").
   */
  contextTitle?: string;
}

const SECTION_CONFIG: Record<
  STARSectionKey,
  {
    letter: string;
    label: string;
    icon: React.FC<{ className?: string }>;
    accentColor: string;
    borderAccent: string;
    bgAccent: string;
    badgeBg: string;
    badgeText: string;
    barColor: string;
  }
> = {
  situation: {
    letter: 'S',
    label: 'Situation',
    icon: Compass,
    accentColor: 'text-indigo-600',
    borderAccent: 'border-indigo-200',
    bgAccent: 'bg-indigo-50/50',
    badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    badgeText: 'text-indigo-700',
    barColor: 'bg-[#4F46E5]',
  },
  task: {
    letter: 'T',
    label: 'Task',
    icon: CheckSquare,
    accentColor: 'text-amber-600',
    borderAccent: 'border-amber-200',
    bgAccent: 'bg-amber-50/50',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    badgeText: 'text-amber-700',
    barColor: 'bg-amber-500',
  },
  action: {
    letter: 'A',
    label: 'Action',
    icon: Zap,
    accentColor: 'text-violet-600',
    borderAccent: 'border-violet-200',
    bgAccent: 'bg-violet-50/50',
    badgeBg: 'bg-violet-100 text-violet-800 border-violet-200',
    badgeText: 'text-violet-700',
    barColor: 'bg-violet-600',
  },
  result: {
    letter: 'R',
    label: 'Result',
    icon: Award,
    accentColor: 'text-emerald-600',
    borderAccent: 'border-emerald-200',
    bgAccent: 'bg-emerald-50/50',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    badgeText: 'text-emerald-700',
    barColor: 'bg-emerald-500',
  },
};

const getRatingBadge = (rating?: STARRating) => {
  switch (rating) {
    case 'exceptional':
      return {
        label: 'Exceptional',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-300',
      };
    case 'proficient':
      return {
        label: 'Proficient',
        className: 'bg-indigo-50 text-indigo-700 border-indigo-300',
      };
    case 'adequate':
      return {
        label: 'Adequate',
        className: 'bg-amber-50 text-amber-700 border-amber-300',
      };
    case 'needs_work':
      return {
        label: 'Needs Growth',
        className: 'bg-rose-50 text-rose-700 border-rose-300',
      };
    default:
      return {
        label: 'Evaluated',
        className: 'bg-slate-100 text-slate-700 border-slate-300',
      };
  }
};

export const STARFeedback: React.FC<STARFeedbackProps> = ({
  data,
  isDemoMode = false,
  onToggleDemoMode,
  showDemoToggle = true,
  className = '',
  contextTitle,
}) => {
  const [internalDemoMode, setInternalDemoMode] = useState<boolean>(isDemoMode);
  const [activeTab, setActiveTab] = useState<'all' | STARSectionKey>('all');

  const demoActive = onToggleDemoMode ? isDemoMode : internalDemoMode;

  const handleToggle = (checked: boolean) => {
    if (onToggleDemoMode) {
      onToggleDemoMode(checked);
    } else {
      setInternalDemoMode(checked);
    }
  };

  // Determine active dataset: Real data takes priority if provided;
  // If no real data, demo data is only used if demoActive is true.
  const activeData: STARFeedbackData | null = data
    ? data
    : demoActive
    ? DEMO_STAR_FEEDBACK_DATA
    : null;

  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6 print:shadow-none print:p-0 print:border-none ${className}`}
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4F46E5] border border-indigo-200 flex items-center justify-center font-bold text-sm">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                STAR-Method Behavioral Feedback
                {activeData && activeData.source === 'demo_sample' && (
                  <span className="no-print text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold uppercase tracking-wider">
                    Demo Mode · Sample Scores
                  </span>
                )}
                {activeData && activeData.source === 'backend_evaluation' && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Backend Data
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {contextTitle ||
                  'Structured behavioral breakdown of Situation, Task, Action, and Result.'}
              </p>
            </div>
          </div>
        </div>

        {/* Demo Mode Toggle (for testing frontend before Member 3 & 4 backend is connected) */}
        {showDemoToggle && (
          <div className="flex items-center gap-2 self-start sm:self-center no-print print:hidden bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-medium text-slate-700">Sample Demo:</span>
            <button
              type="button"
              role="switch"
              aria-checked={demoActive}
              onClick={() => handleToggle(!demoActive)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                demoActive ? 'bg-[#4F46E5]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  demoActive ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-[11px] font-mono font-bold ${
                demoActive ? 'text-[#4F46E5]' : 'text-slate-400'
              }`}
            >
              {demoActive ? 'ON' : 'OFF'}
            </span>
          </div>
        )}
      </div>

      {/* When data is NOT available and NOT in demo mode -> Display "Analysis pending" */}
      {!activeData ? (
        <div className="py-10 px-6 bg-slate-50/70 border border-dashed border-slate-300 rounded-2xl text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 text-[#4F46E5] border border-indigo-200 flex items-center justify-center animate-pulse">
            <Clock className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-xs font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Analysis pending
            </div>
            <h4 className="text-sm font-bold text-slate-800 mt-2">
              Awaiting Backend STAR Evaluation
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              STAR-Method behavioral scores and breakdown are pending Member 3 & Member 4's
              NLP evaluation pipeline. Once completed, scores for Situation, Task, Action,
              and Result will populate here automatically.
            </p>
          </div>

          <div className="pt-2 no-print print:hidden">
            <button
              type="button"
              onClick={() => handleToggle(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Preview Demo Sample Scores</span>
            </button>
          </div>
        </div>
      ) : (
        /* Data is available (or Demo Mode enabled) */
        <div className="space-y-6">
          {/* Clearly labelled demo mode warning banner if sample data */}
          {activeData.source === 'demo_sample' && (
            <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-xl flex items-start sm:items-center justify-between gap-3 text-xs text-amber-900 no-print print:hidden">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Demo Mode Active:</strong> Displaying clearly labelled sample scores.
                  Frontend displays received data without calculating scores.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle(false)}
                className="text-[11px] font-bold text-amber-800 underline underline-offset-2 shrink-0 hover:text-amber-950 cursor-pointer"
              >
                Show Pending State
              </button>
            </div>
          )}

          {/* Overall STAR-Method Score Banner */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-indigo-900/50 print:bg-white print:text-slate-900 print:border print:border-slate-300 print:shadow-none">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left score highlight */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="relative flex items-center justify-center shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center print:border-slate-300 print:bg-slate-50">
                    {/* Read directly from activeData.overallScore without computing */}
                    <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white print:text-slate-900">
                      {activeData.overallScore}
                    </span>
                    <span className="text-[10px] font-mono text-indigo-200 print:text-slate-500 uppercase">
                      OUT OF 100
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-indigo-300 print:text-slate-600 uppercase tracking-wider font-semibold">
                      Overall STAR Methodology Score
                    </span>
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                        getRatingBadge(activeData.rating).className
                      }`}
                    >
                      {getRatingBadge(activeData.rating).label}
                    </span>
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold tracking-tight text-white print:text-slate-900">
                    {activeData.verdict}
                  </h4>
                  <p className="text-xs text-indigo-100/90 print:text-slate-600 max-w-xl leading-relaxed">
                    {activeData.summary}
                  </p>
                </div>
              </div>

              {/* Right mini stage overview pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-6 print:border-slate-200 print:border-t lg:print:border-t-0">
                {(['situation', 'task', 'action', 'result'] as STARSectionKey[]).map((key) => {
                  const sec = activeData[key];
                  const cfg = SECTION_CONFIG[key];
                  return (
                    <div
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className="bg-white/10 hover:bg-white/15 print:bg-slate-50 border border-white/15 print:border-slate-200 rounded-xl p-2.5 text-center cursor-pointer transition-colors"
                      title={`View ${cfg.label} details`}
                    >
                      <span className="text-[10px] font-mono font-bold text-indigo-200 print:text-slate-500 block uppercase">
                        {cfg.label}
                      </span>
                      {/* Read directly from sec.score without computing */}
                      <span className="text-base sm:text-lg font-extrabold text-white print:text-slate-900 block mt-0.5">
                        {sec.score}%
                      </span>
                      <span className="text-[9px] font-mono text-indigo-300/80 print:text-slate-500 block uppercase truncate">
                        {sec.rating}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Section Filter Tabs (Hidden in print) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-print print:hidden">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-colors cursor-pointer shrink-0 ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All 4 Stages
            </button>
            {(['situation', 'task', 'action', 'result'] as STARSectionKey[]).map((key) => {
              const cfg = SECTION_CONFIG[key];
              const sec = activeData[key];
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-[#4F46E5] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span className="font-bold">{cfg.letter}</span>
                  <span>{cfg.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {sec.score}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Four Feedback Section Cards: Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 print:grid-cols-2 print:gap-4">
            {(['situation', 'task', 'action', 'result'] as STARSectionKey[]).map((key) => {
              const sec = activeData[key];
              const cfg = SECTION_CONFIG[key];
              const Icon = cfg.icon;
              const isFilteredOut = activeTab !== 'all' && activeTab !== key;

              return (
                <div
                  key={key}
                  className={`border border-slate-200 rounded-2xl p-5 shadow-2xs transition-all space-y-4 print:shadow-none break-inside-avoid print-avoid-break ${
                    isFilteredOut ? 'hidden print:block' : 'block'
                  } bg-white`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm border ${cfg.borderAccent} ${cfg.bgAccent} ${cfg.accentColor}`}
                      >
                        {cfg.letter}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                            {sec.title}
                          </h4>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                              getRatingBadge(sec.rating).className
                            }`}
                          >
                            {getRatingBadge(sec.rating).label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{sec.subtitle}</p>
                      </div>
                    </div>

                    {/* Section Score Display (Read directly from data payload) */}
                    <div className="text-right shrink-0 font-mono">
                      <span className="text-xl font-extrabold text-slate-900">
                        {sec.score}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium ml-0.5">/100</span>
                    </div>
                  </div>

                  {/* Modern Score Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>Proficiency Level</span>
                      <span className="font-bold text-slate-700">{sec.score}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/70 relative">
                      <div
                        className={`h-full ${cfg.barColor} rounded-full transition-all duration-700 ease-out`}
                        style={{ width: `${sec.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Summary commentary */}
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {sec.summary}
                  </p>

                  {/* Strengths */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Strengths Demonstrated</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {sec.strengths.map((str, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvement Suggestions */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
                      <Target className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>Improvement Suggestions</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {sec.improvements.map((imp, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-2 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Signals Identified Tags */}
                  {sec.keySignals && sec.keySignals.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {sec.keySignals.map((signal, sigIdx) => (
                        <span
                          key={sigIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-mono border border-slate-200"
                        >
                          ✓ {signal}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
