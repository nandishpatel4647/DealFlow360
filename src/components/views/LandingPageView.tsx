import React, { useState, useRef } from 'react';
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
  Users,
  Eye,
  History,
  Activity,
  Award,
  Zap,
  Check,
  XCircle,
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

  // 3D Hero tilt calculation
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Dampen tilt to ±3 degrees
    const rotateX = -(y / (rect.height / 2)) * 3;
    const rotateY = (x / (rect.width / 2)) * 3;
    setTilt({ rotateX, rotateY });
  };
  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

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
    <div className="min-h-screen bg-[var(--surface-sunken)] text-[var(--text-primary)] font-sans selection:bg-blue-100 selection:text-blue-900 bg-mesh-grid">
      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-[var(--surface-card)]/90 backdrop-blur-md border-b border-[var(--border-default)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold tracking-tight text-[var(--text-primary)]">
                DealFlow<span className="text-[var(--accent-primary)] font-mono">360</span>
              </span>
              <span className="text-[11px] text-[var(--text-tertiary)] font-medium hidden md:inline">
                • Self-Governing B2B Sales Operations
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6 text-xs font-medium text-[var(--text-secondary)]">
            <a href="#sandbox" className="hover:text-[var(--accent-primary)] transition-colors">
              Risk Sandbox
            </a>
            <a href="#engine" className="hover:text-[var(--accent-primary)] transition-colors">
              6-Step Engine
            </a>
            <a href="#comparison" className="hover:text-[var(--accent-primary)] transition-colors">
              Comparison
            </a>
            <a href="#roles" className="hover:text-[var(--accent-primary)] transition-colors">
              Role Personas
            </a>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--surface-sunken)] text-[var(--text-secondary)] border border-[var(--border-default)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" />
              Odoo Ahmedabad Hackathon 2026
            </span>

            <button
              onClick={onOpenAuth}
              className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 rounded-lg hover:bg-[var(--surface-sunken)] transition-colors cursor-pointer"
            >
              Sign In
            </button>

            <button
              onClick={() => loginAsRole('sales_rep')}
              className="btn-primary !py-2 !px-4 !text-xs !gap-1.5 shadow-sm"
            >
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION WITH 3D PERSPECTIVE PRODUCT MOCKUP */}
      <section className="pt-16 pb-12 px-4 sm:px-6 max-w-7xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-primary-soft)] border border-[var(--accent-primary-border)] text-[var(--accent-primary)] text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          The Self-Governing B2B Sales Operations Platform
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] max-w-4xl mx-auto leading-tight">
          Most sales systems record decisions.{' '}
          <span className="text-[var(--accent-primary)] underline decoration-blue-300 dark:decoration-blue-700 underline-offset-8">
            DealFlow360 governs them.
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          Continuous pre-flight control from quotation to cash. Eliminate margin erosion with automated blended risk scoring, multi-tier approvals, split-warehouse logistics, and synchronized counter-offer re-governance.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => loginAsRole('sales_rep')}
            className="btn-primary !py-2.5 !px-5 text-sm !gap-2 shadow-sm font-semibold hover-card-lift"
          >
            Launch Command Center
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenAuth}
            className="btn-secondary !py-2.5 !px-5 text-sm !gap-2 font-semibold hover-card-lift"
          >
            1-Click Demo Login
          </button>
        </div>

        {/* 3D Perspective Product Hero Mockup with Floating Metric Chips */}
        <div
          className="mt-12 max-w-5xl mx-auto relative cursor-pointer"
          style={{ perspective: '1200px' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => loginAsRole('sales_rep')}
        >
          {/* Floating Pill Left Top: Risk Score */}
          <div
            className="hidden md:flex absolute -top-5 -left-4 z-20 items-center gap-2 px-3.5 py-2 rounded-xl surface-card shadow-lg border border-[var(--danger-border)] animate-bounce"
            style={{ animationDuration: '4s' }}
          >
            <div className="w-2 h-2 rounded-full bg-[var(--danger)] animate-pulse" />
            <span className="text-xs font-bold text-[var(--danger)]">
              11.3 High Risk • Requires Finance Escalation
            </span>
          </div>

          {/* Floating Pill Right Top: Margin Protected */}
          <div
            className="hidden md:flex absolute -top-4 -right-4 z-20 items-center gap-2 px-3.5 py-2 rounded-xl surface-card shadow-lg border border-[var(--success-border)] animate-bounce"
            style={{ animationDuration: '3.5s' }}
          >
            <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
            <span className="text-xs font-bold text-[var(--success)]">
              26.8% Margin Protected
            </span>
          </div>

          {/* Floating Pill Left Bottom: Split Hub Logistics */}
          <div
            className="hidden md:flex absolute -bottom-5 -left-4 z-20 items-center gap-2 px-3.5 py-2 rounded-xl surface-card shadow-lg border border-[var(--info-border)] animate-bounce"
            style={{ animationDuration: '4.5s' }}
          >
            <Truck className="w-4 h-4 text-[var(--info)]" />
            <span className="text-xs font-semibold text-[var(--info)]">
              Ahmedabad (6) + Surat (4) Optimal Split
            </span>
          </div>

          {/* Floating Pill Right Bottom: Cryptographic Audit Hash */}
          <div
            className="hidden md:flex absolute -bottom-4 -right-4 z-20 items-center gap-2 px-3.5 py-2 rounded-xl surface-card shadow-lg border border-[var(--accent-primary-border)] animate-bounce"
            style={{ animationDuration: '5s' }}
          >
            <Lock className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span className="text-xs font-mono font-medium text-[var(--text-secondary)]">
              ✓ SHA-256 Audit Log Signed
            </span>
          </div>

          {/* Perspective Container */}
          <div
            className="rounded-2xl surface-card border border-[var(--border-default)] shadow-2xl overflow-hidden card-depth-3d transition-transform duration-200 ease-out"
            style={{
              transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Mock Window Top Bar */}
            <div
              className="px-4 py-3 bg-[var(--surface-sunken)] flex items-center justify-between border-b"
              style={{ borderColor: 'var(--border-default)' }}
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-[11px] text-[var(--text-tertiary)]">
                  dealflow360.internal/ops/Q-1042
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[var(--text-tertiary)]">
                <span className="px-2 py-0.5 rounded bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-semibold">
                  Live Engine Sandbox
                </span>
                <span>v3.1 Production</span>
              </div>
            </div>

            {/* Mockup Body Content Preview */}
            <div className="p-6 bg-[var(--surface-card)] text-left grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-[var(--accent-primary)]">Q-1042</span>
                    <h3 className="text-base font-bold text-[var(--text-primary)]">
                      Acme Corp — Annual Infrastructure Modernization
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-600 border border-amber-200 dark:border-amber-800">
                    Pending Finance Commercial Release
                  </span>
                </div>

                {/* Line Items Preview */}
                <div className="rounded-lg border border-[var(--border-default)] overflow-hidden text-xs">
                  <div className="grid grid-cols-12 gap-2 p-2.5 bg-[var(--surface-sunken)] font-semibold text-[var(--text-secondary)]">
                    <div className="col-span-6">Product / SKU</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-right">Discount</div>
                    <div className="col-span-2 text-right">Status</div>
                  </div>
                  <div className="grid grid-cols-12 gap-2 p-2.5 border-t border-[var(--border-default)] items-center">
                    <div className="col-span-6 font-medium text-[var(--text-primary)]">Enterprise Laptop Pro 14</div>
                    <div className="col-span-2 text-center font-mono">10</div>
                    <div className="col-span-2 text-right font-mono text-emerald-600">12% (Safe)</div>
                    <div className="col-span-2 text-right text-[11px] text-[var(--success)] font-medium">✓ Compliant</div>
                  </div>
                  <div className="grid grid-cols-12 gap-2 p-2.5 border-t border-[var(--border-default)] items-center bg-rose-50/20 dark:bg-rose-950/20">
                    <div className="col-span-6 font-medium text-[var(--text-primary)]">Onsite Installation & Setup</div>
                    <div className="col-span-2 text-center font-mono">1</div>
                    <div className="col-span-2 text-right font-mono text-rose-600 font-bold">18% (&gt;10% Max)</div>
                    <div className="col-span-2 text-right text-[11px] text-rose-600 font-bold">⚠ Risk Triggered</div>
                  </div>
                </div>
              </div>

              {/* Mockup Right Side: Risk Cockpit */}
              <div className="md:col-span-4 p-4 rounded-xl bg-[var(--surface-sunken)] border border-[var(--border-default)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                    Blended Risk Engine
                  </span>
                  <span className="text-xs font-bold text-rose-600 font-mono">11.3 / 25.0</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--border-default)] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 w-[55%]" />
                </div>
                <div className="space-y-1 text-[11px] text-[var(--text-tertiary)]">
                  <div className="flex justify-between">
                    <span>Service Ceiling Overage:</span>
                    <span className="font-mono text-rose-600 font-bold">+6.4 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margin Erosion Impact:</span>
                    <span className="font-mono text-amber-600 font-bold">+3.2 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer Tier Rating:</span>
                    <span className="font-mono text-blue-600 font-bold">+1.7 pts</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-[var(--border-default)] text-center">
                  <span className="text-[11px] text-[var(--accent-primary)] font-semibold hover:underline">
                    Click to launch interactive workspace →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 1-Click Persona Shortcuts bar */}
        <div className="mt-12 max-w-4xl mx-auto p-3 rounded-2xl surface-card border border-[var(--border-default)] shadow-sm">
          <div className="flex items-center justify-between px-2 pb-2 text-xs font-semibold text-[var(--text-tertiary)] border-b border-[var(--border-default)]">
            <span>Instant Demo Access (5 Personas):</span>
            <span className="text-[11px]">Select any role to explore their unique workspace:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => loginAsRole(u.role)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--surface-sunken)] border border-transparent hover:border-[var(--border-default)] transition-all text-left cursor-pointer group"
              >
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-7 h-7 rounded-full object-cover shrink-0 border border-[var(--border-default)]"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-primary)]">
                    {u.name.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-[var(--text-tertiary)] capitalize truncate">
                    {u.role.replace('_', ' ')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TRUST STRIP / HACKATHON CONTEXT */}
      <section className="py-8 border-y border-[var(--border-default)] bg-[var(--surface-card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[var(--text-primary)]">
                ₹4.8 Cr
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">B2B Deals Evaluated</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[var(--success)]">
                &lt; 450ms
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Live Re-governance Engine</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[var(--accent-primary)]">
                0 Violations
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Zero Margin Leaks Allowed</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-[var(--text-primary)]">
                5 Roles
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Role-Isolated UX Shells</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PROBLEM VS SOLUTION COMPARISON */}
      <section id="comparison" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
            Architectural Paradigm Shift
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
            Why Traditional CRM & ERP Systems Bleed Margin
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Legacy Sales Workflow */}
          <div className="surface-card p-6 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/10 dark:bg-rose-950/10 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <XCircle className="w-5 h-5" />
              <span>Traditional Sales Software</span>
            </div>
            <ul className="space-y-3 text-xs text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Blind Discounting:</strong> Reps grant aggressive discounts without instant visibility into product-level margin erosion.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Post-Mortem Approvals:</strong> Finance notices predatory discounting only after quotes have been delivered to clients.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Freight Blindness:</strong> Orders dispatched from single warehouses causing costly split stockouts or excessive shipping fees.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span><strong>Unmonitored Negotiations:</strong> Customer counter-offers accepted over email without re-running commercial margin checks.</span>
              </li>
            </ul>
          </div>

          {/* DealFlow360 Autonomous Architecture */}
          <div className="surface-card p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/10 dark:bg-emerald-950/10 space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>DealFlow360 Self-Governing Platform</span>
            </div>
            <ul className="space-y-3 text-xs text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Pre-Flight Guardrails:</strong> Every keystroke dynamically checks tier ceilings and service margin limits before quote creation.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Dual-Tier Concurrence:</strong> High-risk deals strictly require both Sales Manager and Finance Approver digital sign-offs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Intelligent Split Fulfillment:</strong> Multi-hub inventory allocation automatically minimizes freight across 3 regional depots.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span>
                <span><strong>Synchronized Re-Governance:</strong> Buyer counter-offers in the customer portal immediately bump revisions and re-trigger governance.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE DISCOUNT GOVERNANCE SANDBOX */}
      <section id="sandbox" className="py-12 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="surface-card rounded-2xl border border-[var(--border-default)] shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-[var(--border-default)] bg-[var(--surface-sunken)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[var(--accent-primary)]" />
                  <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                    Live Deal Governance Sandbox
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-[var(--text-tertiary)] mt-1">
                  Adjust the discount slider to test the actual DealFlow360 risk and approval calculation engines in real-time.
                </p>
              </div>

              {/* Tier Switcher */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[var(--text-tertiary)] font-medium">Customer Tier:</span>
                {(['Gold', 'Silver', 'Bronze'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setCustomerTier(t)}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                      customerTier === t
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'surface-card text-[var(--text-secondary)] border border-[var(--border-default)]'
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
                  <label className="text-xs font-bold text-[var(--text-primary)]">
                    Installation & Setup Service Discount
                  </label>
                  <span className="text-base font-bold font-mono text-[var(--accent-primary)]">
                    {serviceDiscount}%{' '}
                    <span className="text-xs font-normal text-[var(--text-tertiary)]">
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
                <div className="flex justify-between text-[11px] text-[var(--text-tertiary)] mt-1 font-mono">
                  <span>0% (Safe)</span>
                  <span>10% (Service Limit)</span>
                  <span>18% (High Deviation)</span>
                  <span>25% (Critical)</span>
                </div>
              </div>

              {/* Dynamic Quote Summary */}
              <div className="p-4 rounded-xl border border-[var(--border-default)] bg-[var(--surface-sunken)] space-y-2.5 text-xs">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>List Price Total:</span>
                  <span className="font-semibold text-[var(--text-primary)] font-mono">
                    ₹{sandboxTotals.totalListAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Total Discount Granted:</span>
                  <span className="font-semibold text-rose-600 font-mono">
                    -₹{sandboxTotals.totalDiscountAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Net Payable Amount:</span>
                  <span className="font-bold text-[var(--text-primary)] font-mono">
                    ₹{sandboxTotals.totalNetAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)] pt-2 border-t border-[var(--border-default)]">
                  <span>Blended Margin:</span>
                  <span className="font-bold text-[var(--text-primary)] font-mono">
                    {sandboxTotals.overallMarginPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Right Result: Live Risk Engine Output */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-xl border border-[var(--border-default)] surface-card shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
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
                  <div className="p-2 rounded-lg bg-[var(--surface-sunken)] border border-[var(--border-default)]">
                    <p className="text-[10px] text-[var(--text-tertiary)] font-medium">Service Overage</p>
                    <p className="text-sm font-bold text-rose-600 font-mono">
                      +{sandboxRisk.riskBreakdown.serviceDeviationPts.toFixed(1)} pts
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--surface-sunken)] border border-[var(--border-default)]">
                    <p className="text-[10px] text-[var(--text-tertiary)] font-medium">Margin Erosion</p>
                    <p className="text-sm font-bold text-amber-600 font-mono">
                      +{sandboxRisk.riskBreakdown.marginErosionPts.toFixed(1)} pts
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--surface-sunken)] border border-[var(--border-default)]">
                    <p className="text-[10px] text-[var(--text-tertiary)] font-medium">Customer Tier</p>
                    <p className="text-sm font-bold text-blue-600 font-mono">
                      +{sandboxRisk.riskBreakdown.tierRiskPts.toFixed(1)} pts
                    </p>
                  </div>
                </div>

                {/* Required Approval Route */}
                <div className="p-3 rounded-lg bg-[var(--accent-primary-soft)] border border-[var(--accent-primary-border)] text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)] block mb-1">
                    Enforced Governance Route:
                  </span>
                  <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                    <span>Quote Draft</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                    {sandboxRisk.riskLevel === 'HIGH' ? (
                      <>
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                          Sales Manager
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                          Finance Approver
                        </span>
                      </>
                    ) : sandboxRisk.riskLevel === 'MEDIUM' ? (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                        Sales Manager
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                        Auto Approved
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
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

      {/* 6. CONNECTED 6-STEP ENGINE WORKFLOW */}
      <section id="engine" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
            End-to-End Operational Lifecycle
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
            The 6 Autonomous DealFlow360 Engines
          </h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-2 max-w-xl mx-auto">
            From initial quote creation to final cash settlement, each engine self-governs its phase while feeding cryptographically verifiable audit logs forward.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Step 1: Quote Builder */}
          <div className="surface-card p-5 rounded-xl border border-[var(--border-default)] space-y-3 hover-card-lift">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
                PHASE 01
              </span>
              <FilePlus2 className="w-4 h-4 text-[var(--accent-primary)]" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Intelligent Quote Builder</h3>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
              Real-time ceiling validation per line item (Hardware 15%, Services 10%, SaaS 12%). Reps cannot submit quotes exceeding hard company boundaries without triggering governance flags.
            </p>
          </div>

          {/* Step 2: Risk Scoring */}
          <div className="surface-card p-5 rounded-xl border border-[var(--border-default)] space-y-3 hover-card-lift">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--warning-soft)] text-[var(--warning)]">
                PHASE 02
              </span>
              <Sliders className="w-4 h-4 text-[var(--warning)]" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Blended Risk Assessment</h3>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
              Calculates composite risk score (0–25 pts) based on discount overages, customer credit tier, and gross margin erosion to route deals dynamically.
            </p>
          </div>

          {/* Step 3: Two-Tier Approvals */}
          <div className="surface-card p-5 rounded-xl border border-[var(--border-default)] space-y-3 hover-card-lift">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--danger-soft)] text-[var(--danger)]">
                PHASE 03
              </span>
              <CheckSquare className="w-4 h-4 text-[var(--danger)]" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Two-Tier Governance Routing</h3>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
              Enforces sequential approval gates. High-risk quotations mandate digital signature from both Sales Manager and Finance Commercial Approver before client delivery.
            </p>
          </div>

          {/* Step 4: Customer Portal */}
          <div className="surface-card p-5 rounded-xl border border-[var(--border-default)] space-y-3 hover-card-lift">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]">
                PHASE 04
              </span>
              <ExternalLink className="w-4 h-4 text-[var(--accent-primary)]" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Isolated Buyer Negotiation</h3>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
              Dedicated customer workspace completely insulated from internal margins or risk scores. Submitting a counter-offer automatically creates Revision 2 and triggers re-governance.
            </p>
          </div>

          {/* Step 5: Fulfillment Split */}
          <div className="surface-card p-5 rounded-xl border border-[var(--border-default)] space-y-3 hover-card-lift">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--info-soft)] text-[var(--info)]">
                PHASE 05
              </span>
              <Truck className="w-4 h-4 text-[var(--info)]" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Freight-Optimized Allocation</h3>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
              Splits inventory across Ahmedabad Hub, Surat Depot, and Mumbai Logistics. Platform Admin confirms the optimal multi-hub split to eliminate stockouts.
            </p>
          </div>

          {/* Step 6: Billing & Invoicing */}
          <div className="surface-card p-5 rounded-xl border border-[var(--border-default)] space-y-3 hover-card-lift">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--success-soft)] text-[var(--success)]">
                PHASE 06
              </span>
              <CreditCard className="w-4 h-4 text-[var(--success)]" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Hybrid Goods & SaaS Billing</h3>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
              Separates one-time physical goods invoices with 18% GST from recurring software subscriptions with daily proration and instant payment reconciliation.
            </p>
          </div>
        </div>
      </section>

      {/* 7. ROLE PERSONAS & EXPERIENCES */}
      <section id="roles" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-[var(--border-default)]">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)]">
            Tailored Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
            Strict Enterprise Role Isolation
          </h2>
          <p className="text-xs text-[var(--text-tertiary)] mt-2 max-w-xl mx-auto">
            Each role interacts with a dedicated interface strictly governed by enterprise permissions. No unauthorized buttons, no margin leaks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              role: 'sales_rep' as UserRole,
              title: 'Sales Rep',
              user: 'Alex Chen',
              focus: 'Build quotes, monitor deal velocity, track line discount margins.',
              canCreate: true,
              canApprove: false,
            },
            {
              role: 'sales_manager' as UserRole,
              title: 'Sales Manager',
              user: 'Marcus Vance',
              focus: 'Review medium-risk quotes, grant commercial overrides, coach reps.',
              canCreate: true,
              canApprove: true,
            },
            {
              role: 'finance' as UserRole,
              title: 'Finance Approver',
              user: 'Elena Rostova',
              focus: 'Review critical high-risk margin deviations and release invoices.',
              canCreate: false,
              canApprove: true,
            },
            {
              role: 'customer' as UserRole,
              title: 'Customer Buyer',
              user: 'Priya Sharma',
              focus: 'Review deliverables, counter-offer on line items, accept terms.',
              canCreate: false,
              canApprove: false,
            },
            {
              role: 'admin' as UserRole,
              title: 'Platform Admin',
              user: 'Nandish Admin',
              focus: 'Approve new user registrations, tune discount limits, confirm dispatch.',
              canCreate: false,
              canApprove: false,
            },
          ].map((persona) => (
            <div
              key={persona.role}
              className="surface-card p-4 rounded-xl border border-[var(--border-default)] flex flex-col justify-between space-y-4 hover-card-lift"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--accent-primary)]">{persona.title}</span>
                  {persona.canCreate && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-sunken)] text-[var(--text-tertiary)] font-mono">
                      + Quote
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                  {persona.focus}
                </p>
              </div>

              <button
                onClick={() => loginAsRole(persona.role)}
                className="w-full btn-secondary !py-1.5 !text-xs !justify-center"
              >
                Log In as {persona.user.split(' ')[0]} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FINAL CALL TO ACTION */}
      <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div
          className="p-8 sm:p-12 rounded-3xl surface-card border border-[var(--accent-primary-border)] shadow-xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--surface-card) 0%, var(--surface-sunken) 100%)',
          }}
        >
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Ready to govern your sales pipeline?
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Experience zero margin leakage and seamless deal fulfillment with DealFlow360 today. Built for enterprise scale at the Odoo Ahmedabad National Hackathon 2026.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => loginAsRole('sales_rep')}
                className="btn-primary !py-2.5 !px-6 text-sm font-semibold shadow-md"
              >
                Launch Live Platform Now →
              </button>
              <button
                onClick={onOpenAuth}
                className="btn-secondary !py-2.5 !px-6 text-sm font-semibold"
              >
                Register New User Account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="border-t border-[var(--border-default)] py-8 px-4 text-center text-xs text-[var(--text-tertiary)] bg-[var(--surface-card)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="font-bold text-[var(--text-primary)]">DealFlow360</span>
            <span>• Odoo Ahmedabad National Hackathon 2026</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="#sandbox" className="hover:text-[var(--text-primary)]">Governance Sandbox</a>
            <a href="#engine" className="hover:text-[var(--text-primary)]">6-Step Engine</a>
            <a href="#comparison" className="hover:text-[var(--text-primary)]">Architecture</a>
            <a href="#roles" className="hover:text-[var(--text-primary)]">Role Access</a>
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Govern every deal from quotation to cash.
          </div>
        </div>
      </footer>
    </div>
  );
};
