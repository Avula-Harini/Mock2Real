import React, { useState } from 'react';
import {
  Shirt,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  HelpCircle,
  TrendingUp,
  Layers,
  ChevronRight,
  ShieldCheck,
  Camera,
  Sun,
  Award,
  Sliders,
  Check
} from 'lucide-react';
import { OutfitFeedbackData, OutfitIndicatorDetail, OutfitIndicatorKey } from '../types/outfit';
import { DEMO_OUTFIT_FEEDBACK_DATA } from '../data/mockOutfitFeedback';

export interface OutfitFeedbackProps {
  /**
   * Real outfit analysis data from Member 3's backend.
   * If null/undefined, panel displays "Analysis pending".
   */
  data?: OutfitFeedbackData | null;
  /**
   * Controls whether clearly labelled Demo Mode is active.
   * Defaults to false (shows "Analysis pending" unless sample demo is enabled).
   */
  isDemoMode?: boolean;
  /**
   * Callback when the user toggles Demo Mode.
   */
  onToggleDemoMode?: (enabled: boolean) => void;
  /**
   * Optional custom container styling.
   */
  className?: string;
  /**
   * Optional context subtitle or note.
   */
  contextTitle?: string;
}

export const OutfitFeedback: React.FC<OutfitFeedbackProps> = ({
  data = null,
  isDemoMode = false,
  onToggleDemoMode,
  className = '',
  contextTitle = 'Objective attire and presentation analysis for interview video calls.',
}) => {
  const [internalDemoMode, setInternalDemoMode] = useState<boolean>(isDemoMode);
  const [selectedIndicator, setSelectedIndicator] = useState<OutfitIndicatorKey | 'all'>('all');

  const demoActive = onToggleDemoMode ? isDemoMode : internalDemoMode;

  const handleToggle = () => {
    const nextVal = !demoActive;
    if (onToggleDemoMode) {
      onToggleDemoMode(nextVal);
    } else {
      setInternalDemoMode(nextVal);
    }
  };

  // Real backend data takes priority; if none and demo active, show sample data
  const activeData: OutfitFeedbackData | null = data || (demoActive ? DEMO_OUTFIT_FEEDBACK_DATA : null);
  const isPending = !activeData;

  // Color helper for indicator ratings
  const getScoreColor = (score: number) => {
    if (score >= 88) return { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500' };
    if (score >= 75) return { text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', bar: 'bg-indigo-500' };
    if (score >= 60) return { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-500' };
    return { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', bar: 'bg-rose-500' };
  };

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm transition-all duration-200 ${className}`}>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0 mt-0.5">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Outfit & Professional Appearance Feedback
              </h3>
              {demoActive && !data && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  DEMO MODE (SAMPLE SCORES)
                </span>
              )}
              {data && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  BACKEND VERIFIED
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                  <Clock className="w-3 h-3 animate-spin text-slate-400" />
                  Analysis pending
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {contextTitle}
            </p>
          </div>
        </div>

        {/* Demo Mode Toggle & Status Indicator */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 print:hidden">
          <button
            type="button"
            onClick={handleToggle}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 cursor-pointer ${
              demoActive
                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle between real backend streaming data and clearly labelled demo sample data"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{demoActive ? 'Demo Mode Active' : 'Enable Demo Mode'}</span>
          </button>
        </div>
      </div>

      {/* Compliance / Ethical Scope Notice */}
      <div className="mt-4 p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
        <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-slate-700">Objective Professional Scope:</span> Feedback strictly focuses on clothing formality, camera framing, lighting clarity, and interview dress code standards. It does <span className="font-semibold text-slate-700">not</span> assess personal appearance, attractiveness, body type, gender, or identity attributes.
        </div>
      </div>

      {/* STATE 1: ANALYSIS PENDING (When no backend data is available and demo mode is off) */}
      {isPending ? (
        <div className="mt-6 py-12 px-6 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100/50 border border-dashed border-slate-300 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
            <Clock className="w-7 h-7 animate-pulse text-[#4F46E5]" />
          </div>
          <h4 className="text-base font-bold text-slate-800 mb-1.5">
            Analysis pending
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
            Awaiting attire and presentation analysis payload from the Member 3 backend pipeline. Scores and feedback will display automatically upon model completion.
          </p>

          <div className="inline-flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleToggle}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#4F46E5] text-white hover:bg-[#4338CA] transition-colors shadow-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Preview Sample Outfit Scores (Demo Mode)
            </button>
          </div>
        </div>
      ) : (
        /* STATE 2: ACTIVE SCORES (Real backend data or Demo Sample Data) */
        <div className="mt-6 space-y-6">
          {/* Overall Outfit Score Card */}
          <div className="p-5 sm:p-6 bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 border border-indigo-100 rounded-2xl shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#4F46E5]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">
                    Overall Presentation Score
                  </span>
                  {activeData.source === 'mock_demo' && (
                    <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Sample Data
                    </span>
                  )}
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {activeData.overallVerdict}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                  {activeData.summary}
                </p>
                {activeData.industryOrRoleTarget && (
                  <p className="text-xs font-medium text-slate-500">
                    <span className="font-semibold text-slate-700">Benchmark Profile:</span> {activeData.industryOrRoleTarget}
                  </p>
                )}
              </div>

              {/* Big Score Gauge */}
              <div className="flex items-center gap-4 shrink-0 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="text-right">
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#4F46E5] font-mono leading-none">
                    {activeData.overallScore}
                  </div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                    out of 100
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-[#4F46E5] border-r-[#4F46E5] flex items-center justify-center font-bold text-xs text-indigo-700">
                  {activeData.overallScore}%
                </div>
              </div>
            </div>

            {/* Quick Filter Tabs for 3 Indicators */}
            <div className="mt-5 pt-4 border-t border-indigo-100/60 flex flex-wrap items-center gap-2 print:hidden">
              <span className="text-xs font-semibold text-slate-600 mr-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" /> Filter:
              </span>
              <button
                type="button"
                onClick={() => setSelectedIndicator('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedIndicator === 'all'
                    ? 'bg-[#4F46E5] text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All 3 Indicators
              </button>
              {(['professionalAttire', 'neatnessPresentation', 'dressCodeSuitability'] as OutfitIndicatorKey[]).map((key) => {
                const item = activeData.indicators[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedIndicator(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                      selectedIndicator === key
                        ? 'bg-[#4F46E5] text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      selectedIndicator === key ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.score}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Three Key Indicators Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Indicator 1: Professional Attire */}
            {(selectedIndicator === 'all' || selectedIndicator === 'professionalAttire') && (
              <IndicatorCard
                indicator={activeData.indicators.professionalAttire}
                icon={<Shirt className="w-4 h-4 text-[#4F46E5]" />}
                colorClass="indigo"
              />
            )}

            {/* Indicator 2: Neatness and Presentation */}
            {(selectedIndicator === 'all' || selectedIndicator === 'neatnessPresentation') && (
              <IndicatorCard
                indicator={activeData.indicators.neatnessPresentation}
                icon={<Sun className="w-4 h-4 text-emerald-600" />}
                colorClass="emerald"
              />
            )}

            {/* Indicator 3: Interview Dress Code Suitability */}
            {(selectedIndicator === 'all' || selectedIndicator === 'dressCodeSuitability') && (
              <IndicatorCard
                indicator={activeData.indicators.dressCodeSuitability}
                icon={<ShieldCheck className="w-4 h-4 text-violet-600" />}
                colorClass="violet"
              />
            )}
          </div>

          {/* Practical Improvement Suggestions & Setup Tips */}
          {activeData.generalPracticalTips && activeData.generalPracticalTips.length > 0 && (
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <TrendingUp className="w-4 h-4 text-[#4F46E5]" />
                <h4 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
                  Practical Setup & Attire Recommendations
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {activeData.generalPracticalTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed"
                  >
                    <span className="w-5 h-5 rounded-md bg-indigo-100 text-[#4F46E5] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
              {activeData.lightingAndFramingNote && (
                <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
                  <Camera className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Webcam & Lighting Checklist:</span> {activeData.lightingAndFramingNote}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface IndicatorCardProps {
  indicator: OutfitIndicatorDetail;
  icon: React.ReactNode;
  colorClass: 'indigo' | 'emerald' | 'violet';
}

const IndicatorCard: React.FC<IndicatorCardProps> = ({ indicator, icon }) => {
  const [showFullChecks, setShowFullChecks] = useState(false);

  // Score badge style
  const getScoreBadge = (score: number) => {
    if (score >= 88) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', bar: 'bg-emerald-500' };
    if (score >= 75) return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', bar: 'bg-indigo-500' };
    if (score >= 60) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-500' };
    return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', bar: 'bg-rose-500' };
  };

  const badge = getScoreBadge(indicator.score);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all duration-150">
      <div className="space-y-4">
        {/* Top title & score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0 mt-0.5">
              {icon}
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {indicator.name}
              </h4>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                {indicator.subtitle}
              </p>
            </div>
          </div>

          <div className={`px-2.5 py-1 rounded-lg border font-mono font-bold text-sm shrink-0 ${badge.bg} ${badge.text} ${badge.border}`}>
            {indicator.score}
            <span className="text-[10px] text-slate-400 font-normal">/100</span>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-center text-[11px] mb-1 font-medium text-slate-500">
            <span>Score: <span className="font-semibold text-slate-800">{indicator.ratingLabel}</span></span>
            <span className="font-mono font-bold text-slate-700">{indicator.score}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${badge.bar}`}
              style={{ width: `${Math.min(100, Math.max(5, indicator.score))}%` }}
            />
          </div>
        </div>

        {/* Feedback summary */}
        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
          {indicator.feedbackSummary}
        </p>

        {/* Strengths */}
        {indicator.strengths && indicator.strengths.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Observed Strengths
            </div>
            <ul className="space-y-1.5">
              {indicator.strengths.map((str, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Practical Improvement Suggestions */}
        {indicator.suggestions && indicator.suggestions.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Practical Suggestions
            </div>
            <ul className="space-y-1.5">
              {indicator.suggestions.map((sug, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Item Checks */}
        {indicator.checks && indicator.checks.length > 0 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowFullChecks(!showFullChecks)}
              className="text-[11px] font-semibold text-[#4F46E5] hover:text-[#4338CA] flex items-center gap-1 cursor-pointer print:hidden"
            >
              <span>{showFullChecks ? 'Hide Detailed Checks' : 'View Detailed Checks'}</span>
              <ChevronRight className={`w-3 h-3 transition-transform ${showFullChecks ? 'rotate-90' : ''}`} />
            </button>

            {showFullChecks && (
              <div className="mt-2 space-y-1.5">
                {indicator.checks.map((chk, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{chk.label}</span>
                      <span className={`px-1.5 py-0.2 rounded font-medium text-[10px] ${
                        chk.status === 'pass'
                          ? 'bg-emerald-100 text-emerald-800'
                          : chk.status === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {chk.status === 'pass' ? 'Passed' : chk.status === 'warning' ? 'Check' : 'Info'}
                      </span>
                    </div>
                    <div className="text-slate-600">{chk.note}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
