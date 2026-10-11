
import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  FileText,
  Lightbulb,
  CheckCircle2,
  ListFilter,
} from 'lucide-react';
import { InterviewQuestion } from '../types/interview';

interface QuestionCardProps {
  question: InterviewQuestion;
  currentIndex: number;
  totalQuestions: number;
  isAnswering: boolean;
  isSpeaking?: boolean;
  onToggleSpeak?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isAnswering,
  isSpeaking: externalIsSpeaking,
  onToggleSpeak: externalOnToggleSpeak,
}) => {
  const [internalIsSpeaking, setInternalIsSpeaking] = useState(false);
  const isSpeaking =
    externalIsSpeaking !== undefined
      ? externalIsSpeaking
      : internalIsSpeaking;

  const [showTips, setShowTips] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);
  const [candidateNotes, setCandidateNotes] = useState<string>('');
  const [showNotes, setShowNotes] = useState(false);

  // Stop speech when the question changes
  useEffect(() => {
    if ('speechSynthesis' in window && externalIsSpeaking === undefined) {
      window.speechSynthesis.cancel();
      setInternalIsSpeaking(false);
    }
  }, [question.id, externalIsSpeaking]);

  const handleToggleSpeak = () => {
    if (externalOnToggleSpeak) {
      externalOnToggleSpeak();
      return;
    }

    if (!('speechSynthesis' in window)) return;

    if (internalIsSpeaking) {
      window.speechSynthesis.cancel();
      setInternalIsSpeaking(false);
      return;
    }

    // Read only the question, without announcing its number
    const utterance = new SpeechSynthesisUtterance(question.prompt);

    utterance.volume = 1.0;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setInternalIsSpeaking(true);
    };

    utterance.onend = () => {
      setInternalIsSpeaking(false);
    };

    utterance.onerror = () => {
      setInternalIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 lg:p-7 flex flex-col justify-between text-slate-900 transition-all">
      <div>
        {/* Metadata line without question numbers */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs text-slate-500 pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-700 font-sans font-medium">
              {question.category}
            </span>

            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>

            <span>
              Target: ~{question.recommendedMinutes} mins
            </span>
          </div>

          <div className="flex items-center gap-3">
            {question.status === 'answered' && (
              <span className="flex items-center gap-1 text-emerald-600 font-medium text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Answer Recorded ({question.recordedDurationSeconds || 0}s)
              </span>
            )}

            {/* Read aloud button */}
            {'speechSynthesis' in window && (
              <button
                type="button"
                onClick={handleToggleSpeak}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSpeaking
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={
                  isSpeaking
                    ? 'Stop speech'
                    : 'Listen to AI interviewer prompt'
                }
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                    <span>Mute AI</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Read Prompt</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Question title and prompt */}
        <div className="space-y-3">
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
            {question.title}
          </h2>

          <p className="text-base lg:text-lg text-slate-700 leading-relaxed font-normal">
            {question.prompt}
          </p>
        </div>

        {/* Evaluation criteria and answering tips */}
        <div className="mt-6 space-y-2.5">
          <div className="border border-slate-200 rounded-xl bg-slate-50/70 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowCriteria(!showCriteria)}
              className="w-full flex items-center justify-between p-3.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/60 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-indigo-600" />
                What the evaluator is looking for ({question.keyCriteria.length} evaluation points)
              </span>

              {showCriteria ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {showCriteria && (
              <div className="px-4 pb-3.5 pt-1 text-xs text-slate-600 border-t border-slate-200/80 bg-white space-y-2 animate-in fade-in duration-150">
                <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                  {question.keyCriteria.map((criterion, index) => (
                    <li key={index} className="leading-relaxed">
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Answering strategy */}
          <div className="border border-slate-200 rounded-xl bg-slate-50/70 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowTips(!showTips)}
              className="w-full flex items-center justify-between p-3.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100/60 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Recommended answering strategy & framing tips
              </span>

              {showTips ? (
                <ChevronUp className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {showTips && (
              <div className="px-4 pb-3.5 pt-1 text-xs text-slate-600 border-t border-slate-200/80 bg-white leading-relaxed animate-in fade-in duration-150">
                <p className="text-slate-700">{question.tips}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Candidate scratchpad */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              {showNotes
                ? 'Hide interview scratchpad'
                : 'Open scratchpad for talking points'}
            </span>
          </button>

          {candidateNotes.trim().length > 0 && (
            <span className="text-[11px] text-slate-400 font-mono">
              {candidateNotes.trim().split(/\s+/).length} words noted
            </span>
          )}
        </div>

        {showNotes && (
          <div className="mt-2.5 animate-in fade-in duration-150">
            <textarea
              value={candidateNotes}
              onChange={(event) =>
                setCandidateNotes(event.target.value)
              }
              placeholder="Jot down bullet points, numbers, or architectural notes before speaking..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-sans"
            />
          </div>
        )}

        {isAnswering && (
          <div className="mt-3 flex items-center justify-between p-3 bg-rose-50 border border-rose-200 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
              <span className="text-xs font-semibold text-rose-800">
                You are currently recording your response.
              </span>
            </div>

            <span className="text-[11px] text-rose-600 font-medium">
              Speak clearly towards your microphone
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
