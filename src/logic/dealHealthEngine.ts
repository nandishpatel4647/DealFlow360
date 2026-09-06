import { Quote, DealAnomaly, Company } from '../types';

/**
 * DATA-DRIVEN Deal Health & Anomaly Scanner
 * 
 * Scans all active quotes and generates anomalies based on REAL data:
 * 1. Stalled Deals: Quotes idle in approval/review stages for too long
 * 2. Discount Spikes: Quotes with discounts significantly above baseline
 * 3. Delivery Slippage: Promised delivery date approaching with unfulfilled stock
 * 4. Margin Erosion: Overall margin below acceptable threshold
 * 5. High Risk Deals: High blended risk score deals needing executive ratification
 * 6. Draft Aging: Drafts that haven't been submitted
 */

const STALE_HOURS_THRESHOLD = 24; // Hours before a deal is considered stalled
const DISCOUNT_BASELINE_PERCENT = 8; // Average baseline discount %
const DISCOUNT_SPIKE_THRESHOLD = 10; // Above 10% total discount is a spike
const MIN_MARGIN_THRESHOLD = 25; // Below 25% margin is a warning
const DELIVERY_APPROACHING_DAYS = 45; // Approaching delivery threshold
const DRAFT_AGING_HOURS = 24; // Draft not submitted within 24 hours

function hoursBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs(Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60)));
}

function daysBetween(date1: string, date2: string): number {
  return Math.floor(hoursBetween(date1, date2) / 24);
}

