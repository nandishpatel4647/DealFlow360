import React, { useState } from 'react';
import {
  Building,
  CheckCircle2,
  Send,
  MessageSquare,
  Calendar,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
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
    setCounterDiscounts((prev) => ({
      ...prev,
      [lineId]: value,
    }));
  };

  const handleSubmitCounter = () => {
    if (!activeQuote) return;
    customerCounterOffer(activeQuote.id, customerNotes, counterDiscounts, deliveryDate);
    setSubmittedMessage(
      'Counter-offer successfully submitted! The quote terms have been received and auto-routed for commercial governance re-approval.'
    );
    setTimeout(() => setSubmittedMessage(null), 6000);
  };

  const handleAcceptTerms = () => {
    if (!activeQuote) return;
    customerAcceptQuote(activeQuote.id);
    alert('Thank you! Quotation confirmed. Your order has proceeded to warehouse fulfillment dispatch.');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* Portal Top Access Banner */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-950/60 to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-md bg-cyan-500/10 border border-cyan-500/30">
            <Building className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold block">
              Customer Collaboration Portal (Restricted Secure View)
            </span>
            <h2 className="text-sm font-semibold text-white">
              Client Session: {matchedCompany.name}
            </h2>
          </div>
        </div>

        {/* Portal Token Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-700">
          <span className="text-[11px] text-slate-400">Viewing as Client:</span>
          <select
            value={customerPortalToken || 'token_acme'}
            onChange={(e) => setCustomerPortalToken(e.target.value)}
            className="bg-transparent text-xs font-bold text-cyan-300 outline-none cursor-pointer"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.portalToken} className="bg-slate-900 text-white">
                {c.name} ({c.tierId} Tier)
              </option>
            ))}
          </select>
        </div>
      </div>

      {submittedMessage && (
        <div className="p-4 rounded-lg bg-cyan-950/40 border border-cyan-500/60 text-xs text-cyan-200 flex items-start gap-2 shadow-lg">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>{submittedMessage}</span>
        </div>
      )}

      {/* Main Quotation Document Sheet */}
      <div className="surface-card p-6 md:p-8 space-y-6 border border-slate-700 shadow-2xl">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white font-mono">{activeQuote.id}</span>
              <StatusBadge status={activeQuote.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Issued by: <span className="text-slate-200">DealFlow360 Enterprise</span> • Sales Rep:{' '}
              <span className="text-slate-200">{activeQuote.salesRep}</span>
            </p>
          </div>

          <div className="text-right font-mono text-xs text-slate-400">
            <div>Date: {new Date(activeQuote.createdAt).toLocaleDateString()}</div>
            <div>Payment Terms: Net 30 Days</div>
          </div>
        </div>

        {/* Line Items with Negotiation Inputs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Quotation Line Items & Collaborative Terms
            </span>
            <span className="text-[11px] text-cyan-400">
              You can adjust proposed discount % or add line questions below
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 font-sans">
                  <th className="pb-2">Deliverable Item</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2">List Price</th>
                  <th className="pb-2">Offered Disc %</th>
                  <th className="pb-2 w-32">Counter-Disc %</th>
                  <th className="pb-2 text-right">Net Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activeQuote.lines.map((l) => {
                  const currentCounter =
                    counterDiscounts[l.id] !== undefined
                      ? counterDiscounts[l.id]
                      : l.counterDiscountPercent || l.discountPercent;

                  return (
                    <tr key={l.id} className="py-3">
                      <td className="py-3 font-sans">
                        <span className="text-white font-medium block">{l.productName}</span>
                        <span className="text-[11px] text-slate-400 capitalize">
                          {l.category} {l.isRecurring && '• Monthly Recurring'}
                        </span>
                      </td>

                      <td className="py-3 text-center text-slate-300 font-bold">{l.quantity}</td>

                      <td className="py-3 text-slate-400">
                        ₹{l.unitListPrice.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 text-slate-300 font-semibold">{l.discountPercent}%</td>

                      {/* Counter Proposal Input */}
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={currentCounter}
                            onChange={(e) =>
                              handleLineDiscountChange(l.id, parseFloat(e.target.value) || 0)
                            }
                            className="w-16 px-2 py-1 rounded bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs outline-none focus:border-cyan-400"
                          />
                          <span className="text-slate-500">%</span>
                        </div>
                      </td>

                      <td className="py-3 text-right text-white font-bold">
                        ₹{l.netAmount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commercial Total Summary */}
        <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-sans block">Delivery Target:</span>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="bg-slate-950 px-2 py-1 rounded border border-slate-700 text-slate-200 outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="text-slate-400">
              Total Contract Amount:{' '}
              <span className="text-slate-200 line-through">
                ₹{activeQuote.totalListAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="text-base font-bold text-white">
              Net Payable Total:{' '}
              <span className="text-cyan-400">
                ₹{activeQuote.totalNetAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Negotiation Notes / Comments */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Additional Negotiation Notes & Commercial Questions
          </label>
          <textarea
            rows={2}
            value={customerNotes}
            onChange={(e) => setCustomerNotes(e.target.value)}
            placeholder="Type any specific requests or counter proposals here..."
            className="w-full p-3 rounded-md bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-cyan-500"
          />
        </div>

        {/* Customer Actions */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={() => setActiveView('builder')}
            className="text-xs text-slate-400 hover:text-slate-200 underline"
          >
            ← Return to Internal Sales Workspace
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmitCounter}
              className="px-4 py-2.5 rounded-md text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-600/20"
            >
              <Send className="w-4 h-4" /> [Submit Counter-Offer Request]
            </button>

            <button
              onClick={handleAcceptTerms}
              className="px-5 py-2.5 rounded-md text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-4 h-4" /> [Confirm & Accept Terms]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
