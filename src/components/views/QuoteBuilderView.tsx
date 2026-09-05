import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
  Send,
  ExternalLink,
  ShieldAlert,
  Package,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { MarginGauge } from '../design-system/MarginGauge';
import { ExplainableRiskCard } from '../design-system/ExplainableRiskCard';
import { ApprovalStepper } from '../design-system/ApprovalStepper';
import { StatusBadge } from '../design-system/StatusBadge';
import { getUpsellRecommendations } from '../../logic/upsellEngine';

export const QuoteBuilderView: React.FC = () => {
  const {
    activeQuote,
    quotes,
    products,
    updateQuoteLine,
    addLineToQuote,
    removeLineFromQuote,
    submitForApproval,
    setActiveView,
    setCustomerPortalToken,
  } = useAppStore();

  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>('');

  if (!activeQuote) {
    return (
      <div className="surface-card p-12 text-center text-[var(--text-tertiary)] text-sm">
        No quotation selected. Please choose a quotation from the pipeline or dashboard.
      </div>
    );
  }

  const upsellRecommendations = getUpsellRecommendations(activeQuote.lines, products);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] font-mono flex items-center gap-2">
              {activeQuote.id}
              <span className="font-sans text-base font-semibold text-[var(--text-secondary)]">
                {activeQuote.companyName}
              </span>
            </h1>
            <StatusBadge status={activeQuote.status} />
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: 'var(--bg-muted)',
                color: 'var(--text-tertiary)',
                border: '1px solid var(--border-default)',
              }}
            >
              {activeQuote.tier} Tier
            </span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Rep: <span className="text-[var(--text-secondary)]">{activeQuote.salesRep}</span> •
            Created: {new Date(activeQuote.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCustomerPortalToken(activeQuote.portalToken);
              setActiveView('portal');
            }}
            className="btn-secondary"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Customer Portal
          </button>

          {activeQuote.status === 'Draft' && (
            <button
              onClick={() => submitForApproval(activeQuote.id)}
              className="btn-primary"
            >
              <Send className="w-3.5 h-3.5" /> Submit for Approval
            </button>
          )}

          {activeQuote.status === 'Pending Manager' && (
            <button
              onClick={() => setActiveView('approvals')}
              className="btn-primary"
              style={{ backgroundColor: 'var(--warning)', borderColor: 'var(--warning)' }}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Review in Approvals
            </button>
          )}

          {activeQuote.status === 'Fully Approved' && (
            <button
              onClick={() => setActiveView('fulfillment')}
              className="btn-primary"
              style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
            >
              <Package className="w-3.5 h-3.5" /> Fulfillment
            </button>
          )}
        </div>
      </div>

      {/* Stepper */}
      <ApprovalStepper status={activeQuote.status} riskLevel={activeQuote.riskLevel} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cart */}
        <div className="lg:col-span-2 space-y-4">
          <div className="surface-card overflow-hidden">
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: '1px solid var(--border-default)' }}
            >
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                Line Items
                <span
                  className="ml-2 text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--bg-muted)',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  {activeQuote.lines.length}
                </span>
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                Inline discount governance active
              </span>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Product / Service</th>
                  <th className="w-16 text-center">Qty</th>
                  <th>List Price</th>
                  <th className="w-28">Discount %</th>
                  <th>Ceiling</th>
                  <th>Status</th>
                  <th>Net Total</th>
                  <th>Margin</th>
                  <th className="text-right w-10"></th>
                </tr>
              </thead>
              <tbody>
                {activeQuote.lines.map((line) => (
                  <tr key={line.id} className="group">
                    <td>
                      <span className="text-[var(--text-primary)] font-medium block text-[13px]">
                        {line.productName}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] capitalize">
                        {line.category} {line.isRecurring && '• Monthly'}
                      </span>
                    </td>

                    <td className="text-center">
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={line.quantity}
                        onChange={(e) =>
                          updateQuoteLine(
                            activeQuote.id,
                            line.id,
                            parseInt(e.target.value) || 1,
                            line.discountPercent
                          )
                        }
                        className="input-field !w-14 !text-center !py-1 !text-xs font-mono"
                      />
                    </td>

                    <td className="text-[var(--text-secondary)] font-mono text-[13px]">
                      ₹{line.unitListPrice.toLocaleString('en-IN')}
                    </td>

                    <td>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={line.discountPercent}
                          onChange={(e) =>
                            updateQuoteLine(
                              activeQuote.id,
                              line.id,
                              line.quantity,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className={`input-field !w-16 !py-1 !text-xs font-mono ${
                            line.isOverLimit
                              ? '!border-[var(--danger)] !bg-[var(--danger-soft)]'
                              : ''
                          }`}
                        />
                        <span className="text-[var(--text-muted)] text-xs">%</span>
                      </div>
                    </td>

                    <td className="text-[var(--text-muted)] font-mono text-[13px]">
                      {line.discountCeiling}%
                    </td>

                    <td>
                      {line.isOverLimit ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--danger)] bg-[var(--danger-soft)] px-2 py-0.5 rounded-full">
                          OVER +{line.overLimitPoints}pt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--success)] bg-[var(--success-soft)] px-2 py-0.5 rounded-full">
                          ✓ OK
                        </span>
                      )}
                    </td>

                    <td className="text-[var(--text-primary)] font-mono font-semibold text-[13px]">
                      ₹{line.netAmount.toLocaleString('en-IN')}
                    </td>

                    <td>
                      <span
                        className="font-mono text-[13px] font-semibold"
                        style={{
                          color:
                            line.marginPercent >= 30
                              ? 'var(--success)'
                              : line.marginPercent >= 15
                              ? 'var(--warning)'
                              : 'var(--danger)',
                        }}
                      >
                        {line.marginPercent}%
                      </span>
                    </td>

                    <td className="text-right">
                      <button
                        onClick={() => removeLineFromQuote(activeQuote.id, line.id)}
                        className="p-1.5 rounded-md transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color = 'var(--danger)';
                          (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--danger-soft)';
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add Product */}
            <div
              className="px-5 py-4 flex items-center gap-3"
              style={{ borderTop: '1px solid var(--border-default)' }}
            >
              <select
                value={selectedProductToAdd}
                onChange={(e) => setSelectedProductToAdd(e.target.value)}
                className="select-field flex-1 !text-xs"
              >
                <option value="">Select product or service to add...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.categoryId}) — ₹{p.listPrice.toLocaleString('en-IN')}{' '}
                    {p.isRecurring && '/mo'}
                  </option>
                ))}
              </select>

              <button
                disabled={!selectedProductToAdd}
                onClick={() => {
                  if (selectedProductToAdd) {
                    addLineToQuote(activeQuote.id, selectedProductToAdd, 1, 0);
                    setSelectedProductToAdd('');
                  }
                }}
                className="btn-secondary disabled:opacity-40"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
          </div>

          <ExplainableRiskCard
            breakdown={activeQuote.riskBreakdown}
            riskLevel={activeQuote.riskLevel}
            approvalStage={activeQuote.approvalStage}
            assignedTo={activeQuote.approvalAssignedTo}
          />
        </div>

        {/* Right: Summary & AI Copilot */}
        <div className="space-y-4">
          {/* Financial Summary */}
          <div className="surface-card p-5 space-y-3">
            <span
              className="section-heading block pb-2"
              style={{ borderBottom: '1px solid var(--border-default)' }}
            >
              Deal Summary
            </span>

            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between text-[var(--text-tertiary)]">
                <span>Total List Value:</span>
                <span className="text-[var(--text-secondary)] font-mono">
                  ₹{activeQuote.totalListAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-[var(--text-tertiary)]">
                <span>Discount Applied:</span>
                <span className="text-[var(--danger)] font-mono">
                  -₹{activeQuote.totalDiscountAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div
                className="pt-2 flex justify-between text-sm font-bold"
                style={{ borderTop: '1px solid var(--border-default)' }}
              >
                <span className="text-[var(--text-primary)]">Net Total:</span>
                <span className="text-[var(--accent-primary)] font-mono">
                  ₹{activeQuote.totalNetAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Confidence */}
            <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-default)' }}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-tertiary)]">Close Confidence:</span>
                <span className="font-mono font-bold text-[var(--accent-primary)]">
                  {activeQuote.dealConfidence}%
                </span>
              </div>
              <div
                className="mt-1.5 h-1.5 w-full rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--bg-muted)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${activeQuote.dealConfidence}%`,
                    backgroundColor: 'var(--accent-primary)',
                  }}
                />
              </div>
            </div>
          </div>

          <MarginGauge marginPercent={activeQuote.overallMarginPercent} targetMargin={30} />

          {/* AI Copilot */}
          <div
            className="surface-card p-5 space-y-3"
            style={{ borderLeft: '3px solid var(--accent-primary)' }}
          >
            <div
              className="flex items-center gap-2 pb-2"
              style={{ borderBottom: '1px solid var(--border-default)' }}
            >
              <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-primary)]">
                AI Deal Copilot
              </span>
            </div>

            {upsellRecommendations.length > 0 ? (
              <div className="space-y-3">
                {upsellRecommendations.slice(0, 2).map((rec) => (
                  <div
                    key={rec.productId}
                    className="p-3 rounded-lg space-y-2"
                    style={{
                      backgroundColor: 'var(--bg-muted)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-semibold text-[var(--text-primary)]">
                        {rec.productName}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--success)] bg-[var(--success-soft)] px-1.5 py-0.5 rounded-full">
                        +₹{rec.expectedMarginImpact.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                      {rec.reason}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        ₹{rec.netPrice.toLocaleString('en-IN')} ({rec.promoDiscount}% off)
                      </span>
                      <button
                        onClick={() =>
                          addLineToQuote(
                            activeQuote.id,
                            rec.productId,
                            1,
                            rec.promoDiscount
                          )
                        }
                        className="btn-primary !py-1 !px-2.5 !text-[11px]"
                      >
                        <Plus className="w-3 h-3" /> Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">
                All optimal upsells already attached.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
