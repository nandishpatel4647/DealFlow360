import React from 'react';
import { IndianRupee, TrendingUp, AlertTriangle, ShieldCheck, Settings, Users, ArrowRight, Package } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { MetricCard } from '../../design-system/MetricCard';
import { StatusBadge } from '../../design-system/StatusBadge';
import { RiskBadge } from '../../design-system/RiskBadge';
import { ActivityTimeline } from '../../design-system/ActivityTimeline';

export const AdminDashboardView: React.FC = () => {
  const {
    quotes,
    anomalies,
    auditLogs,
    setActiveView,
    setSelectedQuoteId,
    createNewQuote,
    companies,
    products,
    warehouses,
    currentUser,
  } = useAppStore();

  const totalPipelineRevenue = quotes.reduce((acc, q) => acc + q.totalNetAmount, 0);
  const avgMargin =
    quotes.length > 0
      ? (quotes.reduce((acc, q) => acc + q.overallMarginPercent, 0) / quotes.length).toFixed(1)
      : '0';
  const pendingApprovals = quotes.filter(
    (q) => q.status === 'Pending Manager' || q.status === 'Pending Finance'
  );
  const activeAnomalies = anomalies.filter((a) => !a.isResolved);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              Platform Administration & System Control
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300">
              {currentUser?.name || 'System Admin'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Full platform-wide oversight across commercial governance, pricing catalogs, multi-warehouse inventory, and user roles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('admin_config')}
            className="px-4 py-2.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-4 h-4" /> System Governance Config
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Platform Pipeline Total"
          value={`₹${(totalPipelineRevenue / 100000).toFixed(2)} Lakh`}
          subtitle={`${quotes.length} total active quotations`}
          icon={IndianRupee}
          variant="cyan"
        />
        <MetricCard
          title="Blended System Margin"
          value={`${avgMargin}%`}
          subtitle="Target SLA: 30.0%"
          icon={TrendingUp}
          variant="emerald"
        />
        <MetricCard
          title="Active Approval Queue"
          value={pendingApprovals.length}
          subtitle="Manager & Finance steps"
          icon={ShieldCheck}
          variant={pendingApprovals.length > 0 ? 'amber' : 'default'}
          onClick={() => setActiveView('approvals')}
        />
        <MetricCard
          title="Platform Risk Anomalies"
          value={activeAnomalies.length}
          subtitle="Stalled & discount spikes"
          icon={AlertTriangle}
          variant={activeAnomalies.length > 0 ? 'crimson' : 'default'}
          onClick={() => setActiveView('deal_health')}
        />
      </div>

      {/* System Catalogs Summary & Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Platform Master Entities & System Data
                </span>
              </div>
              <button
                onClick={() => setActiveView('admin_config')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                Manage System Policies <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans text-xs">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Client Accounts:</span>
                <div className="text-lg font-extrabold text-slate-900">{companies.length} Companies</div>
                <div className="text-[11px] text-slate-600">Bronze, Silver & Gold Tiers</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Master Catalog:</span>
                <div className="text-lg font-extrabold text-slate-900">{products.length} Products</div>
                <div className="text-[11px] text-slate-600">Hardware, Services & SaaS</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Logistics Warehouses:</span>
                <div className="text-lg font-extrabold text-slate-900">{warehouses.length} Hubs</div>
                <div className="text-[11px] text-slate-600">Main Warehouse & East Depot</div>
              </div>
            </div>
          </div>

          {/* Active Quotations Overview Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                All Active Platform Quotations ({quotes.length})
              </span>
              <button
                onClick={() => setActiveView('pipeline')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                Open Kanban Pipeline <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Quote #</th>
                    <th className="py-2.5 px-3">Customer / Rep</th>
                    <th className="py-2.5 px-3">Net Total</th>
                    <th className="py-2.5 px-3">Margin</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                    <th className="py-2.5 px-3">Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {quotes.map((q) => (
                    <tr
                      key={q.id}
                      onClick={() => {
                        setSelectedQuoteId(q.id);
                        setActiveView('builder');
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <ActivityTimeline logs={auditLogs} />
        </div>
      </div>
    </div>
  );
};
