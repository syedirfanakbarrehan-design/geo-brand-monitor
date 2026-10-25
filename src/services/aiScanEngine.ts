import { PromptScanResult, EngineResult, CitationItem } from '../types/saas';

// Common authority domains cited by LLM search engines
const CITATION_DOMAINS = [
  { domain: 'g2.com', title: 'Top Rated Industry Leader Reviews', authorityScore: 94 },
  { domain: 'trustradius.com', title: 'Buyer Comparison & Feature Matrix', authorityScore: 91 },
  { domain: 'techcrunch.com', title: 'Enterprise Technology Benchmark', authorityScore: 92 },
  { domain: 'forbes.com', title: 'Best Business Solutions Guide', authorityScore: 95 },
  { domain: 'capterra.com', title: 'Software Buyers Guide & Ratings', authorityScore: 90 },
  { domain: 'reddit.com/r/saas', title: 'User Community Recommendations', authorityScore: 89 },
  { domain: 'producthunt.com', title: 'Community Feedback & Upvotes', authorityScore: 88 },
];

/**
 * Deterministic hash generator for stable scoring per brand + prompt
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export interface ScanOptions {
  prompt: string;
  brandName: string;
  brandDomain: string;
  competitors: string[];
  workspaceId: string;
  category?: string;
  isSimulated?: boolean;
  liveKeys?: {
    openai?: string;
    perplexity?: string;
    anthropic?: string;
    gemini?: string;
  };
}

export function runDeterministicScan(options: ScanOptions): PromptScanResult {
  const { prompt, brandName, brandDomain, competitors, workspaceId, category } = options;
  const hash = hashString(`${brandName}_${prompt}`);

  // Base visibility score (55 - 95%) with variance
  const baseScore = 60 + (hash % 36);
  const position = (hash % 4) + 1;

  // Engine variations
  const engines: Array<'chatgpt' | 'perplexity' | 'claude' | 'gemini'> = [
    'chatgpt',
    'perplexity',
    'claude',
    'gemini',
  ];

  const engineNames = {
    chatgpt: 'ChatGPT 4o Search',
    perplexity: 'Perplexity Pro Deep Research',
    claude: 'Claude 3.7 Sonnet Web',
    gemini: 'Gemini 2.5 Flash Grounding',
  };

  const engineResults: Record<'chatgpt' | 'perplexity' | 'claude' | 'gemini', EngineResult> = {
    chatgpt: {} as EngineResult,
    perplexity: {} as EngineResult,
    claude: {} as EngineResult,
    gemini: {} as EngineResult,
  };

  let totalScore = 0;

  engines.forEach((eng, idx) => {
    const engineHash = (hash + (idx * 31)) % 100;
    const score = Math.min(99, Math.max(35, baseScore + ((engineHash % 17) - 8)));
    totalScore += score;

    let sentiment: 'Recommended' | 'Mentioned' | 'Missing' | 'Negative' = 'Recommended';
    if (score >= 75) sentiment = 'Recommended';
    else if (score >= 50) sentiment = 'Mentioned';
    else if (score >= 35) sentiment = 'Missing';
    else sentiment = 'Negative';

    const rank = score >= 80 ? 1 : score >= 65 ? 2 : score >= 50 ? 3 : 5;
    const citationsCount = 2 + (engineHash % 5);

    let rawSummary = '';
    if (sentiment === 'Recommended') {
      rawSummary = `Highlighted ${brandName} as a premier selection for "${prompt}", commending its user experience, workflow automation, and competitive pricing relative to ${competitors.slice(0, 2).join(' and ') || 'alternatives'}.`;
    } else if (sentiment === 'Mentioned') {
      rawSummary = `Included ${brandName} within the secondary evaluation list alongside ${competitors[0] || 'market alternatives'}. Recommended adding more public case studies to secure top rank.`;
    } else {
      rawSummary = `Model prioritized ${competitors[0] || 'established market options'} for this prompt. Brand ${brandName} was cited without full feature attribution.`;
    }

    engineResults[eng] = {
      engine: eng,
      name: engineNames[eng],
      score,
      sentiment,
      positionRank: rank,
      citationsCount,
      rawSummary,
      detectedKeywords: [
        'AI Automation',
        'Enterprise Scalability',
        'Direct Integration',
        'Fast Onboarding',
      ],
    };
  });

  const overallScore = Math.round(totalScore / engines.length);
  let dominantSentiment: 'Recommended' | 'Mentioned' | 'Missing' | 'Negative' = 'Recommended';
  if (overallScore >= 75) dominantSentiment = 'Recommended';
  else if (overallScore >= 50) dominantSentiment = 'Mentioned';
  else dominantSentiment = 'Missing';

  // Construct Citations
  const citations: CitationItem[] = [
    {
      id: `cite_${hash}_1`,
      title: `${brandName} Official Product Specifications & Pricing`,
      domain: brandDomain || `${brandName.toLowerCase().replace(/\s+/g, '')}.com`,
      url: `https://${brandDomain || `${brandName.toLowerCase().replace(/\s+/g, '')}.com`}/overview`,
      authorityScore: 88,
      engine: 'chatgpt',
    },
    ...CITATION_DOMAINS.slice(0, 4).map((c, i) => ({
      id: `cite_${hash}_${i + 2}`,
      title: `${c.title} - ${prompt}`,
      domain: c.domain,
      url: `https://${c.domain}/topics/${encodeURIComponent(prompt.toLowerCase().replace(/\s+/g, '-'))}`,
      authorityScore: c.authorityScore,
      engine: engines[i % engines.length],
    })),
  ];

  // Actionable GEO Recommendations
  const recommendations: string[] = [
    `Embed structured JSON-LD (SoftwareApplication & FAQPage) on your comparison pages to reinforce ${brandName}'s entity definition in Gemini & Perplexity indexers.`,
    `Publish direct Head-to-Head benchmark matrices against ${competitors[0] || 'leading competitors'} addressing speed, compliance, and ROI to claim top spot in ChatGPT synthesis.`,
    `Encourage enterprise customer verified reviews on G2 and TrustRadius; LLM retrieval models weigh these citations heavily for commercial search queries.`,
    `Author dedicated landing content answering exact buyer sub-queries around pricing tiers, API latency, and migration support.`,
  ];

  return {
    id: `scan_${Date.now()}_${hash}`,
    workspaceId,
    prompt,
    category: category || 'Buyer Intent',
    timestamp: new Date().toISOString(),
    overallScore,
    dominantSentiment,
    positionRank: position,
    engineResults,
    citations,
    recommendations,
    mode: options.isSimulated === false ? 'live' : 'simulated',
  };
}
