import React, { useState } from 'react';
import {
  Building,
  CheckCircle2,
  Send,
  MessageSquare,
  Calendar,
  Sparkles,
  ShieldCheck,
  Clock,
  AlertCircle,
  FileText,
  Truck,
  ArrowRight,
  LogOut,
  Eye,
  Check,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { StatusBadge } from '../design-system/StatusBadge';

export const CustomerPortalView: React.FC = () => {
  const {
    quotes,
    companies,
    customerPortalToken,
    setCustomerPortalToken,
    customerCounterOffer,
    customerAcceptQuote,
    setActiveView,
    activeUser,
    userRole,
    isCustomerPortalPreview,
    setIsCustomerPortalPreview,
    logout,
  } = useAppStore();

  const [counterDiscounts, setCounterDiscounts] = useState<Record<string, number>>({
    'ql-2': 20, // Pre-fill 20% on Installation service for seamless demo flow
  });
  const [customerNotes, setCustomerNotes] = useState<string>(
    'Can we do 20% on Installation & Onsite Setup to finalize today?'
  );
  const [deliveryDate, setDeliveryDate] = useState<string>('2026-09-25');
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [isSubmittingCounter, setIsSubmittingCounter] = useState(false);
  const [counterSubmittedState, setCounterSubmittedState] = useState<{
    prevDiscount: number;
    requestedDiscount: number;
    notes: string;
    submittedAt: string;
  } | null>(null);
  const [acceptanceError, setAcceptanceError] = useState<string | null>(null);

  const matchedCompany =
    companies.find((c) => c.portalToken === customerPortalToken) ||
    companies.find((c) => c.id === activeUser.companyId) ||
    companies[0];

  const activeQuote =
    quotes.find((q) => q.companyId === matchedCompany.id) ||
    quotes.find((q) => q.id === 'Q-1042') ||
    quotes[0];

  const handleLineDiscountChange = (lineId: string, value: number) => {
    setCounterDiscounts((prev) => ({ ...prev, [lineId]: value }));
  };

  const handleSubmitCounter = () => {
    if (!activeQuote) return;
    if (isCustomerPortalPreview) {
      alert('Preview Mode: Customer actions are disabled during administrative inspection.');
      return;
    }

    setIsSubmittingCounter(true);
    setTimeout(() => {
      const result = customerCounterOffer(activeQuote.id, customerNotes, counterDiscounts, deliveryDate);
      setIsSubmittingCounter(false);

      if (result.success) {
        setCounterSubmittedState({
          prevDiscount: 18,
          requestedDiscount: counterDiscounts['ql-2'] || 20,
          notes: customerNotes,
          submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      } else {
        alert(result.message || 'Unable to submit counter-offer.');
      }
    }, 400);
  };

  const handleConfirmAcceptance = () => {
    if (!activeQuote) return;
    setAcceptanceError(null);

    const result = customerAcceptQuote(activeQuote.id);
    if (!result.success) {
      setAcceptanceError(result.error || 'Failed to accept quotation.');
    } else {
      setIsAcceptModalOpen(false);
    }
  };

  const isConfirmed =
    activeQuote?.status === 'Customer Accepted' ||
    activeQuote?.status === 'Fulfillment' ||
    activeQuote?.status === 'Allocated' ||
    activeQuote?.status === 'Invoiced' ||
    activeQuote?.status === 'Paid';

  const isUnderNegotiation = activeQuote?.status === 'Under Negotiation' || !!counterSubmittedState;

  // 6 Milestones Timeline
  const milestones = [
    { id: 1, label: 'Quotation Received', done: true },
    { id: 2, label: 'Terms Reviewed', done: true },
    {
      id: 3,
      label: isUnderNegotiation ? 'Under Negotiation' : 'Commercial Review',
      done: isUnderNegotiation || isConfirmed,
      current: isUnderNegotiation && !isConfirmed,
    },
    {
      id: 4,
      label: 'Approved Terms',
      done: activeQuote?.status === 'Fully Approved' || isConfirmed,
      current: activeQuote?.status === 'Fully Approved' && !isConfirmed,
    },
    {
      id: 5,
      label: 'Warehouse Fulfillment',
      done: activeQuote?.status === 'Allocated' || activeQuote?.status === 'Invoiced' || activeQuote?.status === 'Paid',
      current: activeQuote?.status === 'Fulfillment',
    },
    {
      id: 6,
      label: 'Settled & Invoiced',
      done: activeQuote?.status === 'Paid',
      current: activeQuote?.status === 'Invoiced',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6 px-4">
      {/* Admin Preview Mode Banner */}
      {isCustomerPortalPreview && (
        <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex items-center justify-between shadow-xs animate-slide-down">
          <div className="flex items-center gap-2.5">
            <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">
                Customer Portal Preview Mode
              </span>
              <p className="text-xs opacity-90">
                Actions are disabled (Read-Only Inspection). Real buyer experience cannot be mutated from preview.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsCustomerPortalPreview(false);
              setActiveView('admin_config');
            }}
            className="btn-secondary !text-xs !py-1 !px-2.5 !border-amber-400"
          >
            Exit Preview
          </button>
        </div>
      )}

      {/* Buyer Workspace Header */}
      <div
        className="p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border embossed-border shadow-xs"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-default)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-sm">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[var(--text-primary)]">
                {matchedCompany.name}
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {matchedCompany.tierId} Tier Buyer
              </span>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Procurement Session • Contact: {matchedCompany.contactEmail}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Company switcher only for demo convenience */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs"
            style={{ backgroundColor: 'var(--bg-muted)', borderColor: 'var(--border-default)' }}
          >
            <span className="text-[var(--text-muted)] text-[11px]">Account:</span>
            <select
              value={customerPortalToken || 'token_acme'}
              onChange={(e) => setCustomerPortalToken(e.target.value)}
              className="select-field !border-0 !bg-transparent !text-xs font-bold !text-[var(--accent-primary)] !p-0 !pr-6 cursor-pointer"
            >
              {companies.map((c) => (
                <option key={c.id} value={c.portalToken}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {userRole === 'customer' ? (
            <button
              onClick={logout}
              className="btn-ghost !text-xs !py-1.5 !px-2.5 !gap-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              title="Sign Out of Customer Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveView('dashboard')}
              className="btn-ghost !text-xs !py-1.5 !px-2.5"
            >
              ← Back to App
            </button>
          )}
        </div>
      </div>

      {/* 6-Stage Milestone Progress Bar */}
      <div
        className="p-4 rounded-xl border"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-default)',
        }}
      >
        <span className="section-heading block mb-3">Order Milestones</span>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {milestones.map((m) => (
            <div
              key={m.id}
              className={`p-2.5 rounded-lg border text-center transition-all ${
                m.current
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] ring-1 ring-[var(--accent-primary)]'
                  : m.done
                  ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                  : 'border-[var(--border-default)] bg-[var(--bg-muted)] text-[var(--text-muted)] opacity-60'
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                {m.done ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Step {m.id}
                </span>
              </div>
              <p className="text-[11px] font-semibold leading-tight">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* State Transition 1: Counter-Offer Submitted Notice */}
      {isUnderNegotiation && counterSubmittedState && (
        <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 space-y-2 animate-scale-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Counter-Offer Submitted ✓ (Under Commercial Review)
              </span>
            </div>
            <span className="text-[11px] text-blue-700 dark:text-blue-300 font-mono">
              Submitted at {counterSubmittedState.submittedAt}
            </span>
          </div>

          <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
            Your counter-offer requesting <strong>{counterSubmittedState.requestedDiscount}% discount</strong> (Previously {counterSubmittedState.prevDiscount}%) has been transmitted to DealFlow360.
            Our sales and commercial finance teams have been notified and are reviewing the revised terms.
          </p>

          <div className="pt-2 border-t border-blue-200 dark:border-blue-800 flex items-center gap-2 text-[11px] text-blue-700 dark:text-blue-400">
            <span>Status:</span>
            <span className="font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 font-mono">
              UNDER NEGOTIATION (Revision {activeQuote.latestRevisionNumber})
            </span>
            <span className="ml-auto">Awaiting seller response</span>
          </div>
        </div>
      )}

      {/* State Transition 2: Terms Accepted Notice */}
      {isConfirmed && (
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 space-y-2 animate-scale-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider">
                ✓ Terms Accepted & Order Confirmed
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                Quotation {activeQuote.id} has been confirmed. Goods are allocated across Gujarat and Mumbai hubs for guaranteed 48h delivery SLA.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quotation Document */}
      <div className="surface-card p-6 md:p-8 space-y-6 embossed-border" style={{ boxShadow: 'var(--shadow-md)' }}>
        {/* Document Header */}
        <div
          className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <div>
            <span className="text-[11px] font-bold text-[var(--accent-primary)] uppercase tracking-wider block">
              Commercial Proposal
            </span>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] mt-1">
              Quotation {activeQuote.id}
              <span className="ml-2 text-xs font-mono font-normal text-[var(--text-tertiary)]">
                (Revision {activeQuote.latestRevisionNumber || 1})
              </span>
            </h2>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Prepared by: {activeQuote.salesRep} • DealFlow360 Commercial Sales
            </p>
          </div>

          <div className="flex items-center gap-2 sm:text-right">
            <StatusBadge status={activeQuote.status} />
          </div>
        </div>

        {/* Line Items Table (Clean, NO internal margins or risk scores) */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Description</th>
                <th className="text-center">Category</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Unit List</th>
                <th className="text-center">Offered Discount</th>
                <th className="text-right">Net Amount</th>
              </tr>
            </thead>
            <tbody>
              {activeQuote.lines.map((l) => {
                const currentDiscount =
                  counterDiscounts[l.id] !== undefined ? counterDiscounts[l.id] : l.discountPercent;

                return (
                  <tr key={l.id}>
                    <td>
                      <span className="font-semibold text-[var(--text-primary)] block">
                        {l.productName}
                      </span>
                      {l.isRecurring && (
                        <span className="text-[10px] text-blue-600 font-medium">
                          SaaS Subscription ({l.billingPeriod})
                        </span>
                      )}
                    </td>
                    <td className="text-center capitalize text-xs text-[var(--text-secondary)]">
                      {l.category}
                    </td>
                    <td className="text-center font-mono font-bold text-xs">
                      {l.quantity}
                    </td>
                    <td className="text-right font-mono text-xs text-[var(--text-secondary)]">
                      ₹{l.unitListPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="text-center">
                      {/* Counter-discount input or locked view */}
                      {!isConfirmed && !isUnderNegotiation ? (
                        <div className="inline-flex items-center gap-1 font-mono">
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={currentDiscount}
                            onChange={(e) =>
                              handleLineDiscountChange(l.id, parseFloat(e.target.value) || 0)
                            }
                            className="input-field !w-16 !py-1 !text-xs !text-right font-mono"
                          />
                          <span className="text-xs text-[var(--text-muted)]">%</span>
                        </div>
                      ) : (
                        <span className="font-mono font-semibold text-xs text-[var(--text-primary)]">
                          {currentDiscount}%
                        </span>
                      )}
                    </td>
                    <td className="text-right font-mono font-bold text-[var(--text-primary)] text-xs">
                      ₹{l.netAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Commercial Summary & Delivery Target */}
        <div
          className="p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
          style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-default)' }}
        >
          <div className="space-y-1">
            <span className="text-[var(--text-tertiary)] block font-medium">Target Delivery Schedule:</span>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <input
                type="date"
                disabled={isConfirmed || isUnderNegotiation}
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="input-field !w-auto !py-1 !text-xs bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="text-right space-y-1 font-mono">
            <div className="text-[var(--text-tertiary)]">
              List Total:{' '}
              <span className="line-through text-[var(--text-muted)]">
                ₹{activeQuote.totalListAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-sm font-bold text-[var(--text-primary)]">
              Total Net Payable:{' '}
              <span className="text-[var(--accent-primary)] font-mono text-base font-extrabold">
                ₹{activeQuote.totalNetAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)]">
              GST (18%) and optimal hub freight calculated at final invoicing.
            </p>
          </div>
        </div>

        {/* Negotiation Notes Input */}
        {!isConfirmed && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              Procurement Negotiation Notes
            </label>
            <textarea
              rows={2}
              disabled={isUnderNegotiation}
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="Enter specific commercial adjustments, SLA clauses, or counter-discount rationale..."
              className="input-field !text-xs"
            />
          </div>
        )}

        {/* Action Controls */}
        <div
          className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Contract Session • DealFlow360 Self-Governing Ledger</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {!isConfirmed && !isUnderNegotiation && (
              <>
                <button
                  type="button"
                  onClick={handleSubmitCounter}
                  disabled={isSubmittingCounter || isCustomerPortalPreview}
                  className="btn-secondary !py-2 !px-4 !text-xs !gap-1.5 cursor-pointer"
                  title="Submit counter-offer for commercial review"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingCounter ? 'Submitting...' : 'Submit Counter-Offer'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAcceptModalOpen(true)}
                  disabled={isCustomerPortalPreview}
                  className="btn-primary !py-2 !px-5 !text-xs !gap-1.5 !bg-emerald-600 hover:!bg-emerald-700 cursor-pointer shadow-sm"
                  title="Accept quotation terms"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Accept Terms</span>
                </button>
              </>
            )}

            {isUnderNegotiation && !isConfirmed && (
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Under Review by DealFlow360 Operations</span>
              </div>
            )}

            {isConfirmed && (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Confirmed — Proceeding to Dispatch</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accept Terms Confirmation Modal */}
      {isAcceptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="w-full max-w-md p-6 rounded-2xl modal-content space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                Confirm Quotation Acceptance?
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                You are confirming order <strong>{activeQuote.id}</strong> on behalf of <strong>{matchedCompany.name}</strong> for net payable amount of:
              </p>
              <p className="text-xl font-mono font-extrabold text-[var(--accent-primary)] pt-1">
                ₹{activeQuote.totalNetAmount.toLocaleString('en-IN')}
              </p>
            </div>

            {acceptanceError && (
              <div className="p-3 rounded-lg text-xs bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                {acceptanceError}
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAcceptModalOpen(false)}
                className="btn-secondary flex-1 justify-center !py-2 !text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAcceptance}
                className="btn-primary flex-1 justify-center !py-2 !text-xs !bg-emerald-600 hover:!bg-emerald-700 cursor-pointer shadow-sm"
              >
                Confirm Acceptance
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
