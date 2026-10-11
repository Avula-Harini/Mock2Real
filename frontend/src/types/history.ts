import { FinalReportData, InterviewQuestion } from './interview';
import { STARFeedbackData } from './star';
import { OutfitFeedbackData } from './outfit';
import { InterviewPerformanceData } from './performance';

export interface RecordedVideoItem {
  questionId: string;
  questionNumber: number;
  questionTitle: string;
  blob?: Blob;
  blobUrl?: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds: number;
  recordedAt: string;
}

export interface SavedInterviewAttempt {
  id: string; // unique UUID or timestamp
  title: string; // e.g. "Senior Frontend Engineer Practice"
  roleTitle: string;
  date: string; // formatted ISO or display string
  timestamp: number;
  durationSeconds: number;
  overallScore: number;
  verdict: string;
  questionsAnsweredCount: number;
  totalQuestionsCount: number;
  reportData: FinalReportData;
  questions: InterviewQuestion[];
  starFeedback?: STARFeedbackData | null;
  outfitFeedback?: OutfitFeedbackData | null;
  performanceData?: InterviewPerformanceData | null;
  isDemoMode?: boolean;
  videoRecordings?: {
    [questionId: string]: {
      questionId: string;
      durationSeconds: number;
      sizeBytes: number;
      recordedAt: string;
      mimeType: string;
      // Note: Video Blob stored in IndexedDB separate store or as ArrayBuffer
      hasStoredBlob?: boolean;
    };
  };
}

export interface ComparisonMetricDelta {
  metricName: string;
  scoreA: number;
  scoreB: number;
  delta: number; // scoreB - scoreA
  label: string;
  improved: boolean;
  category: 'star' | 'general' | 'delivery' | 'overall';
}

export interface AttemptComparisonResult {
  attemptA: SavedInterviewAttempt;
  attemptB: SavedInterviewAttempt;
  overallScoreDelta: number;
  starScoreDelta?: number;
  metricsDeltas: ComparisonMetricDelta[];
  topImprovements: string[];
  focusAreasNext: string[];
  isDemoComparison?: boolean;
}
