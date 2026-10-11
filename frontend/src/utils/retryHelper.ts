import { InterviewQuestion, FinalReportData, RetryComparison, QuestionFeedback } from '../types/interview';

/**
 * Calculates a consolidated score (0-100) for a question based on clarity and structure.
 */
export function getQuestionScore(q: InterviewQuestion): number {
  if (!q.feedback) return 75;
  return Math.round((q.feedback.clarityScore + q.feedback.structureScore) / 2);
}

/**
 * Finds the question with the lowest evaluation score across an interview session.
 */
export function findWeakestQuestion(questions: InterviewQuestion[]): InterviewQuestion | null {
  if (!questions || questions.length === 0) return null;
  
  // Only consider questions that have feedback or were answered
  const evaluated = questions.filter((q) => q.feedback || q.status === 'answered');
  const pool = evaluated.length > 0 ? evaluated : questions;
  
  const sorted = [...pool].sort((a, b) => getQuestionScore(a) - getQuestionScore(b));
  return sorted[0] || null;
}

/**
 * Pre-curated, high-scoring sample answers designed to address the specific
 * shortcomings identified in each question's initial evaluation.
 */
export const SAMPLE_IMPROVED_ANSWERS: Record<string, string> = {
  q1: 'To make our real-time notification engine resilient at 50,000 pushes/second, I structure the architecture into three decoupled layers with proactive backpressure. Ingestion uses distributed Kafka partitions keyed by userId for durable ordering. The dispatch workers process batches idempotently using Redis deduplication keys with a 24-hour TTL to eliminate duplicate SMS or push alerts. For WebSocket edge delivery, connection gateways are clustered behind an Envoy Layer 4 proxy with sticky sessions. During reconnection storms, we enforce exponential backoff with full randomized jitter and circuit breakers. If third-party SMS or APNs providers throttle us, failed jobs divert to a dead-letter queue with alerting SLOs before falling back to batch digests.',
  q2: 'My workflow begins with empirical telemetry rather than premature guesswork. In Chrome DevTools Performance, I capture a 10-second trace during heavy dashboard streaming, filtering for long tasks (>50ms) to identify layout thrashing and forced reflows. Using React 19 Profiler flamegraphs, I isolate components undergoing excessive commit cycles. Architectural remedies include: first, state localization via Jotai/Zustand atomic stores so high-frequency websocket ticks do not invalidate parent trees; second, list virtualization with react-window capped at 30 DOM nodes; third, offloading payload JSON serialization and aggregation math to a background Web Worker; and fourth, applying CSS contain: content to prevent browser layout cascading.',
  q3: 'To build a fault-tolerant concurrency model that prevents dirty writes and inventory overselling, I implement a two-tiered strategy: database optimistic concurrency with explicit client-side reconciliation. In Postgres, we use an atomic monotonic version check: UPDATE items SET stock = stock - 1, version = version + 1 WHERE id = :id AND version = :expected_version. If zero rows update, the server catches the conflict and returns HTTP 409 with the authoritative state. Crucially on the frontend, rather than crashing or discarding user input, our client stores the draft in memory, displays a clean 3-way reconciliation modal showing conflicting fields, and lets the user resolve it. For flash-sale spikes with extreme contention, we shift from database locking to atomic Redis Lua scripts (DECRBY) with Redlock distributed leases, queuing checkout intents asynchronously.',
  q4: 'In my previous role, our lead architect proposed rewriting our microservices orchestration layer into a proprietary mesh, which I believed would jeopardize our quarterly release schedule. Using the STAR framework: Situation: The proposal risked a 4-month feature freeze. Task: As tech lead, I needed to objectively validate whether the custom mesh was truly necessary over standard Istio. Action: Instead of subjective debate, I created a 4-day proof-of-concept spike measuring p99 latency, RAM footprint, and maintenance hours across both options, presenting an objective RFC with a clear risk matrix. Result: The data demonstrated Istio satisfied 95% of our requirements with 80% less maintenance overhead. We aligned on Istio, delivered the quarter on time, and established our team RFC framework for future technical disputes.',
  q5: 'During a Black Friday spike, our payment service experienced a cascading failure where database connection pool exhaustion caused API timeouts across all checkout endpoints. Under pressure, my immediate priority was Mean Time to Mitigate over forensic analysis: I immediately shed load by enabling our fallback read-only inventory cache and tripping the circuit breaker on non-essential recommendation widgets, restoring 92% of core checkout throughput in under 4 minutes. Once stabilized, I used OpenTelemetry distributed traces to isolate an unbounded database query lacking a statement timeout. In our blameless post-mortem, we implemented strict 1500ms query timeouts, connection pool health probes, and automated canary rollbacks.',
  'pm-q1': 'To build an enterprise AI developer copilot for legacy codebases, I focus on the enterprise enterprise-architect persona managing million-line monorepos. Our North Star metric is "Weekly PRs Merged without Regression". MVP boundaries include a read-only AST indexer, strict SOC2 and zero-data-retention compliance gateways, and an in-editor contextual explainer before generative refactoring.',
  'pm-q2': 'I resolve this technical debt vs ARR trade-off through a collaborative compromise framework rather than a zero-sum conflict. I quantify the financial risk of payment microservice downtime against the $2M ARR target. We split scope: dedicate 65% of engineering capacity to high-risk stability hotspots while shipping a phased MVP for the enterprise integration using feature flags.',
  'pm-q3': 'When onboarding activation drops by 15%, I systematically isolate variables: first, check crash telemetry and API latency logs to rule out technical regressions; second, segment the cohort by platform, browser, geography, and acquisition channel; third, review recent deploy changelogs for UX friction. If a regression is verified in the release, I initiate an immediate rollback to protect conversion.',
};

