import { RolePreset, FinalReportData } from '../types/interview';

export const ROLE_PRESETS: RolePreset[] = [
  {
    id: 'fullstack-senior',
    name: 'Senior Full-Stack Engineer',
    level: 'L5 / Senior',
    description: 'System design, frontend architecture, distributed databases, resilience, and behavioral trade-offs.',
    questions: [
      {
        id: 'q1',
        number: 1,
        category: 'System Architecture & Scalability',
        title: 'Real-Time Notification System at Scale',
        prompt:
          'Design an event-driven real-time notification engine capable of delivering up to 50,000 pushes and in-app alerts per second with at-least-once delivery guarantees. How do you handle fan-out spikes, user connection drops, and backpressure?',
        recommendedMinutes: 3,
        keyCriteria: [
          'Message broker selection (Kafka / RabbitMQ / Redis PubSub)',
          'WebSocket gateway connection clustering and sticky session mitigation',
          'Dead-letter queues and idempotency mechanisms',
          'Client reconnection storms and exponential backoff jitter',
        ],
        tips: 'Start with high-level architecture: Ingestion -> Message Broker -> Dispatch Workers -> WebSocket Gateway. Then drill down into edge cases like celebrity fan-out and rate limiting.',
        status: 'active',
        feedback: {
          clarityScore: 92,
          structureScore: 88,
          strengths: [
            'Articulated trade-offs between Redis Pub/Sub for low-latency in-memory fan-out vs. Kafka partitioned logs for auditability.',
            'Proactively addressed reconnection storms using client jitter and server-side rate limit tokens.',
          ],
          improvements: [
            'Could have elaborated more on distributed idempotency keys when dispatching SMS/Email third-party fallbacks.',
          ],
          keyPointsHit: [
            'Decoupled ingestion via durable message queues',
            'Connection pool management across geographically distributed points-of-presence',
            'Idempotent event processing with Redis deduplication hashes',
          ],
          simulatedTranscript:
            'I would structure this into three tiers: an ingestion gateway, a distributed message bus using Kafka for durability, and a stateless WebSocket connection tier scaled behind a layer 4 load balancer...',
        },
      },
      {
        id: 'q2',
        number: 2,
        category: 'Frontend Performance & State',
        title: 'Optimizing Large-Scale React Application Rendering',
        prompt:
          'Suppose your team notices noticeable frame drops and high CPU usage in a complex real-time dashboard with hundreds of frequently updating data streams. Walk me through your profiling workflow and the concrete architectural remedies you would implement.',
        recommendedMinutes: 3,
        keyCriteria: [
          'Chrome DevTools Performance tab, React Profiler, and frame budget audits',
          'State localization vs. global re-render cascading',
          'Virtualization of high-cardinality lists and SVG/Canvas offloading',
          'Web Workers for heavy serialization/data parsing',
        ],
        tips: 'Mention measurement before optimization: identify long tasks (>50ms), distinguish between render phase vs commit phase, and evaluate Web Workers or memoization strategies.',
        status: 'upcoming',
        feedback: {
          clarityScore: 89,
          structureScore: 90,
          strengths: [
            'Emphasized "measure before optimizing" using React Profiler flamegraphs to pinpoint wasteful re-renders.',
            'Suggested windowing/virtualization (react-window) and isolating high-frequency ticking states.',
          ],
          improvements: [
            'Could discuss CSS contain: content properties for reducing browser layout thrashing.',
          ],
          keyPointsHit: [
            'Profile flame charts and commit durations',
            'State slicing to prevent top-level root tree re-evaluations',
            'Offloading complex math to Web Workers',
          ],
          simulatedTranscript:
            'My first step is profiling rather than guessing. I record a trace in Chrome DevTools looking for long tasks exceeding our 16ms frame budget, followed by the React DevTools Profiler...',
        },
      },
      {
        id: 'q3',
        number: 3,
        category: 'Data Modeling & Concurrency',
        title: 'Optimistic Locking & Conflict Resolution',
        prompt:
          'When multiple concurrent clients edit shared collaborative documents or checkout the final inventory item simultaneously, how do you prevent race conditions, dirty writes, and lost updates in both the relational layer and API layer?',
        recommendedMinutes: 2.5,
        keyCriteria: [
          'Optimistic concurrency control with version column vs. pessimistic SELECT FOR UPDATE',
          'Distributed locks via Redis Redlock and trade-offs',
          'Idempotency tokens on HTTP mutation endpoints',
          'User experience and reconciliation when a conflict occurs',
        ],
        tips: 'Contrast high-contention scenarios (flash sales where pessimistic locking or queueing is safer) with low-contention scenarios (collaborative docs where OCC or CRDTs shine).',
        status: 'upcoming',
        feedback: {
          clarityScore: 86,
          structureScore: 85,
          strengths: [
            'Clearly distinguished between low-contention scenarios favoring version columns vs high-contention ticket sales requiring Redis atomics.',
            'Addressed API-level HTTP 409 Conflict semantics.',
          ],
          improvements: [
            'Consider discussing how client-side state reconciles when an optimistic update fails.',
          ],
          keyPointsHit: [
            'Version checks with WHERE version = expected_version',
            'Atomic decrement operations in Redis cache',
            'Clear rollback and user notification flow',
          ],
          simulatedTranscript:
            'For low contention, an optimistic concurrency model using a version timestamp or integer check in the UPDATE statement is lightweight and avoids lock wait timeouts...',
        },
      },
      {
        id: 'q4',
        number: 4,
        category: 'Behavioral & Leadership (STAR)',
        title: 'Technical Disagreement & Cross-Functional Alignment',
        prompt:
          'Tell me about a time you strongly disagreed with a senior stakeholder or architect on a critical technology decision. How did you formulate your proposal, evaluate the trade-offs, and what was the ultimate outcome?',
        recommendedMinutes: 3,
        keyCriteria: [
          'STAR framework (Situation, Task, Action, Result)',
          'Data-driven argumentation instead of personal preference',
          'Proof-of-concept benchmarking or RFC process',
          'Commitment to team alignment regardless of final outcome',
        ],
        tips: 'Structure your response strictly using the STAR methodology: Situation (15%), Task (15%), Action (50%), Result (20%). Highlight humility and rigorous evaluation.',
        status: 'upcoming',
        feedback: {
          clarityScore: 94,
          structureScore: 92,
          strengths: [
            'Exemplary STAR story structure with clean delineation of action steps.',
            'Demonstrated maturity by running objective A/B latency benchmarks rather than arguing subjective opinions.',
          ],
          improvements: [
            'State the long-term maintenance impact 6 months down the road.',
          ],
          keyPointsHit: [
            'Structured RFC proposal with risk matrix',
            'Objective spike prototype testing throughput',
            'Executive alignment and retrospective validation',
          ],
          simulatedTranscript:
            'In my previous role, our lead architect proposed migrating our microservices orchestrator to a complex custom mesh. I believed the maintenance overhead would stall feature delivery...',
        },
      },
      {
        id: 'q5',
        number: 5,
        category: 'Production Reliability & Incident Management',
        title: 'Post-Mortem & Cascading Failures in Production',
        prompt:
          'Walk me through a severe production outage you diagnosed. How did you isolate the root cause under pressure, mitigate customer impact, and implement permanent structural safeguards to prevent recurrence?',
        recommendedMinutes: 2.5,
        keyCriteria: [
          'Mean Time to Detect (MTTD) and Mean Time to Recovery (MTTR) prioritization',
          'Blameless post-mortem culture',
          'Circuit breakers, timeouts, and graceful degradation strategies',
          'Monitoring, distributed tracing (OpenTelemetry), and alerting SLOs',
        ],
        tips: 'Show poise under pressure: prioritize stopping the bleeding (mitigation) before finding the deep root cause. Mention telemetry, dashboards, and automated circuit breakers.',
        status: 'upcoming',
        feedback: {
          clarityScore: 91,
          structureScore: 89,
          strengths: [
            'Showcased crisp operational discipline: immediate mitigation via feature flags before conducting deep forensic log analysis.',
            'Discussed blameless post-mortem actions with tracked Jira remediations.',
          ],
          improvements: [
            'Could quantify the monetary or customer SLA impact prevented.',
          ],
          keyPointsHit: [
            'Traffic shed and fallback read-only cache activation',
            'Identified unbounded query connection leak',
            'Implemented query timeout guards and health probes',
          ],
          simulatedTranscript:
            'During a peak Cyber Monday campaign, an unindexed query triggered connection pool starvation across our primary cluster. Our immediate action was flipping our circuit breaker to serve cached inventory...',
        },
      },
    ],
  },
  {
    id: 'product-manager',
    name: 'Technical Product Manager',
    level: 'Senior PM',
    description: 'Product sense, technical feasibility, metric frameworks, user empathy, and prioritization.',
    questions: [
      {
        id: 'pm-q1',
        number: 1,
        category: 'Product Strategy & Vision',
        title: 'Designing an AI-Powered Developer Onboarding Experience',
        prompt:
          'How would you define the 1-year product roadmap for an AI developer copilot specifically tailored to enterprise legacy codebases? Define the target persona, success metrics, and MVP scope.',
        recommendedMinutes: 3,
        keyCriteria: ['User segmentation', 'North star metric', 'MVP boundary', 'Security/compliance guardrails'],
        tips: 'Define clear user personas (Junior onboarding vs Principal maintaining compliance). State a North Star Metric like "Time to first merged PR".',
        status: 'active',
      },
      {
        id: 'pm-q2',
        number: 2,
        category: 'Execution & Prioritization',
        title: 'Managing Technical Debt vs. Feature Velocity',
        prompt:
          'Your engineering team demands 2 full sprints to refactor a legacy payment microservice, but sales needs two enterprise integrations to close $2M in ARR this quarter. How do you resolve this conflict?',
        recommendedMinutes: 3,
        keyCriteria: ['RICE framework', 'Risk quantification', 'Compromise scoping', 'Stakeholder communication'],
        tips: 'Avoid binary either/or thinking. Propose hybrid scoping, risk assessment of outage vs revenue loss.',
        status: 'upcoming',
      },
      {
        id: 'pm-q3',
        number: 3,
        category: 'Metrics & Experimentation',
        title: 'Diagnosing a 15% Drop in Core Conversion Funnel',
        prompt:
          'Following a major release, your core onboarding activation rate drops by 15%. How do you systematically troubleshoot whether this is seasonality, a bug, or product regression?',
        recommendedMinutes: 2.5,
        keyCriteria: ['Funnel segmentation by device/geo', 'Cohort analysis', 'Rollback trigger thresholds', 'User telemetry audits'],
        tips: 'Segment by browser, device, geography, new vs returning users. Check error monitoring logs first.',
        status: 'upcoming',
      },
    ],
  },
];

