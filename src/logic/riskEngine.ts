import { QuoteLine, CustomerTierType, RiskLevel, RiskBreakdown, ConfigPolicy } from '../types';

export const DEFAULT_CONFIG_POLICY: ConfigPolicy = {
  tierCeilings: {
    Bronze: 5,
    Silver: 10,
    Gold: 15,
  },
  categoryCeilings: {
    hardware: 15,
    services: 10,
    subscription: 12,
  },
  approvalThresholds: {
    lowRiskMax: 3.0,
    mediumRiskMax: 8.0,
    singleLineOverageMax: 10.0,
  },
  warehouseFreightWeights: {
    ahmedabad: { base: 1500, perUnit: 250 },
    surat: { base: 1800, perUnit: 300 },
    mumbai: { base: 2200, perUnit: 350 },
  },
};

export function evaluateBlendedRisk(
  lines: QuoteLine[],
  tier: CustomerTierType,
  policy: ConfigPolicy = DEFAULT_CONFIG_POLICY
): {
  blendedScore: number;
  riskLevel: RiskLevel;
  riskBreakdown: RiskBreakdown;
  approvalStage: 'None' | 'Sales Manager' | 'Finance' | 'Fully Approved';
  assignedTo: string;
} {
  if (lines.length === 0) {
    return {
      blendedScore: 0,
      riskLevel: 'LOW',
      riskBreakdown: {
        serviceDeviationPts: 0,
        marginErosionPts: 0,
        tierRiskPts: 0,
        totalScore: 0,
        reasons: ['No line items in quotation'],
      },
      approvalStage: 'None',
      assignedTo: '-',
    };
  }

  const reasons: string[] = [];
  let weightedDeviationSum = 0;
  let totalNetAmount = 0;
  let totalCostAmount = 0;
  let maxSingleLineOverage = 0;

  for (const line of lines) {
    totalNetAmount += line.netAmount;
    totalCostAmount += line.quantity * line.unitCostPrice;

    const ceiling = policy.categoryCeilings[line.category] ?? line.discountCeiling;
    const overage = Math.max(0, line.discountPercent - ceiling);

    if (overage > 0) {
      if (overage > maxSingleLineOverage) {
        maxSingleLineOverage = overage;
      }
      // Weight by line net share
      weightedDeviationSum += overage * (line.netAmount > 0 ? line.netAmount : 1);
      reasons.push(
        `${line.productName} (${line.category}) discount of ${line.discountPercent}% exceeds limit (${ceiling}%) by +${overage.toFixed(1)} pts`
      );
    }
  }

  const serviceDeviationPts = totalNetAmount > 0
    ? Number(((weightedDeviationSum / totalNetAmount) * 1.8).toFixed(1))
    : 0;

  // Margin Erosion points (Target benchmark is 32%)
  const overallMargin = totalNetAmount > 0 ? ((totalNetAmount - totalCostAmount) / totalNetAmount) * 100 : 0;
  let marginErosionPts = 0;
  if (overallMargin < 30) {
    marginErosionPts = Number(((30 - overallMargin) * 0.35).toFixed(1));
    reasons.push(`Blended margin of ${overallMargin.toFixed(1)}% is below company target (30.0%) by +${marginErosionPts} pts`);
  }

  // Tier factor
  let tierRiskPts = 0;
  if (tier === 'Bronze') {
    tierRiskPts = 1.8;
    reasons.push('Customer is Bronze tier with minimal baseline discretion (+1.8 pts)');
  } else if (tier === 'Silver') {
    tierRiskPts = 1.2;
    reasons.push('Customer is Silver tier (+1.2 pts)');
  } else {
    tierRiskPts = 0.5;
    reasons.push('Customer is Gold tier with high discretion (+0.5 pts)');
  }

  // Total Blended Score
  const rawScore = serviceDeviationPts + marginErosionPts + tierRiskPts;
  const blendedScore = Number(rawScore.toFixed(1));

  // Determine Risk Level & Approval Chain
  let riskLevel: RiskLevel = 'LOW';
  let approvalStage: 'None' | 'Sales Manager' | 'Finance' | 'Fully Approved' = 'None';
  let assignedTo = '-';

  if (blendedScore > policy.approvalThresholds.mediumRiskMax || maxSingleLineOverage >= policy.approvalThresholds.singleLineOverageMax) {
    riskLevel = 'HIGH';
    approvalStage = 'Sales Manager'; // First stage: Sales Manager reviews and forwards to Finance
    assignedTo = 'M. Shah (Sales Manager) -> R. Iyer (Finance)';
  } else if (blendedScore >= policy.approvalThresholds.lowRiskMax) {
    riskLevel = 'MEDIUM';
    approvalStage = 'Sales Manager';
    assignedTo = 'M. Shah (Sales Manager)';
  } else {
    riskLevel = 'LOW';
    approvalStage = 'Fully Approved';
    assignedTo = 'Auto-Approved';
    if (reasons.length === 0) {
      reasons.push('All line discounts within allowed category ceilings and healthy margin.');
    }
  }

  return {
    blendedScore,
    riskLevel,
    riskBreakdown: {
      serviceDeviationPts,
      marginErosionPts,
      tierRiskPts,
      totalScore: blendedScore,
      reasons,
    },
    approvalStage,
    assignedTo,
  };
}
