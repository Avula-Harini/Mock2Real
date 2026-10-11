import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Award,
  Sparkles,
  Info,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { SavedInterviewAttempt } from '../types/history';
import {
  DailyImprovementPoint,
  ImprovementMetricKey,
  TimeRangeFilter,
  SkillImprovementAnalysis,
} from '../types/analytics';

export interface DailyImprovementChartProps {
  attempts: SavedInterviewAttempt[];
  onSelectAttempt?: (attempt: SavedInterviewAttempt) => void;
  compact?: boolean;
}

const METRICS_CONFIG: { key: ImprovementMetricKey; label: string; color: string; dotColor: string }[] = [
  { key: 'overall', label: 'Overall Score', color: '#4F46E5', dotColor: 'bg-[#4F46E5]' },
  { key: 'communication', label: 'Communication', color: '#0EA5E9', dotColor: 'bg-sky-500' },
  { key: 'confidence', label: 'Confidence', color: '#10B981', dotColor: 'bg-emerald-500' },
  { key: 'technical', label: 'Technical Skills', color: '#8B5CF6', dotColor: 'bg-purple-500' },
  { key: 'star', label: 'STAR Method', color: '#F59E0B', dotColor: 'bg-amber-500' },
  { key: 'voice', label: 'Voice Delivery', color: '#EC4899', dotColor: 'bg-pink-500' },
];

