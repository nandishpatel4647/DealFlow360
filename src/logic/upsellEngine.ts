import { Product, QuoteLine } from '../types';

export interface UpsellRecommendation {
  productId: string;
  productName: string;
  category: string;
  listPrice: number;
  promoDiscount: number;
  netPrice: number;
  expectedMarginImpact: number;
  reason: string;
  confidenceScore: number;
}

export function getUpsellRecommendations(
  currentLines: QuoteLine[],
  allProducts: Product[]
): UpsellRecommendation[] {
  const currentProductIds = new Set(currentLines.map((l) => l.productId));
  const recommendations: UpsellRecommendation[] = [];

  const hasLaptop = currentLines.some((l) => l.productId === 'prod-laptop');
  const hasService = currentLines.some((l) => l.category === 'services');
  const hasSubscription = currentLines.some((l) => l.category === 'subscription');

  // Rule 1: Laptop in cart -> recommend Extended Warranty
  if (hasLaptop && !currentProductIds.has('prod-warranty')) {
    const p = allProducts.find((item) => item.id === 'prod-warranty');
    if (p) {
      recommendations.push({
        productId: p.id,
        productName: p.name,
        category: p.categoryId,
        listPrice: p.listPrice,
        promoDiscount: 10,
        netPrice: Math.round(p.listPrice * 0.9),
        expectedMarginImpact: 8400,
        reason:
          'Customers purchasing Enterprise Laptop frequently add Extended 2-Yr Warranty; combination recovers approximately +4.2% margin.',
        confidenceScore: 92,
      });
    }
  }

  // Rule 2: Hardware in cart -> recommend Wireless Docking Station
  if (hasLaptop && !currentProductIds.has('prod-dock')) {
    const p = allProducts.find((item) => item.id === 'prod-dock');
    if (p) {
      recommendations.push({
        productId: p.id,
        productName: p.name,
        category: p.categoryId,
        listPrice: p.listPrice,
        promoDiscount: 12,
        netPrice: Math.round(p.listPrice * 0.88),
        expectedMarginImpact: 3200,
        reason:
          'High co-purchase frequency (74%) with Enterprise Laptop orders. Improves bundled margin health.',
        confidenceScore: 86,
      });
    }
  }

  // Rule 3: No Subscription -> recommend Cloud Analytics Pro
  if (!hasSubscription && !currentProductIds.has('prod-cloud-analytics')) {
    const p = allProducts.find((item) => item.id === 'prod-cloud-analytics');
    if (p) {
      recommendations.push({
        productId: p.id,
        productName: p.name,
        category: p.categoryId,
        listPrice: p.listPrice,
        promoDiscount: 15,
        netPrice: Math.round(p.listPrice * 0.85),
        expectedMarginImpact: 12500,
        reason:
          'Attach recurring SaaS telemetry to hardware deals to build long-term Annual Recurring Revenue (ARR).',
        confidenceScore: 89,
      });
    }
  }

  // Fallback if none matched
  if (recommendations.length === 0) {
    const unpicked = allProducts.filter((p) => !currentProductIds.has(p.id));
    if (unpicked.length > 0) {
      const p = unpicked[0];
      recommendations.push({
        productId: p.id,
        productName: p.name,
        category: p.categoryId,
        listPrice: p.listPrice,
        promoDiscount: 5,
        netPrice: Math.round(p.listPrice * 0.95),
        expectedMarginImpact: 4500,
        reason: `Popular item across ${p.categoryId} category with high standalone customer satisfaction.`,
        confidenceScore: 75,
      });
    }
  }

  return recommendations;
}
