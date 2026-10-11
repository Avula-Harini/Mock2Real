import { InterviewPerformanceData } from '../types/performance';

/**
 * Standard Demo Mock Data for Interview Performance Indicators.
 * Note: Clearly labelled as Demo Mock Data to differentiate from backend-streamed analysis.
 */
export const DEMO_PERFORMANCE_DATA: InterviewPerformanceData = {
  source: 'mock_demo',
  analyzedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  eyeContact: {
    score: 86,
    rating: 'excellent',
    label: 'Strong Camera Focus',
    summary: 'Candidate maintains consistent lens gaze (86% active gaze), demonstrating composure and engagement.',
    cameraFocusRatio: 86,
    lookAwayCount: 3,
    benchmark: 80,
    details: [
      '86% direct camera contact throughout answer',
      'Brief natural pauses when organizing complex thoughts',
      'No persistent screen-reading or notes-glancing detected',
    ],
  },
  posture: {
    score: 82,
    rating: 'good',
    label: 'Upright & Centered',
    summary: 'Spine alignment is centered and open. Minimal fidgeting with comfortable shoulder placement.',
    stabilityRatio: 88,
    slouchDetected: false,
    headAlignment: 'centered',
    benchmark: 75,
    details: [
      'Upper torso well centered within upper-third frame',
      'Open chest posture signals confidence',
      'Minor side-to-side lean observed during first 15 seconds',
    ],
  },
  facialExpression: {
    score: 79,
    rating: 'good',
    label: 'Engaged & Attentive',
    summary: 'Warm, approachable demeanor with natural nodding and active listening micro-expressions.',
    primaryEmotion: 'confident',
    engagementIndex: 82,
    warmthScore: 78,
    benchmark: 75,
    details: [
      'Consistent positive facial affect and pleasant greeting smile',
      'Appropriate focus during question comprehension phase',
      'Slight brow furrow during technical recall (natural)',
    ],
  },
  voiceDelivery: {
    score: 84,
    rating: 'excellent',
    label: 'Articulate & Steady',
    summary: 'Pacing averages 138 WPM (optimal conversational range) with crisp diction and low filler frequency.',
    pacingWpm: 138,
    paceRating: 'ideal',
    clarityPercent: 91,
    fillerWordRatio: '1.4%',
    modulation: 'natural',
    benchmark: 80,
    details: [
      '138 WPM delivery aligns with top 10% tech interview benchmark',
      'Low filler frequency (1.4% "um/uh" ratio)',
      'Natural pitch modulation prevents flat monotone delivery',
    ],
  },
  outfit: {
    rating: 'professional',
    score: 92,
    summary: 'Clean business-casual attire with high contrast against the neutral backdrop.',
    confidenceScore: 94,
    items: [
      {
        attribute: 'Contrast & Visibility',
        status: 'passed',
        note: 'Solid collared shirt provides sharp contrast with room lighting.',
      },
      {
        attribute: 'Formality Rating',
        status: 'passed',
        note: 'Meets tech & corporate business casual standards.',
      },
      {
        attribute: 'Framing & Distractions',
        status: 'passed',
        note: 'No distracting bright patterns or reflective accessories detected.',
      },
    ],
    tips: [
      'Attire aligns well with senior engineering and leadership interviews.',
      'Maintain adequate ambient lighting to prevent glare.',
    ],
  },
};
