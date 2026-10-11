export type OutfitIndicatorKey = 'professionalAttire' | 'neatnessPresentation' | 'dressCodeSuitability';

export type OutfitRatingLevel = 'exceptional' | 'appropriate' | 'needs_adjustment' | 'inappropriate';

export interface OutfitIndicatorDetail {
  key: OutfitIndicatorKey;
  name: string;
  subtitle: string;
  score: number; // 0 - 100
  rating: OutfitRatingLevel;
  ratingLabel: string; // e.g. "Optimal & Business Ready", "Well-Groomed & Clear", "Role-Aligned"
  feedbackSummary: string;
  strengths: string[];
  suggestions: string[];
  checks: {
    label: string;
    status: 'pass' | 'warning' | 'info';
    note: string;
  }[];
}

export interface OutfitFeedbackData {
  overallScore: number; // 0 - 100
  overallVerdict: string; // e.g. "Interview-Ready & Professional"
  summary: string;
  analyzedAt?: string;
  industryOrRoleTarget?: string; // e.g. "Tech / Product / Consulting Roles"
  indicators: {
    professionalAttire: OutfitIndicatorDetail;
    neatnessPresentation: OutfitIndicatorDetail;
    dressCodeSuitability: OutfitIndicatorDetail;
  };
  generalPracticalTips: string[];
  lightingAndFramingNote?: string;
  source?: 'realtime_ai' | 'mock_demo' | 'backend_stream';
}
