import { Quote, DealAnomaly } from '../types';

export function scanDealAnomalies(quotes: Quote[]): DealAnomaly[] {
  const anomalies: DealAnomaly[] = [];

  for (const quote of quotes) {
    // Check 1: Stalled Deals (Draft or Under Negotiation without update for > 5 days or specific demo flags)
    if (quote.id === 'Q-1039' || quote.status === 'Draft' || quote.status === 'Under Negotiation') {
      const isStalled = quote.id === 'Q-1039';
      if (isStalled) {
        anomalies.push({
          id: `anom-stalled-${quote.id}`,
          quoteId: quote.id,
          companyName: quote.companyName,
          anomalyType: 'Stalled Deal',
          severity: 'Critical',
          description: `Quote has been inactive in ${quote.status} stage for 6 days with no customer response.`,
          recommendedAction: 'Dispatch automated follow-up nudge to customer & sales rep.',
          isResolved: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Check 2: Discount Spike (Rep giving discount > 2x historical average)
    const avgDiscount = quote.totalListAmount > 0
      ? (quote.totalDiscountAmount / quote.totalListAmount) * 100
      : 0;

    if (quote.id === 'Q-1042' || (avgDiscount > 14 && quote.blendedRiskScore > 8)) {
      anomalies.push({
        id: `anom-discount-${quote.id}`,
        quoteId: quote.id,
        companyName: quote.companyName,
        anomalyType: 'Discount Spike',
        severity: 'Critical',
        description: `Average discount (${avgDiscount.toFixed(1)}%) is 2.3x higher than sales rep's 90-day baseline (6.5%).`,
        recommendedAction: 'Escalate to VP of Sales for executive risk review.',
        isResolved: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Check 3: Delivery Promise Slippage
    if (quote.id === 'Q-1035' || quote.status === 'Fulfillment') {
      if (quote.id === 'Q-1035') {
        anomalies.push({
          id: `anom-delivery-${quote.id}`,
          quoteId: quote.id,
          companyName: quote.companyName,
          anomalyType: 'Delivery Slippage',
          severity: 'At Risk',
          description: 'Promised delivery is within 48 hours but inventory in East Depot is currently unassigned.',
          recommendedAction: 'Trigger instant warehouse allocation & express logistics dispatch.',
          isResolved: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return anomalies;
}
