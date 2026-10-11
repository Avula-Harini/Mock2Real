import { OutfitFeedbackData } from '../types/outfit';

/**
 * Clearly labelled sample data for Demo Mode only.
 * Focuses strictly on attire professionalism, neatness, and dress code alignment.
 * Strictly avoids evaluating attractiveness, body type, gender, or personal identity.
 */
export const DEMO_OUTFIT_FEEDBACK_DATA: OutfitFeedbackData = {
  overallScore: 88,
  overallVerdict: 'Interview-Ready & Role-Appropriate',
  summary: 'Attire and presentation demonstrate a polished, business-casual standard well-suited for video and onsite interviews.',
  analyzedAt: 'Just now',
  industryOrRoleTarget: 'Software Engineering / Tech & Product Positions',
  indicators: {
    professionalAttire: {
      key: 'professionalAttire',
      name: 'Professional Attire',
      subtitle: 'Formality level, garment structure, and neckline balance',
      score: 90,
      rating: 'exceptional',
      ratingLabel: 'Professional & Business-Casual',
      feedbackSummary: 'Collared shirt / structured top creates a strong executive impression with neutral, high-contrast tones against the backdrop.',
      strengths: [
        'Structured collar and solid neutral fabric frame the face professionally',
        'Strong contrast against the background prevents visual blending into the room',
        'Subtle, non-distracting pattern keeps focus centered on your communication'
      ],
      suggestions: [
        'Ensure collar points sit symmetrically without shifting during movements',
        'Consider keeping a backup blazer or structured cardigan nearby for formal panels'
      ],
      checks: [
        { label: 'Formality Level', status: 'pass', note: 'Smart Business-Casual meets industry hiring benchmarks' },
        { label: 'Fabric Contrast', status: 'pass', note: 'Separates candidate clearly from background lighting' },
        { label: 'Pattern Subtlety', status: 'pass', note: 'Solid texture avoids moiré interference on webcam' }
      ]
    },
    neatnessPresentation: {
      key: 'neatnessPresentation',
      name: 'Neatness & Presentation',
      subtitle: 'Wrinkle-free apparel, clean framing, lighting and grooming',
      score: 86,
      rating: 'appropriate',
      ratingLabel: 'Crisp, Balanced & Well-Framed',
      feedbackSummary: 'Apparel appears pressed and well-maintained. Frontal key lighting keeps face clearly visible with clean camera framing.',
      strengths: [
        'Clean shoulder lines with no visible creases or fabric bunching',
        'Key lighting is evenly distributed with minimal harsh backlighting',
        'Tidy overall presentation conveys preparation and respect for the interviewer'
      ],
      suggestions: [
        'Slightly raise camera lens to eye level so shoulders remain aligned horizontally',
        'Ensure hair remains swept back from microphones to prevent rustle noises'
      ],
      checks: [
        { label: 'Crease & Fit Check', status: 'pass', note: 'Smooth drape without tension lines' },
        { label: 'Lighting Distribution', status: 'pass', note: 'Face illuminated without harsh shadows' },
        { label: 'Camera Proximity', status: 'warning', note: 'Frame includes mid-chest up; maintain 2-3 feet distance' }
      ]
    },
    dressCodeSuitability: {
      key: 'dressCodeSuitability',
      name: 'Interview Dress Code Suitability',
      subtitle: 'Target company culture, role expectation, and industry standard',
      score: 88,
      rating: 'appropriate',
      ratingLabel: 'Aligned with Tech & Product Standards',
      feedbackSummary: 'Meets modern tech and corporate standards where clean business-casual is expected without being overly rigid or under-dressed.',
      strengths: [
        'Hits the sweet spot between overly casual streetwear and unnecessarily stiff black-tie attire',
        'Versatile look appropriate for both first-round screening and final loop rounds'
      ],
      suggestions: [
        'For high-finance, enterprise legal, or executive boards, upgrade with a tailored suit jacket',
        'Research company glassdoor/website culture photos 24 hours prior to final round'
      ],
      checks: [
        { label: 'Industry Baseline', status: 'pass', note: 'Well-aligned with modern corporate and startup loops' },
        { label: 'Remote / Video Ergonomics', status: 'pass', note: 'Comfortable fit that supports natural upright posture' }
      ]
    }
  },
  generalPracticalTips: [
    'Test your lighting setup 10 minutes before the call; position your primary light source in front of you, not behind.',
    'Keep your webcam at eye level to maintain an open chest line and natural shoulder posture.',
    'Choose solid jewel tones or muted blues/grays; high-contrast white or deep black can blow out webcam auto-exposure.',
    'Remove lanyards, bulky badges, or clinking jewelry that might brush against lapel microphones.'
  ],
  lightingAndFramingNote: 'Framing recommendation: Position the camera 2 to 3 feet away at eye level, capturing the top of the head down to mid-chest.'
};
