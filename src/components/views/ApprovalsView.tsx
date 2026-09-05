import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  FileText,
  UserCheck,
  DollarSign,
  AlertOctagon,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { RiskBadge } from '../design-system/RiskBadge';
import { StatusBadge } from '../design-system/StatusBadge';
import { ExplainableRiskCard } from '../design-system/ExplainableRiskCard';
import { ActivityTimeline } from '../design-system/ActivityTimeline';

export const ApprovalsView: React.FC = () => {
  const {
    quotes,
    userRole,
    setUserRole,
    selectedQuoteId,
    setSelectedQuoteId,
    managerApprove,
    financeApprove,
    returnForRevision,
    auditLogs,
    setActiveView,
  } = useAppStore();

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [returnComments, setReturnComments] = useState<string>('');
  const [showReturnModal, setShowReturnModal] = useState<boolean>(false);

  const activeQuote = quotes.find((q) => q.id === selectedQuoteId) || quotes[0];

  const filteredQuotes = quotes.filter((q) => {
    if (filter === 'pending') {
      return q.status === 'Pending Manager' || q.status === 'Pending Finance';
    }
    if (filter === 'approved') {
      return q.status === 'Fully Approved' || q.status === 'Fulfillment' || q.status === 'Invoiced' || q.status === 'Paid';
    }
    return true;
  });

  const pendingCount = quotes.filter(
    (q) => q.status === 'Pending Manager' || q.status === 'Pending Finance'
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Approval & Risk Governance Center
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
              {pendingCount} Pending Multi-Tier Approvals
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enforces multi-level commercial discipline. High-risk quotations require Sales Manager review followed by Finance concurrence.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
              filter === 'pending'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
              filter === 'approved'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
              filter === 'all'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Deals ({quotes.length})
          </button>
        </div>
      </div>

      {/* Main Grid: Queue on Left, Decision Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Approvals Queue List */}
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block pb-1">
            Governance Queue ({filteredQuotes.length})
          </span>

          <div className="space-y-2.5">
            {filteredQuotes.map((q) => {
              const isSelected = activeQuote?.id === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuoteId(q.id)}
                  className={`p-4 rounded-lg surface-card border transition cursor-pointer ${
                    isSelected
                      ? 'border-cyan-500/80 bg-slate-800/80 shadow-md'
                      : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400">{q.id}</span>
                    <RiskBadge level={q.riskLevel} score={q.blendedRiskScore} size="sm" />
                  </div>

                  <h4 className="mt-1.5 text-xs font-semibold text-white">{q.companyName}</h4>

                  <div className="mt-2 flex items-baseline justify-between text-xs font-mono">
                    <span className="text-slate-300 font-bold">
                      ₹{q.totalNetAmount.toLocaleString('en-IN')}
                    </span>
                    <span
                      className={
                        q.overallMarginPercent >= 30 ? 'text-emerald-400' : 'text-amber-400'
                      }
                    >
                      {q.overallMarginPercent}% Margin
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Stage: {q.approvalStage}</span>
                    <StatusBadge status={q.status} />
                  </div>
                </div>
              );
            })}

            {filteredQuotes.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs surface-card">
                No quotations found matching this filter.
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Cols: Selected Quote Risk Audit & Decision Actions */}
        {activeQuote ? (
          <div className="lg:col-span-2 space-y-4">
            {/* Header Box */}
            <div className="surface-card p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white font-mono">{activeQuote.id}</span>
                    <span className="text-sm text-slate-300 font-semibold">
                      — {activeQuote.companyName}
                    </span>
                    <StatusBadge status={activeQuote.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customer Tier: <span className="text-slate-200">{activeQuote.tier}</span> • Assigned Reviewer:{' '}
                    <span className="text-cyan-400">{activeQuote.approvalAssignedTo}</span>
                  </p>
                </div>

                <button
                  onClick={() => setActiveView('builder')}
                  className="px-3 py-1.5 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <FileText className="w-3.5 h-3.5" /> Edit in Quote Builder
                </button>
              </div>

              {/* Action Decision Toolbar */}
              <div className="mt-4 p-4 rounded-lg bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Governance Decision Actions (Active Role: {userRole.toUpperCase()})
                  </span>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-500">Quick Role Switch:</span>
                    <button
                      onClick={() => setUserRole('sales_manager')}
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        userRole === 'sales_manager'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Manager
                    </button>
                    <button
                      onClick={() => setUserRole('finance')}
                      className={`px-2 py-0.5 rounded text-[11px] ${
                        userRole === 'finance'
                          ? 'bg-purple-500 text-white font-bold'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Finance
                    </button>
                  </div>
                </div>

                {/* Stage 1: Sales Manager Actions */}
                {activeQuote.status === 'Pending Manager' && (
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    {activeQuote.riskLevel === 'HIGH' ? (
                      <button
                        onClick={() =>
                          managerApprove(
                            activeQuote.id,
                            'Commercial discount verified by Sales Manager. Forwarding to Finance for margin concurrency.'
                          )
                        }
                        className="px-4 py-2 rounded-md text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" /> [Approve & Forward to Finance]
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          managerApprove(activeQuote.id, 'Terms within acceptable business boundaries.')
                        }
                        className="px-4 py-2 rounded-md text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" /> [Approve Quotation]
                      </button>
                    )}

                    <button
                      onClick={() => setShowReturnModal(true)}
                      className="px-3.5 py-2 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Return with Revision Notes
                    </button>
                  </div>
                )}

                {/* Stage 2: Finance Actions (Strictly only after Manager Approval for HIGH Risk) */}
                {activeQuote.status === 'Pending Finance' && (
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() =>
                        financeApprove(
                          activeQuote.id,
                          'Gross margin impact (26.8%) audited and ratified by Corporate Finance.'
                        )
                      }
                      className="px-4 py-2 rounded-md text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/20 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" /> [Approve Deal — Final Finance Authorization]
                    </button>

                    <button
                      onClick={() => setShowReturnModal(true)}
                      className="px-3.5 py-2 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reject / Return to Sales
                    </button>
                  </div>
                )}

                {activeQuote.status === 'Fully Approved' && (
                  <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Deal is fully approved through governance protocol.
                    </span>
                    <button
                      onClick={() => setActiveView('fulfillment')}
                      className="px-3 py-1 rounded text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center gap-1"
                    >
                      Fulfill Order <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {activeQuote.status === 'Draft' && (
                  <p className="text-xs text-slate-400">
                    Quote is currently in Draft. Sales rep has not submitted for governance routing.
                  </p>
                )}
              </div>
            </div>

            {/* Explainable Risk Box */}
            <ExplainableRiskCard
              breakdown={activeQuote.riskBreakdown}
              riskLevel={activeQuote.riskLevel}
              approvalStage={activeQuote.approvalStage}
              assignedTo={activeQuote.approvalAssignedTo}
            />

            {/* Line-level Audit Table */}
            <div className="surface-card p-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block pb-2 border-b border-slate-800">
                Itemized Line Evaluation
              </span>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-sans">
                      <th className="pb-2">Product / Service</th>
                      <th className="pb-2 text-center">Qty</th>
                      <th className="pb-2">Discount %</th>
                      <th className="pb-2">Category Limit</th>
                      <th className="pb-2">Governance Flag</th>
                      <th className="pb-2">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {activeQuote.lines.map((l) => (
                      <tr key={l.id} className="py-2.5">
                        <td className="py-2.5 font-sans text-white font-medium">
                          {l.productName}
                        </td>
                        <td className="py-2.5 text-center text-slate-300">{l.quantity}</td>
                        <td className="py-2.5 font-bold text-slate-200">{l.discountPercent}%</td>
                        <td className="py-2.5 text-slate-400">{l.discountCeiling}%</td>
                        <td className="py-2.5 font-sans">
                          {l.isOverLimit ? (
                            <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                              OVER (+{l.overLimitPoints}pt)
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              Compliant
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 text-slate-200 font-bold">
                          ₹{l.netAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Trail */}
            <ActivityTimeline logs={auditLogs} quoteId={activeQuote.id} />
          </div>
        ) : null}
      </div>

      {/* Return Notes Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="surface-card p-6 max-w-md w-full border border-slate-700 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-400" /> Return Quotation for Revision
            </h3>
            <p className="text-xs text-slate-400">
              Provide actionable guidance for the sales rep to adjust discounts or product mix.
            </p>
            <textarea
              rows={3}
              value={returnComments}
              onChange={(e) => setReturnComments(e.target.value)}
              placeholder="e.g. Reduce service discount to 10% or attach Extended Warranty to restore margin..."
              className="w-full p-2.5 rounded-md bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-cyan-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (activeQuote) {
                    returnForRevision(
                      activeQuote.id,
                      returnComments || 'Returned for discount revision.'
                    );
                    setShowReturnModal(false);
                    setReturnComments('');
                  }
                }}
                className="px-4 py-1.5 rounded text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Submit Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
