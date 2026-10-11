import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Mic,
  MicOff,
  AlertCircle,
  FileText,
  RotateCcw,
  Sparkles,
  Edit3,
  CheckCircle2,
  Terminal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export type RecognitionStatus =
  | 'idle'
  | 'starting'
  | 'listening'
  | 'stopped'
  | 'unsupported'
  | 'error';

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onaudiostart: (() => void) | null;
  onsoundstart: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onsoundend: (() => void) | null;
  onaudioend: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
}

interface LiveTranscriptProps {
  isActive: boolean; // Candidate clicked Start Answer
  isSpeaking: boolean; // AI interviewer voice is playing
  transcript: string;
  onTranscriptChange: (newTranscript: string) => void;
  onClear?: () => void;
  className?: string;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  isActive,
  isSpeaking,
  transcript,
  onTranscriptChange,
  onClear,
  className = '',
}) => {
  // Real recognition lifecycle status (Requirement 4)
  const [recognitionStatus, setRecognitionStatus] =
    useState<RecognitionStatus>('idle');

  // Diagnostics telemetry state (Requirement 5 & 6)
  const [lastEventName, setLastEventName] = useState<string>('none');
  const [lastErrorCode, setLastErrorCode] = useState<string>('none');
  const [engineProvider, setEngineProvider] = useState<string>('checking...');
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(true);

  // Live text display state (Requirement 4 & 8)
  const [interimText, setInterimText] = useState<string>('');
  const [showManualFallback, setShowManualFallback] = useState<boolean>(false);

  // References to handle closures and avoid repeated recognition.start() calls (Requirement 9)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isRunningRef = useRef<boolean>(false); // Tracks whether recognition is actively started/listening
  const isStartingRef = useRef<boolean>(false); // Guards against rapid parallel .start() invocations
  const hasPermissionErrorRef = useRef<boolean>(false); // Requirement 10: Never auto-restart on permission denial
  const baseTranscriptRef = useRef<string>(transcript);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Synchronize base transcript when changed from outside
  useEffect(() => {
    baseTranscriptRef.current = transcript;
  }, [transcript]);

  // Determine provider name on mount (Requirement 2)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.SpeechRecognition) {
      setEngineProvider('window.SpeechRecognition (Standard)');
    } else if (window.webkitSpeechRecognition) {
      setEngineProvider('window.webkitSpeechRecognition (WebKit/Blink)');
    } else {
      setEngineProvider('Unsupported by this browser');
      setRecognitionStatus('unsupported');
    }
  }, []);

  // Stop recognition helper
  const stopRecognition = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isRunningRef.current || isStartingRef.current) {
      try {
        console.log('[SpeechRecognition] Invoking recognition.stop()');
        recognition.stop();
      } catch (err) {
        console.warn('[SpeechRecognition] Error stopping recognition:', err);
      }
    }
    isRunningRef.current = false;
    isStartingRef.current = false;
    setInterimText('');
    setRecognitionStatus((prev) =>
      prev === 'listening' || prev === 'starting' ? 'stopped' : prev
    );
  }, []);

  // Start recognition helper with safety guards (Requirement 3, 9, 10)
  const startRecognition = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    // Requirement 10: Do not restart after permission denial
    if (hasPermissionErrorRef.current) {
      console.warn(
        '[SpeechRecognition] Blocked start: permission was previously denied.'
      );
      setRecognitionStatus('error');
      setLastErrorCode('not-allowed');
      return;
    }

    // Requirement 9: Prevent repeated recognition.start() calls while already active
    if (isRunningRef.current || isStartingRef.current) {
      console.log(
        '[SpeechRecognition] Already starting or listening, skipping duplicate start() call'
      );
      return;
    }

    try {
      console.log('[SpeechRecognition] Invoking recognition.start()');
      isStartingRef.current = true;
      setRecognitionStatus('starting');
      setLastEventName('calling start()');
      recognition.start();
    } catch (err: unknown) {
      isStartingRef.current = false;
      const errorStr =
        err instanceof Error ? err.name || err.message : String(err);
      console.warn('[SpeechRecognition] Exception during start():', errorStr);
      setLastEventName(`start() exception: ${errorStr}`);

      // If already started in browser engine, mark listening
      if (errorStr.includes('already started')) {
        isRunningRef.current = true;
        setRecognitionStatus('listening');
      } else {
        setRecognitionStatus('error');
        setLastErrorCode(errorStr);
      }
    }
  }, []);

  // Initialize SpeechRecognition instance on mount (Requirement 2 & 5)
  useEffect(() => {
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setRecognitionStatus('unsupported');
      setEngineProvider('Unsupported');
      setShowManualFallback(true);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      // 1. onstart (Requirement 5)
      recognition.onstart = () => {
        console.log('[SpeechRecognition] onstart fired');
        isStartingRef.current = false;
        isRunningRef.current = true;
        setRecognitionStatus('listening');
        setLastEventName('onstart');
      };

      // 2. onaudiostart (Requirement 5)
      recognition.onaudiostart = () => {
        console.log('[SpeechRecognition] onaudiostart fired');
        setLastEventName('onaudiostart');
      };

      // 3. onsoundstart (Requirement 5)
      recognition.onsoundstart = () => {
        console.log('[SpeechRecognition] onsoundstart fired');
        setLastEventName('onsoundstart');
      };

      // 4. onspeechstart (Requirement 5)
      recognition.onspeechstart = () => {
        console.log('[SpeechRecognition] onspeechstart fired');
        setLastEventName('onspeechstart');
      };

      // 5. onresult (Requirement 5 & 8)
      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        console.log(
          '[SpeechRecognition] onresult fired with index:',
          event.resultIndex,
          event.results
        );
        setLastEventName(`onresult (${event.results.length} items)`);

        let sessionFinal = '';
        let currentInterim = '';

        // Iterate over results to ensure all final and interim words are captured
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          const text = res[0]?.transcript || '';

          if (res.isFinal) {
            sessionFinal += text + ' ';
          } else {
            currentInterim += text;
          }
        }

        // Requirement 8: Update visible transcript in React state
        const combined = (baseTranscriptRef.current + ' ' + sessionFinal).trim();
        if (combined) {
          onTranscriptChange(combined);
        }

        setInterimText(currentInterim);
      };

      // 6. onerror (Requirement 5 & 6)
      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        console.log('[SpeechRecognition] onerror fired:', event.error, event);
        setLastEventName(`onerror: ${event.error}`);
        setLastErrorCode(event.error);

        // Requirement 10: Do not automatically restart after permission denial
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          hasPermissionErrorRef.current = true;
          setRecognitionStatus('error');
          setShowManualFallback(true);
        } else if (event.error === 'no-speech') {
          // 'no-speech' is non-fatal: user was silent, recognition will transition
          console.log('[SpeechRecognition] no-speech detected (candidate was silent)');
        } else {
          setRecognitionStatus('error');
          setShowManualFallback(true);
        }

        isStartingRef.current = false;
        isRunningRef.current = false;
      };

      // 7. onend (Requirement 5)
      recognition.onend = () => {
        console.log('[SpeechRecognition] onend fired');
        setLastEventName('onend');
        isRunningRef.current = false;
        isStartingRef.current = false;
        setInterimText('');

        // If still active and not paused by AI voice, and no fatal permission error, keep ready
        if (isActive && !isSpeaking && !hasPermissionErrorRef.current) {
          setRecognitionStatus('stopped');
        } else {
          setRecognitionStatus(isActive ? 'stopped' : 'idle');
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('[SpeechRecognition] Initialization exception:', err);
      setRecognitionStatus('unsupported');
      setShowManualFallback(true);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup abort errors
        }
      }
      isRunningRef.current = false;
      isStartingRef.current = false;
    };
  }, [isActive, isSpeaking, onTranscriptChange]);

  // Requirement 7: Check that AI voice playback is not continuously pausing or stopping recognition
  // Verify both isSpeaking prop and window.speechSynthesis.speaking
  const isAIVoiceActuallySpeaking =
    isSpeaking &&
    (typeof window !== 'undefined' && 'speechSynthesis' in window
      ? window.speechSynthesis.speaking
      : true);

  // Manage recognition execution when candidate clicks Start Answer vs Stop Answer
  useEffect(() => {
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass || hasPermissionErrorRef.current) return;

    // Condition to run: Candidate is answering AND AI voice is NOT playing
    const shouldRun = isActive && !isAIVoiceActuallySpeaking;

    if (shouldRun) {
      // Small timeout to allow audio device transition after candidate clicks button
      const timer = setTimeout(() => {
        startRecognition();
      }, 150);
      return () => clearTimeout(timer);
    } else {
      stopRecognition();
    }
  }, [isActive, isAIVoiceActuallySpeaking, startRecognition, stopRecognition]);

  // Auto-scroll transcript container as words appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, interimText]);

  const wordCount = transcript.trim()
    ? transcript.trim().split(/\s+/).length
    : 0;

  // Helper for status badge styling
  const getStatusBadge = () => {
    switch (recognitionStatus) {
      case 'listening':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span>Listening Live</span>
          </div>
        );
      case 'starting':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Starting Mic...</span>
          </div>
        );
      case 'stopped':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Stopped</span>
          </div>
        );
      case 'error':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Error ({lastErrorCode})</span>
          </div>
        );
      case 'unsupported':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>Unsupported</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span>Idle (Ready)</span>
          </div>
        );
    }
  };

  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${
        recognitionStatus === 'listening' ? 'ring-1 ring-indigo-500/50' : ''
      } ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
              recognitionStatus === 'listening'
                ? 'bg-rose-50 text-rose-600'
                : 'bg-indigo-50 text-[#4F46E5]'
            }`}
          >
            {recognitionStatus === 'listening' ? (
              <Mic className="w-4 h-4 animate-pulse" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
              Live Speech-to-Text Transcription
            </h3>
            <p className="text-[11px] text-slate-500 font-normal">
              Direct microphone recognition powered by Web Speech API
            </p>
          </div>
        </div>

        {/* Real Recognition Status Badge (Requirement 4) */}
        <div className="flex items-center gap-2">
          {getStatusBadge()}

          {transcript.trim() && onClear && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Clear current transcript"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowManualFallback(!showManualFallback)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              showManualFallback
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
            }`}
            title="Toggle manual text entry fallback"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Spoken Words Live Display Box (Requirement 4 & 8) */}
      <div
        ref={scrollRef}
        className="mt-3.5 min-h-[72px] max-h-[140px] overflow-y-auto bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-xs sm:text-sm text-slate-800 font-sans leading-relaxed"
      >
        {transcript || interimText ? (
          <div>
            <span className="text-slate-900 font-normal">{transcript}</span>
            {interimText && (
              <span className="text-[#4F46E5] italic font-medium ml-1">
                {interimText}
              </span>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 text-xs italic py-3">
            {isActive
              ? recognitionStatus === 'listening'
                ? 'Listening for your voice... Speak clearly into your microphone.'
                : 'Recognition starting up...'
              : 'Click "Start Answer" to start live microphone transcription.'}
          </div>
        )}
      </div>

      {/* Manual Transcript Fallback (Requirement 12) */}
      {showManualFallback && (
        <div className="mt-3 p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-[#4F46E5]" />
              Manual Transcript Entry Fallback
            </span>
            <span className="text-[11px] text-slate-500">
              Type or edit your answer directly
            </span>
          </div>
          <textarea
            value={transcript}
            onChange={(e) => onTranscriptChange(e.target.value)}
            placeholder="Type or paste your answer here if speech recognition is unavailable..."
            rows={2}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
          />
        </div>
      )}

      {/* Live Transcript Footer Meta */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#4F46E5]" />
          <span className="font-sans">
            {recognitionStatus === 'listening'
              ? 'Transcribing in real time...'
              : `Status: ${recognitionStatus}`}
          </span>
        </div>
        <span>{wordCount} words recorded</span>
      </div>

      {/* Small Diagnostics Section (Requirement 6) */}
      <div className="mt-3 pt-2.5 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowDiagnostics(!showDiagnostics)}
          className="flex items-center justify-between w-full text-[11px] font-mono text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3 h-3 text-indigo-500" />
            <span>Speech Recognition Diagnostics</span>
          </span>
          {showDiagnostics ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showDiagnostics && (
          <div className="mt-2 p-2.5 bg-slate-900 text-slate-200 rounded-xl font-mono text-[10px] space-y-1 overflow-x-auto shadow-inner">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <div>
                <span className="text-slate-400">Engine Status:</span>{' '}
                <span
                  className={
                    recognitionStatus === 'listening'
                      ? 'text-emerald-400 font-bold'
                      : recognitionStatus === 'error'
                      ? 'text-rose-400 font-bold'
                      : 'text-amber-300'
                  }
                >
                  {recognitionStatus}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Recent Event:</span>{' '}
                <span className="text-indigo-300">{lastEventName}</span>
              </div>
              <div>
                <span className="text-slate-400">Last Error Code:</span>{' '}
                <span
                  className={
                    lastErrorCode === 'none' ? 'text-slate-400' : 'text-rose-400'
                  }
                >
                  {lastErrorCode}
                </span>
              </div>
              <div>
                <span className="text-slate-400">AI Speech Block:</span>{' '}
                <span
                  className={
                    isAIVoiceActuallySpeaking ? 'text-rose-400' : 'text-emerald-400'
                  }
                >
                  {isAIVoiceActuallySpeaking ? 'ACTIVE (Paused)' : 'NONE (Listening Allowed)'}
                </span>
              </div>
            </div>
            <div className="pt-1 border-t border-slate-800 text-[9.5px] text-slate-400">
              Provider: {engineProvider}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
