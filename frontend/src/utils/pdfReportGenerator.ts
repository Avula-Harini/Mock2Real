import { jsPDF } from 'jspdf';
import { FinalReportData, InterviewQuestion } from '../types/interview';
import { STARFeedbackData } from '../types/star';
import { OutfitFeedbackData } from '../types/outfit';
import { InterviewPerformanceData } from '../types/performance';

export interface GeneratePDFReportOptions {
  reportData: FinalReportData;
  questions: InterviewQuestion[];
  starFeedback?: STARFeedbackData | null;
  outfitFeedback?: OutfitFeedbackData | null;
  performanceData?: InterviewPerformanceData | null;
  isDemoMode?: boolean;
}

/**
 * Generates and triggers download of a professional multi-page vector/text PDF report.
 * Uses jsPDF directly with crisp typography, headers, metric score boxes,
 * STAR breakdowns, and question analyses.
 */
export async function downloadInterviewPDFReport({
  reportData,
  questions,
  starFeedback,
  outfitFeedback,
  performanceData,
  isDemoMode = false,
}: GeneratePDFReportOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let cursorY = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - margin - 12) {
      doc.addPage();
      cursorY = margin;
      drawPageHeader();
    }
  };

  const drawPageHeader = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Mock2Real • AI-Powered Interview Assessment & Coaching', margin, cursorY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${doc.getNumberOfPages()}`, pageWidth - margin, cursorY, { align: 'right' });
    cursorY += 4;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);
    cursorY += 6;
  };

  // 1. BRAND HEADER & REPORT TITLE
  doc.setFillColor(79, 70, 229); // #4F46E5 Indigo
  doc.roundedRect(margin, cursorY, contentWidth, 24, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('Mock2Real Comprehensive Interview Evaluation', margin + 6, cursorY + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(224, 231, 255);
  doc.text(
    `Candidate: ${reportData.candidateName || 'Candidate'}  |  Target Role: ${reportData.roleTitle || 'Professional Role'}  |  Date: ${reportData.completedAt || new Date().toLocaleDateString()}`,
    margin + 6,
    cursorY + 18
  );

  cursorY += 30;

  // DEMO MODE WATERMARK / BANNER (Requirement 4)
  if (isDemoMode) {
    doc.setFillColor(254, 243, 199); // Amber-100
    doc.setDrawColor(245, 158, 11); // Amber-500
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, cursorY, contentWidth, 9, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(180, 83, 9);
    doc.text('DEMO MODE: Contains simulated benchmark data and sample AI evaluation scores for preview.', margin + 4, cursorY + 6);
    cursorY += 13;
  }

  // 2. OVERALL SCORE & SUMMARY CARD
  checkPageBreak(38);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, cursorY, contentWidth, 34, 3, 3, 'FD');

  // Overall score circle/box
  doc.setFillColor(79, 70, 229);
  doc.roundedRect(margin + 5, cursorY + 5, 24, 24, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(`${reportData.overallScore}`, margin + 17, cursorY + 18, { align: 'center' });
  doc.setFontSize(7);
  doc.text('/ 100', margin + 17, cursorY + 24, { align: 'center' });

  // Verdict & Duration
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(`Recommendation: ${reportData.verdict}`, margin + 34, cursorY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const durationMin = Math.round((reportData.totalDurationSeconds || 180) / 60);
  doc.text(
    `Questions Evaluated: ${reportData.questionsAnsweredCount || questions.length} of ${reportData.totalQuestionsCount || questions.length}   •   Session Duration: ~${durationMin} mins   •   Status: Final Evaluation`,
    margin + 34,
    cursorY + 17
  );

  // Micro Metrics row
  const metricsY = cursorY + 23;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`SPEAKING PACE: ${reportData.metrics.wordsPerMinute} WPM`, margin + 34, metricsY);
  doc.text(`CLARITY: ${reportData.metrics.clarityScore}%`, margin + 84, metricsY);
  doc.text(`STRUCTURE: ${reportData.metrics.structureScore}%`, margin + 122, metricsY);
  doc.text(`FILLER WORDS: ${reportData.metrics.fillerWordsRatio}`, margin + 158, metricsY);

  cursorY += 40;

  // 3. CORE PERFORMANCE & PRESENTATION METRICS (Eye Contact, Posture, Voice, Outfit)
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Key Delivery & Appearance Indicators', margin, cursorY);
  cursorY += 5;

  const cardWidth = (contentWidth - 6) / 2;
  const cardHeight = 22;

  // Voice Delivery Card
  const voiceScore = performanceData?.voiceDelivery?.score ?? 84;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, cursorY, cardWidth, cardHeight, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Voice Delivery & Speech Modulation', margin + 4, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Score: ${voiceScore}/100 • Pace: ${performanceData?.voiceDelivery?.pacingWpm || 135} WPM`, margin + 4, cursorY + 12);
  doc.text(performanceData?.voiceDelivery?.summary || 'Natural tone with clear pronunciation and steady cadence.', margin + 4, cursorY + 17, { maxWidth: cardWidth - 8 });

  // Eye Contact & Posture Card
  const eyeScore = performanceData?.eyeContact?.score ?? 88;
  const postureScore = performanceData?.posture?.score ?? 82;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin + cardWidth + 6, cursorY, cardWidth, cardHeight, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('Eye Contact & Posture Alignment', margin + cardWidth + 10, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Eye Contact: ${eyeScore}/100 • Posture Stability: ${postureScore}/100`, margin + cardWidth + 10, cursorY + 12);
  doc.text(performanceData?.eyeContact?.summary || 'Consistent camera engagement with open shoulder framing.', margin + cardWidth + 10, cursorY + 17, { maxWidth: cardWidth - 8 });

  cursorY += cardHeight + 4;

  // Outfit Feedback Card
  const outfitOverall = outfitFeedback?.overallScore ?? 88;
  const outfitVerdict = outfitFeedback?.overallVerdict ?? 'Interview-Ready & Role-Appropriate';
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, cursorY, contentWidth, 20, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`Attire & Professional Presentation (${outfitOverall}/100 - ${outfitVerdict})`, margin + 4, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const outfitSummaryText = outfitFeedback?.summary || 'Attire demonstrates clean business-casual standards with proper webcam lighting and contrast.';
  doc.text(outfitSummaryText, margin + 4, cursorY + 12, { maxWidth: contentWidth - 8 });
  if (outfitFeedback?.indicators) {
    const att = outfitFeedback.indicators.professionalAttire.score;
    const neat = outfitFeedback.indicators.neatnessPresentation.score;
    const dress = outfitFeedback.indicators.dressCodeSuitability.score;
    doc.text(`• Professional Attire: ${att}/100   • Neatness & Presentation: ${neat}/100   • Dress Code Suitability: ${dress}/100`, margin + 4, cursorY + 17);
  }

  cursorY += 26;

  // 4. STAR METHOD EVALUATION BREAKDOWN
  checkPageBreak(58);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('STAR-Method Structural Evaluation', margin, cursorY);
  cursorY += 5;

  const starOverall = starFeedback?.overallScore ?? 85;
  doc.setFillColor(238, 242, 255); // Indigo-50
  doc.setDrawColor(199, 210, 254);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, cursorY, contentWidth, 11, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(67, 56, 202);
  doc.text(`Overall Behavioral Architecture Score: ${starOverall} / 100`, margin + 4, cursorY + 7);
  cursorY += 15;

  // 4 STAR columns or grid
  const starSections = [
    { key: 'Situation', data: starFeedback?.situation, defaultScore: 88, defaultNote: 'Specific business context and timeline clearly articulated.' },
    { key: 'Task', data: starFeedback?.task, defaultScore: 82, defaultNote: 'Personal responsibility and metrics defined early in response.' },
    { key: 'Action', data: starFeedback?.action, defaultScore: 90, defaultNote: 'Concrete technical execution steps and leadership outlined.' },
    { key: 'Result', data: starFeedback?.result, defaultScore: 80, defaultNote: 'Quantified metrics and retrospectives tie back to business impact.' },
  ];

  const colWidth = (contentWidth - 6) / 2;
  const colHeight = 22;

  starSections.forEach((sec, idx) => {
    const isLeft = idx % 2 === 0;
    const x = isLeft ? margin : margin + colWidth + 6;
    if (!isLeft && idx > 0) {
      // same row as previous
    } else if (idx > 0) {
      cursorY += colHeight + 4;
    }
    checkPageBreak(colHeight);

    const score = sec.data?.score ?? sec.defaultScore;
    const summary = sec.data?.summary ?? sec.defaultNote;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, cursorY, colWidth, colHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`${sec.key.toUpperCase()} (${score}/100)`, x + 4, cursorY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(summary, x + 4, cursorY + 11, { maxWidth: colWidth - 8 });
  });

  cursorY += colHeight + 8;

  // 5. STRENGTHS & GROWTH AREAS
  checkPageBreak(45);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Key Strengths & Coaching Priorities', margin, cursorY);
  cursorY += 5;

  const halfWidth = (contentWidth - 6) / 2;

  // Strengths column
  doc.setFillColor(240, 253, 244); // Green-50
  doc.roundedRect(margin, cursorY, halfWidth, 36, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(22, 101, 52);
  doc.text('✓ Standout Strengths', margin + 4, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(21, 128, 61);
  let sY = cursorY + 12;
  (reportData.keyStrengths || []).slice(0, 3).forEach((str) => {
    doc.text(`• ${str}`, margin + 4, sY, { maxWidth: halfWidth - 8 });
    sY += 7;
  });

  // Growth priorities column
  doc.setFillColor(254, 243, 199); // Amber-50
  doc.roundedRect(margin + halfWidth + 6, cursorY, halfWidth, 36, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 83, 9);
  doc.text('⚡ Recommended Growth Focus', margin + halfWidth + 10, cursorY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14);
  let gY = cursorY + 12;
  (reportData.areasForGrowth || []).slice(0, 3).forEach((growth) => {
    doc.text(`• ${growth}`, margin + halfWidth + 10, gY, { maxWidth: halfWidth - 8 });
    gY += 7;
  });

  cursorY += 42;

  // 6. QUESTION-BY-QUESTION DEEP DIVE (Multi-page handled cleanly)
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Question-by-Question Deep Dive', margin, cursorY);
  cursorY += 6;

  questions.forEach((q, idx) => {
    checkPageBreak(40);
    const qBoxHeight = 34;

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, cursorY, contentWidth, qBoxHeight, 2, 2, 'FD');

    // Question number badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(79, 70, 229);
    doc.text(`Question ${idx + 1}: ${q.category}`, margin + 4, cursorY + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(q.prompt, margin + 4, cursorY + 11, { maxWidth: contentWidth - 8 });

    // Answer transcript snippet
    const transcript = q.feedback?.simulatedTranscript || 'No response recorded for this question.';
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const snippet = transcript.length > 180 ? transcript.substring(0, 180) + '...' : transcript;
    doc.text(`Answer summary: "${snippet}"`, margin + 4, cursorY + 18, { maxWidth: contentWidth - 8 });

    // Scores & Feedback
    const clarity = q.feedback?.clarityScore ?? 80;
    const structure = q.feedback?.structureScore ?? 80;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(
      `Clarity Score: ${clarity}%   •   Structure Score: ${structure}%   •   Duration: ${q.recordedDurationSeconds || 60}s`,
      margin + 4,
      cursorY + 25
    );

    if (q.feedback?.strengths && q.feedback.strengths[0]) {
      doc.text(`Key Strength: ${q.feedback.strengths[0]}`, margin + 4, cursorY + 30, { maxWidth: contentWidth - 8 });
    }

    cursorY += qBoxHeight + 4;
  });

  // Footer on final page
  checkPageBreak(15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Report automatically compiled by Mock2Real Interview Studio. For personalized coaching, re-attempt questions or export session history.',
    margin,
    cursorY + 6
  );

  // Trigger browser download
  const dateStr = new Date().toISOString().split('T')[0];
  const sanitizedRole = (reportData.roleTitle || 'Interview')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');
  doc.save(`Mock2Real_Report_${sanitizedRole}_${dateStr}.pdf`);
}
