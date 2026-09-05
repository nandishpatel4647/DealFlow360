import React, { useMemo, useState, useEffect } from 'react';
import {
  Zap,
  Check,
  ArrowRight,
  ShieldCheck,
  FilePlus2,
  Building,
  CreditCard,
  Sparkles,
  TrendingUp,
  Cpu,
  Warehouse,
  BadgeCheck,
  Package,
  UserRound,
  Landmark,
  Handshake,
  Cog,
  PenLine,
  CircleCheck,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { UserRole } from '../../types';
import { BrandLogo } from '../common/BrandLogo';

// Helper for Indian Rupee notation
export const formatINR = (n: number) => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${new Intl.NumberFormat('en-IN').format(Math.round(n))}`;
};

export const seedTestimonials = [
  {
    name: 'Rajesh Varma',
    role: 'CFO',
    company: 'CyberEdge Systems',
    quote:
      'DealFlow360 eliminated 3.8 crores of margin leakage in our first quarter. The explainable risk vectors gave our audit committee unshakeable confidence.',
    img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=srgb&fm=jpg&q=85&w=200',
  },
  {
    name: 'Ananya Sharma',
    role: 'VP RevOps',
    company: 'CloudGrid India',
    quote:
      'Our reps close hybrid deals 4.2× faster now. The tactile CPQ workflow feels engineered, not templated — a rare thing in enterprise software.',
    img: 'https://images.unsplash.com/photo-1614786269829-d24616faf56d?crop=entropy&cs=srgb&fm=jpg&q=85&w=200',
  },
  {
    name: 'Vikram Sethi',
    role: 'CCO',
    company: 'IoTix Technologies',
    quote:
      'Split-hub warehouse routing plus milestone GST invoicing — this is what enterprise India actually needs. Zero manual reconciliation for six months.',
    img: 'https://images.unsplash.com/flagged/photo-1553642618-de0381320ff3?crop=entropy&cs=srgb&fm=jpg&q=85&w=200',
  },
];

export const riskThreshold = (discount: number) => {
  if (discount <= 10)
    return {
      tier: 'low' as const,
      label: 'Auto-Approved — Rep Delegation',
      icon: 'check',
    };
  if (discount <= 18)
    return {
      tier: 'medium' as const,
      label: 'Tier-2 Commercial Review',
      icon: 'loop',
    };
  return {
    tier: 'high' as const,
    label: 'Tier-3 CFO Escalation',
    icon: 'cross',
  };
};

interface LandingPageViewProps {
  onOpenAuth?: () => void;
}

// ---------- Top Nav ----------
const DFNav: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-6xl"
      data-testid="landing-nav"
    >
      <div className="bg-[#0B1528]/95 backdrop-blur-md rounded-full px-5 py-2.5 flex items-center justify-between gap-4 shadow-xl border border-slate-800">
        {/* Unified 3D Logo with pure white text on dark navbar */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center cursor-pointer transition hover:opacity-90"
          data-testid="brand-logo"
        >
          <BrandLogo size="md" theme="dark" subtitle="Deal Cockpit" />
        </button>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 mx-auto text-[13px] font-medium text-slate-300">
          <a
            href="#simulator"
            className="px-3.5 py-1.5 rounded-full hover:bg-slate-800 hover:text-white transition text-slate-300"
            data-testid="nav-simulator"
          >
            Live Simulator
          </a>
          <a
            href="#personas"
            className="px-3.5 py-1.5 rounded-full hover:bg-slate-800 hover:text-white transition text-slate-300"
            data-testid="nav-personas"
          >
            Stakeholders
          </a>
          <a
            href="#roi"
            className="px-3.5 py-1.5 rounded-full hover:bg-slate-800 hover:text-white transition text-slate-300"
            data-testid="nav-roi"
          >
            ROI Calculator
          </a>
          <a
            href="#lifecycle"
            className="px-3.5 py-1.5 rounded-full hover:bg-slate-800 hover:text-white transition text-slate-300"
            data-testid="nav-lifecycle"
          >
            How it works
          </a>
          <a
            href="#trust"
            className="px-3.5 py-1.5 rounded-full hover:bg-slate-800 hover:text-white transition text-slate-300"
            data-testid="nav-trust"
          >
            Enterprise Trust
          </a>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAuth}
            className="bg-[#0176D3] hover:bg-blue-600 text-white font-bold text-[13px] px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer"
            data-testid="launch-cockpit-button"
          >
            Launch Command Center <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- Hero Simulator ----------
const HeroSim: React.FC<{ onOpenAuth: () => void }> = () => {
  const [discount, setDiscount] = useState<number>(9);
  const [signing, setSigning] = useState<boolean>(false);
  const [signed, setSigned] = useState<boolean>(false);
  const base = 34600000;
  const net = base * (1 - discount / 100);
  const margin = 38.5 - discount * 0.85;
  const marginBreach = margin < 25;
  const status = riskThreshold(discount);

  const badges = {
    low: {
      bg: 'bg-blue-50 border border-blue-200',
      text: 'text-[#0176D3]',
      icon: <CircleCheck className="w-4 h-4 text-[#0176D3]" />,
    },
    medium: {
      bg: 'bg-amber-50 border border-amber-200',
      text: 'text-amber-700',
      icon: <Cog className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: '3s' }} />,
    },
    high: {
      bg: 'bg-rose-50 border border-rose-200',
      text: 'text-rose-700',
      icon: <Sparkles className="w-4 h-4 text-rose-600" />,
    },
  }[status.tier];

  const sign = () => {
    setSigning(true);
    setTimeout(() => {
      setSigning(false);
      setSigned(true);
    }, 900);
  };

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden card-3d"
      data-testid="hero-sandbox"
    >
      {/* macOS titlebar */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-100 bg-slate-50/60">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] border border-[#1aab29]" />
        </div>
        <div className="text-xs font-mono text-slate-500 flex-1 text-center">
          Quote <span className="text-[#0176D3] font-bold">#Q-1042</span> · Acme Global Tech
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Sandbox
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Line Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Cpu className="w-4 h-4 text-[#0176D3]" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-slate-900">Edge AI Gateway 240</div>
                <div className="text-[11px] text-slate-500 font-mono">240 units · SKU EG240-HW</div>
              </div>
            </div>
            <div className="font-mono text-sm font-bold text-slate-900">
              {formatINR(240 * 145000)}
            </div>
          </div>
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#0176D3]" />
              </div>
              <div>
                <div className="text-[13px] font-bold text-slate-900">Cloud Deal Intelligence — 3yr</div>
                <div className="text-[11px] text-slate-500 font-mono">1 license · CDI-SAAS-3Y</div>
              </div>
            </div>
            <div className="font-mono text-sm font-bold text-slate-900">₹7.20 L</div>
          </div>
        </div>

        {/* Concession Slider */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Concession Slider</span>
            <span
              className="font-mono font-extrabold text-[#0176D3] text-base"
              data-testid="hero-discount-value"
            >
              {discount}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            value={discount}
            onChange={(e) => setDiscount(+e.target.value)}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0176D3]"
            data-testid="hero-discount-slider"
          />
        </div>

        {/* Metrics Row */}
        <div key={status.tier} className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">
              Governed Net
            </div>
            <div
              className="font-mono text-xl font-extrabold text-slate-900"
              data-testid="hero-net-value"
            >
              {formatINR(net)}
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-0.5">
              Blended Margin
            </div>
            <div
              className={`font-mono text-xl font-extrabold ${
                marginBreach ? 'text-rose-600' : 'text-[#0176D3]'
              }`}
              data-testid="hero-margin-value"
            >
              {margin.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`${badges.bg} rounded-xl p-3.5 flex items-center gap-2.5 shadow-2xs`}
          data-testid="hero-status-badge"
        >
          {badges.icon}
          <div className={`text-xs font-bold ${badges.text}`}>{status.label}</div>
        </div>

        {/* Action Button */}
        <button
          onClick={sign}
          disabled={signing || signed}
          className="w-full bg-[#0176D3] hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-75"
          data-testid="hero-sign-btn"
        >
          {signed ? (
            <>
              <Check className="w-4 h-4" /> Signed · Digital Sign-Off Captured
            </>
          ) : signing ? (
            <>
              <Cog className="w-4 h-4 animate-spin" /> Requesting Signature…
            </>
          ) : (
            <>
              <PenLine className="w-4 h-4" /> Simulate One-Click Digital Sign-Off
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ---------- Multi-Persona Switcher ----------
const PersonaSwitcher: React.FC<{ onOpenAuth: () => void }> = () => {
  const [persona, setPersona] = useState<'sales' | 'finance' | 'buyer' | 'revops'>('sales');
  const personas = [
    { key: 'sales' as const, label: 'For Sales Teams', icon: <UserRound className="w-4 h-4" /> },
    { key: 'finance' as const, label: 'For Finance Approvers', icon: <ShieldCheck className="w-4 h-4" /> },
    { key: 'buyer' as const, label: 'For Enterprise Buyers', icon: <Handshake className="w-4 h-4" /> },
    { key: 'revops' as const, label: 'For RevOps & Ops', icon: <Cog className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="inline-flex p-1 rounded-full bg-slate-100 border border-slate-200 shadow-2xs" data-testid="persona-tabs">
        {personas.map((p) => (
          <button
            key={p.key}
            onClick={() => setPersona(p.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              persona === p.key
                ? 'bg-[#0176D3] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            data-testid={`persona-tab-${p.key}`}
          >
            {p.icon}
            {p.label}
          </button>
        ))}
      </div>
      {persona === 'sales' && <SalesPersonaCard />}
      {persona === 'finance' && <FinancePersonaCard />}
      {persona === 'buyer' && <BuyerPersonaCard />}
      {persona === 'revops' && <RevOpsPersonaCard />}
    </div>
  );
};

const SalesPersonaCard: React.FC = () => {
  const [added, setAdded] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 grid md:grid-cols-2 gap-8 shadow-sm card-3d">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0176D3] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
          SALES · GUARDRAILS
        </div>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
          Quote within ceilings. Upsell without approval loops.
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          Every discount lever is bounded to your delegation. Add strategic add-ons and see
          margin bounce back — before your competition even follows up.
        </p>
        <ul className="space-y-2 pt-2">
          {[
            'Live margin re-quoting',
            'Bundled hardware + SaaS upsell paths',
            'Auto-generated GST/HSN line items',
          ].map((t) => (
            <li key={t} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Check className="w-4 h-4 text-[#0176D3]" /> {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500">
          CPQ Upsell Engine
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-[13px] font-bold text-slate-900">Current Blended Margin</div>
            <div className="text-[11px] text-slate-500">Q-1042 · 240 units</div>
          </div>
          <div className={`font-mono font-bold ${added ? 'text-[#0176D3]' : 'text-slate-900'}`}>
            {added ? '42.6%' : '37.8%'}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
          <div>
            <div className="text-[13px] font-bold text-slate-900">Governed Net Price</div>
            <div className="text-[11px] text-slate-500">Post-recommendation</div>
          </div>
          <div className={`font-mono font-bold ${added ? 'text-[#0176D3]' : 'text-slate-900'}`}>
            {added ? '₹3.28 Cr' : '₹3.10 Cr'}
          </div>
        </div>
        <button
          onClick={() => setAdded(!added)}
          className="w-full bg-[#0176D3] hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 text-xs cursor-pointer"
          data-testid="sales-upsell-btn"
        >
          {added ? (
            <>
              <Check className="w-4 h-4" /> Added · +4.8% margin, +₹18.0 L
            </>
          ) : (
            <>
              <TrendingUp className="w-4 h-4" /> Add 3yr Premium 24/7 SLA Support
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const FinancePersonaCard: React.FC = () => {
  const vectors = [
    { k: 'Gross Margin Safety', v: 72, tint: 'blue' },
    { k: 'Customer Credit Exposure', v: 58, tint: 'amber' },
    { k: 'Warehouse SLA Feasibility', v: 88, tint: 'blue' },
    { k: 'Payment Terms Compliance', v: 64, tint: 'amber' },
  ];
  const tintMap: Record<string, string> = {
    blue: 'from-[#0176D3] to-blue-600',
    amber: 'from-amber-400 to-amber-600',
    rose: 'from-rose-400 to-rose-600',
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 grid md:grid-cols-2 gap-8 shadow-sm card-3d">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0176D3] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
          FINANCE · EXPLAINABLE AI
        </div>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
          See every risk vector. Approve or escalate with proof.
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          Deterministic, explainable scoring across four commercial vectors — audit-ready with a
          full trail of who touched what and why.
        </p>
      </div>
      <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 space-y-3.5">
        <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500 flex items-center justify-between">
          <span>Risk Radar · Q-1044</span>
          <span className="font-mono text-slate-900 font-bold">Composite 62/100</span>
        </div>
        {vectors.map((v) => (
          <div key={v.k}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700">{v.k}</span>
              <span className="font-mono font-bold text-slate-900">{v.v}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${tintMap[v.tint]}`}
                style={{ width: `${v.v}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BuyerPersonaCard: React.FC = () => {
  const [counter, setCounter] = useState(12);
  const [vpSigned, setVpSigned] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 grid md:grid-cols-2 gap-8 shadow-sm card-3d">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0176D3] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
          BUYER · COLLABORATIVE
        </div>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
          A live shared workspace. Not another PDF chain.
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          Buyers counter-offer within your policy tolerance, redline line items, and sign with a
          legally binding digital signature — all in one thread.
        </p>
      </div>
      <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="text-[11px] uppercase font-bold tracking-wider text-slate-500">
          Counter-Offer · Proposal-Q-1044
        </div>
        <div className="flex items-center justify-between text-xs text-slate-700">
          <span className="font-semibold">Requested concession</span>
          <span className="font-mono font-extrabold text-[#0176D3] text-base">{counter}%</span>
        </div>
        <input
          type="range"
          min="5"
          max="20"
          value={counter}
          onChange={(e) => setCounter(+e.target.value)}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0176D3]"
          data-testid="buyer-counter-slider"
        />
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 font-semibold">
          Within seller&apos;s Tier-2 negotiation band
        </div>
        <button
          onClick={() => setVpSigned(true)}
          className="w-full bg-[#0176D3] hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 text-xs cursor-pointer"
          data-testid="buyer-vp-sign-btn"
        >
          {vpSigned ? (
            <>
              <Check className="w-4 h-4" /> VP Procurement Signed · Binding
            </>
          ) : (
            <>
              <PenLine className="w-4 h-4" /> Sign as VP Procurement
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const RevOpsPersonaCard: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-200 p-8 grid md:grid-cols-2 gap-8 shadow-sm card-3d">
    <div className="space-y-3">
      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0176D3] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
        REVOPS · MULTI-HUB
      </div>
      <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
        Split dispatch across hubs, milestone-billed automatically.
      </h3>
      <p className="text-slate-600 text-sm leading-relaxed">
        Route inventory across Bangalore primary and Mumbai cross-dock hubs based on real-time stock
        and SLA distance. Invoicing follows dispatch.
      </p>
    </div>
    <div className="space-y-3">
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-2xs">
        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <Warehouse className="w-5 h-5 text-[#0176D3]" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-slate-900">Bangalore · Primary Hub</div>
          <div className="text-[11px] text-slate-500 font-mono">Route A · SLA 48h · In-stock ✓</div>
        </div>
        <div className="font-mono text-lg font-bold text-[#0176D3]">
          180<span className="text-xs text-slate-500 ml-1">units</span>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-2xs">
        <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          <Package className="w-5 h-5 text-[#0176D3]" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-slate-900">Mumbai · Cross-Dock</div>
          <div className="text-[11px] text-slate-500 font-mono">Route B · SLA 72h · Cross-shipped</div>
        </div>
        <div className="font-mono text-lg font-bold text-[#0176D3]">
          60<span className="text-xs text-slate-500 ml-1">units</span>
        </div>
      </div>
    </div>
  </div>
);

// ---------- ROI Calculator ----------
const ROICalc: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const [vol, setVol] = useState<number>(25);
  const [disc, setDisc] = useState<number>(16);
  const [quotes, setQuotes] = useState<number>(60);
  const recaptured = useMemo(() => vol * (disc / 100) * 0.32, [vol, disc]);
  const turnaround = useMemo(() => Math.max(3.2, 5.4 - vol * 0.04), [vol]);
  const hours = useMemo(() => Math.round(quotes * 12 * 0.72), [quotes]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 lg:p-10 grid lg:grid-cols-2 gap-10 shadow-sm card-3d">
      <div className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0176D3] bg-blue-50 px-2.5 py-1 rounded-full mb-3 border border-blue-100">
            ROI CALCULATOR
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            See exactly what margin you&apos;re leaking today.
          </h3>
        </div>
        <div className="space-y-5">
          <SliderRow
            label="Annual Governed Deal Volume"
            val={`₹${vol} Cr`}
            min={5}
            max={100}
            value={vol}
            onChange={setVol}
            tid="roi-vol"
          />
          <SliderRow
            label="Typical Discount Leakage"
            val={`${disc}%`}
            min={5}
            max={30}
            value={disc}
            onChange={setDisc}
            tid="roi-disc"
          />
          <SliderRow
            label="Monthly Commercial Quotes"
            val={`${quotes}/mo`}
            min={10}
            max={200}
            value={quotes}
            onChange={setQuotes}
            tid="roi-quotes"
          />
        </div>
      </div>
      <div className="grid gap-4 content-start">
        <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-5">
          <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            Annual Margin Recaptured
          </div>
          <div
            className="font-mono text-4xl font-extrabold text-[#0176D3] mt-2"
            data-testid="roi-recaptured"
          >
            ₹{recaptured.toFixed(2)} L
          </div>
          <div className="text-xs text-slate-500 mt-1">Governance-enforced, audit-traceable</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Approval Turnaround
            </div>
            <div
              className="font-mono text-xl font-bold text-slate-900 mt-2"
              data-testid="roi-turn"
            >
              {turnaround.toFixed(1)} d → 4.2 h
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Hours Saved / yr
            </div>
            <div
              className="font-mono text-xl font-bold text-slate-900 mt-2"
              data-testid="roi-hours"
            >
              {hours}
            </div>
          </div>
        </div>
        <button
          onClick={onOpenAuth}
          className="w-full bg-[#0176D3] hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm hover:shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer"
          data-testid="roi-cta"
        >
          Put Guardrails Into Action <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const SliderRow: React.FC<{
  label: string;
  val: string;
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  tid: string;
}> = ({ label, val, min, max, value, onChange, tid }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <div className="text-xs font-semibold text-slate-700">{label}</div>
      <div className="font-mono text-sm font-bold text-[#0176D3]">{val}</div>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(+e.target.value)}
      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0176D3]"
      data-testid={tid}
    />
  </div>
);

// ---------- Lifecycle ----------
const lifecycle = [
  {
    step: '01',
    title: 'Multi-Tier Quoting & CPQ',
    desc: 'Assemble hybrid deals with policy-enforced discount ceilings.',
    icon: FilePlus2,
    route: 'builder',
    role: 'sales_rep' as UserRole,
  },
  {
    step: '02',
    title: 'Continuous Deal Risk AI',
    desc: 'Explainable scoring across margin, credit, tenure and SLA vectors.',
    icon: ShieldCheck,
    route: 'approvals',
    role: 'finance' as UserRole,
  },
  {
    step: '03',
    title: 'Collaborative Buyer Portal',
    desc: 'Enterprise buyers counter-offer and sign in one shared workspace.',
    icon: Building,
    route: 'portal',
    role: 'customer' as UserRole,
  },
  {
    step: '04',
    title: 'Split Fulfillment & Billing',
    desc: 'Multi-hub dispatch with milestone GST-compliant invoicing.',
    icon: CreditCard,
    route: 'fulfillment',
    role: 'fulfillment' as UserRole,
  },
];

const trustBadges = [
  { label: 'SOC 2 Type II Certified', icon: ShieldCheck },
  { label: 'ISO 27001 Security', icon: BadgeCheck },
  { label: 'Automated GST & Multi-Tax · HSN', icon: Landmark },
  { label: 'ERP Sync · Odoo · SAP · Salesforce · Stripe', icon: Cog },
];

// ---------- Main Landing Page ----------
export const LandingPageView: React.FC<LandingPageViewProps> = ({ onOpenAuth }) => {
  const { login, loginAsCustomer, loginAsRole, setActiveView, setUserRole, isAuthenticated } = useAppStore();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('dark');
      if (window.location.hash !== '#/landing') {
        window.history.replaceState(null, '', '#/landing');
      }
    }
  }, []);

  const handleOpenAuth = () => {
    if (onOpenAuth) {
      onOpenAuth();
    } else {
      if (isAuthenticated) {
        setActiveView('dashboard');
      } else {
        login('p.mehta@dealflow360.com', 'demo123', 'sales_rep');
        setActiveView('dashboard');
      }
    }
  };

  const handleLaunchRole = (role: UserRole, targetView?: string) => {
    if (loginAsRole) {
      loginAsRole(role);
    } else {
      setUserRole(role);
    }
    if (role === 'customer') {
      loginAsCustomer('token_acme');
    }
    if (targetView) {
      setActiveView(targetView);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden font-sans">
      {/* Top Floating Nav */}
      <DFNav onOpenAuth={handleOpenAuth} />

      {/* HERO */}
      <section
        id="simulator"
        className="pt-32 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center"
      >
        <div className="space-y-6">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-xs"
            data-testid="hero-eyebrow"
          >
            <span className="w-2 h-2 rounded-full bg-[#0176D3] animate-pulse" />
            DealFlow360 2.0 · Autonomous B2B Deal Desk
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-slate-900">
            Close complex B2B deals.
            <br />
            <span className="text-[#0176D3]">Without leaking margin.</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
            The unified deal desk where reps, approvers, warehouse ops, and enterprise buyers
            finally operate on one governed pipeline — from CPQ to milestone invoicing.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleOpenAuth}
              className="bg-[#0176D3] hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 text-sm cursor-pointer"
              data-testid="hero-primary-cta"
            >
              Launch Command Center <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleLaunchRole('customer', 'portal')}
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold px-5 py-3 rounded-xl shadow-xs transition flex items-center gap-2 text-sm cursor-pointer"
              data-testid="hero-secondary-cta"
            >
              <Building className="w-4 h-4 text-[#0176D3]" /> Customer Portal View
            </button>
          </div>
          <div className="flex flex-wrap gap-4 pt-3 text-xs text-slate-500 font-medium">
            {['Pre-configured ERP data', 'Zero credit card', 'Explainable Risk AI'].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#0176D3]" /> {t}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[
              { v: '₹420 Cr+', l: 'Governed Volume' },
              { v: '4.2×', l: 'Approval Speed' },
              { v: '0%', l: 'Margin Breaches' },
            ].map((m) => (
              <div key={m.l} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs card-3d">
                <div className="font-mono font-extrabold text-xl text-slate-900">{m.v}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{m.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side Hero Sandbox */}
        <HeroSim onOpenAuth={handleOpenAuth} />
      </section>

      {/* MULTI-PERSONA */}
      <section id="personas" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-100">
        <div className="mb-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0176D3] bg-blue-50 px-2.5 py-1 rounded-full mb-3 border border-blue-100">
            MULTI-PERSONA
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            One platform, four very different mornings.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-3">
            Every stakeholder gets the surface they actually need &mdash; no compromise dashboards.
          </p>
        </div>
        <PersonaSwitcher onOpenAuth={handleOpenAuth} />
      </section>

      {/* ROI CALCULATOR */}
      <section id="roi" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-100">
        <ROICalc onOpenAuth={handleOpenAuth} />
      </section>

      {/* LIFECYCLE */}
      <section id="lifecycle" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-100">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0176D3] bg-blue-50 px-2.5 py-1 rounded-full mb-3 border border-blue-100">
            DEAL LIFECYCLE
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            The deal lifecycle, end to end.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {lifecycle.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition card-hover-3d"
                data-testid={`lifecycle-step-${s.step}`}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6 text-[#0176D3]" />
                </div>
                <div className="font-mono text-xs text-slate-500 font-bold">STEP {s.step}</div>
                <h3 className="text-base font-bold text-slate-900 -mt-2">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-600 flex-1 leading-relaxed">{s.desc}</p>
                <button
                  onClick={() => handleLaunchRole(s.role, s.route)}
                  className="text-xs font-bold text-[#0176D3] hover:text-blue-800 flex items-center gap-1 mt-1 cursor-pointer group"
                  data-testid={`lifecycle-launch-${s.step}`}
                >
                  <span>Launch module</span> <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* TRUST */}
      <section id="trust" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-100">
        <div className="mb-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#0176D3] bg-blue-50 px-2.5 py-1 rounded-full mb-3 border border-blue-100">
            ENTERPRISE TRUST
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built for procurement scrutiny.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {trustBadges.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.label} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-2xs">
                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#0176D3]" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-tight">{b.label}</div>
              </div>
            );
          })}
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {seedTestimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm card-hover-3d"
              data-testid={`testimonial-${t.name.split(' ')[0].toLowerCase()}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={t.img}
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-100"
                />
                <div>
                  <div className="text-sm font-bold text-slate-900">{t.name}</div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {t.role} · {t.company}
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      {/* CLOSING BANNER */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl p-10 sm:p-14 text-white bg-gradient-to-br from-[#0176D3] via-blue-600 to-indigo-700 shadow-xl">
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full mb-4 border border-white/30">
              <Sparkles className="w-3.5 h-3.5" /> ENTERPRISE READY
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Ready to experience frictionless deal governance?
            </h2>
            <p className="text-blue-100 text-base sm:text-lg mt-4">
              Live sandbox, pre-loaded with realistic hybrid B2B deals across Bengaluru, Mumbai and
              Delhi.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={handleOpenAuth}
                className="bg-white text-slate-900 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition flex items-center gap-2 cursor-pointer text-sm"
                data-testid="closing-cta-primary"
              >
                Launch Command Center <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleLaunchRole('customer', 'portal')}
                className="bg-white/15 backdrop-blur-xs border border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/25 transition flex items-center gap-2 cursor-pointer text-sm"
                data-testid="closing-cta-secondary"
              >
                <Building className="w-4 h-4" /> Explore Customer Portal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 py-10 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <BrandLogo size="md" subtitle="Built for Commercial Precision" />
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 font-medium">
            <a href="#simulator" className="hover:text-[#0176D3] transition">
              Product
            </a>
            <a href="#trust" className="hover:text-[#0176D3] transition">
              Security
            </a>
            <a href="#lifecycle" className="hover:text-[#0176D3] transition">
              Lifecycle
            </a>
            <button
              onClick={handleOpenAuth}
              className="hover:text-[#0176D3] transition cursor-pointer font-bold"
            >
              Sign In
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-[#0176D3] font-bold text-[11px] border border-blue-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageView;
