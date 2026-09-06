import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR, computeRiskScore } from '@/data/mockData';
import { CheckCircle2, XCircle, RotateCcw, ShieldCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';

const riskChip = {
  low: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900',
  medium:
    'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900',
  high: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900',
};

export default function Approvals() {
  const { quotes, updateQuote } = useApp();
  const pending = quotes.filter(
    (q) => q.stage === 'Internal Review' || q.stage === 'Buyer Counter-Offer'
  );
  const [selectedId, setSelectedId] = useState(pending[0]?.id || quotes[0].id);
  const q = quotes.find((x) => x.id === selectedId) || quotes[0];
  const score = computeRiskScore(q);
  const [note, setNote] = useState('');
  const [trail, setTrail] = useState([
    { by: 'Priya Menon', at: '09:12', act: 'Submitted for Tier-2 review', tone: 'info' },
    { by: 'Risk Engine', at: '09:12', act: `Auto-scored composite ${score.composite}/100`, tone: 'info' },
  ]);

  const act = (kind: 'approve' | 'revise' | 'reject') => {
    const map = {
      approve: { s: 'Signed', t: 'Approved & routed to signature', tone: 'ok' },
      revise: { s: 'Drafting', t: 'Requested revision from AE', tone: 'warn' },
      reject: { s: 'Drafting', t: 'Rejected · CFO override', tone: 'bad' },
    };
    updateQuote(q.id, { stage: map[kind].s });
    setTrail([
      {
        by: 'You (CFO)',
        at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        act: map[kind].t + (note ? ` — "${note}"` : ''),
        tone: map[kind].tone,
      },
      ...trail,
    ]);
    toast.success(map[kind].t);
    setNote('');
  };

  const vectors = [
    { k: 'Customer Tenure', v: score.tenureScore, hint: `${q.tenureMo} months on book` },
    {
      k: 'Margin Headroom',
      v: score.marginScore,
      hint: `Base ${q.marginBase}% · Post-disc ${(q.marginBase - q.discount * 0.85).toFixed(1)}%`,
    },
    { k: 'Credit Line Utilization', v: score.creditScore, hint: `${q.creditUtil}% of ceiling utilized` },
    { k: 'Discount Discipline', v: score.discountPenalty, hint: `${q.discount}% concession applied` },
  ];

  return (
    <div className="space-y-6" data-testid="approvals-page">
      <div>
        <h1 className="text-3xl font-display font-bold text-heading">Approvals & Deal Risk Engine</h1>
        <p className="text-body">Explainable, deterministic scoring. Every decision leaves a trail.</p>
      </div>
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <div className="embossed-card p-4">
          <div className="text-[11px] uppercase font-semibold tracking-wider text-muted-df mb-3 flex items-center justify-between font-mono-df">
            <span>Approval Queue</span>
            <span className="text-indigo-600 font-bold">{pending.length}</span>
          </div>
          <div className="space-y-2">
            {pending.length === 0 && (
              <div className="text-sm text-muted-df p-4 text-center">Queue empty. Nice work.</div>
            )}
            {pending.map((pq) => (
              <button
                key={pq.id}
                onClick={() => setSelectedId(pq.id)}
                className={`w-full text-left p-3 rounded-xl border transition cursor-pointer ${
                  selectedId === pq.id
                    ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                    : 'border-transparent bg-slate-50 dark:bg-slate-900/40 hover:border-indigo-200'
                }`}
                data-testid={`approval-item-${pq.id}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-mono-df text-[11px] font-bold text-indigo-600">{pq.id}</div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      riskChip[pq.risk]
                    }`}
                  >
                    {pq.risk}
                  </span>
                </div>
                <div className="text-[13px] font-semibold text-heading truncate">{pq.customer}</div>
                <div className="text-[11px] text-muted-df font-mono-df mt-0.5">
                  {formatINR(pq.value)} · -{pq.discount}%
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="embossed-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-mono-df text-xs text-indigo-600 font-bold">{q.id}</div>
                <div className="text-xl font-display font-bold text-heading">{q.customer}</div>
                <div className="text-[13px] text-muted-df mt-0.5">
                  Owner: {q.owner} · Close date {q.closeDate}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-muted-df uppercase font-semibold">
                  Composite Risk
                </div>
                <div
                  className="font-mono-df text-4xl font-extrabold text-heading"
                  data-testid="risk-composite"
                >
                  {score.composite}
                  <span className="text-muted-df text-lg font-normal">/100</span>
                </div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {vectors.map((v) => (
                <div key={v.k}>
                  <div className="flex items-center justify-between text-[12px] mb-1">
                    <span className="font-medium text-body">{v.k}</span>
                    <span className="font-mono-df font-semibold text-heading">{v.v}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200/60 dark:bg-slate-800 overflow-hidden mb-1">
                    <div
                      className={`h-full ${
                        v.v >= 60 ? 'bg-indigo-500' : v.v >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.max(4, v.v)}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-muted-df font-mono-df">{v.hint}</div>
                </div>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add an audit note (visible in trail)…"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-heading focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              rows={2}
              data-testid="approval-note"
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => act('approve')}
                className="btn-tactile-primary text-[13px] cursor-pointer"
                data-testid="risk-approve-btn"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve
              </button>
              <button
                onClick={() => act('revise')}
                className="btn-tactile-secondary text-[13px] cursor-pointer"
                data-testid="risk-revise-btn"
              >
                <RotateCcw className="w-4 h-4" /> Request Revision
              </button>
              <button
                onClick={() => act('reject')}
                className="btn-tactile-secondary text-[13px] hover:!border-rose-300 hover:!text-rose-600 cursor-pointer"
                data-testid="risk-reject-btn"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
          <div className="embossed-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-display font-semibold text-heading">
                Immutable Audit Trail
              </h3>
            </div>
            <div className="space-y-2.5">
              {trail.map((t, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/40"
                  data-testid={`trail-${i}`}
                >
                  <Clock className="w-3.5 h-3.5 text-muted-df mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-[13px] text-body">
                      <span className="font-semibold text-heading">{t.by}</span> · {t.act}
                    </div>
                    <div className="text-[11px] text-muted-df font-mono-df">{t.at}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
