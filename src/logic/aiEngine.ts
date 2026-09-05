import { Quote, Company } from '../types';

export interface DealConfidenceBreakdown {
  score: number; // 0 - 100
  historicalConversionRate: number;
  discountHealthScore: number;
  marginHealthScore: number;
  engagementScore: number;
  verdict: 'High Confidence' | 'Moderate Confidence' | 'At Risk';
}

export function calculateDealCloseConfidence(
  quote: Quote,
  company?: Company
): DealConfidenceBreakdown {
  const historicalConversionRate = company?.historicalCloseRate ?? 82;

  // Discount Health (100 if discount is 0, drops as discount grows)
  const avgDiscount = quote.totalListAmount > 0
    ? (quote.totalDiscountAmount / quote.totalListAmount) * 100
    : 0;
  const discountHealthScore = Math.max(30, Math.round(100 - avgDiscount * 3.5));

  // Margin Health (100 if margin >= 40%, scales down if lower)
  const marginHealthScore = Math.min(100, Math.max(20, Math.round((quote.overallMarginPercent / 35) * 85)));

  // Engagement Score based on status and interaction
  let engagementScore = 80;
  if (quote.status === 'Under Negotiation') engagementScore = 90;
  if (quote.status === 'Draft') engagementScore = 70;
  if (quote.blendedRiskScore > 8) engagementScore -= 15;

  const rawScore =
    0.35 * historicalConversionRate +
    0.25 * discountHealthScore +
    0.25 * marginHealthScore +
    0.15 * engagementScore;

  const score = Math.round(Math.min(99, Math.max(25, rawScore)));

  const verdict =
    score >= 75
      ? 'High Confidence'
      : score >= 55
      ? 'Moderate Confidence'
      : 'At Risk';

  return {
    score,
    historicalConversionRate,
    discountHealthScore,
    marginHealthScore,
    engagementScore,
    verdict,
  };
}

export function executeAskDealFlowQuery(query: string, quotes: Quote[]): {
  headline: string;
  matchedQuotes: Quote[];
  summary: string;
} {
  const q = query.toLowerCase().trim();

  if (q.includes('finance') || q.includes('approval') || q.includes('require')) {
    const matched = quotes.filter(
      (qt) => qt.status === 'Pending Finance' || qt.approvalStage === 'Finance' || qt.blendedRiskScore > 8
    );
    return {
      headline: 'Quotations Requiring Finance Approval',
      matchedQuotes: matched,
      summary: `Found ${matched.length} deals exceeding standard governance ceilings that require dual Sales Manager & Finance approval.`,
    };
  }

  if (q.includes('stalled') || q.includes('inactive') || q.includes('risk') || q.includes('acme')) {
    const matched = quotes.filter((qt) => qt.riskLevel === 'HIGH' || qt.status === 'Under Negotiation' || qt.id === 'Q-1042');
    return {
      headline: 'At-Risk & High-Attention Deals',
      matchedQuotes: matched,
      summary: `Found ${matched.length} deals flagged for pricing deviations or stalled negotiation cycles.`,
    };
  }

  if (q.includes('margin') || q.includes('highest') || q.includes('profit')) {
    const matched = [...quotes].sort((a, b) => b.overallMarginPercent - a.overallMarginPercent).slice(0, 3);
    return {
      headline: 'Top Highest-Margin Deals',
      matchedQuotes: matched,
      summary: `Top performing deals by gross margin yield. Leading deal is ${matched[0]?.id} with ${matched[0]?.overallMarginPercent}% margin.`,
    };
  }

  // Default close this week
  const matched = quotes.filter((qt) => qt.dealConfidence >= 75);
  return {
    headline: 'Deals Most Likely to Close This Week',
    matchedQuotes: matched,
    summary: `Identified ${matched.length} high-confidence deals with healthy margins and customer tier alignment.`,
  };
}
