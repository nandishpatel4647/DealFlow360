import React, { useState } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  Truck,
  CreditCard,
  HeartPulse,
  Kanban,
  FilePlus2,
  CheckSquare,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Building2,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { UserRole, QuoteLine } from '../../types';
import { calculateLineMetrics, calculateQuoteTotals } from '../../logic/pricingEngine';
import { evaluateBlendedRisk } from '../../logic/riskEngine';

interface LandingPageViewProps {
  onOpenAuth: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onOpenAuth }) => {
  const { setCurrentRoute, loginAsRole, users, configPolicy } = useAppStore();

  // Dynamic Governance Sandbox State (USES REAL PRICING & RISK ENGINES)
  const [serviceDiscount, setServiceDiscount] = useState<number>(18);
  const [customerTier, setCustomerTier] = useState<'Gold' | 'Silver' | 'Bronze'>('Gold');

  // Compute live sandbox lines with actual pricing engine
  const sandboxLines: QuoteLine[] = [
    {
      id: 'sb-1',
      quoteId: 'Q-SANDBOX',
      productId: 'prod-hw-1',
      productName: 'Enterprise Laptop Pro 14',
      category: 'hardware',
      quantity: 2,
      unitListPrice: 120000,
      unitCostPrice: 78000,
      discountPercent: 12,
      discountCeiling: configPolicy.categoryCeilings.hardware,
      isOverLimit: false,
      overLimitPoints: 0,
      netAmount: 211200,
      marginPercent: 26.1,
      isRecurring: false,
    },
    (() => {
      const ceiling = configPolicy.categoryCeilings.services;
      const metrics = calculateLineMetrics(1, 45000, 33000, serviceDiscount, ceiling);
      return {
        id: 'sb-2',
        quoteId: 'Q-SANDBOX',
        productId: 'prod-srv-1',
        productName: 'Installation & Onsite Setup Service',
        category: 'services',
        quantity: 1,
        unitListPrice: 45000,
        unitCostPrice: 33000,
        discountPercent: serviceDiscount,
        discountCeiling: ceiling,
        isOverLimit: metrics.isOverLimit,
        overLimitPoints: metrics.overLimitPoints,
        netAmount: metrics.netAmount,
        marginPercent: metrics.marginPercent,
        isRecurring: false,
      };
    })(),
    {
      id: 'sb-3',
      quoteId: 'Q-SANDBOX',
      productId: 'prod-hw-2',
      productName: 'Extended 2-Yr Enterprise Care Plan',
      category: 'hardware',
      quantity: 1,
      unitListPrice: 18000,
      unitCostPrice: 9600,
      discountPercent: 10,
      discountCeiling: configPolicy.categoryCeilings.hardware,
      isOverLimit: false,
      overLimitPoints: 0,
      netAmount: 16200,
      marginPercent: 40.7,
      isRecurring: false,
    },
  ];

  // Run real engines
  const sandboxTotals = calculateQuoteTotals(sandboxLines);
  const sandboxRisk = evaluateBlendedRisk(sandboxLines, customerTier, configPolicy);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0A0D14] text-[#111827] dark:text-[#F1F5F9] font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                DealFlow<span className="text-[var(--accent-primary)] font-mono">360</span>
              </span>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                • Govern. Grow. Close.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Odoo Ahmedabad National Hackathon 2026
            </span>

            <button
              onClick={onOpenAuth}
              className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Sign In
            </button>

            <button
              onClick={() => {
                loginAsRole('sales_rep');
              }}
              className="btn-primary !py-2 !px-4 !text-xs !gap-1.5 shadow-sm"
            >
              Launch Command Center
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-12 px-4 sm:px-6 max-w-7xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          The Self-Governing B2B Sales Operations Platform
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Most sales systems record decisions.{' '}
          <span className="text-[var(--accent-primary)] underline decoration-blue-300 dark:decoration-blue-700 underline-offset-8">
            DealFlow360 governs them.
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          From quotation to payment, continuously control discounts, multi-tier approvals, inventory fulfillment, and customer negotiations so teams close deals without losing margin.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => loginAsRole('sales_rep')}
            className="btn-primary !py-2.5 !px-5 text-sm !gap-2 shadow-sm font-semibold"
          >
            Launch Command Center
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenAuth}
            className="btn-secondary !py-2.5 !px-5 text-sm !gap-2 font-semibold"
          >
            1-Click Demo Login
          </button>
        </div>

        {/* 1-Click Persona Shortcuts bar */}
        <div className="mt-10 max-w-4xl mx-auto p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between px-2 pb-2 text-xs font-semibold text-slate-500 border-b border-slate-100 dark:border-slate-800">
            <span>Instant Demo Access (5 Personas):</span>
            <span className="text-[11px] text-slate-400">Click to enter as:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => loginAsRole(u.role)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all text-left cursor-pointer group"
              >
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600">
                    {u.name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-slate-400 capitalize truncate">
                    {u.role.replace('_', ' ')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Real Governance Sandbox Section (Interactive Demo) */}
      <section className="py-12 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[var(--accent-primary)]" />
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Live Deal Governance Sandbox
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Move the discount slider to test the actual DealFlow360 risk and approval calculation engines in real-time.
                </p>
              </div>

              {/* Tier Switcher */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Customer Tier:</span>
                {(['Gold', 'Silver', 'Bronze'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCustomerTier(t)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      customerTier === t
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Controls: Slider */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Installation & Setup Service Discount
                  </label>
                  <span className="text-base font-bold font-mono text-blue-600 dark:text-blue-400">
                    {serviceDiscount}%{' '}
                    <span className="text-xs font-normal text-slate-400">
                      (Ceiling: {configPolicy.categoryCeilings.services}%)
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={serviceDiscount}
                  onChange={(e) => setServiceDiscount(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                  <span>0% (Safe)</span>
                  <span>10% (Service Limit)</span>
                  <span>18% (High Deviation)</span>
                  <span>25% (Critical)</span>
                </div>
              </div>

              {/* Dynamic Quote Summary */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>List Price Total:</span>
                  <span className="font-semibold text-slate-900 dark:text-white font-mono">
                    ₹{sandboxTotals.totalListAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Total Discount Granted:</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono">
                    -₹{sandboxTotals.totalDiscountAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Net Payable Amount:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    ₹{sandboxTotals.totalNetAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span>Blended Margin:</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono">
                    {sandboxTotals.overallMarginPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Right Result: Live Risk Engine Output */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Engine Evaluation
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      sandboxRisk.riskLevel === 'HIGH'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300'
                        : sandboxRisk.riskLevel === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {sandboxRisk.riskLevel} RISK • {sandboxRisk.blendedScore}
                  </span>
                </div>

                {/* Point Factors */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-medium">Service Overage</p>
                    <p className="text-sm font-bold text-rose-600 font-mono">
                      +{sandboxRisk.riskBreakdown.serviceDeviationPts.toFixed(1)} pts
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-medium">Margin Erosion</p>
                    <p className="text-sm font-bold text-amber-600 font-mono">
                      +{sandboxRisk.riskBreakdown.marginErosionPts.toFixed(1)} pts
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 font-medium">Customer Tier</p>
                    <p className="text-sm font-bold text-blue-600 font-mono">
                      +{sandboxRisk.riskBreakdown.tierRiskPts.toFixed(1)} pts
                    </p>
                  </div>
                </div>

                {/* Required Approval Route */}
                <div className="p-3 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 block mb-1">
                    Enforced Governance Route:
                  </span>
                  <div className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-100">
                    <span>Quote Draft</span>
                    <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                    {sandboxRisk.riskLevel === 'HIGH' ? (
                      <>
                        <span className="px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                          Sales Manager
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                        <span className="px-1.5 py-0.5 rounded bg-rose-200/60 dark:bg-rose-900 text-rose-900 dark:text-rose-100">
                          Finance Approver
                        </span>
                      </>
                    ) : sandboxRisk.riskLevel === 'MEDIUM' ? (
                      <span className="px-1.5 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900 text-amber-900 dark:text-amber-100">
                        Sales Manager
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100">
                        Auto Approved
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                    <span>Fulfillment</span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => loginAsRole('sales_rep')}
                    className="btn-primary !py-1.5 !px-3 !text-xs !gap-1.5"
                  >
                    Open Quote in Builder
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities Grid */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
            End-to-End Enterprise Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Governed from Quote to Cash
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Dynamic Discount Ceilings
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enforces category limits (Hardware 15%, Services 10%, SaaS 12%) and customer tier thresholds automatically before quotes leave the building.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Two-Tier Approval Chain
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              High-risk deals require both Sales Manager and Finance Approver concurrence. Sales Managers cannot bypass Finance commercial release.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Freight-Optimized Fulfillment
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Splits inventory across Ahmedabad Hub, Surat Depot, and Mumbai Logistics to eliminate stockouts while minimizing total freight cost.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <ExternalLink className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Customer Portal & Re-Governance
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Customer counter-offers instantly trigger real-time risk recalculation, re-routing deals back through approval governance automatically.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Hybrid Goods & SaaS Billing
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Separates one-time hardware dispatches from recurring subscriptions with exact daily proration and 18% GST tax invoice generation.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Deal Health & Anomaly Detector
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Proactively intercepts stalled quotations and discount spikes with 1-click automated rep nudges and executive escalations.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-4 text-center text-xs text-slate-500">
        <p>DealFlow360 • Built for the Odoo Ahmedabad National Hackathon 2026</p>
        <p className="mt-1 text-slate-400">Govern every deal from quotation to cash.</p>
      </footer>
    </div>
  );
};