export const INITIAL_REPORT_DATA: FinalReportData = {
  overallScore: 88,
  verdict: 'Strong Hire',
  candidateName: 'Candidate (You)',
  roleTitle: 'Senior Full-Stack Engineer',
  completedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  totalDurationSeconds: 785,
  questionsAnsweredCount: 5,
  totalQuestionsCount: 5,
  metrics: {
    wordsPerMinute: 142,
    fillerWordsRatio: '1.8%',
    clarityScore: 91,
    structureScore: 89,
    technicalAccuracy: 93,
  },
  categoryScores: [
    {
      category: 'System Architecture & Scale',
      score: 91,
      benchmark: 78,
      notes: 'Excellent grasp of decoupling patterns, event streams, and connection state isolation.',
    },
    {
      category: 'Frontend & UI Performance',
      score: 89,
      benchmark: 75,
      notes: 'Systematic profiling methodology with precise browser runtime metrics (frame budgets, thread offloading).',
    },
    {
      category: 'Concurrency & Data Consistency',
      score: 85,
      benchmark: 72,
      notes: 'Accurate distinction between optimistic locking and atomic key decrements under high contention.',
    },
    {
      category: 'Communication & STAR Structure',
      score: 93,
      benchmark: 80,
      notes: 'Fluid delivery with clear division between situation, personal actions, and quantifiable impact.',
    },
    {
      category: 'Production Reliability & Incident Management',
      score: 89,
      benchmark: 76,
      notes: 'Strong operational poise; prioritized rapid customer mitigation over immediate forensic curiosity.',
    },
  ],
  keyStrengths: [
    'Articulate problem decomposition: Always defines assumptions and scale numbers before proposing technical components.',
    'Crisp architectural vocabulary: Correct usage of idempotency tokens, connection pools, and circuit breakers.',
    'Strong delivery tempo: Maintained an optimal ~142 WPM conversational pace with minimal filler pauses.',
    'Humility and alignment: Demonstrated executive readiness in behavioral STAR conflicts with data-driven RFC prototypes.',
  ],
  areasForGrowth: [
    'Deepen edge-case coverage: Remember to explicitly call out distributed transaction compensations (Saga pattern) when third-party webhooks fail.',
    'UI thread layout containment: Mention modern CSS contain and content-visibility primitives alongside React component memoization.',
    'Quantify business metrics: Tie engineering optimizations back to dollar savings or reduced cloud infrastructure costs when answering behavioral questions.',
  ],
  actionItems: [
    'Review Saga orchestration patterns for microservices with eventual consistency.',
    'Practice 60-second opening thesis statements to start technical explanations even more decisively.',
    'Incorporate cost-benefit trade-offs (e.g. AWS egress vs Redis memory footprint) during system design discussions.',
  ],
};
