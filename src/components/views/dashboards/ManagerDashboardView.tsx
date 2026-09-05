import React from 'react';
import { ShieldCheck, AlertTriangle, Users, TrendingUp, CheckSquare, HeartPulse, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { MetricCard } from '../../design-system/MetricCard';
import { StatusBadge } from '../../design-system/StatusBadge';
import { RiskBadge } from '../../design-system/RiskBadge';
import { ActivityTimeline } from '../../design-system/ActivityTimeline';

export const ManagerDashboardView: React.FC = () => {
  const { quotes, anomalies, auditLogs, setActiveView, setSelectedQuoteId, currentUser } =
    useAppStore();

  const totalTeamRevenue = quotes.reduce((acc, q) => acc + q.totalNetAmount, 0);
  const pendingManagerQueue = quotes.filter((q) => q.status === 'Pending Manager');
  const activeAnomalies = anomalies.filter((a) => !a.isResolved);
  const avgTeamMargin =
    quotes.length > 0
      ? (quotes.reduce((acc, q) => acc + q.overallMarginPercent, 0) / quotes.length).toFixed(1)
      : '0';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              Sales Manager Governance Dashboard
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              {currentUser?.name || 'M. Shah'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Review commercial discount exceptions, manage team approval queues, and monitor deal health velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('approvals')}
            className="px-4 py-2.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <CheckSquare className="w-4 h-4" /> Manager Approval Queue ({pendingManagerQueue.length})
          </button>
          <button
            onClick={() => setActiveView('deal_health')}
            className="px-3.5 py-2.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <HeartPulse className="w-4 h-4 text-rose-600" /> Risk Anomalies ({activeAnomalies.length})
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Team Pipeline Value"
          value={`₹${(totalTeamRevenue / 100000).toFixed(2)} Lakh`}
          subtitle={`${quotes.length} total team quotations`}
          icon={Users}
          variant="cyan"
        />
        <MetricCard
          title="Pending Manager Approvals"
          value={pendingManagerQueue.length}
          subtitle="Commercial discount queue"
          icon={CheckSquare}
          variant={pendingManagerQueue.length > 0 ? 'amber' : 'default'}
          onClick={() => setActiveView('approvals')}
        />
        <MetricCard
          title="Detected Deal Anomalies"
          value={activeAnomalies.length}
          subtitle="Stalled & discount spikes"
          icon={AlertTriangle}
          variant={activeAnomalies.length > 0 ? 'crimson' : 'default'}
          onClick={() => setActiveView('deal_health')}
        />
        <MetricCard
          title="Team Average Margin"
          value={`${avgTeamMargin}%`}
          subtitle="Target SLA: 30.0%"
          icon={TrendingUp}
          variant="emerald"
        />
      </div>

      {/* Main Grid: Pending Approvals & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Quotations Awaiting Manager Approval ({pendingManagerQueue.length})
                </span>
              </div>
              <button
                onClick={() => setActiveView('approvals')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                Open Full Approval Queue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingManagerQueue.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center font-medium">
                No quotations currently pending Manager approval. All team quotes are compliant!
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3">Quote #</th>
                      <th className="py-2.5 px-3">Customer / Rep</th>
                      <th className="py-2.5 px-3">Net Total</th>
                      <th className="py-2.5 px-3">Margin</th>
                      <th className="py-2.5 px-3">Risk Level</th>
                      <th className="py-2.5 px-3 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {pendingManagerQueue.map((q) => (
                      <tr
                        key={q.id}
                        onClick={() => {
                          setSelectedQuoteId(q.id);
                          setActiveView('approvals');
                        }}
                        className="hover:bg-slate-50 cursor-pointer transition"
                      >
                        <td className="py-2.5 px-3 font-bold text-blue-700 font-mono">{q.id}</td>
                        <td className="py-2.5 px-3">
                          <span className="text-slate-900 font-semibold block">{q.companyName}</span>
                          <span className="text-[11px] text-slate-500">Rep: {q.salesRep}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-900 font-mono font-bold">
                          ₹{q.totalNetAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-700">
                          {q.overallMarginPercent}%
                        </td>
                        <td className="py-2.5 px-3">
                          <RiskBadge level={q.riskLevel} score={q.blendedRiskScore} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white transition text-xs font-bold shadow-2xs">
                            Review & Decision
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <ActivityTimeline logs={auditLogs} />
        </div>
      </div>
    </div>
  );
};
