import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR, stages } from '@/data/mockData';
import { TrendingUp, Percent, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const riskDot = { low: 'bg-indigo-500', medium: 'bg-amber-500', high: 'bg-rose-500' };
const riskLabel = { low: 'Low', medium: 'Medium', high: 'High' };
const riskChip = {
  low: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300',
  medium: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
  high: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
};

export default function Dashboard() {
  const { quotes, moveQuoteStage, setActiveQuoteId } = useApp();
  const nav = useNavigate();

  const kpis = useMemo(() => {
    const total = quotes.reduce((s, q) => s + q.value, 0);
    const avgMargin =
      quotes.reduce((s, q) => s + (q.marginBase - q.discount * 0.85), 0) / quotes.length;
    const pending = quotes.filter(
      (q) => q.stage === 'Internal Review' || q.stage === 'Buyer Counter-Offer'
    ).length;
    const closed = quotes.filter((q) => q.stage === 'Signed' || q.stage === 'Invoiced').length;
    return { total, avgMargin, pending, closed };
  }, [quotes]);

  const cycle = (id: string, cur: string) => {
    const idx = stages.indexOf(cur);
    const next = stages[(idx + 1) % stages.length];
    moveQuoteStage(id, next);
  };

  return (
    <div className="space-y-6" data-testid="dashboard">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-heading">Command Dashboard</h1>
          <p className="text-body">Real-time pipeline governance across your entire deal desk.</p>
        </div>
        <button
          onClick={() => nav('/app/builder')}
          className="btn-tactile-primary text-[13px] cursor-pointer"
          data-testid="new-quote-btn"
        >
          + New Quote
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          tid="kpi-pipeline"
          icon={TrendingUp}
          label="Total Pipeline"
          value={formatINR(kpis.total)}
          sub="Governed volume · 6 deals"
        />
        <KpiCard
          tid="kpi-margin"
          icon={Percent}
          label="Avg Blended Margin"
          value={`${kpis.avgMargin.toFixed(1)}%`}
          sub="Post-discount, pre-tax"
        />
        <KpiCard
          tid="kpi-pending"
          icon={ShieldAlert}
          label="Approvals Pending"
          value={kpis.pending}
          sub="Awaiting Tier-2 / CFO"
          tint="amber"
        />
        <KpiCard
          tid="kpi-closed"
          icon={CheckCircle2}
          label="Closed / Invoiced"
          value={kpis.closed}
          sub="Signed + dispatched"
        />
      </div>

      <div className="embossed-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-display font-semibold text-heading">Deal Kanban</h2>
          <div className="text-[11px] text-muted-df font-mono-df">Click a card to cycle stage →</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stages.map((stage) => {
            const stageQuotes = quotes.filter((q) => q.stage === stage);
            return (
              <div
                key={stage}
                className="bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl p-3 min-h-[420px]"
                data-testid={`kanban-col-${stage.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <div className="flex items-center justify-between px-1 mb-3">
                  <div className="text-[12px] font-semibold text-heading">{stage}</div>
                  <div className="text-[11px] font-mono-df text-muted-df bg-white/60 dark:bg-slate-900 rounded-full px-2 py-0.5">
                    {stageQuotes.length}
                  </div>
                </div>
                <div className="space-y-2.5">
                  {stageQuotes.map((q) => (
                    <div
                      key={q.id}
                      className="kanban-card"
                      onClick={() => {
                        setActiveQuoteId(q.id);
                        cycle(q.id, q.stage);
                      }}
                      data-testid={`kanban-card-${q.id}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-mono-df text-[11px] text-indigo-600 font-bold">
                          {q.id}
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            riskChip[q.risk]
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${riskDot[q.risk]}`} />{' '}
                          {riskLabel[q.risk]}
                        </span>
                      </div>
                      <div className="text-[13px] font-semibold text-heading leading-snug">
                        {q.customer}
                      </div>
                      <div className="text-[11px] text-muted-df mt-0.5">{q.owner}</div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="font-mono-df text-sm font-bold text-heading">
                          {formatINR(q.value)}
                        </div>
                        <div className="text-[11px] font-mono-df text-muted-df">-{q.discount}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="embossed-card p-5">
          <h3 className="text-base font-display font-semibold text-heading mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { l: 'Build CPQ Quote', to: '/app/builder', tid: 'qa-builder' },
              { l: 'Review Approvals', to: '/app/approvals', tid: 'qa-approvals' },
              { l: 'Open Buyer Portal', to: '/app/portal', tid: 'qa-portal' },
              { l: 'Fulfillment Ops', to: '/app/fulfillment', tid: 'qa-fulfill' },
            ].map((a) => (
              <button
                key={a.l}
                onClick={() => nav(a.to)}
                data-testid={a.tid}
                className="text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-transparent hover:border-indigo-200 transition group cursor-pointer"
              >
                <div className="text-[13px] font-semibold text-heading flex items-center justify-between">
                  {a.l}
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-500 opacity-0 group-hover:opacity-100 transition" />
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="embossed-card p-5">
          <h3 className="text-base font-display font-semibold text-heading mb-4">
            Risk Distribution
          </h3>
          <div className="space-y-3">
            {['low', 'medium', 'high'].map((r) => {
              const count = quotes.filter((q) => q.risk === r).length;
              const pct = (count / quotes.length) * 100;
              return (
                <div key={r}>
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span className="font-medium text-body capitalize">{r} risk</span>
                    <span className="font-mono-df font-semibold text-heading">{count} deals</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200/60 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${
                        r === 'low'
                          ? 'bg-indigo-500'
                          : r === 'medium'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const KpiCard: React.FC<{
  icon: any;
  label: string;
  value: string | number;
  sub: string;
  tint?: 'indigo' | 'amber';
  tid: string;
}> = ({ icon: Icon, label, value, sub, tint = 'indigo', tid }) => (
  <div className="embossed-card p-5" data-testid={tid}>
    <div className="flex items-center justify-between mb-2">
      <div className="text-[11px] uppercase tracking-wider text-muted-df font-semibold">
        {label}
      </div>
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          tint === 'amber'
            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'
            : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600'
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <div className="font-mono-df text-3xl font-bold text-heading">{value}</div>
    <div className="text-[11px] text-muted-df mt-1">{sub}</div>
  </div>
);
