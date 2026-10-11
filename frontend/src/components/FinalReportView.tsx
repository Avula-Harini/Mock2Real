import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  RotateCcw,
  TrendingUp,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronUp,
  Share2,
  Check,
  Brain,
  ShieldCheck,
  Target,
  ExternalLink,
  Info,
  X,
  Sparkles,
  Zap,
  ArrowRight,
  Download,
} from 'lucide-react';
import { FinalReportData, InterviewQuestion } from '../types/interview';
import { STARFeedbackData } from '../types/star';
import { OutfitFeedbackData } from '../types/outfit';
import { InterviewPerformanceData } from '../types/performance';
import { STARFeedback } from './STARFeedback';
import { OutfitFeedback } from './OutfitFeedback';
import { findWeakestQuestion, getQuestionScore } from '../utils/retryHelper';
import { downloadInterviewPDFReport } from '../utils/pdfReportGenerator';

interface FinalReportViewProps {
  reportData: FinalReportData;
  questions: InterviewQuestion[];
  onRetake: () => void;
  onBackToStudio: () => void;
  onRetryQuestion?: (questionId: string) => void;
  starFeedback?: STARFeedbackData | null;
  isStarDemoMode?: boolean;
  onToggleStarDemoMode?: (enabled: boolean) => void;
  outfitFeedback?: OutfitFeedbackData | null;
  isOutfitDemoMode?: boolean;
  onToggleOutfitDemoMode?: (enabled: boolean) => void;
  performanceData?: InterviewPerformanceData | null;
}

