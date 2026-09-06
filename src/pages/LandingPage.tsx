import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import DFNav from '@/components/DFNav';
import { formatINR, seedTestimonials, riskThreshold } from '@/data/mockData';
import { toast } from 'sonner';

// ---------- Hero Simulator ----------
const HeroSim = () => {
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
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      text: 'text-indigo-700 dark:text-indigo-300',
      icon: <CircleCheck className="w-3.5 h-3.5" />,
    },
    medium: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      icon: <Cog className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />,
    },
    high: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-700 dark:text-rose-300',
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
  }[status.tier];

  const sign = () => {
    setSigning(true);
    setTimeout(() => {
      setSigning(false);
      setSigned(true);
      toast.success('Digital sign-off captured', {
        description: `Quote #Q-1042 · Signature ID SIG-${Date.now().toString().slice(-6)}`,
      });
    }, 900);
  };

  return (
    <div
      className="embossed-card animate-subtle-float overflow-hidden"
      data-testid="hero-sandbox"
    >
      {/* macOS titlebar */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-black/5 dark:border-white/5 bg-slate-50/70 dark:bg-slate-900/60">
        <div className="flex gap-1.5">
          <span className="mac-dot mac-dot-red" />
          <span className="mac-dot mac-dot-yellow" />
          <span className="mac-dot mac-dot-green" />
        </div>
        <div className="text-xs font-mono-df text-muted-df flex-1 text-center">
          Quote <span className="text-indigo-600 font-semibold">#Q-1042</span> · Acme Global Tech
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" /> Live Sandbox
        </div>
      </div>
      <div className="p-6 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-heading">Edge AI Gateway 240</div>
                <div className="text-[11px] text-muted-df font-mono-df">240 units · SKU EG240-HW</div>
              </div>
            </div>
            <div className="font-mono-df text-sm font-semibold text-subheading">
              {formatINR(240 * 145000)}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-heading">
                  Cloud Deal Intelligence — 3yr
                </div>
                <div className="text-[11px] text-muted-df font-mono-df">1 license · CDI-SAAS-3Y</div>
              </div>
            </div>
            <div className="font-mono-df text-sm font-semibold text-subheading">₹7.20 L</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-[12px] font-medium text-muted-df">
            <span>Concession Slider</span>
            <span
              className="font-mono-df font-bold text-indigo-600 text-base"
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
            className="slider-tactile w-full cursor-pointer"
            data-testid="hero-discount-slider"
          />
        </div>

        <div key={status.tier} className="grid grid-cols-2 gap-3 status-panel-bounce">
          <div className="embossed-card p-3.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-df font-semibold mb-1">
              Governed Net
            </div>
            <div
              className="font-mono-df text-lg font-bold text-heading"
              data-testid="hero-net-value"
            >
              {formatINR(net)}
            </div>
          </div>
          <div className="embossed-card p-3.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-df font-semibold mb-1">
              Blended Margin
            </div>
            <div
              className={`font-mono-df text-lg font-bold ${
                marginBreach ? 'text-rose-600' : 'text-indigo-600'
              }`}
              data-testid="hero-margin-value"
            >
              {margin.toFixed(1)}%
            </div>
          </div>
        </div>

        <div
          className={`${badges.bg} rounded-xl p-3.5 flex items-center gap-2.5 status-panel-bounce`}
          data-testid="hero-status-badge"
        >
          <span className={badges.text}>{badges.icon}</span>
          <div className={`text-[13px] font-semibold ${badges.text}`}>{status.label}</div>
        </div>

        <button
          onClick={sign}
          disabled={signing || signed}
          className="btn-tactile-primary w-full justify-center text-[13px] cursor-pointer"
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

// ---------- Persona Switcher ----------
const PersonaSwitcher = () => {
  const [persona, setPersona] = useState<'sales' | 'finance' | 'buyer' | 'revops'>('sales');
  const personas = [
    { key: 'sales' as const, label: 'For Sales Teams', icon: <UserRound className="w-3.5 h-3.5" /> },
    { key: 'finance' as const, label: 'For Finance Approvers', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { key: 'buyer' as const, label: 'For Enterprise Buyers', icon: <Handshake className="w-3.5 h-3.5" /> },
    { key: 'revops' as const, label: 'For RevOps & Ops', icon: <Cog className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="inline-flex p-1 rounded-full macos-glass shadow-sm" data-testid="persona-tabs">
        {personas.map((p) => (
          <button
            key={p.key}
            onClick={() => setPersona(p.key)}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              persona === p.key
                ? 'bg-gradient-to-b from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-500/30'
                : 'text-muted-df hover:text-heading'
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

const SalesPersonaCard = () => {
  const [added, setAdded] = useState(false);
  return (
    <div className="embossed-card p-8 grid md:grid-cols-2 gap-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full">
          SALES · GUARDRAILS
        </div>
        <h3 className="text-2xl font-display font-bold text-heading">
          Quote within ceilings. Upsell without approval loops.
        </h3>
        <p className="text-body">
          Every discount lever is bounded to your delegation. Add strategic add-ons and see
          margin bounce back — before your competition even follows up.
        </p>
        <ul className="space-y-2 pt-2">
          {[
            'Live margin re-quoting',
            'Bundled hardware + SaaS upsell paths',
            'Auto-generated GST/HSN line items',
          ].map((t) => (
            <li key={t} className="flex items-center gap-2 text-sm text-body">
              <Check className="w-4 h-4 text-indigo-600" /> {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="embossed-card p-5 space-y-3">
        <div className="text-[11px] uppercase font-semibold tracking-wider text-muted-df">
          CPQ Upsell Engine
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
          <div>
            <div className="text-[13px] font-semibold text-heading">Current Blended Margin</div>
            <div className="text-[11px] text-muted-df">Q-1042 · 240 units</div>
          </div>
          <div className={`font-mono-df font-bold ${added ? 'text-indigo-600' : 'text-subheading'}`}>
            {added ? '42.6%' : '37.8%'}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
          <div>
            <div className="text-[13px] font-semibold text-heading">Governed Net Price</div>
            <div className="text-[11px] text-muted-df">Post-recommendation</div>
          </div>
          <div className={`font-mono-df font-bold ${added ? 'text-indigo-600' : 'text-subheading'}`}>
            {added ? '₹3.28 Cr' : '₹3.10 Cr'}
          </div>
        </div>
        <button
          onClick={() => setAdded(!added)}
          className="btn-tactile-primary w-full justify-center text-[13px] cursor-pointer"
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

const FinancePersonaCard = () => {
  const vectors = [
    { k: 'Gross Margin Safety', v: 72, tint: 'indigo' },
    { k: 'Customer Credit Exposure', v: 58, tint: 'amber' },
    { k: 'Warehouse SLA Feasibility', v: 88, tint: 'indigo' },
    { k: 'Payment Terms Compliance', v: 64, tint: 'amber' },
  ];
  const tintMap: Record<string, string> = {
    indigo: 'from-indigo-500 to-indigo-700',
    amber: 'from-amber-400 to-amber-600',
    rose: 'from-rose-400 to-rose-600',
  };
  return (
    <div className="embossed-card p-8 grid md:grid-cols-2 gap-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full">
          FINANCE · EXPLAINABLE AI
        </div>
        <h3 className="text-2xl font-display font-bold text-heading">
          See every risk vector. Approve or escalate with proof.
        </h3>
        <p className="text-body">
          Deterministic, explainable scoring across four commercial vectors — audit-ready with a
          full trail of who touched what and why.
        </p>
      </div>
      <div className="embossed-card p-5 space-y-3.5">
        <div className="text-[11px] uppercase font-semibold tracking-wider text-muted-df flex items-center justify-between">
          <span>Risk Radar · Q-1044</span>
          <span className="font-mono-df text-heading font-semibold">Composite 62/100</span>
        </div>
        {vectors.map((v) => (
          <div key={v.k}>
            <div className="flex items-center justify-between text-[12px] mb-1">
              <span className="font-medium text-body">{v.k}</span>
              <span className="font-mono-df font-semibold text-subheading">{v.v}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-200/60 dark:bg-slate-800 overflow-hidden">
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

const BuyerPersonaCard = () => {
  const [counter, setCounter] = useState(12);
  const [vpSigned, setVpSigned] = useState(false);
  return (
    <div className="embossed-card p-8 grid md:grid-cols-2 gap-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full">
          BUYER · COLLABORATIVE
        </div>
        <h3 className="text-2xl font-display font-bold text-heading">
          A live shared workspace. Not another PDF chain.
        </h3>
        <p className="text-body">
          Buyers counter-offer within your policy tolerance, redline line items, and sign with a
          legally binding digital signature — all in one thread.
        </p>
      </div>
      <div className="embossed-card p-5 space-y-4">
        <div className="text-[11px] uppercase font-semibold tracking-wider text-muted-df">
          Counter-Offer · Proposal-Q-1044
        </div>
        <div className="flex items-center justify-between text-[12px] text-body">
          <span>Requested concession</span>
          <span className="font-mono-df font-bold text-indigo-600 text-base">{counter}%</span>
        </div>
        <input
          type="range"
          min="5"
          max="20"
          value={counter}
          onChange={(e) => setCounter(+e.target.value)}
          className="slider-tactile w-full cursor-pointer"
          data-testid="buyer-counter-slider"
        />
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[12px] text-indigo-800 dark:text-indigo-200 font-medium">
          Within seller&apos;s Tier-2 negotiation band
        </div>
        <button
          onClick={() => {
            setVpSigned(true);
            toast.success('VP signature captured');
          }}
          className="btn-tactile-primary w-full justify-center text-[13px] cursor-pointer"
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

const RevOpsPersonaCard = () => (
  <div className="embossed-card p-8 grid md:grid-cols-2 gap-8">
    <div className="space-y-3">
      <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full">
        REVOPS · MULTI-HUB
      </div>
      <h3 className="text-2xl font-display font-bold text-heading">
        Split dispatch across hubs, milestone-billed automatically.
      </h3>
      <p className="text-body">
        Route inventory across Bangalore primary and Mumbai cross-dock hubs based on real-time stock
        and SLA distance. Invoicing follows dispatch.
      </p>
    </div>
    <div className="space-y-3">
      <div className="embossed-card p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center">
          <Warehouse className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-heading">Bangalore · Primary Hub</div>
          <div className="text-[11px] text-muted-df font-mono-df">Route A · SLA 48h · In-stock ✓</div>
        </div>
        <div className="font-mono-df text-xl font-bold text-indigo-600">
          180<span className="text-xs text-muted-df ml-1">units</span>
        </div>
      </div>
      <div className="embossed-card p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center">
          <Package className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-heading">Mumbai · Cross-Dock</div>
          <div className="text-[11px] text-muted-df font-mono-df">Route B · SLA 72h · Cross-shipped</div>
        </div>
        <div className="font-mono-df text-xl font-bold text-indigo-600">
          60<span className="text-xs text-muted-df ml-1">units</span>
        </div>
      </div>
    </div>
  </div>
);

// ---------- ROI Calculator ----------
const ROICalc = () => {
  const [vol, setVol] = useState<number>(25);
  const [disc, setDisc] = useState<number>(16);
  const [quotes, setQuotes] = useState<number>(60);
  const recaptured = useMemo(() => vol * (disc / 100) * 0.32, [vol, disc]);
  const turnaround = useMemo(() => Math.max(3.2, 5.4 - vol * 0.04), [vol]);
  const hours = useMemo(() => Math.round(quotes * 12 * 0.72), [quotes]);

  return (
    <div className="embossed-card p-8 lg:p-10 grid lg:grid-cols-2 gap-10">
      <div className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full mb-3">
            ROI CALCULATOR
          </div>
          <h3 className="text-2xl md:text-3xl font-display font-bold text-heading">
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
        <div className="embossed-card p-5">
          <div className="text-[10px] uppercase tracking-wider text-muted-df font-semibold">
            Annual Margin Recaptured
          </div>
          <div
            className="font-mono-df text-4xl font-extrabold text-indigo-600 mt-2"
            data-testid="roi-recaptured"
          >
            ₹{recaptured.toFixed(2)} L
          </div>
          <div className="text-[12px] text-muted-df mt-1">Governance-enforced, audit-traceable</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="embossed-card p-5">
            <div className="text-[10px] uppercase tracking-wider text-muted-df font-semibold">
              Approval Turnaround
            </div>
            <div
              className="font-mono-df text-2xl font-bold text-heading mt-2"
              data-testid="roi-turn"
            >
              {turnaround.toFixed(1)} d → 4.2 h
            </div>
          </div>
          <div className="embossed-card p-5">
            <div className="text-[10px] uppercase tracking-wider text-muted-df font-semibold">
              Hours Saved / yr
            </div>
            <div
              className="font-mono-df text-2xl font-bold text-heading mt-2"
              data-testid="roi-hours"
            >
              {hours}
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            window.location.href = '/login';
          }}
          className="btn-tactile-primary w-full justify-center cursor-pointer"
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
    <div className="flex items-center justify-between mb-2">
      <div className="text-[13px] font-medium text-body">{label}</div>
      <div className="font-mono-df text-base font-bold text-indigo-600">{val}</div>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(+e.target.value)}
      className="slider-tactile w-full cursor-pointer"
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
    route: '/app/builder',
  },
  {
    step: '02',
    title: 'Continuous Deal Risk AI',
    desc: 'Explainable scoring across margin, credit, tenure and SLA vectors.',
    icon: ShieldCheck,
    route: '/app/approvals',
  },
  {
    step: '03',
    title: 'Collaborative Buyer Portal',
    desc: 'Enterprise buyers counter-offer and sign in one shared workspace.',
    icon: Building,
    route: '/app/portal',
  },
  {
    step: '04',
    title: 'Split Fulfillment & Billing',
    desc: 'Multi-hub dispatch with milestone GST-compliant invoicing.',
    icon: CreditCard,
    route: '/app/fulfillment',
  },
];

const trustBadges = [
  { label: 'SOC 2 Type II Certified', icon: ShieldCheck },
  { label: 'ISO 27001 Security', icon: BadgeCheck },
  { label: 'Automated GST & Multi-Tax · HSN', icon: Landmark },
  { label: 'ERP Sync · Odoo · SAP · Salesforce · Stripe', icon: Cog },
];

// ---------- Main Landing ----------
export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--df-bg)] overflow-x-hidden">
      <DFNav />

      {/* HERO */}
      <section
        id="simulator"
        className="pt-32 pb-16 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center"
      >
        <div className="space-y-6">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full macos-glass text-[12px] font-semibold text-body"
            data-testid="hero-eyebrow"
          >
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-indigo-500 pulse-dot" />
              <span className="rounded-full bg-indigo-600 w-2 h-2" />
            </span>
            DealFlow360 2.0 · Autonomous B2B Deal Desk
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight leading-[1.02] text-heading">
            Close complex B2B deals.
            <br />
            <span className="text-indigo-600">Without leaking margin.</span>
          </h1>
          <p className="text-lg text-body max-w-xl leading-relaxed">
            The unified deal desk where reps, approvers, warehouse ops, and enterprise buyers
            finally operate on one governed pipeline — from CPQ to milestone invoicing.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => navigate('/login')}
              className="btn-tactile-primary cursor-pointer"
              data-testid="hero-primary-cta"
            >
              Launch Command Center <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-tactile-secondary cursor-pointer"
              data-testid="hero-secondary-cta"
            >
              <Building className="w-4 h-4 text-indigo-600" /> Customer Portal View
            </button>
          </div>
          <div className="flex flex-wrap gap-4 pt-3 text-[13px] text-muted-df">
            {['Pre-configured ERP data', 'Zero credit card', 'Explainable Risk AI'].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-indigo-600" /> {t}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 pt-6">
            {[
              { v: '₹420 Cr+', l: 'Governed Volume' },
              { v: '4.2×', l: 'Approval Speed' },
              { v: '0%', l: 'Margin Breaches' },
            ].map((m) => (
              <div key={m.l} className="embossed-card p-4">
                <div className="font-mono-df font-bold text-xl text-heading">{m.v}</div>
                <div className="text-[11px] text-muted-df mt-1">{m.l}</div>
              </div>
            ))}
          </div>
        </div>
        <HeroSim />
      </section>

      {/* PERSONAS */}
      <section id="personas" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="mb-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full mb-3">
            MULTI-PERSONA
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-heading tracking-tight">
            One platform, four very different mornings.
          </h2>
          <p className="text-body text-lg mt-3">
            Every stakeholder gets the surface they actually need &mdash; no compromise dashboards.
          </p>
        </div>
        <PersonaSwitcher />
      </section>

      {/* ROI */}
      <section id="roi" className="py-20 px-6 max-w-7xl mx-auto">
        <ROICalc />
      </section>

      {/* LIFECYCLE */}
      <section id="lifecycle" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full mb-3">
            DEAL LIFECYCLE
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-heading tracking-tight">
            The deal lifecycle, end to end.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {lifecycle.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="embossed-card p-6 flex flex-col gap-4"
                data-testid={`lifecycle-step-${s.step}`}
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="font-mono-df text-xs text-muted-df">STEP {s.step}</div>
                <h3 className="text-lg font-display font-semibold text-heading -mt-2">
                  {s.title}
                </h3>
                <p className="text-[13px] text-body flex-1">{s.desc}</p>
                <button
                  onClick={() => navigate(s.route.replace('/app', '/login'))}
                  className="text-[13px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 mt-1 cursor-pointer"
                  data-testid={`lifecycle-launch-${s.step}`}
                >
                  Launch module <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* TRUST */}
      <section id="trust" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="mb-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full mb-3">
            ENTERPRISE TRUST
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-heading tracking-tight">
            Built for procurement scrutiny.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {trustBadges.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.label} className="embossed-card p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-[13px] font-semibold text-heading leading-tight">{b.label}</div>
              </div>
            );
          })}
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {seedTestimonials.map((t) => (
            <div
              key={t.name}
              className="embossed-card p-6"
              data-testid={`testimonial-${t.name.split(' ')[0].toLowerCase()}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={t.img}
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-100 dark:ring-indigo-950"
                />
                <div>
                  <div className="text-sm font-semibold text-heading">{t.name}</div>
                  <div className="text-[11px] text-muted-df">
                    {t.role} · {t.company}
                  </div>
                </div>
              </div>
              <p className="text-[13.5px] text-body leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
            </div>
          ))}
        </div>
      </section>

      {/* CLOSING BANNER */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-[32px] p-10 sm:p-14 text-white bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700 shadow-2xl shadow-indigo-600/25">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/20 blur-3xl animate-orb" />
          <div
            className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-blue-400/30 blur-3xl animate-orb"
            style={{ animationDelay: '2s' }}
          />
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full mb-4">
              <Sparkles className="w-3 h-3" /> ENTERPRISE READY
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold tracking-tight leading-tight">
              Ready to experience frictionless deal governance?
            </h2>
            <p className="text-indigo-100 text-lg mt-4">
              Live sandbox, pre-loaded with 6 realistic hybrid B2B deals across Bengaluru, Mumbai and
              Delhi.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={() => navigate('/login')}
                className="bg-white text-indigo-950 font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition flex items-center gap-2 cursor-pointer"
                data-testid="closing-cta-primary"
              >
                Launch Command Center <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-white/15 backdrop-blur border border-white/25 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/25 transition flex items-center gap-2 cursor-pointer"
                data-testid="closing-cta-secondary"
              >
                <Building className="w-4 h-4" /> Explore Customer Portal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200/60 dark:border-slate-800/60 py-10 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <div>
              <div className="font-display font-bold text-heading">DealFlow360</div>
              <div className="text-[11px] text-muted-df">
                © 2026 · Hackathon Edition · Built with commercial precision
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-[13px] text-muted-df">
            <a href="#simulator" className="hover:text-indigo-600 transition">
              Product
            </a>
            <a href="#trust" className="hover:text-indigo-600 transition">
              Security
            </a>
            <a href="#lifecycle" className="hover:text-indigo-600 transition">
              API Docs
            </a>
            <a href="#" className="hover:text-indigo-600 transition">
              Contact Sales
            </a>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 pulse-dot" /> Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
