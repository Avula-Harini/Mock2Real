import React, { useState } from 'react';
import {
  Layers,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Brain,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Clock,
  Target,
} from 'lucide-react';
import { SavedInterviewAttempt } from '../types/history';

export interface CompareAttemptsViewProps {
  attempts: SavedInterviewAttempt[];
  attemptA?: SavedInterviewAttempt | null;
  attemptB?: SavedInterviewAttempt | null;
  onBackToHistory: () => void;
  onBackToStudio: () => void;
}

export const CompareAttemptsView: React.FC<CompareAttemptsViewProps> = ({
  attempts,
  attemptA: initialA,
  attemptB: initialB,
  onBackToHistory,
  onBackToStudio,
}) => {
  // If not provided, select top 2 most recent attempts
  const [selectedIdA, setSelectedIdA] = useState<string>(
    initialA?.id || attempts[0]?.id || ''
  );
  const [selectedIdB, setSelectedIdB] = useState<string>(
    initialB?.id || attempts[1]?.id || attempts[0]?.id || ''
  );

  const attemptA = attempts.find((a) => a.id === selectedIdA) || attempts[0] || null;
  const attemptB = attempts.find((a) => a.id === selectedIdB) || attempts[1] || attempts[0] || null;

  if (!attemptA || !attemptB) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
          <Layers className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Need At Least Two Interview Attempts</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          To unlock side-by-side performance comparison, please complete at least two interview sessions or save two attempts in your session history.
        </p>
        <button
          type="button"
          onClick={onBackToStudio}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4F46E5] text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm hover:bg-[#4338CA] transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>Practice Next Interview</span>
        </button>
      </div>
    );
  }

  // Calculate Deltas strictly from existing real data (do not invent missing data)
  const overallDelta = (attemptB.overallScore || 0) - (attemptA.overallScore || 0);

  // STAR score comparison if available
  const starScoreA = attemptA.starFeedback?.overallScore;
  const starScoreB = attemptB.starFeedback?.overallScore;
  const starDelta = starScoreA !== undefined && starScoreB !== undefined ? starScoreB - starScoreA : undefined;

  // Clarity & Structure comparisons
  const clarityA = attemptA.reportData.metrics?.clarityScore;
  const clarityB = attemptB.reportData.metrics?.clarityScore;
  const clarityDelta = clarityA !== undefined && clarityB !== undefined ? clarityB - clarityA : undefined;

  const structureA = attemptA.reportData.metrics?.structureScore;
  const structureB = attemptB.reportData.metrics?.structureScore;
  const structureDelta = structureA !== undefined && structureB !== undefined ? structureB - structureA : undefined;

  const wpmA = attemptA.reportData.metrics?.wordsPerMinute;
  const wpmB = attemptB.reportData.metrics?.wordsPerMinute;
  const wpmDelta = wpmA !== undefined && wpmB !== undefined ? wpmB - wpmA : undefined;

  // Eye contact & posture comparison if available
  const eyeA = attemptA.performanceData?.eyeContact?.score;
  const eyeB = attemptB.performanceData?.eyeContact?.score;
  const eyeDelta = eyeA !== undefined && eyeB !== undefined ? eyeB - eyeA : undefined;

  // Outfit comparison if available
  const outfitA = attemptA.outfitFeedback?.overallScore;
  const outfitB = attemptB.outfitFeedback?.overallScore;
  const outfitDelta = outfitA !== undefined && outfitB !== undefined ? outfitB - outfitA : undefined;

  const isDemo = attemptA.isDemoMode || attemptB.isDemoMode;

  const renderDeltaBadge = (delta?: number, unit: string = 'pts') => {
    if (delta === undefined) {
      return (
        <span className="text-[11px] font-medium text-slate-400 italic">
          Data pending
        </span>
      );
    }
    if (delta > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <TrendingUp className="w-3 h-3 text-emerald-600" />
          +{delta} {unit}
        </span>
      );
    }
    if (delta < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <TrendingDown className="w-3 h-3 text-rose-600" />
          {delta} {unit}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <Minus className="w-3 h-3 text-slate-400" />
        No change
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] font-mono">
              Performance Analytics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Compare Interview Attempts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Analyze trajectory between two practice sessions to verify your coaching improvements and refine weaker areas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToHistory}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>History List</span>
          </button>
        </div>
      </div>

      {/* Demo watermark if applicable */}
      {isDemo && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <span className="font-bold">Notice:</span> One or more selected attempts include sample demo evaluations. Real backend data will display automatically when streamed.
          </span>
        </div>
      )}

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        {/* Selector A (Baseline) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Baseline Attempt (Attempt A)
          </label>
          <select
            value={selectedIdA}
            onChange={(e) => setSelectedIdA(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] cursor-pointer"
          >
            {attempts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.roleTitle} • {a.date} (Score: {a.overallScore}/100)
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">
            Recorded {attemptA.date} • {attemptA.verdict}
          </p>
        </div>

        {/* Selector B (Follow-up) */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Follow-up / Recent Attempt (Attempt B)
          </label>
          <select
            value={selectedIdB}
            onChange={(e) => setSelectedIdB(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] cursor-pointer"
          >
            {attempts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.roleTitle} • {a.date} (Score: {a.overallScore}/100)
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400">
            Recorded {attemptB.date} • {attemptB.verdict}
          </p>
        </div>
      </div>

      {/* Main Overall Score Trajectory Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-50/70 via-white to-slate-50 border border-indigo-100 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Award className="w-5 h-5 text-[#4F46E5]" />
            <h3 className="text-sm font-bold text-[#4F46E5] uppercase tracking-wider font-mono">
              Overall Performance Progression
            </h3>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {overallDelta > 0
              ? `Solid Improvement (+${overallDelta} Points)`
              : overallDelta === 0
              ? 'Even Performance Maintained'
              : `Score Shift (${overallDelta} Points)`}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
            {overallDelta > 0
              ? 'Your communication clarity, response structure, and delivery pacing showed clear measurable growth in this follow-up round.'
              : 'Review the granular category breakdown below to pinpoint specific areas needing repetition.'}
          </p>
        </div>

        {/* Score comparison pill */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs shrink-0">
          <div className="text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Attempt A</span>
            <span className="text-2xl font-black font-mono text-slate-700">{attemptA.overallScore}</span>
          </div>

          <div className="flex flex-col items-center">
            <ArrowRight className="w-4 h-4 text-slate-400" />
            {renderDeltaBadge(overallDelta)}
          </div>

          <div className="text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Attempt B</span>
            <span className="text-2xl font-black font-mono text-[#4F46E5]">{attemptB.overallScore}</span>
          </div>
        </div>
      </div>

      {/* Granular Metric Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Side-by-Side Category Breakdown</h3>
            <p className="text-xs text-slate-500">Compares evaluation metrics present in both attempts.</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Row 1: STAR Behavioral Score */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#4F46E5]" />
                STAR-Method Architecture
              </span>
              <p className="text-[11px] text-slate-500">Situation, Task, Action & Result structural completeness</p>
            </div>
            <div className="flex items-center gap-6 sm:gap-10 shrink-0 font-mono text-xs sm:text-sm">
              <span className="text-slate-600 font-medium">A: {starScoreA !== undefined ? `${starScoreA}/100` : '—'}</span>
              <span className="text-slate-900 font-bold">B: {starScoreB !== undefined ? `${starScoreB}/100` : '—'}</span>
              <div className="w-24 text-right">{renderDeltaBadge(starDelta)}</div>
            </div>
          </div>

          {/* Row 2: Clarity Score */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Response Clarity & Conciseness
              </span>
              <p className="text-[11px] text-slate-500">Spoken fluency and clarity of thought</p>
            </div>
            <div className="flex items-center gap-6 sm:gap-10 shrink-0 font-mono text-xs sm:text-sm">
              <span className="text-slate-600 font-medium">A: {clarityA !== undefined ? `${clarityA}%` : '—'}</span>
              <span className="text-slate-900 font-bold">B: {clarityB !== undefined ? `${clarityB}%` : '—'}</span>
              <div className="w-24 text-right">{renderDeltaBadge(clarityDelta, '%')}</div>
            </div>
          </div>

          {/* Row 3: Structure Score */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Logical Argument Structure
              </span>
              <p className="text-[11px] text-slate-500">Chronological coherence and framing</p>
            </div>
            <div className="flex items-center gap-6 sm:gap-10 shrink-0 font-mono text-xs sm:text-sm">
              <span className="text-slate-600 font-medium">A: {structureA !== undefined ? `${structureA}%` : '—'}</span>
              <span className="text-slate-900 font-bold">B: {structureB !== undefined ? `${structureB}%` : '—'}</span>
              <div className="w-24 text-right">{renderDeltaBadge(structureDelta, '%')}</div>
            </div>
          </div>

          {/* Row 4: Speaking Pace (WPM) */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                Speaking Pace (WPM)
              </span>
              <p className="text-[11px] text-slate-500">Target benchmark is 130 - 150 Words Per Minute</p>
            </div>
            <div className="flex items-center gap-6 sm:gap-10 shrink-0 font-mono text-xs sm:text-sm">
              <span className="text-slate-600 font-medium">A: {wpmA !== undefined ? `${wpmA} wpm` : '—'}</span>
              <span className="text-slate-900 font-bold">B: {wpmB !== undefined ? `${wpmB} wpm` : '—'}</span>
              <div className="w-24 text-right">{renderDeltaBadge(wpmDelta, 'wpm')}</div>
            </div>
          </div>

          {/* Row 5: Outfit & Appearance */}
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-violet-600" />
                Outfit & Camera Presentation
              </span>
              <p className="text-[11px] text-slate-500">Attire formality, lighting clarity, and webcam framing</p>
            </div>
            <div className="flex items-center gap-6 sm:gap-10 shrink-0 font-mono text-xs sm:text-sm">
              <span className="text-slate-600 font-medium">A: {outfitA !== undefined ? `${outfitA}/100` : '—'}</span>
              <span className="text-slate-900 font-bold">B: {outfitB !== undefined ? `${outfitB}/100` : '—'}</span>
              <div className="w-24 text-right">{renderDeltaBadge(outfitDelta)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Qualitative Comparison: Standout Strengths & Practice Priorities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attempt B Highlights */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div>
              <h4 className="text-base font-bold text-slate-900">Attempt B Standout Strengths</h4>
              <p className="text-xs text-slate-500">Key competencies demonstrated in follow-up round</p>
            </div>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            {(attemptB.reportData.keyStrengths || []).map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Remaining Focus Areas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Target className="w-5 h-5 text-amber-500" />
            <div>
              <h4 className="text-base font-bold text-slate-900">Areas For Continued Practice</h4>
              <p className="text-xs text-slate-500">Targeted tweaks for your upcoming real interviews</p>
            </div>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
            {(attemptB.reportData.areasForGrowth || []).map((growth, idx) => (
              <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>{growth}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
