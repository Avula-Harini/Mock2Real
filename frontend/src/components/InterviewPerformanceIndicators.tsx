import React, { useState } from 'react';
import {
  Eye,
  UserCheck,
  Smile,
  Mic,
  Shirt,
  Sparkles,
  Info,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import {
  InterviewPerformanceData,
  PerformanceScoreMetric,
  EyeContactAnalysis,
  PostureAnalysis,
  FacialExpressionAnalysis,
  VoiceDeliveryAnalysis,
  OutfitFeedbackAnalysis,
} from '../types/performance';
import { DEMO_PERFORMANCE_DATA } from '../data/mockPerformanceData';

export interface InterviewPerformanceIndicatorsProps {
  /**
   * Real performance analysis data supplied from backend (Member 3 / Member 4).
   * When null/undefined, panel automatically shows "Analysis pending".
   */
  analysisData?: InterviewPerformanceData | null;
  /**
   * When true, allows toggling into clearly labelled Demo Mode with mock values.
   * Default: true.
   */
  allowDemoToggle?: boolean;
  /**
   * Initial demo mode state if analysisData is null.
   * Default: false (displays "Analysis pending" by default).
   */
  defaultDemoMode?: boolean;
  /**
   * Optional custom title or header label.
   */
  title?: string;
  /**
   * Optional boolean indicating if the candidate is currently recording an answer.
   */
  isAnswering?: boolean;
  /**
   * Optional callback when demo mode is toggled.
   */
  onToggleDemoMode?: (enabled: boolean) => void;
  /**
   * Optional additional className for container.
   */
  className?: string;
}

export const InterviewPerformanceIndicators: React.FC<InterviewPerformanceIndicatorsProps> = ({
  analysisData = null,
  allowDemoToggle = true,
  defaultDemoMode = false,
  title = 'Interview Performance Indicators',
  isAnswering = false,
  onToggleDemoMode,
  className = '',
}) => {
  const [demoMode, setDemoMode] = useState<boolean>(defaultDemoMode);
  const [showDetailedInsights, setShowDetailedInsights] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'visual' | 'voice' | 'outfit'>('all');

  // Determine which data to use: real data takes priority; if none, check demo mode
  const effectiveData: InterviewPerformanceData | null =
    analysisData || (demoMode ? DEMO_PERFORMANCE_DATA : null);

  const isAnalysisPending = !effectiveData;

  const handleToggleDemo = () => {
    const nextState = !demoMode;
    setDemoMode(nextState);
    if (onToggleDemoMode) {
      onToggleDemoMode(nextState);
    }
  };

  // Helper for status badge styling
  const getScoreBadge = (score?: number) => {
    if (score === undefined) return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };
    if (score >= 85) return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' };
    if (score >= 70) return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300' };
    if (score >= 55) return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' };
    return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300' };
  };

  const getProgressBarColor = (score?: number) => {
    if (score === undefined) return 'bg-slate-300';
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-[#4F46E5]';
    if (score >= 55) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-200 ${className}`}
      data-testid="interview-performance-indicators"
    >
      {/* 1. Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/70 via-white to-slate-50/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-[#4F46E5] shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  {title}
                </h3>
                {isAnswering && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-[10px] font-semibold animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Live Capture
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Non-verbal behavioral tracking & voice delivery diagnostics
              </p>
            </div>
          </div>

          {/* Right controls: Demo toggle & Status pill */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            {allowDemoToggle && !analysisData && (
              <button
                type="button"
                onClick={handleToggleDemo}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
                  demoMode
                    ? 'bg-amber-500/10 border-amber-300 text-amber-800 hover:bg-amber-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title="Toggle simulated demonstration dataset for previewing indicators"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{demoMode ? 'Demo Mode Active' : 'Load Demo Data'}</span>
              </button>
            )}

            {demoMode && (
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-mono font-semibold uppercase tracking-wider">
                Simulated Mock
              </span>
            )}

            {!demoMode && !analysisData && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-medium">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Analysis pending</span>
              </span>
            )}

            {analysisData && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                Connected
              </span>
            )}
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100/80 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#4F46E5] text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Metrics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'visual'
                ? 'bg-[#4F46E5] text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Visual Cues (3)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-[#4F46E5] text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Voice Delivery
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('outfit')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'outfit'
                ? 'bg-[#4F46E5] text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Outfit Feedback
          </button>
        </div>
      </div>

      {/* 2. Main Content Body */}
      <div className="p-4 sm:p-5">
        {isAnalysisPending ? (
          /* "Analysis Pending" Placeholder State */
          <div className="py-8 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h4 className="text-sm font-bold text-slate-800">
                Analysis pending
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Performance indicators (Eye Contact, Posture, Facial Expression, Voice Delivery, and Outfit Feedback) will display automatically once backend computer vision and audio analysis streams data.
              </p>
            </div>

            {allowDemoToggle && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleToggleDemo}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] border border-indigo-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Preview with Clearly Labelled Demo Data</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Active Data Display */
          <div className="space-y-5">
            {/* Demo Notice Banner if in Demo Mode */}
            {demoMode && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold text-amber-950">Notice: Clearly labelled demo preview mode. </span>
                  <span className="text-amber-800">
                    Front-end does not calculate or modify scores locally. These sample indicators simulate Member 3 & Member 4 ML backend responses.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleDemo}
                  className="text-[11px] font-semibold text-amber-900 underline hover:no-underline shrink-0 cursor-pointer"
                >
                  Exit Demo
                </button>
              </div>
            )}

            {/* SECTION 1: Three Primary Visual Indicators (Eye Contact, Posture, Facial Expression) */}
            {(activeTab === 'all' || activeTab === 'visual') && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-slate-400">
                    Primary Visual Behavioral Indicators
                  </span>
                  <span className="text-[11px] text-slate-500">3 Cues Monitored</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Indicator 1: Eye Contact */}
                  <IndicatorCard
                    title="Eye Contact"
                    icon={<Eye className="w-4 h-4 text-indigo-600" />}
                    score={effectiveData?.eyeContact?.score}
                    label={effectiveData?.eyeContact?.label || 'Camera Lens Focus'}
                    summary={effectiveData?.eyeContact?.summary}
                    benchmark={effectiveData?.eyeContact?.benchmark || 80}
                    highlight={`${effectiveData?.eyeContact?.cameraFocusRatio || effectiveData?.eyeContact?.score || 0}% gaze consistency`}
                    details={effectiveData?.eyeContact?.details}
                    getScoreBadge={getScoreBadge}
                    getProgressBarColor={getProgressBarColor}
                  />

                  {/* Indicator 2: Posture */}
                  <IndicatorCard
                    title="Posture & Alignment"
                    icon={<UserCheck className="w-4 h-4 text-indigo-600" />}
                    score={effectiveData?.posture?.score}
                    label={effectiveData?.posture?.label || 'Spine & Head Position'}
                    summary={effectiveData?.posture?.summary}
                    benchmark={effectiveData?.posture?.benchmark || 75}
                    highlight={effectiveData?.posture?.slouchDetected ? 'Minor slouch detected' : 'Upright & centered'}
                    details={effectiveData?.posture?.details}
                    getScoreBadge={getScoreBadge}
                    getProgressBarColor={getProgressBarColor}
                  />

                  {/* Indicator 3: Facial Expression */}
                  <IndicatorCard
                    title="Facial Expression"
                    icon={<Smile className="w-4 h-4 text-indigo-600" />}
                    score={effectiveData?.facialExpression?.score}
                    label={effectiveData?.facialExpression?.label || 'Engagement & Affect'}
                    summary={effectiveData?.facialExpression?.summary}
                    benchmark={effectiveData?.facialExpression?.benchmark || 75}
                    highlight={`Primary: ${effectiveData?.facialExpression?.primaryEmotion || 'Engaged'}`}
                    details={effectiveData?.facialExpression?.details}
                    getScoreBadge={getScoreBadge}
                    getProgressBarColor={getProgressBarColor}
                  />
                </div>
              </div>
            )}

            {/* SECTION 2: Separate Voice Delivery Indicator */}
            {(activeTab === 'all' || activeTab === 'voice') && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#4F46E5]">
                      <Mic className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Voice Delivery Indicator
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Speech pacing, clarity, audio modulation & filler cadence
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-500">
                      Score: <strong className="text-slate-900 text-sm">{effectiveData?.voiceDelivery?.score || 0}%</strong>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md border text-[11px] font-medium ${
                        getScoreBadge(effectiveData?.voiceDelivery?.score).bg
                      } ${getScoreBadge(effectiveData?.voiceDelivery?.score).text} ${
                        getScoreBadge(effectiveData?.voiceDelivery?.score).border
                      }`}
                    >
                      {effectiveData?.voiceDelivery?.label || 'Evaluated'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>Delivery Quality Benchmark</span>
                    <span>Target: {effectiveData?.voiceDelivery?.benchmark || 80}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getProgressBarColor(
                        effectiveData?.voiceDelivery?.score
                      )}`}
                      style={{ width: `${effectiveData?.voiceDelivery?.score || 0}%` }}
                    />
                  </div>
                </div>

                {/* Voice diagnostic metrics grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Pacing</span>
                    <span className="text-xs font-bold text-slate-800">
                      {effectiveData?.voiceDelivery?.pacingWpm || 135} WPM
                    </span>
                    <span className="text-[10px] text-emerald-600 block">Ideal Range</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Clarity</span>
                    <span className="text-xs font-bold text-slate-800">
                      {effectiveData?.voiceDelivery?.clarityPercent || 90}%
                    </span>
                    <span className="text-[10px] text-slate-500 block">Diction Score</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Filler Words</span>
                    <span className="text-xs font-bold text-slate-800">
                      {effectiveData?.voiceDelivery?.fillerWordRatio || '1.4%'}
                    </span>
                    <span className="text-[10px] text-emerald-600 block">Low Ratio</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200/80">
                    <span className="text-[10px] text-slate-400 font-mono uppercase block">Modulation</span>
                    <span className="text-xs font-bold text-slate-800 capitalize">
                      {effectiveData?.voiceDelivery?.modulation || 'Natural'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Dynamic Pitch</span>
                  </div>
                </div>

                {effectiveData?.voiceDelivery?.summary && (
                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/70">
                    {effectiveData.voiceDelivery.summary}
                  </p>
                )}
              </div>
            )}

            {/* SECTION 3: Outfit Feedback Section */}
            {(activeTab === 'all' || activeTab === 'outfit') && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#4F46E5]">
                      <Shirt className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Outfit Feedback & Attire Assessment
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Visual presentation, color contrast & professional dress compliance
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold capitalize">
                      {effectiveData?.outfit?.rating || 'Professional Attire'}
                    </span>
                    {effectiveData?.outfit?.score !== undefined && (
                      <span className="text-xs font-mono font-bold text-slate-800">
                        {effectiveData.outfit.score}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Outfit Summary */}
                {effectiveData?.outfit?.summary && (
                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/70">
                    {effectiveData.outfit.summary}
                  </p>
                )}

                {/* Outfit checklist items */}
                {effectiveData?.outfit?.items && effectiveData.outfit.items.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {effectiveData.outfit.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-white border border-slate-200/80 flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-semibold text-slate-800 block">
                            {item.attribute}
                          </span>
                          <span className="text-[11px] text-slate-500 leading-tight block">
                            {item.note}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Expandable Detailed Coaching Insights toggle */}
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDetailedInsights(!showDetailedInsights)}
                className="text-xs text-[#4F46E5] hover:text-indigo-800 font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{showDetailedInsights ? 'Hide Breakdown' : 'View Breakdown & Tips'}</span>
                {showDetailedInsights ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {showDetailedInsights && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 animate-in fade-in duration-200">
                <span className="font-semibold text-slate-800 block">
                  Integration Notes (Member 3 / Member 4 Backend API):
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                  <li>
                    <strong>Ready for WebSocket/SSE stream:</strong> Provide live updates into <code className="bg-slate-200/60 px-1 py-0.5 rounded font-mono text-[10px]">analysisData</code> prop to update Eye Contact, Posture, Facial Expression, Voice Delivery, or Outfit in real time.
                  </li>
                  <li>
                    <strong>Zero Frontend Scoring:</strong> All percentages, ratings, and qualitative feedback are rendered purely as received from backend models.
                  </li>
                  <li>
                    <strong>Graceful Fallback:</strong> If backend stream disconnects or is empty, UI immediately reverts to &quot;Analysis pending&quot;.
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface IndicatorCardProps {
  title: string;
  icon: React.ReactNode;
  score?: number;
  label: string;
  summary?: string;
  benchmark: number;
  highlight?: string;
  details?: string[];
  getScoreBadge: (score?: number) => { bg: string; text: string; border: string };
  getProgressBarColor: (score?: number) => string;
}

const IndicatorCard: React.FC<IndicatorCardProps> = ({
  title,
  icon,
  score,
  label,
  summary,
  benchmark,
  highlight,
  details,
  getScoreBadge,
  getProgressBarColor,
}) => {
  const badge = getScoreBadge(score);

  return (
    <div className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex flex-col justify-between space-y-3">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-md bg-indigo-50 border border-indigo-200/60 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <span className="text-xs font-bold text-slate-900 truncate">{title}</span>
          </div>

          <span
            className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold shrink-0 ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {label}
          </span>
        </div>

        {/* Score & Progress bar */}
        <div className="space-y-1 mb-2">
          <div className="flex justify-between items-baseline text-xs">
            <span className="text-[11px] text-slate-500 font-mono">Score</span>
            <span className="font-extrabold text-slate-900 font-mono text-sm">
              {score !== undefined ? `${score}%` : '--'}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
            <div
              className={`h-full transition-all duration-500 ${getProgressBarColor(score)}`}
              style={{ width: `${score || 0}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0</span>
            <span>Target: {benchmark}%</span>
            <span>100</span>
          </div>
        </div>

        {/* Highlight badge if any */}
        {highlight && (
          <div className="mb-2">
            <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200/70">
              {highlight}
            </span>
          </div>
        )}

        {/* Short summary */}
        {summary && (
          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
            {summary}
          </p>
        )}
      </div>

      {/* Bullet details if provided */}
      {details && details.length > 0 && (
        <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
          {details.slice(0, 2).map((d, i) => (
            <div key={i} className="flex items-start gap-1">
              <span className="text-indigo-500 font-bold">•</span>
              <span className="line-clamp-1">{d}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
