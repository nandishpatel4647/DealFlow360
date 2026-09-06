import { Product, QuoteLine } from '../types';

export type RecommendationType = 'cross-sell' | 'upsell';

export interface UpsellRecommendation {
  productId: string;
  productName: string;
  category: string;
  type: RecommendationType;
  triggerItemName?: string;
  listPrice: number;
  promoDiscount: number;
  netPrice: number;
  costPrice: number;
  expectedMarginImpact: number;
  expectedMarginPercent: number;
  reason: string;
  confidenceScore: number;
  tags: string[];
  badgeTitle: string;
}

interface AffinityRule {
  triggerMatches: (names: string[], categories: string[], ids: string[]) => { matched: boolean; triggerName?: string };
  targetProductMatcher: (p: Product) => boolean;
  type: RecommendationType;
  promoDiscount: number;
  confidenceScore: number;
  badgeTitle: string;
  reasonGenerator: (triggerName: string, targetProduct: Product) => string;
  tags: string[];
}

// Intelligent Semantic & Commercial Correlation Rules
const AFFINITY_RULES: AffinityRule[] = [
  // 1. Laptop / Mobile / Workstation -> Docking Station or Thunderbolt Cable (Essential Hardware Companion)
  {
    triggerMatches: (names, categories, ids) => {
      const match = names.find((n) => /laptop|notebook|workstation|pc|mobile|phone|macbook|thinkpad/i.test(n))
        || (ids.includes('prod-laptop') ? 'Laptop Pro 14' : undefined);
      return { matched: !!match, triggerName: match || 'Enterprise Computer' };
    },
    targetProductMatcher: (p) => /docking|dock|thunderbolt|hub/i.test(p.name) || p.id === 'prod-dock' || p.id === 'prod-dock-cable',
    type: 'cross-sell',
    promoDiscount: 8,
    confidenceScore: 96,
    badgeTitle: 'Essential Workstation Peripheral',
    reasonGenerator: (triggerName) =>
      `94% of enterprise workstation deployments attach a high-throughput Docking Station or Thunderbolt 4 Cable to ${triggerName} for dual-4K monitor expansion and desk ergonomics.`,
    tags: ['94% Attach Rate', 'Workstation Essential', 'Zero Friction'],
  },

  // 2. Display / Monitor / TV -> 4K Video Conference Bar
  {
    triggerMatches: (names) => {
      const match = names.find((n) => /display|monitor|screen|curved|ultrawide|tv|television/i.test(n));
      return { matched: !!match, triggerName: match || 'Enterprise Display' };
    },
    targetProductMatcher: (p) => /video conference|video bar|webcam|camera/i.test(p.name) || p.id === 'prod-video-bar',
    type: 'cross-sell',
    promoDiscount: 10,
    confidenceScore: 92,
    badgeTitle: 'Hybrid Meeting Room Synergy',
    reasonGenerator: (triggerName) =>
      `88% of clients purchasing ${triggerName} bundle the 4K Ultra-HD Auto-Framing Video Conference Bar for complete hybrid boardroom audio/visual readiness.`,
    tags: ['88% Attach Rate', 'Meeting Room Ready', '+₹16,000 Margin'],
  },

  // 3. Laptop / Workstation / Mobile / TV -> Wireless Ergonomic Keyboard & Mouse Combo
  {
    triggerMatches: (names, categories) => {
      const match = names.find((n) => /laptop|pc|workstation|computer|mobile|desk/i.test(n))
        || (categories.includes('hardware') ? 'Hardware Deployment' : undefined);
      return { matched: !!match, triggerName: match || 'Hardware Deployment' };
    },
    targetProductMatcher: (p) => /keyboard|mouse|combo|peripherals/i.test(p.name) || p.id === 'prod-keyboard-mouse' || p.id === 'prod-ergonomic-peripherals',
    type: 'cross-sell',
    promoDiscount: 5,
    confidenceScore: 95,
    badgeTitle: 'Ergonomic Desk Productivity',
    reasonGenerator: (triggerName) =>
      `91% co-purchase rate alongside ${triggerName}. Equipping end-users with whisper-quiet ergonomic keyboards and precision mice ensures high workplace productivity.`,
    tags: ['91% Co-Purchase', 'End-User Productivity'],
  },

  // 4. Any Hardware (Laptop, Display, TV, Mobile) -> 3-Year Enterprise Care Plan SLA
  {
    triggerMatches: (names, categories) => {
      const match = names.find((n) => /laptop|display|tv|mobile|hardware|device|server|terminal/i.test(n))
        || (categories.includes('hardware') ? 'Enterprise Hardware Asset' : undefined);
      return { matched: !!match, triggerName: match || 'Hardware Asset' };
    },
    targetProductMatcher: (p) => /care plan|maintenance|warranty|support/i.test(p.name) || p.id === 'prod-care-plan',
    type: 'upsell',
    promoDiscount: 10,
    confidenceScore: 97,
    badgeTitle: 'Mission-Critical Warranty & SLA',
    reasonGenerator: (triggerName) =>
      `Critical asset protection for ${triggerName}. 95% of enterprise buyers attach the 3-Year 24/7 Care Plan SLA for guaranteed replacement coverage and continuous uptime (+₹30,000 margin lift).`,
    tags: ['95% Attach Willingness', 'Recurring SLA', '+₹30,000 Margin'],
  },

  // 5. Onsite Setup Service -> Care Plan 3 years (The exact setup service in user's quote!)
  {
    triggerMatches: (names, _, ids) => {
      const match = names.find((n) => /setup|installation|deployment|service/i.test(n)) || (ids.includes('prod-service') ? 'Onsite Setup Service' : undefined);
      return { matched: !!match, triggerName: match || 'Onsite Setup Service' };
    },
    targetProductMatcher: (p) => /care plan|maintenance|warranty|sla|support/i.test(p.name) || p.id === 'prod-care-plan',
    type: 'upsell',
    promoDiscount: 10,
    confidenceScore: 96,
    badgeTitle: 'High-Margin SLA Upsell',
    reasonGenerator: (triggerName) =>
      `92% of enterprise clients who contract ${triggerName} attach the 3-Year 24/7 Support Care Plan to lock in post-deployment coverage (+₹30,000 gross margin lift).`,
    tags: ['92% Attach Rate', '+₹30,000 Margin', 'Recurring ARR'],
  },

  // 6. Onsite Setup Service -> Enterprise Architecture Consulting
  {
    triggerMatches: (names, _, ids) => {
      const match = names.find((n) => /setup|installation/i.test(n)) || (ids.includes('prod-service') ? 'Onsite Setup Service' : undefined);
      return { matched: !!match, triggerName: match || 'Onsite Setup Service' };
    },
    targetProductMatcher: (p) => /consulting|architecture|advisory/i.test(p.name) || p.id === 'prod-consulting',
    type: 'upsell',
    promoDiscount: 8,
    confidenceScore: 90,
    badgeTitle: 'Strategic Advisory Upsell',
    reasonGenerator: (triggerName) =>
      `Augment physical deployment under ${triggerName} with Senior Solution Architects for end-to-end security compliance and governance roadmap.`,
    tags: ['Strategic Scale', 'Executive Advisory'],
  },

  // 7. Laptop -> Docking Station
  {
    triggerMatches: (names, _, ids) => {
      const match = names.find((n) => /laptop|workstation|notebook|macbook/i.test(n)) || (ids.includes('prod-laptop') ? 'Laptop Pro 14' : undefined);
      return { matched: !!match, triggerName: match || 'Enterprise Laptop' };
    },
    targetProductMatcher: (p) => /dock|docking station/i.test(p.name) || p.id === 'prod-dock',
    type: 'cross-sell',
    promoDiscount: 12,
    confidenceScore: 95,
    badgeTitle: 'Essential Desk Companion',
    reasonGenerator: (triggerName) =>
      `88% of enterprise workstation deployments pair ${triggerName} with Dual-4K Docking Stations for single-cable desk connectivity & 100W charging.`,
    tags: ['88% Attach Rate', 'Plug & Play'],
  },

  // 8. Laptop -> Smart UltraWide Display
  {
    triggerMatches: (names, _, ids) => {
      const match = names.find((n) => /laptop|workstation|notebook/i.test(n)) || (ids.includes('prod-laptop') ? 'Laptop Pro 14' : undefined);
      return { matched: !!match, triggerName: match || 'Enterprise Laptop' };
    },
    targetProductMatcher: (p) => /display|monitor|screen|curved/i.test(p.name) || p.id === 'prod-display',
    type: 'cross-sell',
    promoDiscount: 10,
    confidenceScore: 91,
    badgeTitle: 'Productivity Workspace Bundle',
    reasonGenerator: (triggerName) =>
      `Pairing ${triggerName} with an UltraWide 34" Display lifts employee engineering output by 35% while capturing +₹21,000 hardware margin.`,
    tags: ['Ergonomic Bundle', '+₹21,000 Margin'],
  },

  // 9. Laptop -> Care Plan 3 Years
  {
    triggerMatches: (names, _, ids) => {
      const match = names.find((n) => /laptop|workstation|hardware/i.test(n)) || (ids.includes('prod-laptop') ? 'Laptop Pro 14' : undefined);
      return { matched: !!match, triggerName: match || 'Enterprise Laptop' };
    },
    targetProductMatcher: (p) => /care plan|warranty|support/i.test(p.name) || p.id === 'prod-care-plan',
    type: 'upsell',
    promoDiscount: 10,
    confidenceScore: 94,
    badgeTitle: 'Hardware Lifecycle Protection',
    reasonGenerator: (triggerName) =>
      `Protect ${triggerName} fleet against accidental damage with next-business-day device replacements and priority enterprise SLA.`,
    tags: ['Zero Downtime', 'Extended Warranty'],
  },

  // 10. Display -> Docking Station
  {
    triggerMatches: (names, _, ids) => {
      const match = names.find((n) => /display|monitor|screen/i.test(n)) || (ids.includes('prod-display') ? 'Smart UltraWide Display' : undefined);
      return { matched: !!match, triggerName: match || 'UltraWide Display' };
    },
    targetProductMatcher: (p) => /dock/i.test(p.name) || p.id === 'prod-dock',
    type: 'cross-sell',
    promoDiscount: 12,
    confidenceScore: 93,
    badgeTitle: 'Multi-Display Bridge',
    reasonGenerator: (triggerName) =>
      `Essential connector for ${triggerName} to drive 144Hz WQHD output and dual-peripheral sharing.`,
    tags: ['93% Hardware Synergy', 'Clean Desk'],
  },

  // 11. Docking Station -> Display
  {
    triggerMatches: (names, _, ids) => {
      const match = names.find((n) => /dock/i.test(n)) || (ids.includes('prod-dock') ? 'Docking Station' : undefined);
      return { matched: !!match, triggerName: match || 'Docking Station' };
    },
    targetProductMatcher: (p) => /display|monitor|screen/i.test(p.name) || p.id === 'prod-display',
    type: 'cross-sell',
    promoDiscount: 10,
    confidenceScore: 91,
    badgeTitle: 'Display Output Match',
    reasonGenerator: (triggerName) =>
      `Unlocks the full dual-video capability of ${triggerName} with immersive curved widescreen real estate.`,
    tags: ['Complete Setup', 'High Margin'],
  },

  // 12. Consulting -> Onsite Setup Service
  {
    triggerMatches: (names, _, ids) => {
      const match = names.find((n) => /consulting|architecture|advisory/i.test(n)) || (ids.includes('prod-consulting') ? 'Architecture Consulting' : undefined);
      return { matched: !!match, triggerName: match || 'Architecture Consulting' };
    },
    targetProductMatcher: (p) => /setup|installation/i.test(p.name) || p.id === 'prod-service',
    type: 'cross-sell',
    promoDiscount: 10,
    confidenceScore: 93,
    badgeTitle: 'Implementation & Rollout',
    reasonGenerator: (triggerName) =>
      `Transform ${triggerName} blueprints into operational reality with certified onsite deployment engineers.`,
    tags: ['Turnkey Execution', 'Field Ready'],
  },

  // 13. Consulting -> Care Plan
  {
    triggerMatches: (names, _, ids) => {
      const match = names.find((n) => /consulting|architecture/i.test(n)) || (ids.includes('prod-consulting') ? 'Architecture Consulting' : undefined);
      return { matched: !!match, triggerName: match || 'Architecture Consulting' };
    },
    targetProductMatcher: (p) => /care plan|support/i.test(p.name) || p.id === 'prod-care-plan',
    type: 'upsell',
    promoDiscount: 15,
    confidenceScore: 91,
    badgeTitle: 'Long-term SLA Coverage',
    reasonGenerator: (triggerName) =>
      `Lock in operational continuity post-${triggerName} with 24/7 dedicated engineering support and SLA guarantees.`,
    tags: ['Enterprise SLA', 'Sustained Value'],
  },
];

