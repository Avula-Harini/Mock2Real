import React from 'react';
import {
  ArrowRight,
  Sparkles,
  Video,
  ShieldCheck,
  Zap,
  BarChart3,
  Bot,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface LandingHeroProps {
  onStartPractice: () => void;
  onExploreFeatures: () => void;
  onViewReport: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartPractice,
  onExploreFeatures,
  onViewReport,
}) => {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Hero Section */}
      <div className="w-full max-w-4xl mx-auto pt-10 pb-12 px-4 sm:px-6 text-center flex flex-col items-center">
        {/* Top Pill Badge matching screenshot */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide uppercase shadow-xs mb-8">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
          <span>YOUR NEXT INTERVIEW STARTS HERE</span>
        </div>

        {/* Main Headline matching screenshot */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#4F46E5] tracking-tight leading-tight max-w-3xl">
          Perform with confidence.
        </h1>

        {/* Subtitle matching screenshot */}
        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed font-normal">
          Turn interview anxiety into confidence with realistic mock interviews, personalized AI feedback, and actionable insights to help you become interview-ready.
        </p>

        {/* Action Buttons matching screenshot */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md">
          <button
            type="button"
            onClick={onStartPractice}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-indigo-500/20 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <span>Start Your Free Practice</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onExploreFeatures}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <span>Explore Features</span>
          </button>
        </div>

        {/* Subtext matching screenshot */}
        <p className="mt-5 text-xs text-slate-500 font-medium">
          No pressure. Just practice, feedback, and progress.
        </p>
      </div>

      {/* Mock Interview Preview Window Card (matching the bottom frame in screenshot) */}
      <div className="w-full max-w-5xl mx-auto px-4 pb-16">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden">
          {/* Window Header matching screenshot */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/70 text-xs">
            {/* Window Dots */}
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            </div>

            {/* Center Label */}
            <span className="font-mono text-[11px] font-semibold text-slate-500 tracking-wider uppercase">
              MOCK INTERVIEW PREVIEW
            </span>

            {/* Right Tag */}
            <div className="flex items-center gap-1.5 text-indigo-600 font-mono text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              <span>AI POWERED</span>
            </div>
          </div>

          {/* Interactive Preview Content */}
          <div className="p-6 sm:p-8 bg-gradient-to-b from-white via-slate-50/40 to-slate-50/70">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Real-Time Video Simulator</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Practice with live camera preview, audio frequency feedback, and real-time posture framing.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Real Interview Questions</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tailored tracks for Senior Full-Stack and Technical PM with structured STAR evaluation rubrics.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-5 rounded-xl bg-white border border-slate-200/80 shadow-xs space-y-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Deep Diagnostic Report</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Comprehensive executive feedback with speech pacing (WPM), filler word rates, and exportable PDF report.
                </p>
              </div>
            </div>

            {/* Quick action bar */}
            <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero backend required · 100% browser-based practice</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onViewReport}
                  className="flex-1 sm:flex-none text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  View Sample Report →
                </button>
                <button
                  type="button"
                  onClick={onStartPractice}
                  className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-all"
                >
                  Launch Studio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