export function scanDealAnomalies(quotes: Quote[], companies?: Company[]): DealAnomaly[] {
  const anomalies: DealAnomaly[] = [];
  const now = new Date().toISOString();

  for (const quote of quotes) {
    // Skip completed/paid/rejected quotes — they're done
    if (['Paid', 'Rejected', 'Rejected by Sales Manager', 'Rejected by Finance'].includes(quote.status)) {
      continue;
    }

    const company = companies?.find((c) => c.id === quote.companyId);
    const hoursOld = hoursBetween(quote.createdAt, now);
    const hoursIdle = hoursBetween(quote.updatedAt, now);
    const effectiveHours = Math.max(hoursOld, hoursIdle);

    // ═══════════════════════════════════════════════════════════
    // 1. STALLED DEAL DETECTION
    // Quotes stuck in approval or customer review stages
    // ═══════════════════════════════════════════════════════════
    const stalledStatuses = [
      'Pending Manager', 'Pending Finance', 'Pending Customer',
      'Under Negotiation', 'Customer Revision Requested',
    ];
    
    if (stalledStatuses.includes(quote.status) && effectiveHours >= STALE_HOURS_THRESHOLD) {
      const daysIdleDisplay = Math.floor(effectiveHours / 24);
      const severity: DealAnomaly['severity'] = effectiveHours >= 120 ? 'Critical' : effectiveHours >= 48 ? 'At Risk' : 'Warning';
      anomalies.push({
        id: `anom-${quote.id}-stall`,
        quoteId: quote.id,
        companyName: quote.companyName,
        anomalyType: 'Stalled Deal',
        severity,
        description: `Idle ${daysIdleDisplay > 0 ? `${daysIdleDisplay} day${daysIdleDisplay > 1 ? 's' : ''}` : `${effectiveHours}h`} in "${quote.status}" stage without progression`,
        recommendedAction: effectiveHours >= 72 ? 'Escalate' : 'Nudge Rep',
        isResolved: false,
        createdAt: quote.updatedAt || quote.createdAt,
      });
    }

    // ═══════════════════════════════════════════════════════════
    // 2. DISCOUNT SPIKE DETECTION
    // Flags quotes with overall discount exceeding baseline
    // ═══════════════════════════════════════════════════════════
    if (quote.totalListAmount > 0 && quote.totalDiscountAmount > 0) {
      const discountPercent = (quote.totalDiscountAmount / quote.totalListAmount) * 100;
      const baseline = company?.historicalAvgDiscount || DISCOUNT_BASELINE_PERCENT;

      if (discountPercent >= DISCOUNT_SPIKE_THRESHOLD) {
        const aboveBaseline = ((discountPercent / baseline - 1) * 100).toFixed(0);
        anomalies.push({
          id: `anom-${quote.id}-disc`,
          quoteId: quote.id,
          companyName: quote.companyName,
          anomalyType: 'Discount Spike',
          severity: discountPercent > 13 ? 'Critical' : 'At Risk',
          description: `Total discount ${discountPercent.toFixed(1)}% exceeds baseline (${baseline}%) by +${aboveBaseline}%`,
          recommendedAction: 'Escalate',
          isResolved: false,
          createdAt: quote.updatedAt || quote.createdAt,
        });
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 3. DELIVERY SLIPPAGE DETECTION
    // Promised delivery approaching but fulfillment not completed
    // ═══════════════════════════════════════════════════════════
    if (quote.promisedDeliveryDate) {
      const daysToDelivery = daysBetween(now, quote.promisedDeliveryDate);
      const isPast = new Date(quote.promisedDeliveryDate) < new Date();
      const isFulfilled = quote.fulfillmentStage && ['Fulfillment Completed', 'Delivered', 'Shipped'].includes(quote.fulfillmentStage);
      const isRelevantStatus = !['Draft', 'Rejected', 'Paid'].includes(quote.status);

      if (isRelevantStatus && !isFulfilled && (isPast || daysToDelivery <= DELIVERY_APPROACHING_DAYS)) {
        anomalies.push({
          id: `anom-${quote.id}-deliv`,
          quoteId: quote.id,
          companyName: quote.companyName,
          anomalyType: 'Delivery Slippage',
          severity: isPast ? 'Critical' : daysToDelivery <= 20 ? 'At Risk' : 'Warning',
          description: isPast
            ? `Delivery promised date passed (${quote.promisedDeliveryDate}) — order unfulfilled`
            : `Promised delivery in ${daysToDelivery} days, current status is "${quote.status}"`,
          recommendedAction: isPast ? 'Escalate' : 'Nudge Rep',
          isResolved: false,
          createdAt: now,
        });
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 4. MARGIN EROSION WARNING
    // Quotes with margin below threshold
    // ═══════════════════════════════════════════════════════════
    if (
      quote.overallMarginPercent > 0 &&
      quote.overallMarginPercent < MIN_MARGIN_THRESHOLD &&
      quote.status !== 'Draft'
    ) {
      anomalies.push({
        id: `anom-${quote.id}-margin`,
        quoteId: quote.id,
        companyName: quote.companyName,
        anomalyType: 'Discount Spike',
        severity: quote.overallMarginPercent < 20 ? 'Critical' : 'Warning',
        description: `Blended margin ${quote.overallMarginPercent.toFixed(1)}% is below target threshold (${MIN_MARGIN_THRESHOLD}%)`,
        recommendedAction: 'Escalate',
        isResolved: false,
        createdAt: quote.updatedAt || quote.createdAt,
      });
    }

    // ═══════════════════════════════════════════════════════════
    // 5. HIGH RISK DEAL DETECTION
    // Quotes classified as HIGH risk level
    // ═══════════════════════════════════════════════════════════
    if (quote.riskLevel === 'HIGH' && !['Paid', 'Rejected'].includes(quote.status)) {
      anomalies.push({
        id: `anom-${quote.id}-risk`,
        quoteId: quote.id,
        companyName: quote.companyName,
        anomalyType: 'Discount Spike',
        severity: 'Critical',
        description: `High risk score (${quote.blendedRiskScore?.toFixed(1) || '11+'}) requires senior commercial governance signoff`,
        recommendedAction: 'Escalate',
        isResolved: false,
        createdAt: quote.createdAt,
      });
    }

    // ═══════════════════════════════════════════════════════════
    // 6. DRAFT AGING
    // Drafts not submitted within threshold
    // ═══════════════════════════════════════════════════════════
    if (quote.status === 'Draft' && effectiveHours >= DRAFT_AGING_HOURS) {
      anomalies.push({
        id: `anom-${quote.id}-draft`,
        quoteId: quote.id,
        companyName: quote.companyName,
        anomalyType: 'Stalled Deal',
        severity: effectiveHours >= 72 ? 'At Risk' : 'Warning',
        description: `Draft created ${Math.floor(effectiveHours / 24)} days ago without submission for approval`,
        recommendedAction: 'Nudge Rep',
        isResolved: false,
        createdAt: quote.createdAt,
      });
    }
  }

  return anomalies;
}