/**
 * Returns a high-scoring sample answer tailored for the question.
 */
export function getSampleImprovedAnswer(questionId: string): string {
  if (SAMPLE_IMPROVED_ANSWERS[questionId]) {
    return SAMPLE_IMPROVED_ANSWERS[questionId];
  }
  return 'In this improved response, I systematically structure my explanation with clear assumptions, concrete architectural trade-offs, quantifiable operational metrics, and proactive recovery handling for failure modes.';
}

/**
 * Generates an evaluation for the candidate's new attempt,
 * highlighting what improved relative to the original attempt.
 */
export function generateImprovedEvaluation(
  question: InterviewQuestion,
  newTranscript: string,
  newDurationSeconds: number
): RetryComparison {
  const originalFeedback = question.feedback || {
    clarityScore: 82,
    structureScore: 80,
    strengths: ['Addressed core question requirements.'],
    improvements: ['Provide more detailed trade-offs and error recovery.'],
    simulatedTranscript: 'My initial approach was focusing on the basic solution...',
    keyPointsHit: question.keyCriteria.slice(0, 2),
  };

  const originalScore = getQuestionScore(question);
  
  // Calculate improvement delta (typically +8 to +12 points increase)
  const scoreBoost = Math.floor(Math.random() * 4) + 8; // +8 to +11
  const improvedScore = Math.min(97, Math.max(originalScore + 6, originalScore + scoreBoost));
  const scoreDelta = improvedScore - originalScore;

  const improvedClarity = Math.min(98, (originalFeedback.clarityScore || 84) + Math.floor(Math.random() * 4) + 7);
  const improvedStructure = Math.min(96, (originalFeedback.structureScore || 82) + Math.floor(Math.random() * 4) + 8);

  // Generate question-specific "what improved" bullet points
  const whatImproved: string[] = [];

  // 1. Addressed the specific previous improvement feedback
  if (originalFeedback.improvements && originalFeedback.improvements.length > 0) {
    const primaryFix = originalFeedback.improvements[0];
    whatImproved.push(
      `Directly resolved previous coaching feedback: ${primaryFix.replace(/\.$/, '')} with concrete implementation details.`
    );
  } else {
    whatImproved.push('Directly addressed previous weaknesses with concrete implementation depth and edge-case handling.');
  }

  // 2. Structural & delivery improvements
  whatImproved.push(
    'Stronger executive framework: Delineated problem decomposition, trade-offs, and failure recovery protocols in a clear logical sequence.'
  );

  // 3. Technical depth & criteria coverage
  whatImproved.push(
    `Satisfied 100% of key evaluation criteria (${question.keyCriteria.length}/${question.keyCriteria.length}), incorporating production-grade metrics and resiliency patterns.`
  );

  // 4. Candidate speech pacing & confidence
  whatImproved.push(
    `Optimal response duration (${newDurationSeconds}s vs recommended ${Math.round(question.recommendedMinutes * 60)}s) with crisp technical articulation.`
  );

  const improvedFeedback: QuestionFeedback = {
    clarityScore: improvedClarity,
    structureScore: improvedStructure,
    simulatedTranscript: newTranscript.trim() || getSampleImprovedAnswer(question.id),
    keyPointsHit: [...question.keyCriteria],
    strengths: [
      ...originalFeedback.strengths,
      'Demonstrated senior-level maturity by proactively discussing conflict reconciliation, client rollback, and backpressure.',
      'Comprehensive coverage of both happy-path scale and catastrophic edge-case degradation.',
    ],
    improvements: [
      'Minor polish: Could further quantify dollar ROI or cloud infrastructure savings in a formal board presentation.',
    ],
  };

  return {
    originalScore,
    improvedScore,
    scoreDelta,
    originalTranscript: originalFeedback.simulatedTranscript || 'Original spoken answer...',
    improvedTranscript: newTranscript.trim() || getSampleImprovedAnswer(question.id),
    whatImproved,
    originalFeedback,
    improvedFeedback,
    timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    attemptNumber: 2,
  };
}

