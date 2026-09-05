import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Send,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Package,
  Layers,
  HelpCircle,
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
      <div className="p-12 text-center text-slate-400 surface-card">
        No quotation selected. Please choose a quotation from the pipeline or dashboard.
      </div>
    );
  }

  const upsellRecommendations = getUpsellRecommendations(activeQuote.lines, products);

  return (
    <div className="space-y-6">
      {/* Top Header: Quote ID, Customer, Status, and Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
              {activeQuote.id}
              <span className="font-sans text-base font-semibold text-slate-300">
                ({activeQuote.companyName})
              </span>
            </h1>
            <StatusBadge status={activeQuote.status} />
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 font-mono">
              {activeQuote.tier} Tier Customer
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rep: <span className="text-slate-200">{activeQuote.salesRep}</span> • Created:{' '}
            {new Date(activeQuote.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setCustomerPortalToken(activeQuote.portalToken);
              setActiveView('portal');
            }}
            className="px-3.5 py-2 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open Customer Portal
          </button>

          {activeQuote.status === 'Draft' && (
            <button
              onClick={() => submitForApproval(activeQuote.id)}
              className="px-4 py-2 rounded-md text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Submit for Approval Governance
            </button>
          )}

          {activeQuote.status === 'Pending Manager' && (
            <button
              onClick={() => setActiveView('approvals')}
              className="px-4 py-2 rounded-md text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Review in Approval Center
            </button>
          )}

          {activeQuote.status === 'Fully Approved' && (
            <button
              onClick={() => setActiveView('fulfillment')}
              className="px-4 py-2 rounded-md text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" /> Proceed to Fulfillment
            </button>
          )}
        </div>
      </div>

      {/* Lifecycle Stepper */}
      <ApprovalStepper status={activeQuote.status} riskLevel={activeQuote.riskLevel} />

      {/* Main Grid: Cart Line Items & Live Intelligence Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cart Table & Product Adder */}
        <div className="lg:col-span-2 space-y-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Configured Deal Line Items ({activeQuote.lines.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Real-time inline discount governance enabled
              </span>
            </div>

            {/* Line Items Table */}
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-medium">
                    <th className="pb-2">Product / Service</th>
                    <th className="pb-2 w-16 text-center">Qty</th>
                    <th className="pb-2">List Price</th>
                    <th className="pb-2 w-28">Discount %</th>
                    <th className="pb-2">Ceiling</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Net Total</th>
                    <th className="pb-2">Margin</th>
                    <th className="pb-2 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {activeQuote.lines.map((line) => (
                    <tr key={line.id} className="group hover:bg-slate-900/50">
                      <td className="py-3 font-sans">
                        <span className="text-white font-medium block">
                          {line.productName}
                        </span>
                        <span className="text-[11px] text-slate-400 capitalize flex items-center gap-1 font-mono">
                          {line.category} {line.isRecurring && '• Monthly SaaS'}
                        </span>
                      </td>

                      {/* Qty Input */}
                      <td className="py-3 text-center">
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
                          className="w-12 text-center py-1 rounded bg-slate-900 border border-slate-700 text-white font-mono text-xs outline-none focus:border-cyan-500"
                        />
                      </td>

                      <td className="py-3 text-slate-300">
                        ₹{line.unitListPrice.toLocaleString('en-IN')}
                      </td>

                      {/* Discount % Input */}
                      <td className="py-3">
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
                            className={`w-14 px-2 py-1 rounded font-mono text-xs outline-none transition ${
                              line.isOverLimit
                                ? 'bg-rose-950/60 border border-rose-500 text-rose-300 font-bold'
                                : 'bg-slate-900 border border-slate-700 text-white focus:border-cyan-500'
                            }`}
                          />
                          <span className="text-slate-500">%</span>
                        </div>
                      </td>

                      <td className="py-3 text-slate-400">
                        {line.discountCeiling}%
                      </td>

                      {/* Over-Limit Status Indicator */}
                      <td className="py-3 font-sans">
                        {line.isOverLimit ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                            OVER (+{line.overLimitPoints}pt)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            OK
                          </span>
                        )}
                      </td>

                      <td className="py-3 text-white font-bold">
                        ₹{line.netAmount.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3">
                        <span
                          className={
                            line.marginPercent >= 30
                              ? 'text-emerald-400'
                              : line.marginPercent >= 15
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }
                        >
                          {line.marginPercent}%
                        </span>
                      </td>

                      <td className="py-3 text-right">
                        <button
                          onClick={() => removeLineFromQuote(activeQuote.id, line.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Add Product Bar */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-3">
              <select
                value={selectedProductToAdd}
                onChange={(e) => setSelectedProductToAdd(e.target.value)}
                className="flex-1 py-2 px-3 rounded-md bg-slate-900 border border-slate-700 text-xs text-slate-200 outline-none focus:border-cyan-500 cursor-pointer"
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
                className="px-4 py-2 rounded-md text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer border border-slate-700"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
          </div>

          {/* Explainable Risk Card */}
          <ExplainableRiskCard
            breakdown={activeQuote.riskBreakdown}
            riskLevel={activeQuote.riskLevel}
            approvalStage={activeQuote.approvalStage}
            assignedTo={activeQuote.approvalAssignedTo}
          />
        </div>

        {/* Right 1 Col: Summary & AI Deal Copilot */}
        <div className="space-y-4">
          {/* Quote Financial Summary */}
          <div className="surface-card p-5 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block pb-2 border-b border-slate-800">
              Commercial Deal Summary
            </span>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Total List Value:</span>
                <span className="text-slate-200">
                  ₹{activeQuote.totalListAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Discount Applied:</span>
                <span className="text-rose-400">
                  -₹{activeQuote.totalDiscountAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold">
                <span className="text-white">Net Contract Total:</span>
                <span className="text-cyan-400">
                  ₹{activeQuote.totalNetAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Deal Confidence Meter */}
            <div className="mt-4 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Deal Close Confidence:</span>
                <span className="font-mono font-bold text-cyan-400">
                  {activeQuote.dealConfidence}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${activeQuote.dealConfidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* Margin Health Gauge */}
          <MarginGauge marginPercent={activeQuote.overallMarginPercent} targetMargin={30} />

          {/* AI Deal Copilot Drawer */}
          <div className="surface-card p-5 border border-cyan-500/30 bg-cyan-950/10 space-y-3">
            <div className="flex items-center gap-2 text-cyan-300 pb-2 border-b border-cyan-900/40">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider">
                AI Deal Copilot Recommendation
              </span>
            </div>

            {upsellRecommendations.length > 0 ? (
              <div className="space-y-3">
                {upsellRecommendations.slice(0, 2).map((rec) => (
                  <div
                    key={rec.productId}
                    className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-semibold text-white">
                        {rec.productName}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        +₹{rec.expectedMarginImpact.toLocaleString('en-IN')} Margin
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {rec.reason}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400">
                        Promo: ₹{rec.netPrice.toLocaleString('en-IN')} ({rec.promoDiscount}% off)
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
                        className="px-2.5 py-1 rounded text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add to Quote
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                All optimal upsells already attached to this quotation.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