export function getUpsellRecommendations(
  currentLines: QuoteLine[],
  allProducts: Product[]
): UpsellRecommendation[] {
  const currentProductIds = new Set(currentLines.map((l) => l.productId));
  const currentNames = currentLines.map((l) => l.productName);
  const currentCategories = currentLines.map((l) => l.category);
  const recommendations: UpsellRecommendation[] = [];
  const addedTargetIds = new Set<string>();

  // Helper to build a validated recommendation object
  const buildRecommendation = (
    product: Product,
    rule: {
      type: RecommendationType;
      triggerItemName?: string;
      promoDiscount: number;
      confidenceScore: number;
      badgeTitle: string;
      reason: string;
      tags: string[];
    }
  ): UpsellRecommendation => {
    const listPrice = product.listPrice;
    const costPrice = product.costPrice || Math.round(listPrice * 0.6);
    const promoDiscount = rule.promoDiscount;
    const netPrice = Math.round(listPrice * (1 - promoDiscount / 100));
    const expectedMarginImpact = Math.max(1, netPrice - costPrice);
    const expectedMarginPercent = Math.round((expectedMarginImpact / netPrice) * 100);

    return {
      productId: product.id,
      productName: product.name,
      category: product.categoryId,
      type: rule.type,
      triggerItemName: rule.triggerItemName,
      listPrice,
      promoDiscount,
      netPrice,
      costPrice,
      expectedMarginImpact,
      expectedMarginPercent,
      reason: rule.reason,
      confidenceScore: rule.confidenceScore,
      tags: rule.tags,
      badgeTitle: rule.badgeTitle,
    };
  };

  // 1. If quote has items: evaluate Affinity Rules against items in cart
  if (currentLines.length > 0) {
    for (const rule of AFFINITY_RULES) {
      const matchResult = rule.triggerMatches(
        currentNames,
        currentCategories,
        Array.from(currentProductIds)
      );

      if (matchResult.matched) {
        // Find matching target products from the catalog that are NOT yet in the quote
        const candidateProducts = allProducts.filter(
          (p) => !currentProductIds.has(p.id) && !addedTargetIds.has(p.id) && rule.targetProductMatcher(p)
        );

        for (const target of candidateProducts) {
          addedTargetIds.add(target.id);
          const reason = rule.reasonGenerator(matchResult.triggerName || 'current quote items', target);
          recommendations.push(
            buildRecommendation(target, {
              type: rule.type,
              triggerItemName: matchResult.triggerName,
              promoDiscount: rule.promoDiscount,
              confidenceScore: rule.confidenceScore,
              badgeTitle: rule.badgeTitle,
              reason,
              tags: rule.tags,
            })
          );
        }
      }
    }
  }

  // 2. Category Complementary Cross-Sell & Upsell Fallbacks (If fewer than 3 recommendations)
  if (recommendations.length < 3 && currentLines.length > 0) {
    const hasHardware = currentLines.some((l) => l.category === 'hardware');
    const hasServices = currentLines.some((l) => l.category === 'services');
    const hasSubscription = currentLines.some((l) => l.category === 'subscription');

    const unpicked = allProducts.filter(
      (p) => !currentProductIds.has(p.id) && !addedTargetIds.has(p.id)
    );

    for (const prod of unpicked) {
      if (recommendations.length >= 4) break;

      // Hardware in cart but missing Care Plan -> recommend Care Plan
      if (hasHardware && prod.categoryId === 'subscription' && !addedTargetIds.has(prod.id)) {
        addedTargetIds.add(prod.id);
        recommendations.push(
          buildRecommendation(prod, {
            type: 'upsell',
            triggerItemName: 'Hardware Equipment in Quote',
            promoDiscount: 10,
            confidenceScore: 93,
            badgeTitle: 'Warranty & SLA Attachment',
            reason: `Attach recurring enterprise care coverage to hardware shipments to guarantee 24/7 SLA and unlock recurring revenue.`,
            tags: ['Recurring ARR', 'High Margin SaaS'],
          })
        );
      }

      // Hardware in cart but missing Setup Service -> recommend Setup
      if (hasHardware && prod.categoryId === 'services' && !addedTargetIds.has(prod.id)) {
        addedTargetIds.add(prod.id);
        recommendations.push(
          buildRecommendation(prod, {
            type: 'cross-sell',
            triggerItemName: 'Hardware Equipment in Quote',
            promoDiscount: 8,
            confidenceScore: 89,
            badgeTitle: 'Professional Deployment',
            reason: `Provide full-day certified engineer deployment to install and configure hardware at customer facility.`,
            tags: ['Turnkey Solution', '89% Attach Rate'],
          })
        );
      }

      // Services in cart but missing hardware -> recommend flagship hardware
      if (hasServices && prod.categoryId === 'hardware' && !addedTargetIds.has(prod.id)) {
        addedTargetIds.add(prod.id);
        recommendations.push(
          buildRecommendation(prod, {
            type: 'cross-sell',
            triggerItemName: 'Professional Services in Quote',
            promoDiscount: 5,
            confidenceScore: 86,
            badgeTitle: 'Hardware Host Attachment',
            reason: `Add host enterprise workstations to accompany the scheduled service deployment.`,
            tags: ['Workstation Core', 'Complementary Item'],
          })
        );
      }
    }
  }

  // 3. Fallback for Empty Quote State or remaining unpicked slots
  if (recommendations.length === 0) {
    const unpicked = allProducts.filter(
      (p) => !currentProductIds.has(p.id) && !addedTargetIds.has(p.id)
    );

    // Prioritize flagship products for starter recommendations
    const starterOrder = ['prod-laptop', 'prod-service', 'prod-display', 'prod-care-plan'];
    const sorted = [...unpicked].sort((a, b) => {
      const idxA = starterOrder.indexOf(a.id);
      const idxB = starterOrder.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return b.listPrice - a.listPrice;
    });

    for (const prod of sorted.slice(0, 2)) {
      addedTargetIds.add(prod.id);
      const isRecurring = prod.isRecurring || prod.categoryId === 'subscription';
      recommendations.push(
        buildRecommendation(prod, {
          type: isRecurring ? 'upsell' : 'cross-sell',
          triggerItemName: 'Quote Starter Engine',
          promoDiscount: 5,
          confidenceScore: 90,
          badgeTitle: isRecurring ? 'High-Margin Anchor' : 'Flagship Asset',
          reason: isRecurring
            ? `Top-rated subscription asset with exceptional 70%+ gross margins. Recommended anchor for commercial quotations.`
            : `High-velocity core product. 74% of enterprise quotations commence with this asset.`,
          tags: ['Top Performer', 'High Velocity'],
        })
      );
    }
  }

  // Sort by confidenceScore descending (highest confidence match first)
  return recommendations.sort((a, b) => b.confidenceScore - a.confidenceScore);
}