/**
 * Updates the overall report data after an improved retry is applied.
 */
export function recalculateReportWithRetry(
  reportData: FinalReportData,
  updatedQuestions: InterviewQuestion[]
): FinalReportData {
  const totalScores = updatedQuestions.map((q) => getQuestionScore(q));
  const avgScore = Math.round(totalScores.reduce((acc, s) => acc + s, 0) / (totalScores.length || 1));
  
  // Recalculate metrics
  const newOverall = Math.max(reportData.overallScore, Math.min(98, avgScore));
  const newClarity = Math.min(98, Math.max(reportData.metrics.clarityScore, Math.round(newOverall + 1)));
  const newStructure = Math.min(97, Math.max(reportData.metrics.structureScore, Math.round(newOverall)));

  // If score rises above 90, verdict is Strong Hire
  let verdict: FinalReportData['verdict'] = reportData.verdict;
  if (newOverall >= 90) {
    verdict = 'Strong Hire';
  } else if (newOverall >= 82) {
    verdict = 'Hire';
  }

  // Update category scores if applicable
  const updatedCategories = reportData.categoryScores.map((cat) => {
    // Boost matching category score slightly
    return {
      ...cat,
      score: Math.min(98, Math.max(cat.score, cat.score + 2)),
    };
  });

  return {
    ...reportData,
    overallScore: newOverall,
    verdict,
    metrics: {
      ...reportData.metrics,
      clarityScore: newClarity,
      structureScore: newStructure,
      technicalAccuracy: Math.min(98, reportData.metrics.technicalAccuracy + 1),
    },
    categoryScores: updatedCategories,
    keyStrengths: [
      'Targeted iteration capability: Rapidly incorporated feedback between interview attempts to boost answer quality and criteria coverage.',
      ...reportData.keyStrengths.slice(0, 3),
    ],
  };
}
