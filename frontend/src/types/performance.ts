export type IndicatorRating = 'excellent' | 'good' | 'needs_work' | 'poor';

export interface PerformanceScoreMetric {
  score: number; // 0-100
  rating: IndicatorRating;
  label: string; // e.g. "Optimal", "Good", "Needs Adjustment"
  summary: string;
  details?: string[];
  benchmark?: number; // target score, default e.g. 75 or 80
}

export interface EyeContactAnalysis extends PerformanceScoreMetric {
  cameraFocusRatio?: number; // 0-100%
  lookAwayCount?: number;
}

export interface PostureAnalysis extends PerformanceScoreMetric {
  stabilityRatio?: number; // 0-100%
  slouchDetected?: boolean;
  headAlignment?: 'centered' | 'tilted_left' | 'tilted_right' | 'leaning';
}

export interface FacialExpressionAnalysis extends PerformanceScoreMetric {
  primaryEmotion?: 'confident' | 'attentive' | 'neutral' | 'stressed' | 'smiling';
  engagementIndex?: number; // 0-100%
  warmthScore?: number;
}

export interface VoiceDeliveryAnalysis extends PerformanceScoreMetric {
  pacingWpm?: number; // Words Per Minute
  paceRating?: 'too_slow' | 'ideal' | 'too_fast';
  clarityPercent?: number; // 0-100%
  fillerWordRatio?: string; // e.g., "1.2%"
  modulation?: 'monotone' | 'natural' | 'dynamic';
}

export interface OutfitFeedbackItem {
  attribute: string; // e.g. "Color Contrast", "Formality", "Grooming & Lighting"
  status: 'passed' | 'warning' | 'info';
  note: string;
}

export interface OutfitFeedbackAnalysis {
  rating: 'professional' | 'appropriate' | 'casual' | 'needs_attention';
  score?: number; // 0-100
  summary: string;
  confidenceScore?: number; // 0-100%
  items?: OutfitFeedbackItem[];
  tips?: string[];
}

export interface InterviewPerformanceData {
  eyeContact?: EyeContactAnalysis;
  posture?: PostureAnalysis;
  facialExpression?: FacialExpressionAnalysis;
  voiceDelivery?: VoiceDeliveryAnalysis;
  outfit?: OutfitFeedbackAnalysis;
  analyzedAt?: string;
  source?: 'realtime_ai' | 'mock_demo' | 'backend_stream';
}
