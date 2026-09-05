import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  MessageSquare,
  User,
  Calendar,
  CheckCircle2,
  Send,
  LogOut,
  Sparkles,
  Building,
  CreditCard,
  ArrowLeft,
  ChevronRight,
  Info,
  Clock,
  XCircle,
  FileCheck,
  Printer,
  Download,
  X,
  CreditCard as PaymentIcon,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { StatusBadge } from '../design-system/StatusBadge';
import { Invoice } from '../../types';

export const CustomerPortalView: React.FC = () => {
  const {
    quotes,
    companies,
    invoices,
    customerPortalToken,
    setCustomerPortalToken,
    customerCounterOffer,
    customerAcceptQuote,
    setActiveView,
    currentUser,
    logout,
    addCustomAuditLog,
    messages,
    sendMessage,
    recordPayment,
  } = useAppStore();

  // Top Navbar Tab State: My Quotation | Messages | Invoices | Profile
  const [activeTab, setActiveTab] = useState<'quotation' | 'messages' | 'invoices' | 'profile'>('quotation');

  // Counter Offer Form State
  const [counterDiscounts, setCounterDiscounts] = useState<Record<string, number>>({});
  const [lineComments, setLineComments] = useState<Record<string, string>>({});
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [requestedDelivery, setRequestedDelivery] = useState<string>('');
  const [submittedBanner, setSubmittedBanner] = useState<string | null>(null);

  const [newMessageText, setNewMessageText] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const matchedCompany =
    companies.find((c) => c.portalToken === customerPortalToken) || companies[0];
  const activeQuote =
    quotes.find((q) => q.companyId === matchedCompany.id) ||
    quotes.find((q) => q.id === 'Q-1040') ||
    quotes[0];

  // STRICT SECURITY FILTER: ONLY SHOW THIS PARTICULAR CUSTOMER'S INVOICES
  const customerInvoices = invoices.filter(
    (inv) =>
      inv.companyId === matchedCompany.id ||
      inv.companyName.toLowerCase().includes(matchedCompany.name.toLowerCase())
  );

  const totalInvoicedAmount = customerInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalPaidAmount = customerInvoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalOutstandingAmount = totalInvoicedAmount - totalPaidAmount;

  // Workflow Status Checks for Active Quote
  const isConfirmed = [
    'Customer Approved',
    'Pending Finance',
    'Finance Approved',
    'Fully Approved',
    'Confirmed',
    'Fulfillment',
    'Invoiced',
    'Paid',
  ].includes(activeQuote?.status || '');

  const isAwaitingRep = activeQuote?.status === 'Customer Revision Requested';
  const isRejected = [
    'Rejected',
    'Rejected by Sales Manager',
    'Rejected by Finance',
  ].includes(activeQuote?.status || '');
  const isPendingManager = activeQuote?.status === 'Pending Manager';

  // Can the customer interact with input fields & buttons?
  const canInteract = !isConfirmed && !isAwaitingRep && !isRejected && !isPendingManager;

  // Check if customer has made actual changes or typed comments
  const hasUserChanges =
    Boolean(generalNotes.trim()) ||
    Boolean(requestedDelivery.trim()) ||
    Object.values(lineComments).some((c) => c.trim().length > 0) ||
    Object.entries(counterDiscounts).some(([lineId, val]) => {
      const orig = activeQuote?.lines.find((l) => l.id === lineId)?.discountPercent;
      return val !== undefined && val !== orig;
    });

  const handleLineDiscountChange = (lineId: string, value: number) => {
    if (!canInteract) return;
    setCounterDiscounts((prev) => ({
      ...prev,
      [lineId]: value,
    }));
  };

  const handleLineCommentChange = (lineId: string, text: string) => {
    if (!canInteract) return;
    setLineComments((prev) => ({
      ...prev,
      [lineId]: text,
    }));
  };

  const handleSubmitCounterRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuote || !canInteract || !hasUserChanges) return;

    customerCounterOffer(
      activeQuote.id,
      generalNotes || 'Customer requested commercial revision.',
      counterDiscounts,
      requestedDelivery
    );

    addCustomAuditLog(
      activeQuote.id,
      `${matchedCompany.name} (Customer)`,
      'Submitted Revision Request & Counter Terms',
      {
        counterDiscounts,
        lineComments,
        requestedDelivery,
        notes: generalNotes,
      }
    );

    setSubmittedBanner(
      `Revision Request Submitted! Your counter-proposal has been sent to Sales Representative (${activeQuote.salesRep}). Awaiting sales response.`
    );
    setTimeout(() => setSubmittedBanner(null), 8000);
  };

  const handleConfirmQuotation = () => {
    if (!activeQuote || !canInteract) return;
    customerAcceptQuote(activeQuote.id);
    addCustomAuditLog(
      activeQuote.id,
      `${matchedCompany.name} (Customer)`,
      'Confirmed & Accepted Quotation Terms'
    );
    setSubmittedBanner(
      `Thank you! Quotation ${activeQuote.id} has been successfully confirmed and accepted. The order is now advancing to fulfillment & invoicing.`
    );
    setTimeout(() => setSubmittedBanner(null), 8000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeQuote) return;

    sendMessage(activeQuote.id, newMessageText, 'customer', `${matchedCompany.name} Procurement`);
    setNewMessageText('');
  };

  const quoteMessages = messages.filter((m) => m.quoteId === (activeQuote?.id || 'Q-1040'));

  if (!activeQuote) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-xs max-w-xl mx-auto my-12 font-sans">
        <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">No Active Customer Quotation</h2>
        <p className="text-xs text-slate-500 mt-1">Please select a valid customer portal account.</p>
        <button
          onClick={logout}
          className="mt-4 px-4 py-2 bg-[#0176D3] text-white font-bold text-xs rounded-lg shadow-xs hover:bg-blue-700 font-sans"
        >
          Return to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-900 font-sans pb-12">
      {/* Top Navbar Header Bar */}
      <header className="bg-[#0176D3] text-white shadow-md border-b border-blue-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center text-white font-bold border border-white/30">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-white font-sans">
              DealFlow<span className="text-blue-200">360</span>
            </span>
          </div>

          {/* Navigation Tabs: My Quotation | Messages | Invoices | Profile */}
          <nav className="flex items-center gap-1.5 bg-blue-800/60 p-1 rounded-xl border border-blue-600/40 text-xs font-bold">
            <button
              onClick={() => setActiveTab('quotation')}
              className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'quotation'
                  ? 'bg-slate-900 text-white font-extrabold shadow-sm'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" /> My Quotation
            </button>

            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'messages'
                  ? 'bg-slate-900 text-white font-extrabold shadow-sm border border-white/20'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" /> Messages
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            {/* INVOICES TAB FOR CUSTOMER */}
            <button
              onClick={() => setActiveTab('invoices')}
              className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'invoices'
                  ? 'bg-slate-900 text-white font-extrabold shadow-sm border border-white/20'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <FileCheck className="w-4 h-4" /> Invoices
              {customerInvoices.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-500 text-white text-[10px] font-extrabold">
                  {customerInvoices.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'profile'
                  ? 'bg-slate-900 text-white font-extrabold shadow-sm border border-white/20'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" /> Profile
            </button>
          </nav>

          {/* Account Selector & Sign Out */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 text-xs">
              <span className="text-blue-100 font-semibold">Account:</span>
              <select
                value={customerPortalToken || 'token_acme'}
                onChange={(e) => setCustomerPortalToken(e.target.value)}
                className="bg-transparent font-bold text-white outline-none cursor-pointer"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.portalToken} className="bg-slate-900 text-white">
                    {c.name} ({c.tierId})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                if (currentUser?.role !== 'customer') {
                  setActiveView('dashboard');
                } else {
                  logout();
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/30 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {currentUser?.role !== 'customer' ? (
                <>
                  <ArrowLeft className="w-4 h-4 text-blue-100" /> Exit Preview
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 text-rose-300" /> Sign Out
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {submittedBanner && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5 shadow-xs font-medium">
            <Sparkles className="w-5 h-5 text-[#0176D3] shrink-0 mt-0.5" />
            <span>{submittedBanner}</span>
          </div>
        )}

        {/* TAB 1: MY QUOTATION */}
        {activeTab === 'quotation' && (
          <div className="space-y-6">
            {/* Title & Subheader Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                    Customer Portal Negotiation Screen
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Customer reviews and negotiates the quote directly, no email needed
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Status:</span>
                  <StatusBadge status={activeQuote.status} />
                </div>
              </div>

              {/* Quote Reference Details */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 font-medium pt-1">
                <div>
                  Quotation ID: <span className="font-bold text-slate-900 font-mono">{activeQuote.id}</span> • Customer:{' '}
                  <span className="font-bold text-slate-900">{activeQuote.companyName}</span>
                </div>
                <div>
                  Assigned Sales Rep: <span className="font-bold text-slate-900">{activeQuote.salesRep}</span> • Payment Terms:{' '}
                  <span className="font-bold text-slate-900">Net 30 Days</span>
                </div>
              </div>
            </div>

            {/* STATUS WORKFLOW BANNER */}
            {isConfirmed && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Quotation Confirmed & Accepted!</strong> Your contract terms have been confirmed and the order is progressing to fulfillment & invoicing.
                  </span>
                </div>
                <span className="px-3 py-1 rounded bg-emerald-600 text-white font-extrabold text-[11px] shadow-2xs">
                  ✓ Confirmed
                </span>
              </div>
            )}

            {isAwaitingRep && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
                  <span>
                    <strong>Revision Request Submitted!</strong> Awaiting response from Sales Representative ({activeQuote.salesRep}). Once Sales updates the proposal, you will be able to review or confirm terms.
                  </span>
                </div>
                <span className="px-3 py-1 rounded bg-amber-600 text-white font-extrabold text-[11px] shadow-2xs">
                  ⏳ Awaiting Sales Rep Response
                </span>
              </div>
            )}

            {isRejected && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-900 flex items-center gap-2.5 shadow-2xs">
                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>
                  <strong>Quotation Closed:</strong> This quotation has been rejected. Please contact your sales representative.
                </span>
              </div>
            )}

            {/* Line-item Customer Comment / Feedback Table */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Line Item Commercial Review & Specific Line Feedback
                </span>
                <span className="text-[11px] text-[#0176D3] font-semibold">
                  Direct line item comments & counter discount proposals
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Line</th>
                      <th className="p-3.5">List Price</th>
                      <th className="p-3.5">Offered Disc</th>
                      <th className="p-3.5 w-32">Counter Disc %</th>
                      <th className="p-3.5">Customer Comment / Feedback</th>
                      <th className="p-3.5 text-right">Net Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {activeQuote.lines.map((l) => {
                      const currentCounter =
                        counterDiscounts[l.id] !== undefined
                          ? counterDiscounts[l.id]
                          : l.counterDiscountPercent || l.discountPercent;

                      return (
                        <tr key={l.id} className="hover:bg-slate-50/60 transition">
                          <td className="p-3.5">
                            <span className="text-slate-900 font-bold block">{l.productName}</span>
                            <span className="text-[11px] text-slate-500 capitalize">
                              {l.category} {l.isRecurring && '• Monthly SaaS'}
                            </span>
                          </td>

                          <td className="p-3.5 font-mono text-slate-700">
                            ₹{l.unitListPrice.toLocaleString('en-IN')}
                          </td>

                          <td className="p-3.5 font-semibold text-slate-800">{l.discountPercent}%</td>

                          {/* Counter Discount % Input */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="50"
                                disabled={!canInteract}
                                value={currentCounter}
                                onChange={(e) =>
                                  handleLineDiscountChange(l.id, parseFloat(e.target.value) || 0)
                                }
                                className="w-16 px-2 py-1 rounded bg-slate-50 border border-slate-300 text-slate-900 font-bold text-xs outline-none focus:border-[#0176D3] focus:bg-white disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                              />
                              <span className="text-slate-500 font-bold">%</span>
                            </div>
                          </td>

                          {/* Customer Comment / Feedback Input */}
                          <td className="p-3.5">
                            <input
                              type="text"
                              disabled={!canInteract}
                              placeholder={canInteract ? "e.g. Can this be 15% off instead of 10%?" : "Comments locked"}
                              value={lineComments[l.id] || ''}
                              onChange={(e) => handleLineCommentChange(l.id, e.target.value)}
                              className="w-full px-3 py-1.5 rounded bg-slate-50 border border-slate-300 text-slate-900 text-xs font-normal outline-none focus:border-[#0176D3] focus:bg-white placeholder-slate-400 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                            />
                          </td>

                          <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                            ₹{l.netAmount.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Counter-Offer Form: Counter Discount %, Requested Delivery Date & General Notes */}
            <form onSubmit={handleSubmitCounterRequest} className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                    Counter Discount % & Overall Commercial Remarks
                  </label>
                  <textarea
                    rows={3}
                    disabled={!canInteract}
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    placeholder={canInteract ? "Enter general remarks regarding your requested commercial revision..." : "Remarks locked for current status"}
                    className="w-full p-3 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 font-medium outline-none focus:border-[#0176D3] focus:bg-white disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                    Requested Delivery Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-3 text-[#0176D3]" />
                    <input
                      type="date"
                      disabled={!canInteract}
                      value={requestedDelivery}
                      onChange={(e) => setRequestedDelivery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 font-bold outline-none focus:border-[#0176D3] focus:bg-white disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2 font-medium">
                    Propose target delivery schedule for physical hardware dispatch and setup.
                  </p>
                </div>
              </div>

              {/* Commercial Total Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
                <div className="text-xs text-slate-600">
                  Catalog Value:{' '}
                  <span className="line-through text-slate-400">
                    ₹{activeQuote.totalListAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-base font-extrabold text-slate-900">
                  Total Contract Amount Payable:{' '}
                  <span className="text-[#0176D3]">
                    ₹{activeQuote.totalNetAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Submit Request & Confirm Quotation */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-500 font-medium">
                  {canInteract ? (
                    hasUserChanges ? (
                      <span className="text-blue-700 font-bold">
                        Changes detected. You can submit your revision request or confirm terms.
                      </span>
                    ) : (
                      <span>
                        Modify discount %, add line feedback, or enter remarks to enable <strong>Submit Request</strong>. Or click <strong>Confirm Quotation</strong> to accept terms.
                      </span>
                    )
                  ) : (
                    <span>Quotation actions locked for current workflow status ({activeQuote.status}).</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Submit Request Button */}
                  <button
                    type="submit"
                    disabled={!canInteract || !hasUserChanges}
                    title={
                      !canInteract
                        ? 'Request submission disabled for current status'
                        : !hasUserChanges
                        ? 'Modify discount %, add line feedback, or enter notes to submit a request'
                        : 'Submit revision request'
                    }
                    className={`px-6 py-3 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-2xs ${
                      canInteract && hasUserChanges
                        ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    }`}
                  >
                    {isAwaitingRep ? (
                      <>
                        <Clock className="w-4 h-4 text-amber-500 animate-pulse" /> ⏳ Awaiting Sales Rep Response...
                      </>
                    ) : isConfirmed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Quotation Confirmed
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-blue-400" /> Submit Request
                      </>
                    )}
                  </button>

                  {/* Confirm Quotation Button */}
                  <button
                    type="button"
                    disabled={!canInteract}
                    onClick={handleConfirmQuotation}
                    className={`px-6 py-3 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-xs ${
                      isConfirmed
                        ? 'bg-emerald-700 text-white cursor-not-allowed opacity-90'
                        : canInteract
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" /> {isConfirmed ? '✓ Quotation Confirmed' : 'Confirm Quotation'}
                  </button>
                </div>
              </div>
            </form>

            {/* Governance Warning Box */}
            <div className="p-4 rounded-xl bg-[#FFF4E5] border border-[#FFD599] text-xs font-bold text-[#B76E00] flex items-center gap-2.5 shadow-2xs">
              <Info className="w-4 h-4 text-[#B76E00] shrink-0" />
              <span>
                If final terms exceed thresholds, the quote automatically re-enters approval.
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: MESSAGES */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 text-[#0176D3] flex items-center justify-center font-bold">
                  <User className="w-5 h-5 text-[#0176D3]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Direct Operations Thread: {activeQuote.salesRep}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Sales Operations & Governance Team • Quote {activeQuote.id}
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Online
              </span>
            </div>

            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
              {quoteMessages.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic text-xs">
                  No messages yet. Send a message below to start negotiating directly with {activeQuote.salesRep}.
                </div>
              ) : (
                quoteMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'customer' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                    </div>
                    <div
                      className={`max-w-md p-3.5 rounded-xl text-xs font-medium leading-relaxed shadow-2xs ${
                        msg.sender === 'customer'
                          ? 'bg-[#0176D3] text-white rounded-br-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
              <input
                type="text"
                placeholder="Type your message or inquiry regarding quote terms..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1 p-3 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 outline-none focus:border-[#0176D3] focus:bg-white font-medium"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-lg bg-[#0176D3] hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: CUSTOMER INVOICES (STRICTLY SCOPED TO THIS PARTICULAR CUSTOMER ONLY) */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            {/* Header & Metrics */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans flex items-center gap-2">
                    <FileCheck className="w-6 h-6 text-[#0176D3]" /> Official Customer Tax Invoices
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Showing official tax invoices issued exclusively to <strong className="text-slate-900">{matchedCompany.name}</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#0176D3] border border-blue-200 font-bold">
                    {customerInvoices.length} Invoice{customerInvoices.length === 1 ? '' : 's'} Issued
                  </span>
                </div>
              </div>

              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Total Invoiced Amount</span>
                  <span className="text-base font-extrabold text-slate-900">
                    ₹{totalInvoicedAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-[10px] text-emerald-800 uppercase font-extrabold block">Paid Invoices</span>
                  <span className="text-base font-extrabold text-emerald-700">
                    ₹{totalPaidAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 space-y-1">
                  <span className="text-[10px] text-amber-800 uppercase font-extrabold block">Outstanding / Pending</span>
                  <span className="text-base font-extrabold text-amber-800">
                    ₹{totalOutstandingAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Invoices Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs space-y-4">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Billing Documents ({matchedCompany.name})
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Verified B2B Commercial Invoices
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Invoice ID</th>
                      <th className="p-3.5">Quotation Ref</th>
                      <th className="p-3.5">Billing Type</th>
                      <th className="p-3.5">Due Date</th>
                      <th className="p-3.5">Subtotal</th>
                      <th className="p-3.5">Tax (GST 18%)</th>
                      <th className="p-3.5">Total Amount</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {customerInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3.5 font-mono font-bold text-[#0176D3]">{inv.id}</td>
                        <td className="p-3.5 font-mono font-bold text-slate-800">{inv.quoteId}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                            {inv.invoiceType}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">{inv.dueDate}</td>
                        <td className="p-3.5 font-mono text-slate-700">₹{inv.subtotal.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 font-mono text-slate-500">₹{inv.taxAmount.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 font-mono font-bold text-slate-900">
                          ₹{inv.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5">
                          {inv.status === 'Paid' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              Paid
                            </span>
                          ) : inv.status === 'Sent' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              Sent / Due
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              {inv.status}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="px-3 py-1 rounded bg-[#0176D3] hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-2xs flex items-center gap-1 ml-auto"
                          >
                            <FileText className="w-3.5 h-3.5" /> View Invoice
                          </button>
                        </td>
                      </tr>
                    ))}

                    {customerInvoices.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                          No invoices issued yet for {matchedCompany.name}. Confirmed quotes advance to invoicing upon fulfillment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
                  <div className="w-14 h-14 rounded-xl bg-blue-100 text-[#0176D3] flex items-center justify-center font-bold border border-blue-200">
                    <Building className="w-8 h-8 text-[#0176D3]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-extrabold text-slate-900">{matchedCompany.name}</h2>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        {matchedCompany.tierId} Tier
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Client ID: <code className="font-mono font-bold text-slate-800">{matchedCompany.id}</code> • Industry: {matchedCompany.industry}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Authorized Contact Email</span>
                    <span className="text-slate-900 font-bold font-mono">{matchedCompany.contactEmail}</span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Approved Credit Ceiling</span>
                    <span className="text-emerald-700 font-bold font-mono">
                      ₹{(matchedCompany.creditLimit / 100000).toFixed(2)} Lakh
                    </span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Default Discount Limit</span>
                    <span className="text-slate-900 font-bold font-mono">15% Max Ceiling</span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Secure Portal Access Token</span>
                    <span className="text-blue-700 font-bold font-mono">{matchedCompany.portalToken}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block pb-2 border-b border-slate-200">
                  Active Client Contract Records & Commercial Proposals
                </span>

                <div className="space-y-3 text-xs font-medium">
                  {quotes
                    .filter((q) => q.companyId === matchedCompany.id)
                    .map((q) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-blue-300 transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 font-mono">{q.id}</span>
                            <StatusBadge status={q.status} />
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-1">
                            Contract Total: ₹{q.totalNetAmount.toLocaleString('en-IN')} • Rep: {q.salesRep}
                          </span>
                        </div>

                        <button
                          onClick={() => setActiveTab('quotation')}
                          className="px-3 py-1.5 rounded bg-white hover:bg-slate-100 text-[#0176D3] border border-slate-300 font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          Open Review <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block pb-2 border-b border-slate-200">
                  Billing & Physical Dispatch Address
                </span>

                <div className="space-y-2 text-xs text-slate-700 font-medium leading-relaxed">
                  <p className="font-bold text-slate-900">{matchedCompany.name}</p>
                  <p>Procurement Division, Building 4</p>
                  <p>SG Highway Technology Park</p>
                  <p>Ahmedabad, Gujarat 380054</p>
                  <p className="pt-2 text-slate-500 font-mono text-[11px]">GSTIN: 24AAACA1234F1Z9</p>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-blue-200 p-6 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-[#0176D3]">
                  <CreditCard className="w-4 h-4 text-[#0176D3]" />
                  <span className="text-xs font-bold uppercase tracking-wider">Assigned Account Manager</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  Your dedicated Enterprise Account Executive is <strong className="text-slate-900">P. Mehta</strong>. For urgent SLA escalation, contact <code className="font-mono font-bold text-blue-700">sales@dealflow360.com</code>.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* OFFICIAL CUSTOMER TAX INVOICE MODAL PREVIEW & PDF PRINT */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-6 font-sans max-h-[90vh] overflow-y-auto">
            {/* Modal Header Actions */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 no-print">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#0176D3]" />
                <h3 className="text-sm font-bold text-slate-900 font-mono">
                  Tax Invoice Document: {selectedInvoice.id}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-[#0176D3] hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Tax Invoice Paper */}
            <div className="bg-white p-6 rounded-lg border border-slate-300 space-y-6 text-xs text-slate-800">
              <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">TAX INVOICE</h2>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Original for Recipient • GST Compliance Copy
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-[#0176D3] font-mono block">
                    {selectedInvoice.id}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Date: {new Date().toLocaleDateString('en-US')}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Due Date: {selectedInvoice.dueDate}
                  </span>
                </div>
              </div>

              {/* Billed To & Seller Info */}
              <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Billed To (Customer):</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedInvoice.companyName}</p>
                  <p className="text-slate-600">Client ID: {selectedInvoice.companyId}</p>
                  <p className="text-slate-600">GSTIN: 24AAACA1234F1Z9</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Issued By (Seller):</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">DealFlow360 Enterprise India Pvt Ltd</p>
                  <p className="text-slate-600">SG Highway Tech Tower, Ahmedabad</p>
                  <p className="text-slate-600">GSTIN: 24DEF360CPQ99</p>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Description</th>
                      <th className="p-3">Type</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedInvoice.lines.map((l) => (
                      <tr key={l.id}>
                        <td className="p-3 font-sans font-bold text-slate-900">{l.description}</td>
                        <td className="p-3 text-[11px] text-slate-600 font-sans">{l.type}</td>
                        <td className="p-3 text-center font-bold">{l.quantity}</td>
                        <td className="p-3 text-right">₹{l.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-bold">₹{l.total.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary Totals */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-bold">₹{selectedInvoice.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (18%):</span>
                    <span className="font-bold">₹{selectedInvoice.taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-300 flex justify-between text-sm font-bold text-slate-900">
                    <span>Total Amount:</span>
                    <span className="text-[#0176D3]">₹{selectedInvoice.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Payment Status Banner */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-bold block">Payment Status:</span>
                  <span className={`font-bold ${selectedInvoice.status === 'Paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {selectedInvoice.status === 'Paid' ? `Paid on ${selectedInvoice.paidAt ? new Date(selectedInvoice.paidAt).toLocaleDateString() : 'Record'}` : `Outstanding (Due ${selectedInvoice.dueDate})`}
                  </span>
                </div>

                {selectedInvoice.status !== 'Paid' && (
                  <button
                    onClick={() => {
                      recordPayment(selectedInvoice.id);
                      setSelectedInvoice((prev) => prev ? { ...prev, status: 'Paid', paidAt: new Date().toISOString() } : null);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded transition shadow-2xs flex items-center gap-1 no-print"
                  >
                    <PaymentIcon className="w-3.5 h-3.5" /> Pay Now / Settle
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