export const FinalReportView: React.FC<FinalReportViewProps> = ({
  reportData,
  questions,
  onRetake,
  onBackToStudio,
  onRetryQuestion,
  starFeedback,
  isStarDemoMode,
  onToggleStarDemoMode,
  outfitFeedback,
  isOutfitDemoMode,
  onToggleOutfitDemoMode,
  performanceData,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showIframeHelp, setShowIframeHelp] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(
    questions[0]?.id || null
  );

  const weakestQuestion = findWeakestQuestion(questions);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await downloadInterviewPDFReport({
        reportData,
        questions,
        starFeedback,
        outfitFeedback,
        performanceData,
        isDemoMode: Boolean(isStarDemoMode || isOutfitDemoMode),
      });
    } catch (err) {
      console.error('Failed to generate PDF report:', err);
      alert('Could not generate PDF directly. Please use the Print Report button as alternative.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Direct onClick handler that calls window.print()
  const handlePrint = () => {
    setIsPrinting(true);

    try {
      window.print();
    } catch (err) {
      console.warn('Browser window.print() call encountered error:', err);
      setShowIframeHelp(true);
    }

    if (typeof window !== 'undefined' && window.self !== window.top) {
      setShowIframeHelp(true);
    }

    setTimeout(() => {
      setIsPrinting(false);
    }, 1200);
  };

  const handleOpenStandaloneAndPrint = () => {
    const url = new URL(window.location.href);
    url.hash = '#print';
    window.open(url.toString(), '_blank');
  };

  const toggleExpand = (id: string) => {
    setExpandedQuestion(expandedQuestion === id ? null : id);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 text-slate-900 print:py-0 print:px-0 print:space-y-6 print:max-w-none print:w-full">
      {/* Print-Only Formal A4 Document Header */}
      <div className="hidden print:block pb-5 mb-5 border-b-2 border-slate-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center font-bold text-sm">
              M2R
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Mock2Real · Candidate Performance Diagnostic
              </h1>
              <p className="text-xs text-slate-600">
                Official Mock Interview Assessment & Telemetry Analysis
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-600 font-mono">
            <div>Date: {reportData.completedAt}</div>
            <div>Evaluation ID: #M2R-{reportData.overallScore}K-89</div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block uppercase font-mono text-[10px]">Candidate</span>
            <span className="font-semibold text-slate-900">{reportData.candidateName}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-mono text-[10px]">Role Track</span>
            <span className="font-semibold text-slate-900">{reportData.roleTitle}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-mono text-[10px]">Assessment Result</span>
            <span className="font-bold text-[#4F46E5]">{reportData.verdict} ({reportData.overallScore}/100)</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase font-mono text-[10px]">Duration</span>
            <span className="font-semibold text-slate-900">{formatDuration(reportData.totalDurationSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Screen Top Banner Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 print:hidden no-print">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#4F46E5] font-semibold">
            <span>MOCK2REAL EVALUATION REPORT</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-slate-500 font-sans">{reportData.completedAt}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Candidate Performance Diagnostic
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track: {reportData.roleTitle} · {reportData.questionsAnsweredCount} of{' '}
            {reportData.totalQuestionsCount} Questions Evaluated
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {weakestQuestion && onRetryQuestion && (
            <button
              type="button"
              onClick={() => onRetryQuestion(weakestQuestion.id)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-300 border border-amber-500/40 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Practice and improve your lowest-scoring response"
            >
              <Sparkles className="w-4 h-4 text-amber-900" />
              <span>Retry Weakest Answer</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
          </button>

          {/* Download Real PDF Report Button */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            title="Download multi-page PDF evaluation report with all scores, STAR feedback, and indicators"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          {/* Primary Print Report Button */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={false}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer group"
            title="Click to print report or save via system print dialog"
          >
            <Printer className="w-4 h-4 text-[#4F46E5] group-hover:scale-110 transition-transform" />
            <span>{isPrinting ? 'Opening Print Dialog...' : 'Print Report'}</span>
          </button>

          <button
            type="button"
            onClick={onRetake}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Interview</span>
          </button>
        </div>
      </div>

      {/* Prominent Targeted Practice Banner: Retry Weakest Answer */}
      {weakestQuestion && onRetryQuestion && (
        <div className="bg-gradient-to-r from-amber-50/90 via-indigo-50/40 to-white border-2 border-amber-300/80 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 no-print print:hidden">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-5 h-5 fill-amber-500 text-amber-700" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-800 uppercase tracking-wider">
                  Targeted Coaching Opportunity
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs font-semibold text-slate-700">
                  Focus Area: Question {weakestQuestion.number} ({getQuestionScore(weakestQuestion)}%)
                </span>
                {weakestQuestion.retryAttempt && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                    Improved (+{weakestQuestion.retryAttempt.scoreDelta}%)
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Retry & Improve Your Weakest Answer: {weakestQuestion.title}
              </h3>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                {weakestQuestion.feedback?.improvements?.[0]
                  ? `AI Feedback to address: "${weakestQuestion.feedback.improvements[0]}"`
                  : 'Take a focused 3-minute practice round to incorporate feedback, re-record your answer, and raise your diagnostic score.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onRetryQuestion(weakestQuestion.id)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 border border-amber-500/40 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 group"
            >
              <Sparkles className="w-4 h-4 text-amber-900 group-hover:rotate-12 transition-transform" />
              <span>{weakestQuestion.retryAttempt ? 'Review or Retry Again' : 'Retry This Answer & Improve'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-950" />
            </button>
          </div>
        </div>
      )}

      {/* Embedded Iframe Helper Notice */}
      {showIframeHelp && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start justify-between gap-3 text-xs text-indigo-900 animate-in fade-in duration-200 no-print print:hidden">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-slate-900">
                Browser Iframe Notice: If your print dialog was blocked by iframe sandboxing
              </p>
              <p className="text-slate-700 leading-relaxed">
                Some browsers prevent embedded preview frames from opening native print modals. You can open this report in a clean standalone tab to print directly or press <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-slate-800">Ctrl + P</kbd> / <kbd className="px-1.5 py-0.5 bg-white rounded border border-slate-300 font-mono text-slate-800">Cmd + P</kbd>.
              </p>
              <div className="pt-1.5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenStandaloneAndPrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg font-medium transition-colors shadow-xs cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Standalone Tab & Print</span>
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowIframeHelp(false)}
            className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Primary Scorecard Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 print:grid-cols-3 gap-6 break-inside-avoid print-avoid-break">
        {/* Overall Recommendation Card */}
        <div className="lg:col-span-1 print:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between print:shadow-none print:p-5">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>EXECUTIVE VERDICT</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="mt-5 text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="#F1F5F9"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="58"
                    stroke="#4F46E5"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={364}
                    strokeDashoffset={364 - (364 * reportData.overallScore) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                    {reportData.overallScore}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">OUT OF 100</span>
                </div>
              </div>

              <div className="mt-4">
                <span className="text-lg font-bold text-emerald-600 tracking-wide uppercase">
                  {reportData.verdict}
                </span>
                <p className="text-xs text-slate-600 mt-1">
                  Candidate demonstrates senior-level communication, system decomposition, and reliability thinking.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 mt-6 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 font-mono">TOTAL TIME</span>
              <p className="font-bold text-slate-800 mt-0.5">
                {formatDuration(reportData.totalDurationSeconds)}
              </p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 font-mono">COMPLETION</span>
              <p className="font-bold text-slate-800 mt-0.5">
                {reportData.questionsAnsweredCount}/{reportData.totalQuestionsCount} (100%)
              </p>
            </div>
          </div>
        </div>

        {/* Speech & Delivery Diagnostics */}
        <div className="lg:col-span-2 print:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between print:shadow-none print:p-5">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Speech & Delivery Telemetry
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time audio articulation, cadence, and conciseness indicators.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#4F46E5] font-semibold font-mono">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Optimal Band</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 print:grid-cols-4 gap-3.5 mt-5">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-mono block">SPEAKING PACE</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                  {reportData.metrics.wordsPerMinute} <span className="text-xs font-normal text-slate-500">WPM</span>
                </span>
                <span className="text-[10px] text-emerald-600 font-medium mt-1 block">Ideal: 130 - 160 WPM</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-mono block">FILLER WORDS</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                  {reportData.metrics.fillerWordsRatio}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium mt-1 block">&lt; 3% Excellent</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-mono block">CLARITY INDEX</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                  {reportData.metrics.clarityScore}%
                </span>
                <span className="text-[10px] text-[#4F46E5] font-medium mt-1 block">High Articulation</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-mono block">STAR STRUCTURE</span>
                <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                  {reportData.metrics.structureScore}%
                </span>
                <span className="text-[10px] text-[#4F46E5] font-medium mt-1 block">Clear Framework</span>
              </div>
            </div>

            {/* Competency Benchmarks */}
            <div className="mt-5 space-y-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                Competency Breakdown vs. Industry Benchmark
              </span>
              <div className="space-y-2.5">
                {reportData.categoryScores.map((cat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-800 font-medium">{cat.category}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-500">Benchmark: {cat.benchmark}%</span>
                        <span className="text-[#4F46E5] font-bold">{cat.score}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60 relative">
                      {/* Benchmark marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                        style={{ left: `${cat.benchmark}%` }}
                        title={`Industry Benchmark: ${cat.benchmark}%`}
                      />
                      {/* Candidate score */}
                      <div
                        className="h-full bg-[#4F46E5] rounded-full"
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Growth Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6 break-inside-avoid print-avoid-break">
        {/* Strengths */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 print:shadow-none print:p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Standout Strengths</h3>
              <p className="text-xs text-slate-500">Demonstrated competitive advantages</p>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            {reportData.keyStrengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Growth Areas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 print:shadow-none print:p-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Target className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Growth & Coaching Priorities</h3>
              <p className="text-xs text-slate-500">Targeted tweaks before your next round</p>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            {reportData.areasForGrowth.map((growth, idx) => (
              <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                <span>{growth}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable Next Steps */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3 break-inside-avoid print-avoid-break print:shadow-none print:p-5">
        <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">
          Suggested Action Plan Before Onsite
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-3">
          {reportData.actionItems.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 leading-relaxed"
            >
              <span className="font-mono text-[#4F46E5] font-bold block mb-1">
                STEP {idx + 1}
              </span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* STAR-Method Interview Feedback Section */}
      <div className="break-inside-avoid print-avoid-break">
        <STARFeedback
          data={starFeedback}
          isDemoMode={isStarDemoMode}
          onToggleDemoMode={onToggleStarDemoMode}
          contextTitle="Behavioral response architecture evaluated across Situation, Task, Action, and Result."
        />
      </div>

      {/* Outfit and Professional Appearance Feedback Section */}
      <div className="break-inside-avoid print-avoid-break">
        <OutfitFeedback
          data={outfitFeedback}
          isDemoMode={isOutfitDemoMode}
          onToggleDemoMode={onToggleOutfitDemoMode}
          contextTitle="Objective attire, lighting, framing, and interview dress code evaluation for video loops."
        />
      </div>

      {/* Question-by-Question Deep Dive Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Question-by-Question Deep Dive
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Recorded answers, criteria matched, and constructive feedback across all questions.
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {questions.length} Items Evaluated
          </span>
        </div>

        <div className="space-y-3.5">
          {questions.map((q, idx) => {
            const isExpanded = expandedQuestion === q.id;
            const feedback = q.feedback;

            return (
              <div
                key={q.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-sm break-inside-avoid print-avoid-break"
              >
                {/* Accordion Trigger */}
                <div
                  onClick={() => toggleExpand(q.id)}
                  className="w-full p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 text-left hover:bg-slate-50/60 print:hover:bg-transparent transition-colors cursor-pointer print:cursor-default"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-[#4F46E5] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <span>{q.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-600 font-semibold">
                          Recorded: {q.recordedDurationSeconds || 145}s
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                        {q.title}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {q.retryAttempt ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>Improved (+{q.retryAttempt.scoreDelta}%)</span>
                      </span>
                    ) : q.id === weakestQuestion?.id ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-300 text-[11px] font-mono font-bold">
                        Weakest Response
                      </span>
                    ) : null}

                    <span className="text-xs font-mono text-slate-700 font-bold">
                      Score: {q.retryAttempt ? q.retryAttempt.improvedScore : feedback ? feedback.clarityScore : 88}%
                    </span>

                    {onRetryQuestion && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRetryQuestion(q.id);
                        }}
                        className="no-print print:hidden px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-[#4F46E5] border border-indigo-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Retry this question to improve your answer"
                      >
                        <Sparkles className="w-3 h-3 text-[#4F46E5]" />
                        <span>{q.retryAttempt ? 'View Compare' : 'Retry'}</span>
                      </button>
                    )}

                    <div className="no-print print:hidden">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Question Details: Shown when expanded on screen, AND ALWAYS SHOWN ON PRINT! */}
                <div
                  className={`px-5 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-5 print:bg-white print:border-slate-200 print:space-y-4 print-always-show ${
                    isExpanded ? 'block' : 'hidden print:block'
                  }`}
                >
                  {/* Prompt */}
                  <div>
                    <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1 font-semibold">
                      Prompt Given:
                    </span>
                    <p className="text-sm text-slate-800 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                      {q.prompt}
                    </p>
                  </div>

                  {/* Retry Attempt 2 Improvement Summary Banner */}
                  {q.retryAttempt && (
                    <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-xl space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                            ✓
                          </span>
                          <span className="text-xs font-bold text-emerald-900">
                            Targeted Practice Completed: Score Improved from {q.retryAttempt.originalScore}% to {q.retryAttempt.improvedScore}% (+{q.retryAttempt.scoreDelta}%)
                          </span>
                        </div>
                        {onRetryQuestion && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRetryQuestion(q.id);
                            }}
                            className="no-print print:hidden text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] underline underline-offset-2 cursor-pointer"
                          >
                            View Full Comparison
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-emerald-900/90 space-y-1">
                        <span className="font-semibold block text-[11px] uppercase font-mono text-emerald-800">
                          What Improved:
                        </span>
                        <ul className="space-y-0.5 list-disc list-inside">
                          {q.retryAttempt.whatImproved.slice(0, 2).map((imp, i) => (
                            <li key={i}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Simulated Transcript */}
                  {feedback?.simulatedTranscript && (
                    <div>
                      <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1 font-semibold">
                        Candidate Spoken Excerpt:
                      </span>
                      <blockquote className="text-xs text-slate-700 italic bg-white p-3.5 rounded-xl border-l-2 border-[#4F46E5] border-y border-r border-slate-200">
                        "{feedback.simulatedTranscript}"
                      </blockquote>
                    </div>
                  )}

                  {/* Strengths & Improvements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4">
                    {/* Strengths */}
                    <div className="space-y-1.5 p-3.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> What You Did Well
                      </span>
                      <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                        {feedback?.strengths.map((s, i) => (
                          <li key={i} className="leading-relaxed">
                            {s}
                          </li>
                        )) || <li>Strong technical articulation and confidence.</li>}
                      </ul>
                    </div>

                    {/* Improvements */}
                    <div className="space-y-1.5 p-3.5 bg-white rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Room For Improvement
                      </span>
                      <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                        {feedback?.improvements.map((im, i) => (
                          <li key={i} className="leading-relaxed">
                            {im}
                          </li>
                        )) || <li>Provide more concrete numerical production metrics.</li>}
                      </ul>
                    </div>
                  </div>

                  {/* Key Evaluation Points Hit */}
                  {feedback?.keyPointsHit && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">
                        Evaluation Criteria Matched:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {feedback.keyPointsHit.map((kp, i) => (
                          <span
                            key={i}
                            className="text-xs text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200"
                          >
                            ✓ {kp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Screen Bottom Navigation */}
      <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 no-print print:hidden">
        <span>Mock2Real AI Evaluation Engine</span>
        <button
          type="button"
          onClick={onBackToStudio}
          className="text-[#4F46E5] hover:text-[#4338CA] font-semibold underline underline-offset-4 cursor-pointer"
        >
          Return to Interview Studio
        </button>
      </div>
    </div>
  );
};
