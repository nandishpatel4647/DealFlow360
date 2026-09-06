import React from 'react';
import { ShieldCheck, FileText, PlusCircle, ArrowRight, Clock, ShieldAlert, Activity } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { MetricCard } from '../../design-system/MetricCard';
import { StatusBadge } from '../../design-system/StatusBadge';
import { RiskBadge } from '../../design-system/RiskBadge';
import { ActivityTimeline } from '../../design-system/ActivityTimeline';

export const SalesDashboardView: React.FC = () => {
  const { quotes, anomalies, auditLogs, setActiveView, setSelectedQuoteId, createNewQuote, companies, currentUser } =
    useAppStore();

  const myQuotes = quotes;
  const pendingApprovals = quotes.filter(
    (q) => q.status === 'Pending Manager' || q.status === 'Pending Finance'
  );
  const openQuotations = quotes.filter(
    (q) => q.status === 'Draft' || q.status === 'Pending Manager' || q.status === 'Pending Finance' || q.status === 'Under Negotiation'
  );
  const atRiskDeals = anomalies.filter((a) => !a.isResolved);

  return (
    <div className="space-y-6">
      {/* Top Banner (Blueprint Page 2 Header) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 card-3d flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
              Sales Command Center
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 badge-3d">
              Active Workspace
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Real-time quotation pipeline, multi-line discount ceilings, live margin gauges, and AI Deal Copilot.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('approvals')}
            className="px-3.5 py-2 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer btn-3d"
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" /> View Approvals
          </button>

          <button
            onClick={() => {
              const newId = createNewQuote(companies[0].id);
              setSelectedQuoteId(newId);
              setActiveView('builder');
            }}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0176D3] hover:bg-blue-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> New Quotation
          </button>
        </div>
      </div>

      {/* Blueprint Dynamic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Pending Approvals"
          value={`${pendingApprovals.length} quotations`}
          subtitle="Awaiting Manager / Finance review"
          delta="Dynamic state value"
          isPositive={false}
          icon={Clock}
          variant={pendingApprovals.length > 0 ? 'amber' : 'default'}
          onClick={() => setActiveView('approvals')}
        />

        <MetricCard
          title="Open Quotations"
          value={`${openQuotations.length} active deals`}
          subtitle="In pipeline & negotiation"
          delta="Dynamic state value"
          isPositive={true}
          icon={FileText}
          variant="cyan"
          onClick={() => setActiveView('pipeline')}
        />

        <MetricCard
          title="At-Risk Deals"
          value={`${atRiskDeals.length} flagged deals`}
          subtitle="Flagged by Deal Health Engine"
          delta="Dynamic state value"
          isPositive={false}
          icon={ShieldAlert}
          variant={atRiskDeals.length > 0 ? 'crimson' : 'emerald'}
          onClick={() => setActiveView('deal_health')}
        />
      </div>

      {/* Main Grid: Quotations & Real Recent Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0176D3]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Active Commercial Quotations ({myQuotes.length})
                </span>
              </div>
              <button
                onClick={() => setActiveView('pipeline')}
                className="text-xs font-bold text-[#0176D3] hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                Open Quotations List <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Quote #</th>
                    <th className="py-2.5 px-3">Customer / Tier</th>
                    <th className="py-2.5 px-3">Net Amount</th>
                    <th className="py-2.5 px-3">Margin</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {myQuotes.map((q) => (
                    <tr
                      key={q.id}
                      onClick={() => {
                        setSelectedQuoteId(q.id);
                        setActiveView('builder');
                      }}
                      className="hover:bg-slate-50 cursor-pointer transition"
                    >
                      <td className="py-2.5 px-3 font-bold text-[#0176D3] font-mono">{q.id}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-slate-900 font-semibold block">{q.companyName}</span>
                        <span className="text-[11px] text-slate-500">{q.tier} Tier</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-900 font-mono font-bold">
                        ₹{q.totalNetAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span className={q.overallMarginPercent >= 30 ? 'text-emerald-700' : 'text-amber-700'}>
                          {q.overallMarginPercent}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <RiskBadge level={q.riskLevel} score={q.blendedRiskScore} size="sm" />
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={q.status} />
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 transition text-[11px] font-bold border border-slate-300 shadow-2xs">
                          Open Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Blueprint Recent Activity Log */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Activity className="w-4 h-4 text-[#0176D3]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Recent System Activity Log
              </span>
            </div>
            <ActivityTimeline logs={auditLogs} />
          </div>
        </div>
      </div>
    </div>
  );
};
