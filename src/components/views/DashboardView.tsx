import React from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileText,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { MetricCard } from '../design-system/MetricCard';
import { StatusBadge } from '../design-system/StatusBadge';
import { RiskBadge } from '../design-system/RiskBadge';
import { ActivityTimeline } from '../design-system/ActivityTimeline';

export const DashboardView: React.FC = () => {
  const {
    quotes,
    anomalies,
    auditLogs,
    setActiveView,
    setSelectedQuoteId,
    createNewQuote,
    companies,
  } = useAppStore();

  const totalPipelineRevenue = quotes.reduce((acc, q) => acc + q.totalNetAmount, 0);
  const avgMargin = quotes.length > 0
    ? (quotes.reduce((acc, q) => acc + q.overallMarginPercent, 0) / quotes.length).toFixed(1)
    : '0';
  const pendingApprovals = quotes.filter(
    (q) => q.status === 'Pending Manager' || q.status === 'Pending Finance'
  );
  const criticalAnomalies = anomalies.filter((a) => !a.isResolved);

  return (
    <div className="space-y-6">
      {/* Top Banner / Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Executive Command Center
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              Live Governance
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time B2B deal operations, continuous discount risk governance, and multi-warehouse visibility.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newId = createNewQuote(companies[0].id);
              setSelectedQuoteId(newId);
              setActiveView('builder');
            }}
            className="px-4 py-2 rounded-md text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> + New Quotation
          </button>
          <button
            onClick={() => setActiveView('approvals')}
            className="px-3.5 py-2 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" /> Approvals ({pendingApprovals.length})
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Pipeline Value"
          value={`₹${(totalPipelineRevenue / 100000).toFixed(2)} Lakh`}
          subtitle={`${quotes.length} total quotations tracked`}
          delta="+18.4% vs last mo"
          isPositive={true}
          icon={DollarSign}
          variant="cyan"
        />
        <MetricCard
          title="Average Blended Margin"
          value={`${avgMargin}%`}
          subtitle="Target threshold: 30.0%"
          delta="+2.8 pts"
          isPositive={true}
          icon={TrendingUp}
          variant="emerald"
        />
        <MetricCard
          title="Pending Approvals"
          value={pendingApprovals.length}
          subtitle="Manager & Finance queue"
          icon={ShieldCheck}
          variant={pendingApprovals.length > 0 ? 'amber' : 'default'}
          onClick={() => setActiveView('approvals')}
        />
        <MetricCard
          title="At-Risk Deal Anomalies"
          value={criticalAnomalies.length}
          subtitle="Stalled & discount deviations"
          icon={AlertTriangle}
          variant={criticalAnomalies.length > 0 ? 'crimson' : 'default'}
          onClick={() => setActiveView('deal_health')}
        />
      </div>

      {/* Main Grid: Live Pipeline Summary & Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Deals Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Active Governed Deals
                </span>
              </div>
              <button
                onClick={() => setActiveView('pipeline')}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                Open Kanban Pipeline <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-medium">
                    <th className="pb-2">Quote ID</th>
                    <th className="pb-2">Customer / Tier</th>
                    <th className="pb-2">Net Amount</th>
                    <th className="pb-2">Margin</th>
                    <th className="pb-2">Risk</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {quotes.map((q) => (
                    <tr
                      key={q.id}
                      onClick={() => {
                        setSelectedQuoteId(q.id);
                        setActiveView('builder');
                      }}
                      className="group hover:bg-slate-800/40 cursor-pointer transition"
                    >
                      <td className="py-3 font-semibold text-cyan-400 flex items-center gap-1.5">
                        {q.id}
                      </td>
                      <td className="py-3 font-sans">
                        <span className="text-white font-medium block">{q.companyName}</span>
                        <span className="text-[11px] text-slate-400">
                          {q.tier} Tier • Rep: {q.salesRep}
                        </span>
                      </td>
                      <td className="py-3 text-slate-200">
                        ₹{q.totalNetAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3">
                        <span
                          className={
                            q.overallMarginPercent >= 30
                              ? 'text-emerald-400'
                              : 'text-amber-400'
                          }
                        >
                          {q.overallMarginPercent}%
                        </span>
                      </td>
                      <td className="py-3">
                        <RiskBadge level={q.riskLevel} score={q.blendedRiskScore} size="sm" />
                      </td>
                      <td className="py-3 font-sans">
                        <StatusBadge status={q.status} />
                      </td>
                      <td className="py-3 text-right">
                        <button className="px-2 py-1 rounded bg-slate-800 group-hover:bg-cyan-500/20 text-slate-300 group-hover:text-cyan-300 transition text-[11px] border border-slate-700">
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Audit Stream */}
        <div className="space-y-4">
          <ActivityTimeline logs={auditLogs} />
        </div>
      </div>
    </div>
  );
};
