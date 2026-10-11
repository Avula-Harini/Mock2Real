import { SavedInterviewAttempt } from './history';

export type TimeRangeFilter = '7d' | '30d' | 'all';

export type ImprovementMetricKey =
  | 'overall'
  | 'communication'
  | 'confidence'
  | 'technical'
  | 'star'
  | 'voice';

export interface MetricDefinition {
  key: ImprovementMetricKey;
  label: string;
  color: string;
  dotColor: string;
  description: string;
}

export interface DailyImprovementPoint {
  dateKey: string; // YYYY-MM-DD
  dateLabel: string; // e.g. "Oct 4"
  timestamp: number;
  attemptCount: number;
  overallScore: number;
  communicationScore?: number;
  confidenceScore?: number;
  technicalScore?: number;
  starScore?: number;
  voiceScore?: number;
  attempts: SavedInterviewAttempt[];
}

export interface SkillImprovementAnalysis {
  key: ImprovementMetricKey;
  label: string;
  color: string;
  firstScore: number | null;
  latestScore: number | null;
  pointsDelta: number | null; // Latest - First in percentage points (e.g. +8.0 pts)
  relativeGrowthPct: number | null; // ((Latest - First) / First) * 100 (e.g. +11.4%)
  hasData: boolean;
  trend: 'improved' | 'declined' | 'neutral' | 'no_data';
}

export interface ImprovementDashboardSummary {
  firstAttemptScore: number | null;
  latestAttemptScore: number | null;
  pointsDelta: number | null; // score change in percentage points
  relativeGrowthPct: number | null; // relative percentage growth
  totalPracticeSessions: number;
  currentStreakDays: number;
  dateRangeLabel: string;
  mostImprovedSkill: SkillImprovementAnalysis | null;
  needsPracticeSkill: SkillImprovementAnalysis | null;
  skillsBreakdown: SkillImprovementAnalysis[];
  dailyPoints: DailyImprovementPoint[];
  hasEnoughData: boolean; // >= 2 scored attempts
  isDemoMode: boolean;
}
