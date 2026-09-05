import { QuoteLine, ProductCategoryType, CustomerTierType } from '../types';

export function calculateLineMetrics(
  quantity: number,
  unitListPrice: number,
  unitCostPrice: number,
  discountPercent: number,
  categoryCeiling: number
) {
  const lineListAmount = quantity * unitListPrice;
  const discountAmount = lineListAmount * (discountPercent / 100);
  const netAmount = lineListAmount - discountAmount;
  const lineCostAmount = quantity * unitCostPrice;
  const marginAmount = netAmount - lineCostAmount;
  const marginPercent = netAmount > 0 ? (marginAmount / netAmount) * 100 : 0;

  const isOverLimit = discountPercent > categoryCeiling;
  const overLimitPoints = isOverLimit ? Number((discountPercent - categoryCeiling).toFixed(1)) : 0;

  return {
    lineListAmount,
    discountAmount,
    netAmount,
    lineCostAmount,
    marginAmount,
    marginPercent: Number(marginPercent.toFixed(1)),
    isOverLimit,
    overLimitPoints,
  };
}

export function calculateQuoteTotals(lines: QuoteLine[]) {
  if (lines.length === 0) {
    return {
      totalListAmount: 0,
      totalDiscountAmount: 0,
      totalNetAmount: 0,
      totalCostAmount: 0,
      overallMarginPercent: 0,
    };
  }

  let totalListAmount = 0;
  let totalNetAmount = 0;
  let totalCostAmount = 0;

  for (const line of lines) {
    const list = line.quantity * line.unitListPrice;
    const net = line.netAmount;
    const cost = line.quantity * line.unitCostPrice;

    totalListAmount += list;
    totalNetAmount += net;
    totalCostAmount += cost;
  }

  const totalDiscountAmount = totalListAmount - totalNetAmount;
  const overallMargin = totalNetAmount > 0 ? ((totalNetAmount - totalCostAmount) / totalNetAmount) * 100 : 0;

  return {
    totalListAmount,
    totalDiscountAmount,
    totalNetAmount,
    totalCostAmount,
    overallMarginPercent: Number(overallMargin.toFixed(1)),
  };
}
