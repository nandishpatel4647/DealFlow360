import React, { useState } from 'react';
import {
  Building,
  CheckCircle2,
  Send,
  MessageSquare,
  Calendar,
  Sparkles,
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
  } = useAppStore();

  const [counterDiscounts, setCounterDiscounts] = useState<Record<string, number>>({});
  const [customerNotes, setCustomerNotes] = useState<string>(
    'Can we do 20% on Installation & Onsite Setup to finalize today?'
  );
  const [deliveryDate, setDeliveryDate] = useState<string>('2026-09-25');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const matchedCompany =
    companies.find((c) => c.portalToken === customerPortalToken) || companies[0];
  const activeQuote =
    quotes.find((q) => q.companyId === matchedCompany.id) ||
    quotes.find((q) => q.id === 'Q-1042') ||
    quotes[0];

  const handleLineDiscountChange = (lineId: string, value: number) => {
    setCounterDiscounts((prev) => ({ ...prev, [lineId]: value }));
  };

  const handleSubmitCounter = () => {
    if (!activeQuote) return;
    customerCounterOffer(activeQuote.id, customerNotes, counterDiscounts, deliveryDate);
    setSubmittedMessage(
      'Counter-offer submitted! Terms received and auto-routed for governance re-approval.'
    );
    setTimeout(() => setSubmittedMessage(null), 6000);
  };

  const handleAcceptTerms = () => {
    if (!activeQuote) return;
    customerAcceptQuote(activeQuote.id);
    alert('Thank you! Order confirmed and proceeding to warehouse fulfillment.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Portal Banner */}
      <div
        className="p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{
          backgroundColor: 'var(--accent-primary-soft)',
          border: '1px solid var(--accent-primary-border)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'var(--accent-primary)', color: 'white' }}
          >
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--accent-primary)] block">
              Customer Portal (Secure View)
            </span>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              {matchedCompany.name}
            </h2>
          </div>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-md"
          style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <span className="text-[11px] text-[var(--text-muted)]">Client:</span>
          <select
            value={customerPortalToken || 'token_acme'}
            onChange={(e) => setCustomerPortalToken(e.target.value)}
            className="select-field !border-0 !bg-transparent !text-xs font-bold !text-[var(--accent-primary)] !p-0 !pr-6"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.portalToken}>
                {c.name} ({c.tierId} Tier)
              </option>
            ))}
          </select>
        </div>
      </div>

      {submittedMessage && (
        <div
          className="p-4 rounded-lg text-xs flex items-start gap-2 animate-slide-down"
          style={{
            backgroundColor: 'var(--success-soft)',
            border: '1px solid var(--success-border)',
            color: 'var(--success)',
          }}
        >
          <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{submittedMessage}</span>
        </div>
      )}

      {/* Quote Document */}
      <div className="surface-card p-6 md:p-8 space-y-6" style={{ boxShadow: 'var(--shadow-lg)' }}>
        {/* Header */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[var(--text-primary)] font-mono">
                {activeQuote.id}
              </span>
              <StatusBadge status={activeQuote.status} />
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Issued by: <span className="text-[var(--text-secondary)]">DealFlow360</span> •
              Rep: <span className="text-[var(--text-secondary)]">{activeQuote.salesRep}</span>
            </p>
          </div>

          <div className="text-right text-xs text-[var(--text-tertiary)] font-mono">
            <div>Date: {new Date(activeQuote.createdAt).toLocaleDateString()}</div>
            <div>Payment: Net 30 Days</div>
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Line Items & Terms
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              Adjust discount % to submit a counter-proposal
            </span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th className="text-center">Qty</th>
                <th>List Price</th>
                <th>Offered %</th>
                <th className="w-32">Your Counter %</th>
                <th className="text-right">Net Price</th>
              </tr>
            </thead>
            <tbody>
              {activeQuote.lines.map((l) => {
                const currentCounter =
                  counterDiscounts[l.id] !== undefined
                    ? counterDiscounts[l.id]
                    : l.counterDiscountPercent || l.discountPercent;

                return (
                  <tr key={l.id}>
                    <td>
                      <span className="text-[var(--text-primary)] font-medium block">{l.productName}</span>
                      <span className="text-[11px] text-[var(--text-muted)] capitalize">
                        {l.category} {l.isRecurring && '• Monthly'}
                      </span>
                    </td>
                    <td className="text-center font-mono font-bold">{l.quantity}</td>
                    <td className="font-mono text-[var(--text-secondary)]">
                      ₹{l.unitListPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="font-mono font-semibold">{l.discountPercent}%</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={currentCounter}
                          onChange={(e) =>
                            handleLineDiscountChange(l.id, parseFloat(e.target.value) || 0)
                          }
                          className="input-field !w-16 !py-1 !text-xs font-mono font-bold !text-[var(--accent-primary)]"
                        />
                        <span className="text-[var(--text-muted)]">%</span>
                      </div>
                    </td>
                    <td className="text-right font-mono font-bold text-[var(--text-primary)]">
                      ₹{l.netAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div
          className="p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
          style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-default)' }}
        >
          <div className="space-y-1">
            <span className="text-[var(--text-tertiary)] block">Delivery Target:</span>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="input-field !w-auto !py-1 !text-xs"
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
            <div className="text-base font-bold text-[var(--text-primary)]">
              Net Payable:{' '}
              <span className="text-[var(--accent-primary)]">
                ₹{activeQuote.totalNetAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[var(--accent-primary)]" /> Negotiation Notes
          </label>
          <textarea
            rows={2}
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            placeholder="Type any requests or counter proposals..."
            className="input-field !text-xs"
          />
        </div>

        {/* Actions */}
        <div
          className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ borderTop: '1px solid var(--border-default)' }}
        >
          <button
            onClick={() => setActiveView('builder')}
            className="btn-ghost !text-xs"
          >
            ← Return to Internal View
          </button>

          <div className="flex items-center gap-3">
            <button onClick={handleSubmitCounter} className="btn-primary">
              <Send className="w-4 h-4" /> Submit Counter-Offer
            </button>
            <button
              onClick={handleAcceptTerms}
              className="btn-primary"
              style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
            >
              <CheckCircle2 className="w-4 h-4" /> Accept Terms
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
