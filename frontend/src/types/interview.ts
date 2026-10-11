export type QuestionStatus = 'upcoming' | 'active' | 'answering' | 'answered' | 'skipped';

export interface QuestionFeedback {
  strengths: string[];
  improvements: string[];
  clarityScore: number;
  structureScore: number;
  simulatedTranscript: string;
  keyPointsHit: string[];
}

export interface RetryComparison {
  originalScore: number;
  improvedScore: number;
  scoreDelta: number;
  originalTranscript: string;
  improvedTranscript: string;
  whatImproved: string[];
  originalFeedback: QuestionFeedback;
  improvedFeedback: QuestionFeedback;
  timestamp: string;
  attemptNumber?: number;
}

export interface InterviewQuestion {
  id: string;
  number: number;
  category: string;
  title: string;
  prompt: string;
  recommendedMinutes: number;
  keyCriteria: string[];
  tips: string;
  status: QuestionStatus;
  recordedDurationSeconds?: number;
  feedback?: QuestionFeedback;
  retryAttempt?: RetryComparison;
}

export interface RolePreset {
  id: string;
  name: string;
  level: string;
  description: string;
  questions: InterviewQuestion[];
}

export interface ReportCategoryScore {
  category: string;
  score: number;
  benchmark: number;
  notes: string;
}

export interface FinalReportData {
  overallScore: number;
  verdict: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'Needs Improvement';
  candidateName: string;
  roleTitle: string;
  completedAt: string;
  totalDurationSeconds: number;
  questionsAnsweredCount: number;
  totalQuestionsCount: number;
  metrics: {
    wordsPerMinute: number;
    fillerWordsRatio: string;
    clarityScore: number;
    structureScore: number;
    technicalAccuracy: number;
  };
  categoryScores: ReportCategoryScore[];
  keyStrengths: string[];
  areasForGrowth: string[];
  actionItems: string[];
}
