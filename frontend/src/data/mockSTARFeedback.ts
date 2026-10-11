import { STARFeedbackData } from '../types/star';

/**
 * Standard Demo Mock Data for STAR-Method Interview Feedback.
 * Clearly marked as Demo Sample Mode to distinguish from real backend evaluations.
 * Scores are pre-calculated by the data payload — NEVER computed on the frontend.
 */
export const DEMO_STAR_FEEDBACK_DATA: STARFeedbackData = {
  overallScore: 92, // Pre-calculated mock score
  rating: 'exceptional',
  verdict: 'Exemplary Structured Delivery',
  summary:
    'Candidate executed the STAR methodology with exceptional clarity. Maintained rigorous emphasis on personal agency in Action, grounded by concrete, quantified business impact in Result.',
  source: 'demo_sample',
  evaluatedAt: 'Oct 10, 2026 · 12:30 PM (Demo Sample Mode)',
  scope: 'Overall Interview Aggregate (5 Responses Evaluated)',
  situation: {
    section: 'situation',
    title: 'Situation',
    subtitle: 'Context, environment, and business problem constraints',
    score: 90, // Pre-calculated
    rating: 'proficient',
    summary:
      'Set concrete architectural context and real-world production scale upfront (50,000 notifications/sec), establishing clear stakes for delivery failures.',
    strengths: [
      'Framed the high-throughput traffic spike challenge with specific operational figures.',
      'Explicitly detailed business ramifications of delayed notifications for downstream consumers.',
    ],
    improvements: [
      'Could introduce the cross-functional stakeholder landscape slightly earlier in the prompt response.',
      'Briefly mention budget or timeline constraints alongside technical hurdles.',
    ],
    keySignals: ['Production Volume Scoped', 'Business Risk Articulated', 'Realistic Pre-conditions'],
  },
  task: {
    section: 'task',
    title: 'Task',
    subtitle: 'Objectives, personal responsibility, and specific deliverables',
    score: 88, // Pre-calculated
    rating: 'proficient',
    summary:
      'Defined core technical goals with crisp SLA targets (<100ms delivery latency, zero message drops), delineating clear success criteria.',
    strengths: [
      'Established measurable SLA benchmarks for latency and packet loss tolerances.',
      'Delineated architectural goals clearly before proposing individual implementation components.',
    ],
    improvements: [
      'Sharpen the distinction between individual ownership and team-wide deliverables.',
      'Explicitly call out constraints that limited off-the-shelf commercial alternatives.',
    ],
    keySignals: ['SLA Target Defined (<100ms)', 'Success Metrics Articulated', 'Role Boundaries Outlined'],
  },
  action: {
    section: 'action',
    title: 'Action',
    subtitle: 'Concrete steps, tactical decisions, and technical ownership',
    score: 95, // Pre-calculated
    rating: 'exceptional',
    summary:
      'Demonstrated commanding technical ownership using first-person accountability ("I designed", "I isolated") while explaining intricate distributed deduplication and backoff jitter.',
    strengths: [
      'Decisively articulated decoupling ingestion via distributed logs and Redis idempotency hashes.',
      'Detailed preventative mitigation for reconnection storms using client jitter and server token buckets.',
      'Highlighted defensive engineering patterns with dead-letter queue recovery workflows.',
    ],
    improvements: [
      'Could briefly mention alternative architectures evaluated before settling on the primary stack.',
      'Highlight how code review or test coverage standards were enforced during rollout.',
    ],
    keySignals: ['High Personal Agency ("I implemented")', 'Deep Architectural Trade-offs', 'Resilience Mechanics'],
  },
  result: {
    section: 'result',
    title: 'Result',
    subtitle: 'Measurable outcomes, retrospective lessons, and long-term impact',
    score: 94, // Pre-calculated
    rating: 'exceptional',
    summary:
      'Provided verified quantitative results (99.99% delivery reliability, p99 latency under 45ms) and articulated lasting operational improvements for team on-call health.',
    strengths: [
      'Grounded outcomes in concrete engineering metrics: 99.99% delivery reliability and 3x throughput headroom.',
      'Documented operational wins: 65% reduction in recurring on-call alert pages.',
      'Shared retrospective learnings on Redis cache expiration policies to aid ongoing platform maintenance.',
    ],
    improvements: [
      'Tie infrastructural cost efficiency directly to top-level organizational savings.',
      'State customer sentiment or Net Promoter Score impact alongside system uptime.',
    ],
    keySignals: ['99.99% Uptime Verified', '65% Alert Reduction', 'Retrospective Learnings Shared'],
  },
};
