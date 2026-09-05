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

  const filterOptions = [
    { key: 'pending' as const, label: `Pending (${pendingCount})` },
    { key: 'approved' as const, label: 'Approved' },
    { key: 'all' as const, label: `All (${quotes.length})` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
            Approvals & Risk Center
            {pendingCount > 0 && (
              <span
                className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--warning-soft)', color: 'var(--warning)' }}
              >
                {pendingCount} Pending
              </span>
            )}
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Multi-level commercial governance. High-risk deals require Sales Manager → Finance concurrence.
          </p>
        </div>

        {/* Filter Pills */}
        <div
          className="flex items-center gap-0.5 p-1 rounded-lg"
          style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-default)' }}
        >
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                filter === opt.key
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
              style={
                filter === opt.key
                  ? { border: '1px solid var(--border-default)' }
                  : { border: '1px solid transparent' }
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Queue */}
        <div className="space-y-3">
          <span className="section-heading block pb-1">
            Queue ({filteredQuotes.length})
          </span>

          <div className="space-y-2.5">
            {filteredQuotes.map((q) => {
              const isSelected = activeQuote?.id === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQuoteId(q.id)}
                  className="surface-card-interactive p-4"
                  style={
                    isSelected
                      ? {
                          borderColor: 'var(--accent-primary)',
                          boxShadow: '0 0 0 3px var(--accent-primary-soft)',
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[var(--accent-primary)]">
                      {q.id}
                    </span>
                    <RiskBadge level={q.riskLevel} score={q.blendedRiskScore} size="sm" />
                  </div>

                  <h4 className="mt-1.5 text-[13px] font-semibold text-[var(--text-primary)]">
                    {q.companyName}
                  </h4>

                  <div className="mt-2 flex items-baseline justify-between text-xs font-mono">
                    <span className="text-[var(--text-primary)] font-bold">
                      ₹{q.totalNetAmount.toLocaleString('en-IN')}
                    </span>
                    <span
                      style={{
                        color:
                          q.overallMarginPercent >= 30
                            ? 'var(--success)'
                            : 'var(--warning)',
                      }}
                    >
                      {q.overallMarginPercent}%
                    </span>
                  </div>

                  <div
                    className="mt-2 pt-2 flex items-center justify-between text-[11px] text-[var(--text-muted)]"
                    style={{ borderTop: '1px solid var(--border-subtle)' }}
                  >
                    <span>{q.approvalStage}</span>
                    <StatusBadge status={q.status} size="sm" />
                  </div>
                </div>
              );
            })}

            {filteredQuotes.length === 0 && (
              <div className="surface-card p-8 text-center text-[var(--text-muted)] text-xs">
                No quotations match this filter.
              </div>
            )}
          </div>
        </div>

        {/* Right: Detail */}
        {activeQuote ? (
          <div className="lg:col-span-2 space-y-4">
            {/* Header */}
            <div className="surface-card p-5">
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3"
                style={{ borderBottom: '1px solid var(--border-default)' }}
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-[var(--text-primary)] font-mono">
                      {activeQuote.id}
                    </span>
                    <span className="text-sm text-[var(--text-secondary)] font-semibold">
                      — {activeQuote.companyName}
                    </span>
                    <StatusBadge status={activeQuote.status} />
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    Tier: <span className="text-[var(--text-secondary)]">{activeQuote.tier}</span> •
                    Reviewer: <span className="text-[var(--accent-primary)]">{activeQuote.approvalAssignedTo}</span>
                  </p>
                </div>

                <button
                  onClick={() => setActiveView('builder')}
                  className="btn-ghost !text-xs"
                >
                  <FileText className="w-3.5 h-3.5" /> Open in Builder
                </button>
              </div>

              {/* Decision Actions */}
              <div
                className="mt-4 p-4 rounded-lg space-y-3"
                style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-default)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="section-heading">
                    Decision Actions ({userRole})
                  </span>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[var(--text-muted)]">Role:</span>
                    <button
                      onClick={() => setUserRole('sales_manager')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                        userRole === 'sales_manager'
                          ? 'bg-[var(--accent-primary)] text-white'
                          : 'bg-[var(--bg-surface)] text-[var(--text-tertiary)] border border-[var(--border-default)]'
                      }`}
                    >
                      Manager
                    </button>
                    <button
                      onClick={() => setUserRole('finance')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition cursor-pointer ${
                        userRole === 'finance'
                          ? 'bg-[var(--info)] text-white'
                          : 'bg-[var(--bg-surface)] text-[var(--text-tertiary)] border border-[var(--border-default)]'
                      }`}
                    >
                      Finance
                    </button>
                  </div>
                </div>

                {/* Manager Actions */}
                {activeQuote.status === 'Pending Manager' && (
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    {activeQuote.riskLevel === 'HIGH' ? (
                      <button
                        onClick={() =>
                          managerApprove(
                            activeQuote.id,
                            'Commercial discount verified. Forwarding to Finance.'
                          )
                        }
                        className="btn-primary"
                        style={{ backgroundColor: 'var(--warning)', borderColor: 'var(--warning)' }}
                      >
                        <UserCheck className="w-4 h-4" /> Approve & Forward to Finance
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          managerApprove(activeQuote.id, 'Terms within acceptable boundaries.')
                        }
                        className="btn-primary"
                        style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve Quotation
                      </button>
                    )}
                    <button
                      onClick={() => setShowReturnModal(true)}
                      className="btn-secondary"
                      style={{ color: 'var(--danger)' }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Return for Revision
                    </button>
                  </div>
                )}

                {/* Finance Actions */}
                {activeQuote.status === 'Pending Finance' && (
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() =>
                        financeApprove(
                          activeQuote.id,
                          'Margin impact audited and ratified by Finance.'
                        )
                      }
                      className="btn-primary"
                      style={{ backgroundColor: 'var(--info)', borderColor: 'var(--info)' }}
                    >
                      <ShieldCheck className="w-4 h-4" /> Final Finance Authorization
                    </button>
                    <button
                      onClick={() => setShowReturnModal(true)}
                      className="btn-secondary"
                      style={{ color: 'var(--danger)' }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reject / Return
                    </button>
                  </div>
                )}

                {activeQuote.status === 'Fully Approved' && (
                  <div
                    className="p-3 rounded-lg flex items-center justify-between"
                    style={{ backgroundColor: 'var(--success-soft)', border: '1px solid var(--success-border)' }}
                  >
                    <span className="text-xs text-[var(--success)] font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Fully approved through governance protocol.
                    </span>
                    <button
                      onClick={() => setActiveView('fulfillment')}
                      className="btn-primary !py-1.5 !px-3 !text-xs"
                      style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
                    >
                      Fulfill <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {activeQuote.status === 'Draft' && (
                  <p className="text-xs text-[var(--text-muted)]">
                    Quote is in Draft. Sales rep has not submitted for governance.
                  </p>
                )}
              </div>
            </div>

            <ExplainableRiskCard
              breakdown={activeQuote.riskBreakdown}
              riskLevel={activeQuote.riskLevel}
              approvalStage={activeQuote.approvalStage}
              assignedTo={activeQuote.approvalAssignedTo}
            />

            {/* Line Audit Table */}
            <div className="surface-card overflow-hidden">
              <div
                className="px-5 py-3.5"
                style={{ borderBottom: '1px solid var(--border-default)' }}
              >
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  Line Evaluation
                </span>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-center">Qty</th>
                    <th>Discount</th>
                    <th>Ceiling</th>
                    <th>Status</th>
                    <th>Net Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {activeQuote.lines.map((l) => (
                    <tr key={l.id}>
                      <td className="text-[var(--text-primary)] font-medium">{l.productName}</td>
                      <td className="text-center font-mono">{l.quantity}</td>
                      <td className="font-mono font-semibold">{l.discountPercent}%</td>
                      <td className="font-mono text-[var(--text-muted)]">{l.discountCeiling}%</td>
                      <td>
                        {l.isOverLimit ? (
                          <span className="text-[11px] font-semibold text-[var(--danger)] bg-[var(--danger-soft)] px-2 py-0.5 rounded-full">
                            OVER +{l.overLimitPoints}pt
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-[var(--success)] bg-[var(--success-soft)] px-2 py-0.5 rounded-full">
                            Compliant
                          </span>
                        )}
                      </td>
                      <td className="font-mono font-semibold text-[var(--text-primary)]">
                        ₹{l.netAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ActivityTimeline logs={auditLogs} quoteId={activeQuote.id} />
          </div>
        ) : null}
      </div>

      {/* Return Modal */}
      {showReturnModal && (
        <div className="modal-overlay flex items-center justify-center p-4">
          <div className="modal-content p-6 max-w-md w-full space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[var(--danger)]" /> Return for Revision
            </h3>
            <p className="text-xs text-[var(--text-tertiary)]">
              Provide guidance for the sales rep to adjust discounts or product mix.
            </p>
            <textarea
              rows={3}
              value={returnComments}
              onChange={(e) => setReturnComments(e.target.value)}
              placeholder="e.g. Reduce service discount to 10% or attach Extended Warranty..."
              className="input-field !text-xs"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReturnModal(false)}
                className="btn-ghost"
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
                className="btn-danger"
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
