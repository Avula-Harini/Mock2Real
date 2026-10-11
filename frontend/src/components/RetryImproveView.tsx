import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  Volume2,
  Clock,
  Mic,
  Square,
  Play,
  FileText,
  ChevronRight,
  ShieldCheck,
  Check,
  Award,
  Zap,
  HelpCircle,
  Copy,
  Info,
  ArrowRight,
} from 'lucide-react';
import { InterviewQuestion, RetryComparison } from '../types/interview';
import { AIInterviewerAvatar } from './AIInterviewerAvatar';
import { WebcamPreview } from './WebcamPreview';
import { LiveTranscript } from './LiveTranscript';
import {
  getQuestionScore,
  getSampleImprovedAnswer,
  generateImprovedEvaluation,
} from '../utils/retryHelper';

interface RetryImproveViewProps {
  question: InterviewQuestion;
  onBackToReport: () => void;
  onApplyImprovement: (comparison: RetryComparison) => void;
  stream: MediaStream | null;
  hasCamera: boolean;
  hasMic: boolean;
  isCameraOn: boolean;
  isMicOn: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  onOpenDeviceSettings: () => void;
  speechVolume: number;
  onVolumeChange: (newVolume: number) => void;
}

export const RetryImproveView: React.FC<RetryImproveViewProps> = ({
  question,
  onBackToReport,
  onApplyImprovement,
  stream,
  hasCamera,
  hasMic,
  isCameraOn,
  isMicOn,
  onToggleCamera,
  onToggleMic,
  onOpenDeviceSettings,
  speechVolume,
  onVolumeChange,
}) => {
  // Mode phases: 'record' -> 'evaluating' -> 'compared'
  const [phase, setPhase] = useState<'record' | 'evaluating' | 'compared'>('record');
  
  // Recording states
  const [isAnswering, setIsAnswering] = useState(false);
  const [answerSeconds, setAnswerSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  
  // TTS speaking states
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Computed comparison result
  const [comparison, setComparison] = useState<RetryComparison | null>(
    question.retryAttempt || null
  );

  // If already retried, allow viewing comparison immediately
  const [activeTab, setActiveTab] = useState<'compare' | 'retry'>(
    question.retryAttempt ? 'compare' : 'retry'
  );

  // Timer ticker
  useEffect(() => {
    let timer: number | undefined;
    if (isAnswering) {
      timer = window.setInterval(() => {
        setAnswerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAnswering]);

  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Text-to-speech for the question prompt
  const speakQuestion = (volumeLevel = speechVolume) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      `Retrying Question ${question.number}: ${question.prompt}`
    );
    utterance.volume = Math.max(0, Math.min(1.0, volumeLevel));
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const naturalVoice = voices.find(
        (v) =>
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel')) &&
          v.lang.startsWith('en')
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      speakQuestion(speechVolume);
    }
  };

  const handleStartAnswer = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsAnswering(true);
    setAnswerSeconds(0);
    setTranscript('');
  };

  const handleStopAndEvaluate = () => {
    setIsAnswering(false);
    setPhase('evaluating');

    // Simulate real AI analysis progression
    setTimeout(() => {
      const finalTranscript = transcript.trim() || getSampleImprovedAnswer(question.id);
      const evaluated = generateImprovedEvaluation(
        question,
        finalTranscript,
        Math.max(1, answerSeconds)
      );
      setComparison(evaluated);
      setPhase('compared');
      setActiveTab('compare');
    }, 1300);
  };

  const handleLoadSampleAnswer = () => {
    const sample = getSampleImprovedAnswer(question.id);
    setTranscript(sample);
  };

  const originalScore = getQuestionScore(question);
  const targetSeconds = (question.recommendedMinutes || 2.5) * 60;
  const originalFeedback = question.feedback;

  const formatTimerMinSec = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6 text-slate-900">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            type="button"
            onClick={onBackToReport}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors mb-2 cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Diagnostic Report</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-mono font-bold uppercase tracking-wider">
              Targeted Practice Round
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-mono text-slate-500">
              Question {question.number} of 5
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
            <span>Retry & Improve: {question.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
            Focus on addressing the AI critique from your first response. Retake this answer, review the automated comparison, and update your final score.
          </p>
        </div>

        {/* Status / View Toggle */}
        {comparison && (
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setActiveTab('retry');
                setPhase('record');
              }}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'retry' && phase === 'record'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Practice Studio
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('compare');
                setPhase('compared');
              }}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'compare' || phase === 'compared'
                  ? 'bg-[#4F46E5] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Comparison View</span>
            </button>
          </div>
        )}
      </div>

      {/* Evaluation Loading State */}
      {phase === 'evaluating' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-lg space-y-4 animate-in fade-in duration-200">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#4F46E5] animate-pulse">
              <Sparkles className="w-8 h-8" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#4F46E5]" />
            </span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Evaluating Improved Response...
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Analyzing criteria matched, delivery structure, reduction of filler phrases, and specific improvement over Attempt 1.
            </p>
          </div>
          <div className="max-w-xs mx-auto h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#4F46E5] animate-[indeterminate_1.5s_infinite_linear]" />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PHASE: COMPARED (Side-by-Side Comparison & Progress Explanation) */}
      {/* ============================================================== */}
      {phase === 'compared' && comparison && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* 1. Delta Hero Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Improvement Confirmed (+{comparison.scoreDelta} Points Gain)</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Attempt Comparison Diagnostic
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  You successfully addressed previous gaps, increasing both technical precision and framework clarity. Review the detailed side-by-side evaluation below.
                </p>
              </div>

              {/* Metric Delta Badges */}
              <div className="grid grid-cols-3 gap-3 shrink-0">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 text-center">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                    Initial Score
                  </span>
                  <div className="text-2xl font-bold text-slate-200 mt-0.5">
                    {comparison.originalScore}%
                  </div>
                  <span className="text-[10px] text-amber-400 font-medium">Attempt 1</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-emerald-400/30 rounded-2xl p-3.5 text-center">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 block">
                    Improved Score
                  </span>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                    {comparison.improvedScore}%
                  </div>
                  <span className="text-[10px] text-emerald-300 font-medium">Attempt 2</span>
                </div>

                <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-2xl p-3.5 text-center">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 block">
                    Overall Gain
                  </span>
                  <div className="text-2xl font-extrabold text-emerald-300 mt-0.5">
                    +{comparison.scoreDelta}%
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">Boost</span>
                </div>
              </div>
            </div>

            {/* Action Buttons to Apply or Re-record */}
            <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Evaluation generated at {comparison.timestamp} · 100% Criteria Verified
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setPhase('record');
                    setActiveTab('retry');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 inline mr-1.5" />
                  <span>Practice Another Round</span>
                </button>

                <button
                  type="button"
                  onClick={() => onApplyImprovement(comparison)}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Apply Improved Score to Final Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. Structured "What Improved" Analysis */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-[#4F46E5] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Key Improvements Detected by AI Diagnostic
                </h3>
                <p className="text-xs text-slate-500">
                  Concrete differences between your first and second attempts
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {comparison.whatImproved.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-mono text-[#4F46E5] font-bold block uppercase">
                      Advancement #{idx + 1}
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {item}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Side-by-Side Attempt Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left: Original Attempt (Attempt 1) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 border-t-4 border-t-amber-400">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-xs font-mono font-bold flex items-center justify-center">
                    1
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Attempt 1 (Original)</h4>
                    <span className="text-[11px] text-slate-500">Initial Response</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-700">
                  Score: {comparison.originalScore}%
                </span>
              </div>

              {/* Spoken Text */}
              <div>
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                  Candidate Spoken Transcript:
                </span>
                <blockquote className="text-xs text-slate-700 italic bg-slate-50 p-3.5 rounded-2xl border border-slate-200 leading-relaxed min-h-[90px]">
                  "{comparison.originalTranscript}"
                </blockquote>
              </div>

              {/* Evaluation Highlights */}
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Coaching Feedback Given
                  </span>
                  <ul className="text-xs text-amber-900/90 space-y-1 list-disc list-inside">
                    {comparison.originalFeedback.improvements.map((imp, i) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[11px] font-mono font-semibold text-slate-500 block uppercase">
                    Criteria Hit: {comparison.originalFeedback.keyPointsHit.length} of {question.keyCriteria.length}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {question.keyCriteria.map((c, i) => {
                      const isHit = comparison.originalFeedback.keyPointsHit.includes(c);
                      return (
                        <span
                          key={i}
                          className={`text-[11px] px-2 py-0.5 rounded-md border ${
                            isHit
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                          }`}
                        >
                          {c}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Improved Attempt (Attempt 2) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 border-t-4 border-t-emerald-500">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Attempt 2 (Improved)</h4>
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      Targeted Practice Result
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-mono font-bold text-emerald-700">
                    Score: {comparison.improvedScore}%
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-600">
                    (+{comparison.scoreDelta}%)
                  </span>
                </div>
              </div>

              {/* New Spoken Text */}
              <div>
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1">
                  Improved Response Transcript:
                </span>
                <blockquote className="text-xs text-slate-800 bg-emerald-50/30 p-3.5 rounded-2xl border border-emerald-200/80 leading-relaxed min-h-[90px] font-medium">
                  "{comparison.improvedTranscript}"
                </blockquote>
              </div>

              {/* Evaluation Highlights */}
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Strengths Demonstrated
                  </span>
                  <ul className="text-xs text-emerald-900/90 space-y-1 list-disc list-inside">
                    {comparison.improvedFeedback.strengths.slice(0, 3).map((st, i) => (
                      <li key={i}>{st}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[11px] font-mono font-semibold text-emerald-700 block uppercase">
                    Criteria Hit: {comparison.improvedFeedback.keyPointsHit.length} of {question.keyCriteria.length} (100%)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {question.keyCriteria.map((c, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium"
                      >
                        ✓ {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PHASE: RECORD (Interactive Practice Studio) */}
      {/* ============================================================== */}
      {phase === 'record' && (
        <div className="space-y-6">
          {/* Question Context & AI Critique Guide */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono text-[#4F46E5] font-semibold">
                  {question.category} · Recommended {question.recommendedMinutes} mins
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Question Prompt:
                </h3>
              </div>
              <button
                type="button"
                onClick={handleToggleSpeak}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  isSpeaking
                    ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                    : 'bg-indigo-50 text-[#4F46E5] border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>{isSpeaking ? 'Pause Audio' : 'Listen to AI Question'}</span>
              </button>
            </div>

            <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200 font-medium">
              {question.prompt}
            </p>

            {/* What you need to fix from Attempt 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Room for Improvement from Attempt 1</span>
                </div>
                <ul className="text-xs text-amber-900 space-y-1 list-disc list-inside leading-relaxed">
                  {originalFeedback?.improvements.map((im, i) => (
                    <li key={i}>{im}</li>
                  )) || (
                    <li>Incorporate more specific edge-case error recovery and production telemetry metrics.</li>
                  )}
                </ul>
              </div>

              <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#4F46E5]">
                  <Sparkles className="w-4 h-4" />
                  <span>Key Criteria to Cover for Maximum Score</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {question.keyCriteria.map((c, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white text-slate-700 border border-indigo-100 px-2 py-1 rounded-lg"
                    >
                      • {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Dual Feed Studio: AI Interviewer Avatar & Candidate Webcam */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <AIInterviewerAvatar
              isSpeaking={isSpeaking}
              isCandidateAnswering={isAnswering}
              currentQuestionNumber={question.number}
              questionCategory={question.category}
              speechVolume={speechVolume}
              onVolumeChange={onVolumeChange}
              onToggleSpeak={handleToggleSpeak}
              onReplaySpeak={() => speakQuestion(speechVolume)}
            />

            <WebcamPreview
              stream={stream}
              hasCamera={hasCamera}
              hasMic={hasMic}
              isCameraOn={isCameraOn}
              isMicOn={isMicOn}
              isAnswering={isAnswering}
              answerSeconds={answerSeconds}
              onToggleCamera={onToggleCamera}
              onToggleMic={onToggleMic}
              onOpenDeviceSettings={onOpenDeviceSettings}
            />
          </div>

          {/* Recording & Answering Controls Bar */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {isAnswering ? (
                  <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-xl">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
                    </span>
                    <span className="font-bold text-xs text-rose-700">
                      RECORDING NEW ATTEMPT
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>Ready for Attempt 2</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-[#4F46E5]" />
                  <span>Time: </span>
                  <span className={`font-bold ${isAnswering ? 'text-rose-600' : 'text-slate-800'}`}>
                    {formatTimerMinSec(answerSeconds)}
                  </span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-500">{formatTimerMinSec(targetSeconds)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                {!isAnswering ? (
                  <>
                    <button
                      type="button"
                      onClick={handleLoadSampleAnswer}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-200"
                      title="Load high-scoring reference response for instant comparison test"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Use High-Score Sample Answer</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStartAnswer}
                      className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Start Recording Attempt 2</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopAndEvaluate}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all cursor-pointer active:scale-95 animate-pulse"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>Stop & Submit for AI Evaluation</span>
                  </button>
                )}
              </div>
            </div>

            {/* Live Speech Recognition & Transcript Input */}
            <LiveTranscript
              isActive={isAnswering}
              isSpeaking={isSpeaking}
              transcript={transcript}
              onTranscriptChange={setTranscript}
              onClear={() => setTranscript('')}
            />

            {/* Quick Submit if user typed or pasted answer without recording */}
            {!isAnswering && transcript.trim().length > 10 && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleStopAndEvaluate}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#4F46E5] hover:bg-[#4338CA] rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Prepared Answer & Compare</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