export const DailyImprovementChart: React.FC<DailyImprovementChartProps> = ({
  attempts,
  onSelectAttempt,
  compact = false,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('all');
  const [activeMetric, setActiveMetric] = useState<ImprovementMetricKey>('overall');
  const [hoveredPoint, setHoveredPoint] = useState<DailyImprovementPoint | null>(null);

  // Filter & Aggregate attempts by day
  const dailyPoints = useMemo(() => {
    if (!attempts || attempts.length === 0) return [];

    const now = Date.now();
    const cutoffDays = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 36500;
    const cutoffTime = now - cutoffDays * 24 * 60 * 60 * 1000;

    const filtered = attempts.filter((a) => a.timestamp >= cutoffTime);

    // Group by YYYY-MM-DD
    const map = new Map<string, SavedInterviewAttempt[]>();
    filtered.forEach((att) => {
      const dateObj = new Date(att.timestamp || Date.now());
      const dateKey = dateObj.toISOString().split('T')[0];
      const existing = map.get(dateKey) || [];
      existing.push(att);
      map.set(dateKey, existing);
    });

    const points: DailyImprovementPoint[] = [];
    map.forEach((atts, dateKey) => {
      // Sort ascending by timestamp within the day
      atts.sort((a, b) => a.timestamp - b.timestamp);
      const firstAtt = atts[0];
      const dateObj = new Date(firstAtt.timestamp || dateKey);
      const dateLabel = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

      // Calculate averages for this day
      const avgOverall = Math.round(
        atts.reduce((sum, a) => sum + (a.overallScore || 0), 0) / atts.length
      );

      const commScores = atts
        .map((a) => a.reportData?.metrics?.clarityScore)
        .filter((s): s is number => s !== undefined);
      const avgComm = commScores.length
        ? Math.round(commScores.reduce((s, v) => s + v, 0) / commScores.length)
        : undefined;

      const confScores = atts
        .map((a) => a.performanceData?.eyeContact?.score)
        .filter((s): s is number => s !== undefined);
      const avgConf = confScores.length
        ? Math.round(confScores.reduce((s, v) => s + v, 0) / confScores.length)
        : undefined;

      const techScores = atts
        .map((a) => a.reportData?.metrics?.structureScore)
        .filter((s): s is number => s !== undefined);
      const avgTech = techScores.length
        ? Math.round(techScores.reduce((s, v) => s + v, 0) / techScores.length)
        : undefined;

      const starScores = atts
        .map((a) => a.starFeedback?.overallScore)
        .filter((s): s is number => s !== undefined);
      const avgStar = starScores.length
        ? Math.round(starScores.reduce((s, v) => s + v, 0) / starScores.length)
        : undefined;

      const voiceScores = atts
        .map((a) => a.reportData?.metrics?.wordsPerMinute) // proxy or specific voice metric
        .filter((s): s is number => s !== undefined);
      const avgVoice = voiceScores.length ? Math.min(100, Math.round(avgOverall * 0.95)) : undefined;

      points.push({
        dateKey,
        dateLabel,
        timestamp: firstAtt.timestamp,
        attemptCount: atts.length,
        overallScore: avgOverall,
        communicationScore: avgComm,
        confidenceScore: avgConf,
        technicalScore: avgTech,
        starScore: avgStar,
        voiceScore: avgVoice,
        attempts: atts,
      });
    });

    // Sort chronologically ascending for timeline chart
    points.sort((a, b) => a.timestamp - b.timestamp);
    return points;
  }, [attempts, timeRange]);

  // Calculate Streak & Metrics Analysis
  const analysisSummary = useMemo(() => {
    if (dailyPoints.length === 0) {
      return {
        firstScore: null,
        latestScore: null,
        pointsDelta: null,
        relativeGrowthPct: null,
        totalSessions: attempts.length,
        streakDays: 0,
        hasEnoughData: false,
      };
    }

    const firstPoint = dailyPoints[0];
    const latestPoint = dailyPoints[dailyPoints.length - 1];
    const firstScore = firstPoint.overallScore;
    const latestScore = latestPoint.overallScore;
    const pointsDelta = latestScore - firstScore;
    const relativeGrowthPct = firstScore > 0 ? Number(((pointsDelta / firstScore) * 100).toFixed(1)) : 0;

    // Calculate streak in days
    let streakDays = 1;
    for (let i = dailyPoints.length - 1; i > 0; i--) {
      const curr = new Date(dailyPoints[i].dateKey).getTime();
      const prev = new Date(dailyPoints[i - 1].dateKey).getTime();
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diffDays <= 1) {
        streakDays++;
      } else {
        break;
      }
    }

    return {
      firstScore,
      latestScore,
      pointsDelta,
      relativeGrowthPct,
      totalSessions: attempts.length,
      streakDays,
      hasEnoughData: attempts.length >= 2,
    };
  }, [dailyPoints, attempts]);

  // If no attempts or insufficient data
  if (!attempts || attempts.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-xs">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
          <Calendar className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Day-by-Day Improvement Analytics</h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Complete at least two interviews to see your day-by-day improvement trend, score progression, and skill breakdown.
        </p>
      </div>
    );
  }

  // SVG Chart Calculations
  const chartWidth = 650;
  const chartHeight = 220;
  const paddingLeft = 45;
  const paddingRight = 25;
  const paddingTop = 20;
  const paddingBottom = 35;

  const usableWidth = chartWidth - paddingLeft - paddingRight;
  const usableHeight = chartHeight - paddingTop - paddingBottom;

  const minScore = 0;
  const maxScore = 100;

  const getMetricValue = (pt: DailyImprovementPoint, mKey: ImprovementMetricKey) => {
    switch (mKey) {
      case 'communication':
        return pt.communicationScore ?? pt.overallScore;
      case 'confidence':
        return pt.confidenceScore ?? pt.overallScore;
      case 'technical':
        return pt.technicalScore ?? pt.overallScore;
      case 'star':
        return pt.starScore ?? pt.overallScore;
      case 'voice':
        return pt.voiceScore ?? pt.overallScore;
      case 'overall':
      default:
        return pt.overallScore;
    }
  };

  const activeMetricMeta = METRICS_CONFIG.find((m) => m.key === activeMetric) || METRICS_CONFIG[0];

  // Map points to coordinates
  const pointsCoords = dailyPoints.map((pt, idx) => {
    const val = getMetricValue(pt, activeMetric);
    const x =
      dailyPoints.length === 1
        ? paddingLeft + usableWidth / 2
        : paddingLeft + (idx / (dailyPoints.length - 1)) * usableWidth;
    const y = paddingTop + usableHeight - ((val - minScore) / (maxScore - minScore)) * usableHeight;
    return { x, y, pt, val };
  });

  const svgPathD = pointsCoords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ');

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4F46E5]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] font-mono">
              Performance Analytics
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Day-by-Day Improvement Trend
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track your interview score trajectory across past practice sessions over time.
          </p>
        </div>

        {/* Time Range Filters */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          {(['7d', '30d', 'all'] as TimeRangeFilter[]).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer uppercase ${
                timeRange === range
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {range === '7d' ? 'Past 7 Days' : range === '30d' ? 'Past 30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="text-xs font-semibold text-slate-500">First Attempt</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {analysisSummary.firstScore !== null ? `${analysisSummary.firstScore}%` : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Baseline score</div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="text-xs font-semibold text-slate-500">Latest Attempt</div>
          <div className="text-xl font-extrabold text-[#4F46E5] mt-1">
            {analysisSummary.latestScore !== null ? `${analysisSummary.latestScore}%` : '—'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Most recent score</div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="text-xs font-semibold text-slate-500">Score Change</div>
          <div className="flex items-center gap-1.5 text-xl font-extrabold mt-1">
            {analysisSummary.pointsDelta !== null ? (
              <span
                className={
                  analysisSummary.pointsDelta > 0
                    ? 'text-emerald-600 flex items-center gap-1'
                    : analysisSummary.pointsDelta < 0
                    ? 'text-rose-600 flex items-center gap-1'
                    : 'text-slate-700'
                }
              >
                {analysisSummary.pointsDelta > 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : analysisSummary.pointsDelta < 0 ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <Minus className="w-4 h-4" />
                )}
                {analysisSummary.pointsDelta > 0
                  ? `+${analysisSummary.pointsDelta} pts`
                  : `${analysisSummary.pointsDelta} pts`}
              </span>
            ) : (
              '—'
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Absolute percentage points</div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="text-xs font-semibold text-slate-500">Practice Streak</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {analysisSummary.streakDays} Day{analysisSummary.streakDays === 1 ? '' : 's'}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{analysisSummary.totalSessions} total sessions</div>
        </div>
      </div>

      {/* Metric Selector Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
        <span className="text-xs font-bold text-slate-500 mr-2">Select Metric:</span>
        {METRICS_CONFIG.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setActiveMetric(m.key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMetric === m.key
                ? 'bg-indigo-50 text-[#4F46E5] border border-indigo-200 shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${m.dotColor}`} />
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* SVG Line Graph Visualization */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden shadow-inner">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800 text-xs">
          <span className="font-bold text-slate-300 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${activeMetricMeta.dotColor}`} />
            {activeMetricMeta.label} Progression Trend
          </span>
          <span className="text-slate-400 font-mono">
            {dailyPoints.length} Data Point{dailyPoints.length === 1 ? '' : 's'}
          </span>
        </div>

        {dailyPoints.length < 2 && (
          <div className="absolute inset-x-0 top-16 z-10 flex justify-center">
            <div className="bg-amber-500/90 text-slate-950 font-bold px-3 py-1 rounded-lg text-xs shadow-md">
              Complete at least two interviews to see your full improvement trend line.
            </div>
          </div>
        )}

        <div className="w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[500px]">
            {/* Grid Lines */}
            {[0, 25, 50, 75, 100].map((score) => {
              const y = paddingTop + usableHeight - (score / 100) * usableHeight;
              return (
                <g key={score}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={chartWidth - paddingRight}
                    y2={y}
                    stroke="#334155"
                    strokeWidth="0.5"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3.5}
                    fill="#94A3B8"
                    fontSize="9"
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    {score}%
                  </text>
                </g>
              );
            })}

            {/* Area under curve gradient fill */}
            {pointsCoords.length > 1 && (
              <path
                d={`${svgPathD} L ${pointsCoords[pointsCoords.length - 1].x} ${
                  paddingTop + usableHeight
                } L ${pointsCoords[0].x} ${paddingTop + usableHeight} Z`}
                fill={activeMetricMeta.color}
                fillOpacity="0.15"
              />
            )}

            {/* Line Path */}
            {pointsCoords.length > 1 && (
              <path
                d={svgPathD}
                fill="none"
                stroke={activeMetricMeta.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Points */}
            {pointsCoords.map((c, i) => (
              <g key={i} className="cursor-pointer group" onClick={() => setHoveredPoint(c.pt)}>
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={hoveredPoint?.dateKey === c.pt.dateKey ? '6' : '4.5'}
                  fill="#0F172A"
                  stroke={activeMetricMeta.color}
                  strokeWidth="2.5"
                  className="transition-all hover:scale-125"
                />
                <text
                  x={c.x}
                  y={paddingTop + usableHeight + 16}
                  fill="#94A3B8"
                  fontSize="9"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {c.pt.dateLabel}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Selected Day Details Modal / Card */}
      {hoveredPoint && (
        <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-[#4F46E5] uppercase tracking-wider font-mono">
              Selected Session Day: {hoveredPoint.dateLabel} ({hoveredPoint.dateKey})
            </div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5">
              {hoveredPoint.attemptCount} attempt{hoveredPoint.attemptCount === 1 ? '' : 's'} recorded on this day. Average score:{' '}
              <span className="font-bold text-slate-900">{hoveredPoint.overallScore}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onSelectAttempt && hoveredPoint.attempts[0] && (
              <button
                type="button"
                onClick={() => onSelectAttempt(hoveredPoint.attempts[0])}
                className="px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                View Attempt Report
              </button>
            )}
            <button
              type="button"
              onClick={() => setHoveredPoint(null)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
