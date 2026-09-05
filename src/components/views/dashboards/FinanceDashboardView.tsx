import React from 'react';
import { CreditCard, CheckCircle2, Calendar, ShieldAlert, Truck, FileCheck, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { MetricCard } from '../../design-system/MetricCard';
import { RiskBadge } from '../../design-system/RiskBadge';
import { ActivityTimeline } from '../../design-system/ActivityTimeline';

export const FinanceDashboardView: React.FC = () => {
  const { quotes, invoices, subscriptions, auditLogs, setActiveView, setSelectedQuoteId, currentUser } =
    useAppStore();

  const pendingFinanceQueue = quotes.filter((q) => q.status === 'Pending Finance');
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalPaid = invoices.filter((inv) => inv.status === 'Paid').reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalMonthlyARR = subscriptions.filter((s) => s.status === 'Active').reduce((acc, s) => acc + s.amountPerPeriod * 12, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              Finance & Operations Control Center
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {currentUser?.name || 'R. Iyer'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Review high-risk discount exposures, control warehouse fulfillment dispatch, and manage hybrid subscription billing schedules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('approvals')}
            className="px-4 py-2.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" /> Finance Approvals ({pendingFinanceQueue.length})
          </button>
          <button
            onClick={() => setActiveView('fulfillment')}
            className="px-3.5 py-2.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Truck className="w-4 h-4 text-blue-600" /> Warehouse Allocation
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Pending Finance Approvals"
          value={pendingFinanceQueue.length}
          subtitle="High-risk discount queue"
          icon={ShieldAlert}
          variant={pendingFinanceQueue.length > 0 ? 'crimson' : 'default'}
          onClick={() => setActiveView('approvals')}
        />
        <MetricCard
          title="Total Invoiced Receivables"
          value={`₹${(totalInvoiced / 100000).toFixed(2)} Lakh`}
          subtitle={`${invoices.length} total tax invoices`}
          icon={CreditCard}
          variant="cyan"
          onClick={() => setActiveView('billing')}
        />
        <MetricCard
          title="Settled Revenue Paid"
          value={`₹${(totalPaid / 100000).toFixed(2)} Lakh`}
          subtitle="Verified bank settlements"
          delta="100% compliant"
          isPositive={true}
          icon={CheckCircle2}
          variant="emerald"
          onClick={() => setActiveView('billing')}
        />
        <MetricCard
          title="Active Annualized ARR"
          value={`₹${(totalMonthlyARR / 100000).toFixed(2)} Lakh`}
          subtitle={`${subscriptions.length} recurring SaaS plans`}
          icon={Calendar}
          variant="cyan"
          onClick={() => setActiveView('billing')}
        />
      </div>

      {/* Main Grid: Finance Queue & Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Quotations Awaiting High-Risk Finance Approval ({pendingFinanceQueue.length})
                </span>
              </div>
              <button
                onClick={() => setActiveView('approvals')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                Open Full Queue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {pendingFinanceQueue.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center font-medium">
                No high-risk quotations currently pending Finance review.
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
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {pendingFinanceQueue.map((q) => (
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
                        <td className="py-2.5 px-3 font-mono font-bold text-rose-700">
                          {q.overallMarginPercent}%
                        </td>
                        <td className="py-2.5 px-3">
                          <RiskBadge level={q.riskLevel} score={q.blendedRiskScore} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white transition text-xs font-bold shadow-2xs">
                            Review Finance Risk
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
