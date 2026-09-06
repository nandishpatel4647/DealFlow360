import { Quote, DealAnomaly, Company } from '../types';

/**
 * DATA-DRIVEN Deal Health & Anomaly Scanner
 * 
 * Scans all active quotes and generates anomalies based on REAL data:
 * 1. Stalled Deals: Quotes idle in approval/review stages for too long
 * 2. Discount Spikes: Quotes with discounts significantly above company historical avg
 * 3. Delivery Slippage: Promised delivery date approaching/past with unfulfilled stock
 * 4. Margin Erosion: Overall margin below acceptable threshold
 */

const STALE_DAYS_THRESHOLD = 5; // Days before a deal is considered stalled
const DISCOUNT_SPIKE_MULTIPLIER = 1.8; // 80% above historical avg triggers spike
const MIN_MARGIN_THRESHOLD = 15; // Below 15% margin is a warning
const DELIVERY_WINDOW_DAYS = 3; // Within 3 days of promised date

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs(Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)));
}

export function scanDealAnomalies(quotes: Quote[], companies?: Company[]): DealAnomaly[] {
  const anomalies: DealAnomaly[] = [];
  const now = new Date().toISOString();
  let anomalyIndex = 1;

  for (const quote of quotes) {
    // Skip completed/paid/rejected quotes
    if (['Paid', 'Rejected', 'Rejected by Sales Manager', 'Rejected by Finance'].includes(quote.status)) {
      continue;
    }

    const company = companies?.find((c) => c.id === quote.companyId);

    // 1. STALLED DEAL DETECTION
    // Quotes stuck in approval or customer review stages
    const stalledStatuses = ['Pending Manager', 'Pending Finance', 'Pending Customer', 'Under Negotiation', 'Customer Revision Requested'];
    if (stalledStatuses.includes(quote.status)) {
      const daysIdle = daysBetween(quote.updatedAt, now);
      if (daysIdle >= STALE_DAYS_THRESHOLD) {
        const severity = daysIdle >= 10 ? 'Critical' : daysIdle >= 7 ? 'At Risk' : 'Warning';
        anomalies.push({
          id: `anom-stall-${anomalyIndex++}`,
          quoteId: quote.id,
          companyName: quote.companyName,
          anomalyType: 'Stalled Deal',
          severity,
          description: `Idle ${daysIdle} days in "${quote.status}" stage (SLA: ${STALE_DAYS_THRESHOLD} days)`,
          recommendedAction: daysIdle >= 10 ? 'Escalate' : 'Nudge Rep',
          isResolved: false,
          createdAt: quote.updatedAt,
        });
      }
    }

    // 2. DISCOUNT SPIKE DETECTION
    // Compare quote's overall discount to company's historical average
    if (quote.totalListAmount > 0) {
      const discountPercent = (quote.totalDiscountAmount / quote.totalListAmount) * 100;
      const historicalAvg = company?.historicalAvgDiscount || 8; // Default 8% if unknown

      if (discountPercent > historicalAvg * DISCOUNT_SPIKE_MULTIPLIER && discountPercent > 10) {
        anomalies.push({
          id: `anom-disc-${anomalyIndex++}`,
          quoteId: quote.id,
          companyName: quote.companyName,
          anomalyType: 'Discount Spike',
          severity: discountPercent > historicalAvg * 2.5 ? 'Critical' : 'At Risk',
          description: `Discount ${discountPercent.toFixed(1)}% vs ${historicalAvg}% historical baseline (${((discountPercent / historicalAvg - 1) * 100).toFixed(0)}% above)`,
          recommendedAction: 'Escalate',
          isResolved: false,
          createdAt: quote.updatedAt,
        });
      }
    }

    // 3. DELIVERY SLIPPAGE DETECTION
    // Promised delivery date approaching but fulfillment not started
    if (quote.promisedDeliveryDate && quote.fulfillmentStage !== 'Delivered' && quote.fulfillmentStage !== 'Shipped') {
      const daysToDelivery = daysBetween(now, quote.promisedDeliveryDate);
      const isPast = new Date(quote.promisedDeliveryDate) < new Date();
      const isFulfillmentStarted = quote.fulfillmentStage && !['Not Ready', 'Ready for Fulfillment'].includes(quote.fulfillmentStage);

      if ((daysToDelivery <= DELIVERY_WINDOW_DAYS || isPast) && !isFulfillmentStarted) {
        anomalies.push({
          id: `anom-deliv-${anomalyIndex++}`,
          quoteId: quote.id,
          companyName: quote.companyName,
          anomalyType: 'Delivery Slippage',
          severity: isPast ? 'Critical' : 'At Risk',
          description: isPast
            ? `Delivery ${daysToDelivery} days overdue, fulfillment not completed`
            : `Promised delivery in ${daysToDelivery} days but warehouse allocation pending`,
          recommendedAction: isPast ? 'Escalate' : 'Nudge Rep',
          isResolved: false,
          createdAt: now,
        });
      }
    }

    // 4. MARGIN EROSION WARNING
    // Quotes with very low margins
    if (quote.overallMarginPercent < MIN_MARGIN_THRESHOLD && quote.overallMarginPercent > 0 && quote.status !== 'Draft') {
      anomalies.push({
        id: `anom-margin-${anomalyIndex++}`,
        quoteId: quote.id,
        companyName: quote.companyName,
        anomalyType: 'Discount Spike', // Use closest type
        severity: quote.overallMarginPercent < 8 ? 'Critical' : 'Warning',
        description: `Blended margin ${quote.overallMarginPercent.toFixed(1)}% below ${MIN_MARGIN_THRESHOLD}% threshold — potential margin erosion`,
        recommendedAction: 'Escalate',
        isResolved: false,
        createdAt: quote.updatedAt,
      });
    }
  }

  return anomalies;
}
