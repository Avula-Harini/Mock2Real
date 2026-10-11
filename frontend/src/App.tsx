/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { AIInterviewerAvatar } from './components/AIInterviewerAvatar';
import { LiveTranscript } from './components/LiveTranscript';
import { WebcamPreview } from './components/WebcamPreview';
import { QuestionCard } from './components/QuestionCard';
import { InterviewControls } from './components/InterviewControls';
import { ProgressSidebar } from './components/ProgressSidebar';
import { PermissionModal } from './components/PermissionModal';
import { FinalReportView } from './components/FinalReportView';
import { RetryImproveView } from './components/RetryImproveView';
import { InterviewPerformanceIndicators } from './components/InterviewPerformanceIndicators';
import { VideoRecordingManager } from './components/VideoRecordingManager';
import { InterviewHistoryView } from './components/InterviewHistoryView';
import { CompareAttemptsView } from './components/CompareAttemptsView';
import { InterviewPerformanceData } from './types/performance';
import { STARFeedbackData } from './types/star';
import { OutfitFeedbackData } from './types/outfit';
import { SavedInterviewAttempt, RecordedVideoItem } from './types/history';
import { ROLE_PRESETS, INITIAL_REPORT_DATA } from './data/mockQuestions';
import { InterviewQuestion, FinalReportData, RetryComparison } from './types/interview';
import { recalculateReportWithRetry } from './utils/retryHelper';
import {
  saveAttemptToDB,
  getAllAttemptsFromDB,
  saveVideoBlobToDB,
  deleteVideoBlobFromDB,
} from './utils/indexedDBHelper';
import {
  Clock,
  Menu,
  X,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

export default function App() {
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0);
  const currentRole = ROLE_PRESETS[selectedRoleIndex];
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Questions state (cloned from current role preset)
  const [questions, setQuestions] = useState<InterviewQuestion[]>(
    currentRole.questions
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // Default to 'interview' studio so interview works immediately, with 'home' easily accessible via navbar
  const [currentView, setCurrentView] = useState<'home' | 'interview' | 'report' | 'retry' | 'history' | 'compare'>('interview');
  const [retryQuestionId, setRetryQuestionId] = useState<string | null>(null);

  // Video Recording state (keyed by questionId)
  const [videoRecordings, setVideoRecordings] = useState<Record<string, RecordedVideoItem>>({});
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // History & Comparison selected items
  const [allSavedAttempts, setAllSavedAttempts] = useState<SavedInterviewAttempt[]>([]);
  const [selectedAttemptForReport, setSelectedAttemptForReport] = useState<SavedInterviewAttempt | null>(null);
  const [compareAttemptA, setCompareAttemptA] = useState<SavedInterviewAttempt | null>(null);
  const [compareAttemptB, setCompareAttemptB] = useState<SavedInterviewAttempt | null>(null);

  // Interview execution state
  const [interviewStatus, setInterviewStatus] = useState<
    'idle' | 'in_progress' | 'completed'
  >('idle');
  const [isAnswering, setIsAnswering] = useState(false);
  const [answerSeconds, setAnswerSeconds] = useState(0);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);

  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Hardware states
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [hasMic, setHasMic] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // AI Interviewer speaking audio state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Candidate live speech-to-text transcripts keyed by question id
  const [liveTranscripts, setLiveTranscripts] = useState<Record<string, string>>({});

  // End Interview Confirmation Modal
  const [showEndConfirmModal, setShowEndConfirmModal] = useState(false);

  // Report data state
  const [reportData, setReportData] = useState<FinalReportData>(INITIAL_REPORT_DATA);

  // Real performance analysis results from Member 3 & Member 4 backend (null by default = 'Analysis pending')
  const [backendPerformanceData, setBackendPerformanceData] = useState<InterviewPerformanceData | null>(null);

  // Real STAR-Method evaluation results from Member 3 & Member 4 backend (null by default = 'Analysis pending')
  const [backendSTARFeedback, setBackendSTARFeedback] = useState<STARFeedbackData | null>(null);
  const [isStarDemoMode, setIsStarDemoMode] = useState<boolean>(true);

  // Real Outfit & Professional Appearance evaluation results from Member 3 backend (null by default = 'Analysis pending')
  const [backendOutfitFeedback, setBackendOutfitFeedback] = useState<OutfitFeedbackData | null>(null);
  const [isOutfitDemoMode, setIsOutfitDemoMode] = useState<boolean>(true);

  // Check URL hash/parameters on mount for standalone tab navigation and printing
  useEffect(() => {
    const hash = window.location.hash;
    const searchParams = new URLSearchParams(window.location.search);
    if (hash === '#report' || searchParams.get('view') === 'report' || hash === '#print' || searchParams.get('print') === 'true') {
      setCurrentView('report');
    } else if (hash === '#home' || searchParams.get('view') === 'home') {
      setCurrentView('home');
    } else if (hash === '#interview' || searchParams.get('view') === 'interview') {
      setCurrentView('interview');
    } else if (hash === '#retry' || searchParams.get('view') === 'retry') {
      setCurrentView('retry');
    } else if (hash === '#history' || searchParams.get('view') === 'history') {
      setCurrentView('history');
    } else if (hash === '#compare' || searchParams.get('view') === 'compare') {
      setCurrentView('compare');
    }

    // Preload history attempts from IndexedDB
    getAllAttemptsFromDB().then((list) => {
      setAllSavedAttempts(list);
    }).catch((err) => {
      console.warn('Could not load attempts on mount:', err);
    });

    if (hash === '#print' || searchParams.get('print') === 'true') {
      const printTimer = setTimeout(() => {
        try {
          window.print();
        } catch (e) {
          console.warn('Auto-print in standalone tab:', e);
        }
      }, 700);
      return () => clearTimeout(printTimer);
    }
  }, []);

  // Initialize media devices on mount
  useEffect(() => {
    initMediaStream();
    return () => {
      stopAllMediaTracks();
    };
  }, []);

  const stopAllMediaTracks = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  const initMediaStream = async () => {
    try {
      setPermissionError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionError('Camera and audio APIs are not supported in this environment.');
        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      setStream(mediaStream);
      setHasCamera(mediaStream.getVideoTracks().length > 0);
      setHasMic(mediaStream.getAudioTracks().length > 0);
    } catch (err: unknown) {
      console.warn('Initial getUserMedia prompt:', err);
      const errorMsg =
        err instanceof Error
          ? err.name === 'NotAllowedError'
            ? 'Camera/microphone access was blocked. Please enable permissions in your browser bar.'
            : err.message
          : 'Unable to access media devices.';
      setPermissionError(errorMsg);
      // Fallback: try audio only if video failed
      try {
        const audioOnly = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(audioOnly);
        setHasMic(true);
        setHasCamera(false);
      } catch {
        // simulation mode
      }
    }
  };

  // Switch role preset
  const handleSelectRole = (index: number) => {
    setSelectedRoleIndex(index);
    const newQuestions = ROLE_PRESETS[index].questions.map((q, idx) => ({
      ...q,
      status: (idx === 0 ? 'active' : 'upcoming') as InterviewQuestion['status'],
      recordedDurationSeconds: undefined,
    }));
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setInterviewStatus('idle');
    setIsAnswering(false);
    setAnswerSeconds(0);
    setTotalElapsedTime(0);
  };

  // Total session timer
  useEffect(() => {
    let timer: number | undefined;
    if (interviewStatus === 'in_progress') {
      timer = window.setInterval(() => {
        setTotalElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [interviewStatus]);

  // Question Answer recording timer
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

  // Current Question
  const currentQuestion = questions[currentQuestionIndex] || questions[0];

  // Voice playback volume state: defaults to 1.0 (100% maximum supported SpeechSynthesis volume)
  const [speechVolume, setSpeechVolume] = useState<number>(1.0);

  // Stop speech synthesis if question changes or interview status changes
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [currentQuestionIndex, interviewStatus]);

  // Core speech synthesis function with volume = 1.0, rate = 0.9, pitch = 1.0
  const speakQuestion = (volumeLevel = speechVolume) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      `Question ${currentQuestionIndex + 1}: ${currentQuestion.prompt}`
    );
    // Explicitly set parameters as required:
    utterance.volume = Math.max(0, Math.min(1.0, volumeLevel)); // 1.0 maximum supported volume
    utterance.rate = 0.9; // 0.9 clear interview speed
    utterance.pitch = 1.0; // 1.0 natural voice pitch

    // Select natural sounding voice if available in browser
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const naturalVoice = voices.find(
        (v) => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')) && v.lang.startsWith('en')
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }
    }

    // Synchronize speaking indicators strictly with actual audio playback
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      speakQuestion(speechVolume);
    }
  };

  const handleReplaySpeak = () => {
    speakQuestion(speechVolume);
  };

  const handleVolumeChange = (newVolume: number) => {
    setSpeechVolume(newVolume);
    // If voice is currently playing, adjust cleanly at updated volume level
    if (isSpeaking && 'speechSynthesis' in window) {
      speakQuestion(newVolume);
    }
  };

  // Interview actions
 const handleStartInterview = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8001/start-interview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: currentRole.name,
        difficulty: 'beginner',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to start interview');
    }

    const data = await response.json();

    console.log('Backend response:', data);

    if (!data.session_id) {
      throw new Error('Backend did not return a session ID');
    }

    setSessionId(data.session_id);

    setInterviewStatus('in_progress');

    const updated = [...questions];
    updated[currentQuestionIndex].status = 'active';
    setQuestions(updated);

  } catch (error) {
    console.error('Start interview error:', error);
    alert('Unable to connect to backend. Please check FastAPI.');
  }
};
  const handleStartAnswer = () => {
    // Ensure AI interviewer voice is canceled so speech recognition is not blocked
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);

    if (interviewStatus === 'idle') {
      setInterviewStatus('in_progress');
    }
    setIsAnswering(true);
    setAnswerSeconds(0);

    const updated = [...questions];
    updated[currentQuestionIndex].status = 'answering';
    setQuestions(updated);

    // FEATURE 2: Video Recording (Webcam Video + Microphone Audio)
    if (stream && typeof window !== 'undefined' && 'MediaRecorder' in window) {
      try {
        // Choose best supported mime type
        let mimeType = 'video/webm;codecs=vp9,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm;codecs=vp8,opus';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4';
        }

        recordedChunksRef.current = [];
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        const targetQId = currentQuestion.id;
        const targetQNum = currentQuestionIndex + 1;
        const targetQTitle = currentQuestion.title;

        recorder.onstop = () => {
          const chunks = recordedChunksRef.current;
          if (chunks.length > 0) {
            const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
            const recordedItem: RecordedVideoItem = {
              questionId: targetQId,
              questionNumber: targetQNum,
              questionTitle: targetQTitle,
              blob,
              blobUrl: URL.createObjectURL(blob),
              mimeType: recorder.mimeType || 'video/webm',
              sizeBytes: blob.size,
              durationSeconds: Math.max(1, answerSeconds),
              recordedAt: new Date().toLocaleTimeString(),
            };

            setVideoRecordings((prev) => ({
              ...prev,
              [targetQId]: recordedItem,
            }));

            // Also persist to IndexedDB asynchronously
            saveVideoBlobToDB('current_session', targetQId, blob, {
              durationSeconds: Math.max(1, answerSeconds),
              recordedAt: new Date().toISOString(),
            }).catch((e) => {
              console.warn('Could not persist video chunk to IndexedDB:', e);
            });
          }
        };

        recorder.start(1000); // 1-second chunks
      } catch (recErr) {
        console.warn('MediaRecorder could not start video capture:', recErr);
      }
    }
  };

  const handleStopAnswer = () => {
    setIsAnswering(false);
    const recordedSecs = Math.max(1, answerSeconds);
    const spokenText = liveTranscripts[currentQuestion.id]?.trim();

    // Stop MediaRecorder if running
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (recErr) {
        console.warn('MediaRecorder stop error:', recErr);
      }
    }

    const updated = [...questions];
    const existingFeedback = updated[currentQuestionIndex].feedback;
    updated[currentQuestionIndex] = {
      ...updated[currentQuestionIndex],
      status: 'answered',
      recordedDurationSeconds: recordedSecs,
      feedback: existingFeedback
        ? {
            ...existingFeedback,
            simulatedTranscript: spokenText || existingFeedback.simulatedTranscript,
          }
        : undefined,
    };
    setQuestions(updated);

    // Update report data questions count
    setReportData((prev) => ({
      ...prev,
      questionsAnsweredCount: updated.filter((q) => q.status === 'answered').length,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setAnswerSeconds(0);

      const updated = [...questions];
      if (updated[nextIdx].status !== 'answered') {
        updated[nextIdx].status = 'active';
      }
      setQuestions(updated);
    } else {
      // Completed all questions
      handleConfirmEndInterview();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setAnswerSeconds(0);
    }
  };

  const handleSelectQuestionFromSidebar = (index: number) => {
    setCurrentQuestionIndex(index);
    setAnswerSeconds(0);
    setIsMobileSidebarOpen(false);

    const updated = [...questions];
    if (updated[index].status === 'upcoming') {
      updated[index].status = 'active';
    }
    setQuestions(updated);
  };

  const handleConfirmEndInterview = () => {
    setShowEndConfirmModal(false);
    setInterviewStatus('completed');
    setIsAnswering(false);

    // Stop recorder if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Stop recorder on interview end:', e);
      }
    }

    // Sync report data
   const answeredCount = questions.filter((q) => q.status === 'answered').length;
    const finalReport: FinalReportData = {
      ...reportData,
      roleTitle: currentRole.name,
      completedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      totalDurationSeconds: Math.max(totalElapsedTime, 180),
      questionsAnsweredCount: Math.max(answeredCount, questions.length),
      totalQuestionsCount: questions.length,
    };
    setReportData(finalReport);

    // FEATURE 3: Save interview attempt into IndexedDB
    const attemptId = `attempt_${Date.now()}`;
    const videoMetaMap: Record<string, {
      questionId: string;
      durationSeconds: number;
      sizeBytes: number;
      recordedAt: string;
      mimeType: string;
      hasStoredBlob: boolean;
    }> = {};

    Object.entries(videoRecordings).forEach(([qId, item]) => {
      videoMetaMap[qId] = {
        questionId: qId,
        durationSeconds: item.durationSeconds,
        sizeBytes: item.sizeBytes,
        recordedAt: item.recordedAt,
        mimeType: item.mimeType,
        hasStoredBlob: Boolean(item.blob),
      };
      // Persist blob under attemptId
      if (item.blob) {
        saveVideoBlobToDB(attemptId, qId, item.blob, {
          durationSeconds: item.durationSeconds,
          recordedAt: item.recordedAt,
        }).catch((err) => console.warn('Could not save video blob for attempt:', err));
      }
    });

    const newAttempt: SavedInterviewAttempt = {
      id: attemptId,
      title: `${currentRole.name} Practice Session`,
      roleTitle: currentRole.name,
      date: finalReport.completedAt,
      timestamp: Date.now(),
      durationSeconds: finalReport.totalDurationSeconds,
      overallScore: finalReport.overallScore,
      verdict: finalReport.verdict,
      questionsAnsweredCount: finalReport.questionsAnsweredCount,
      totalQuestionsCount: finalReport.totalQuestionsCount,
      reportData: finalReport,
      questions: [...questions],
      starFeedback: backendSTARFeedback,
      outfitFeedback: backendOutfitFeedback,
      performanceData: backendPerformanceData,
      isDemoMode: Boolean(isStarDemoMode || isOutfitDemoMode),
      videoRecordings: videoMetaMap,
    };

    saveAttemptToDB(newAttempt).then(() => {
      setAllSavedAttempts((prev) => [newAttempt, ...prev]);
    }).catch((err) => {
      console.warn('Could not save attempt to IndexedDB:', err);
    });

    // Switch to Final Report View
    setCurrentView('report');
  };

  const handleStartRetry = (questionId: string) => {
    setRetryQuestionId(questionId);
    setCurrentView('retry');
  };

  const handleApplyRetryImprovement = (comparison: RetryComparison) => {
    const targetId = retryQuestionId || questions[0].id;

    const updated = questions.map((q) => {
      if (q.id === targetId) {
        return {
          ...q,
          feedback: comparison.improvedFeedback,
          retryAttempt: comparison,
        };
      }
      return q;
    });

    setQuestions(updated);
    const updatedReport = recalculateReportWithRetry(reportData, updated);
    setReportData(updatedReport);
    setCurrentView('report');
  };

  const handleResetInterview = () => {
    setInterviewStatus('idle');
    setIsAnswering(false);
    setAnswerSeconds(0);
    setTotalElapsedTime(0);
    setCurrentQuestionIndex(0);
    setLiveTranscripts({});
    setQuestions(
      currentRole.questions.map((q, idx) => ({
        ...q,
        status: idx === 0 ? 'active' : 'upcoming',
        recordedDurationSeconds: undefined,
      }))
    );
  };

  const toggleCamera = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      videoTracks.forEach((t) => {
        t.enabled = !isCameraOn;
      });
    }
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      audioTracks.forEach((t) => {
        t.enabled = !isMicOn;
      });
    }
    setIsMicOn(!isMicOn);
  };

  // Question target timer calculation
  const targetSeconds = (currentQuestion.recommendedMinutes || 3) * 60;
  const questionProgressPct = Math.min(100, Math.round((answerSeconds / targetSeconds) * 100));

  const formatTimerMinSec = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-[#4F46E5] selection:text-white print:min-h-0 print:bg-white print:text-slate-900">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        selectedRoleIndex={selectedRoleIndex}
        onSelectRole={handleSelectRole}
        interviewStatus={interviewStatus}
        isAnswering={isAnswering}
        totalElapsedTime={totalElapsedTime}
        hasCamera={hasCamera}
        hasMic={hasMic}
        isCameraOn={isCameraOn}
        isMicOn={isMicOn}
        onOpenDeviceSettings={() => setIsDeviceModalOpen(true)}
        onEndInterview={() => setShowEndConfirmModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 print:p-0 print:m-0 print:max-w-none print:w-full">
        {currentView === 'home' ? (
          <LandingHero
            onStartPractice={() => setCurrentView('interview')}
            onExploreFeatures={() => setCurrentView('interview')}
            onViewReport={() => setCurrentView('report')}
          />
        ) : currentView === 'report' ? (
          <FinalReportView
            reportData={reportData}
            questions={questions}
            onRetake={() => {
              handleResetInterview();
              setCurrentView('interview');
            }}
            onBackToStudio={() => setCurrentView('interview')}
            onRetryQuestion={handleStartRetry}
            starFeedback={backendSTARFeedback}
            isStarDemoMode={isStarDemoMode}
            onToggleStarDemoMode={setIsStarDemoMode}
            outfitFeedback={backendOutfitFeedback}
            isOutfitDemoMode={isOutfitDemoMode}
            onToggleOutfitDemoMode={setIsOutfitDemoMode}
            performanceData={backendPerformanceData}
          />
        ) : currentView === 'history' ? (
          <InterviewHistoryView
            onSelectAttemptForReport={(attempt) => {
              setSelectedAttemptForReport(attempt);
              setReportData(attempt.reportData);
              setQuestions(attempt.questions);
              if (attempt.starFeedback) setBackendSTARFeedback(attempt.starFeedback);
              if (attempt.outfitFeedback) setBackendOutfitFeedback(attempt.outfitFeedback);
              if (attempt.performanceData) setBackendPerformanceData(attempt.performanceData);
              setCurrentView('report');
            }}
            onCompareAttempts={(attA, attB) => {
              setCompareAttemptA(attA);
              setCompareAttemptB(attB || null);
              setCurrentView('compare');
            }}
            onBackToStudio={() => setCurrentView('interview')}
          />
        ) : currentView === 'compare' ? (
          <CompareAttemptsView
            attempts={allSavedAttempts}
            attemptA={compareAttemptA}
            attemptB={compareAttemptB}
            onBackToHistory={() => setCurrentView('history')}
            onBackToStudio={() => setCurrentView('interview')}
          />
        ) : currentView === 'retry' ? (
          <RetryImproveView
            question={
              questions.find((q) => q.id === retryQuestionId) || questions[0]
            }
            onBackToReport={() => setCurrentView('report')}
            onApplyImprovement={handleApplyRetryImprovement}
            stream={stream}
            hasCamera={hasCamera}
            hasMic={hasMic}
            isCameraOn={isCameraOn}
            isMicOn={isMicOn}
            onToggleCamera={toggleCamera}
            onToggleMic={toggleMic}
            onOpenDeviceSettings={() => setIsDeviceModalOpen(true)}
            speechVolume={speechVolume}
            onVolumeChange={handleVolumeChange}
          />
        ) : (
          <div className="space-y-6">
            {/* Mobile Header / Quick Controls Bar */}
            <div className="lg:hidden flex items-center justify-between bg-white border border-slate-200 p-3.5 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Q{currentQuestionIndex + 1}/{questions.length}
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-600 truncate max-w-[150px]">
                  {currentQuestion.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
              >
                <Menu className="w-3.5 h-3.5 text-[#4F46E5]" />
                <span>Questions</span>
              </button>
            </div>

            {/* Live Progress Bar & Question Timer Banner */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                {/* Left: Current Phase & Status */}
                <div className="flex items-center gap-3">
                  {isAnswering ? (
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
                      </span>
                      <span className="font-bold text-rose-700">
                        RECORDING ANSWER
                      </span>
                    </div>
                  ) : interviewStatus === 'in_progress' ? (
                    <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg text-[#4F46E5]">
                      <span className="w-2 h-2 rounded-full bg-[#4F46E5] animate-pulse" />
                      <span className="font-semibold">Question Active — Prepare Your Response</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-slate-700 border border-slate-200">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span className="font-medium">Studio Ready — Press Start to Begin</span>
                    </div>
                  )}

                  {currentQuestion.status === 'answered' && (
                    <span className="text-emerald-600 flex items-center gap-1 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Recorded ({currentQuestion.recordedDurationSeconds || 0}s)
                    </span>
                  )}
                </div>

                {/* Right: Question Timer ticker */}
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-[#4F46E5]" />
                    <span className="font-sans font-medium">Answer Time:</span>
                    <span
                      className={`font-bold ${
                        isAnswering ? 'text-rose-600' : 'text-slate-800'
                      }`}
                    >
                      {formatTimerMinSec(answerSeconds)}
                    </span>
                  </div>

                  <span className="text-slate-300">/</span>

                  <div className="text-slate-500">
                    <span className="font-sans font-medium">Target: </span>
                    <span className="text-slate-800 font-semibold">
                      {formatTimerMinSec(targetSeconds)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar for question answer target */}
              <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    isAnswering
                      ? questionProgressPct > 90
                        ? 'bg-rose-500'
                        : 'bg-[#4F46E5]'
                      : 'bg-slate-300'
                  }`}
                  style={{ width: `${Math.max(2, questionProgressPct)}%` }}
                />
              </div>
            </div>

            {/* Desktop Dashboard 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left / Center Main Stage (Webcam + Question Card) */}
              <div className="lg:col-span-8 space-y-6">
                {/* 1. Dual-Feed Video Grid: AI Interviewer on Left, Candidate Webcam on Right */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {/* Left: AI Interviewer Avatar Panel */}
                  <AIInterviewerAvatar
                    isSpeaking={isSpeaking}
                    isCandidateAnswering={isAnswering}
                    currentQuestionNumber={currentQuestionIndex + 1}
                    questionCategory={currentQuestion.category}
                    speechVolume={speechVolume}
                    onVolumeChange={handleVolumeChange}
                    onToggleSpeak={handleToggleSpeak}
                    onReplaySpeak={handleReplaySpeak}
                  />

                  {/* Right: Candidate Webcam Preview */}
                  <WebcamPreview
                    stream={stream}
                    hasCamera={hasCamera}
                    hasMic={hasMic}
                    isCameraOn={isCameraOn}
                    isMicOn={isMicOn}
                    isAnswering={isAnswering}
                    answerSeconds={answerSeconds}
                    onToggleCamera={toggleCamera}
                    onToggleMic={toggleMic}
                    onOpenDeviceSettings={() => setIsDeviceModalOpen(true)}
                  />
                </div>

                {/* 2. Interview Performance Indicators Panel (Below Candidate Webcam Area) */}
                <InterviewPerformanceIndicators
                  analysisData={backendPerformanceData}
                  isAnswering={isAnswering}
                  allowDemoToggle={true}
                  defaultDemoMode={false}
                  title="Interview Performance Indicators"
                />

                {/* 3. Primary Question Card */}
                <QuestionCard
                  question={currentQuestion}
                  currentIndex={currentQuestionIndex}
                  totalQuestions={questions.length}
                  isAnswering={isAnswering}
                  isSpeaking={isSpeaking}
                  onToggleSpeak={handleToggleSpeak}
                />


                {/* 4. Primary Interview Action Controls */}
                <InterviewControls
                  interviewStatus={interviewStatus}
                  isAnswering={isAnswering}
                  canGoNext={currentQuestionIndex < questions.length - 1}
                  canGoPrev={currentQuestionIndex > 0}
                  isLastQuestion={currentQuestionIndex === questions.length - 1}
                  onStartInterview={handleStartInterview}
                  onStartAnswer={handleStartAnswer}
                  onStopAnswer={handleStopAnswer}
                  onNextQuestion={handleNextQuestion}
                  onPrevQuestion={handlePrevQuestion}
                  onEndInterview={() => setShowEndConfirmModal(true)}
                  onResetInterview={handleResetInterview}
                />

                {/* 5. Video Recording Manager (Per Question) */}
                <VideoRecordingManager
                  questionId={currentQuestion.id}
                  questionNumber={currentQuestionIndex + 1}
                  questionTitle={currentQuestion.title}
                  isAnswering={isAnswering}
                  recordingItem={videoRecordings[currentQuestion.id] || null}
                  onDeleteRecording={(qId) => {
                    setVideoRecordings((prev) => {
                      const next = { ...prev };
                      delete next[qId];
                      return next;
                    });
                    deleteVideoBlobFromDB('current_session', qId);
                  }}
                />
              </div>

              {/* Right Sidebar: Interview Progress Navigation */}
              <div className="hidden lg:block lg:col-span-4 sticky top-24">
                <ProgressSidebar
                  questions={questions}
                  currentIndex={currentQuestionIndex}
                  isAnswering={isAnswering}
                  totalElapsedTime={totalElapsedTime}
                  onSelectQuestion={handleSelectQuestionFromSidebar}
                  onViewReport={() => setCurrentView('report')}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Drawer for Progress Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-150 no-print print:hidden">
          <div className="relative w-full max-w-xs bg-white border-r border-slate-200 p-4 flex flex-col justify-between shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
              <span className="text-sm font-bold text-slate-900">Questions Navigation</span>
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ProgressSidebar
                questions={questions}
                currentIndex={currentQuestionIndex}
                isAnswering={isAnswering}
                totalElapsedTime={totalElapsedTime}
                onSelectQuestion={handleSelectQuestionFromSidebar}
                onViewReport={() => {
                  setIsMobileSidebarOpen(false);
                  setCurrentView('report');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Device Readiness Modal */}
      <PermissionModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        stream={stream}
        hasCamera={hasCamera}
        hasMic={hasMic}
        onRequestPermissions={initMediaStream}
        permissionError={permissionError}
      />

      {/* End Interview Confirmation Modal */}
      {showEndConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 no-print print:hidden">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">End Interview Session?</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Are you ready to submit your responses and generate your Final Diagnostic Report?
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Questions Answered:</span>
                <span className="font-bold text-slate-900">
                  {questions.filter((q) => q.status === 'answered').length} of {questions.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Duration:</span>
                <span className="font-bold text-slate-900">
                  {formatTimerMinSec(totalElapsedTime)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowEndConfirmModal(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Continue Interview
              </button>
              <button
                type="button"
                onClick={handleConfirmEndInterview}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer active:scale-95"
              >
                End & View Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
