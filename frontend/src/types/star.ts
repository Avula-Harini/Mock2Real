export type STARSectionKey = 'situation' | 'task' | 'action' | 'result';

export type STARRating = 'exceptional' | 'proficient' | 'adequate' | 'needs_work';

export interface STARSectionFeedback {
  section: STARSectionKey;
  title: string;
  subtitle: string;
  score: number; // 0-100 (Provided directly by backend or demo data; NOT calculated in frontend)
  rating: STARRating;
  summary: string;
  strengths: string[];
  improvements: string[];
  keySignals?: string[];
}

export interface STARFeedbackData {
  overallScore: number; // 0-100 (Provided directly by backend or demo data; NOT calculated in frontend)
  rating: STARRating;
  verdict: string;
  summary: string;
  situation: STARSectionFeedback;
  task: STARSectionFeedback;
  action: STARSectionFeedback;
  result: STARSectionFeedback;
  source: 'backend_evaluation' | 'demo_sample';
  evaluatedAt?: string;
  scope?: string;
}
