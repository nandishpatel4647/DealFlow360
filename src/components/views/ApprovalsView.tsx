import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  FileText,
  UserCheck,
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
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Approval & Governance Queue
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              {pendingCount} Pending Reviews
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Enforces multi-level commercial governance. High-risk quotations require Sales Manager review followed by Finance concurrence.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 border border-slate-200">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
              filter === 'pending'
                ? 'bg-white text-amber-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
              filter === 'approved'
                ? 'bg-white text-emerald-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
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
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block pb-1">
            Governance Queue ({filteredQuotes.length})
          </span>

          <div className="space-y-2.5">
            {filteredQuotes.map((q) => {
              const isSelected = activeQuote?.id === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuoteId(q.id)}
                  className={`p-4 rounded-lg bg-white border transition cursor-pointer shadow-xs ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-100 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-600">{q.id}</span>
                    <RiskBadge level={q.riskLevel} score={q.blendedRiskScore} size="sm" />
                  </div>

                  <h4 className="mt-1.5 text-xs font-bold text-slate-900">{q.companyName}</h4>

                  <div className="mt-2 flex items-baseline justify-between text-xs font-mono">
                    <span className="text-slate-900 font-bold">
                      ₹{q.totalNetAmount.toLocaleString('en-IN')}
                    </span>
                    <span
                      className={
                        q.overallMarginPercent >= 30 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'
                      }
                    >
                      {q.overallMarginPercent}% Margin
                    </span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Stage: {q.approvalStage}</span>
                    <StatusBadge status={q.status} />
                  </div>
                </div>
              );
            })}

            {filteredQuotes.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs bg-white rounded-lg border border-slate-200 shadow-xs font-medium">
                No quotations found matching this filter.
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Cols: Selected Quote Risk Audit & Decision Actions */}
        {activeQuote ? (
          <div className="lg:col-span-2 space-y-4">
            {/* Header Box */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900 font-mono">{activeQuote.id}</span>
                    <span className="text-sm text-slate-700 font-bold">
                      — {activeQuote.companyName}
                    </span>
                    <StatusBadge status={activeQuote.status} />
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Customer Tier: <span className="text-slate-900 font-bold">{activeQuote.tier}</span> • Reviewer:{' '}
                    <span className="text-blue-700 font-bold">{activeQuote.approvalAssignedTo}</span>
                  </p>
                </div>

                <button
                  onClick={() => setActiveView('builder')}
                  className="px-3 py-1.5 rounded-md text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
                >
                  <FileText className="w-4 h-4 text-blue-600" /> Edit Quote
                </button>
              </div>

              {/* Action Decision Toolbar */}
              <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Governance Decision Bar (Authenticated Session Role: {userRole.replace('_', ' ').toUpperCase()})
                  </span>
                </div>

                {/* Stage 1: Sales Manager Actions */}
                {activeQuote.status === 'Pending Manager' && (
                  <div className="pt-2">
                    {userRole === 'sales_manager' || userRole === 'admin' ? (
                      <div className="flex flex-wrap items-center gap-3">
                        {activeQuote.riskLevel === 'HIGH' ? (
                          <button
                            onClick={() =>
                              managerApprove(
                                activeQuote.id,
                                'Commercial discount verified by Sales Manager. Forwarding to Finance for margin concurrency.'
                              )
                            }
                            className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <UserCheck className="w-4 h-4" /> Approve & Forward to Finance
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              managerApprove(activeQuote.id, 'Terms within acceptable business boundaries.')
                            }
                            className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" /> Approve Quotation
                          </button>
                        )}

                        <button
                          onClick={() => setShowReturnModal(true)}
                          className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Return with Revision Notes
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                        Quotation is currently undergoing Sales Manager review (M. Shah). Only authorized Sales Managers can sign off.
                      </p>
                    )}
                  </div>
                )}

                {/* Stage 2: Finance Actions (Strictly only after Manager Approval for HIGH Risk) */}
                {activeQuote.status === 'Pending Finance' && (
                  <div className="pt-2">
                    {userRole === 'finance' || userRole === 'admin' ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={() =>
                            financeApprove(
                              activeQuote.id,
                              'Gross margin impact audited and ratified by Corporate Finance.'
                            )
                          }
                          className="px-4 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" /> Approve Deal (Final Finance Authorization)
                        </button>

                        <button
                          onClick={() => setShowReturnModal(true)}
                          className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Reject / Return to Sales
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs font-semibold text-purple-800 bg-purple-50 p-2.5 rounded-lg border border-purple-200">
                        Quotation is currently undergoing Corporate Finance review (R. Iyer). Only authorized Finance Approvers can sign off.
                      </p>
                    )}
                  </div>
                )}

                {activeQuote.status === 'Fully Approved' && (
                  <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <span className="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Quotation is fully authorized and ready for fulfillment.
                    </span>
                    <button
                      onClick={() => setActiveView('fulfillment')}
                      className="px-3.5 py-1.5 rounded-md text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      Fulfill Order <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {activeQuote.status === 'Draft' && (
                  <p className="text-xs text-slate-500 font-medium">
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
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block pb-2 border-b border-slate-200">
                Itemized Line Evaluation
              </span>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-sans font-semibold bg-slate-50">
                      <th className="p-2.5">Product / Service</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5">Discount %</th>
                      <th className="p-2.5">Category Limit</th>
                      <th className="p-2.5">Governance Flag</th>
                      <th className="p-2.5">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {activeQuote.lines.map((l) => (
                      <tr key={l.id} className="py-2.5">
                        <td className="p-2.5 font-sans text-slate-900 font-bold">
                          {l.productName}
                        </td>
                        <td className="p-2.5 text-center text-slate-700">{l.quantity}</td>
                        <td className="p-2.5 font-bold text-slate-900">{l.discountPercent}%</td>
                        <td className="p-2.5 text-slate-600">{l.discountCeiling}%</td>
                        <td className="p-2.5 font-sans">
                          {l.isOverLimit ? (
                            <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              OVER (+{l.overLimitPoints}pt)
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              Compliant
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-900 font-bold">
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-rose-600" /> Return Quotation for Revision
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Provide actionable guidance for the sales rep to adjust discounts or product mix.
            </p>
            <textarea
              rows={3}
              value={returnComments}
              onChange={(e) => setReturnComments(e.target.value)}
              placeholder="e.g. Reduce service discount to 10% or attach Extended Warranty to restore margin..."
              className="w-full p-2.5 rounded-md bg-slate-50 border border-slate-300 text-xs text-slate-900 font-medium outline-none focus:border-blue-600 focus:bg-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReturnModal(false)}
                className="px-3 py-1.5 rounded text-xs text-slate-600 hover:text-slate-900 font-semibold"
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
                className="px-4 py-1.5 rounded text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
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

