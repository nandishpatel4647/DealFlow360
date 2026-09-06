import React, { useState, useEffect } from 'react';
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
  RotateCcw,
  FileCheck,
  Printer,
  Download,
  X,
  Camera,
  CreditCard as PaymentIcon,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useAppStore } from '../../store/useAppStore';
import { StatusBadge } from '../design-system/StatusBadge';
import { Invoice } from '../../types';
import { formatDateDisplay } from '../../logic/dateUtils';

export const CustomerPortalView: React.FC = () => {
  const {
    quotes,
    companies,
    invoices,
    customerPortalToken,
    setCustomerPortalToken,
    selectedQuoteId,
    setSelectedQuoteId,
    customerCounterOffer,
    customerAcceptQuote,
    setActiveView,
    currentUser,
    logout,
    addCustomAuditLog,
    messages,
    sendMessage,
    recordPayment,
    setIsProfileModalOpen,
  } = useAppStore();

  const getTabFromHash = (): 'quotation' | 'messages' | 'invoices' | 'profile' => {
    if (typeof window === 'undefined') return 'quotation';
    const clean = window.location.hash.replace(/^#\/?/, '').split('?')[0];
    if (clean === 'portal/messages' || clean === 'messages') return 'messages';
    if (clean === 'portal/invoices' || clean === 'invoices') return 'invoices';
    if (clean === 'portal/profile' || clean === 'profile') return 'profile';
    return 'quotation';
  };

  // Top Navbar Tab State: My Quotation | Messages | Invoices | Profile with URL Hash Sync
  const [activeTab, setActiveTabState] = useState<'quotation' | 'messages' | 'invoices' | 'profile'>(getTabFromHash);

  const setActiveTab = (tab: 'quotation' | 'messages' | 'invoices' | 'profile') => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      window.history.pushState(null, '', `#/portal/${tab}`);
    }
  };

  useEffect(() => {
    const handleHashSync = () => {
      const tab = getTabFromHash();
      setActiveTabState(tab);
    };

    window.addEventListener('hashchange', handleHashSync);
    window.addEventListener('popstate', handleHashSync);

    // Synchronize initial subpage hash on mount
    if (typeof window !== 'undefined') {
      const current = getTabFromHash();
      if (!window.location.hash.startsWith('#/portal/')) {
        window.history.replaceState(null, '', `#/portal/${current}`);
      }
    }

    return () => {
      window.removeEventListener('hashchange', handleHashSync);
      window.removeEventListener('popstate', handleHashSync);
    };
  }, []);

  // Counter Offer Form State
  const [counterDiscounts, setCounterDiscounts] = useState<Record<string, number>>({});
  const [lineComments, setLineComments] = useState<Record<string, string>>({});
  const [generalNotes, setGeneralNotes] = useState<string>('');
  const [requestedDelivery, setRequestedDelivery] = useState<string>('');
  const [submittedBanner, setSubmittedBanner] = useState<string | null>(null);

  const [newMessageText, setNewMessageText] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [manualQuoteId, setManualQuoteId] = useState<string | null>(null);

  // Check if selectedQuoteId matches a quote in store
  const selectedQuoteInStore = quotes.find((q) => q.id === selectedQuoteId);

  // Resolve matchedCompany dynamically from selectedQuoteInStore, portalToken, or fallback
  const matchedCompany =
    (selectedQuoteInStore &&
      companies.find(
        (c) =>
          c.id === selectedQuoteInStore.companyId ||
          c.name.toLowerCase() === selectedQuoteInStore.companyName.toLowerCase()
      )) ||
    companies.find((c) => c.portalToken === customerPortalToken) ||
    companies[0];

  const customerQuotes = quotes.filter(
    (q) =>
      q.companyId === matchedCompany.id ||
      q.companyName.toLowerCase().includes(matchedCompany.name.toLowerCase())
  );

  const manuallySelectedQuote = manualQuoteId ? customerQuotes.find((q) => q.id === manualQuoteId) : null;
  const selectedQuoteForCustomer = customerQuotes.find((q) => q.id === selectedQuoteId) || selectedQuoteInStore;
  const pendingCustomerQuote = customerQuotes.find(
    (q) => q.status === 'Pending Customer' || q.status === 'Customer Revision Requested' || q.status === 'Pending Finance'
  );

  // Active Quote Resolution:
  // 1. Manually selected quote from dropdown
  // 2. Selected quote in store (if matching customer)
  // 3. Pending customer quote awaiting review
  // 4. Fallback to latest customer quote
  const activeQuote =
    manuallySelectedQuote ||
    selectedQuoteForCustomer ||
    pendingCustomerQuote ||
    customerQuotes[0] ||
    null;

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
    'Finance Approved',
    'Fully Approved',
    'Confirmed',
    'Fulfillment',
    'Invoiced',
    'Paid',
  ].includes(activeQuote?.status || '');

  const isPendingFinance =
    activeQuote?.status === 'Pending Finance' || activeQuote?.status === 'Customer Approved';

  const isAwaitingRep = activeQuote?.status === 'Customer Revision Requested';
  const isRejected = [
    'Rejected',
    'Rejected by Sales Manager',
    'Rejected by Finance',
  ].includes(activeQuote?.status || '');
  const isPendingManager = activeQuote?.status === 'Pending Manager';

  const lastRevision = activeQuote?.revisionHistory && activeQuote.revisionHistory.length > 0
    ? activeQuote.revisionHistory[activeQuote.revisionHistory.length - 1]
    : null;

  const wasRevisionRejectedByRep =
    activeQuote?.status === 'Pending Customer' &&
    lastRevision &&
    (lastRevision.discountSummary?.toLowerCase().includes('rejected') ||
     lastRevision.notes?.toLowerCase().includes('declined') ||
     lastRevision.notes?.toLowerCase().includes('rejected'));

  // Can the customer interact with input fields & buttons?
  const canInteract = !isConfirmed && !isPendingFinance && !isAwaitingRep && !isRejected && !isPendingManager;

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

    sendMessage(activeQuote.id, newMessageText, 'customer', `${currentUser?.name || matchedCompany.name} (${matchedCompany.name})`);
    setNewMessageText('');
  };

  const quoteMessages = messages.filter((m) => activeQuote && m.quoteId === activeQuote.id);

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
          <button
            onClick={() => setActiveView('landing')}
            title="View Public Landing Page"
            className="cursor-pointer transition hover:opacity-90 text-left"
          >
            <BrandLogo size="md" theme="dark" subtitle="Client Collaboration Portal" />
          </button>

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
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                    Quotation Summary & Commercial Review
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Review your official proposal, request commercial revisions, or confirm quotation terms.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">Status:</span>
                  <StatusBadge status={activeQuote.status} />
                </div>
              </div>

              {/* QUOTATION SUMMARY BOX */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block uppercase">Quotation</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono font-bold text-slate-900 text-sm">{activeQuote.id}</span>
                    {customerQuotes.length > 1 && (
                      <select
                        value={activeQuote.id}
                        onChange={(e) => {
                          setManualQuoteId(e.target.value);
                          setSelectedQuoteId(e.target.value);
                        }}
                        className="px-2 py-0.5 rounded bg-white border border-slate-300 font-sans font-bold text-slate-800 text-xs outline-none cursor-pointer hover:border-blue-500 shadow-2xs"
                      >
                        {customerQuotes.map((q) => (
                          <option key={q.id} value={q.id}>
                            {q.id} ({q.status})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block uppercase">Customer</span>
                  <span className="font-bold text-slate-900 text-sm">{activeQuote.companyName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block uppercase">Original Delivery Date</span>
                  <span className="font-bold text-blue-700 text-sm flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    {formatDateDisplay(activeQuote.promisedDeliveryDate || '15 October 2026')}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block uppercase">Sales Representative</span>
                  <span className="font-bold text-slate-900 text-sm">{activeQuote.salesRep}</span>
                </div>
              </div>

              {/* Delivery Location Card */}
              {activeQuote.deliveryAddress && (
                <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <Building className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Delivery Address: {activeQuote.deliveryAddress.addressLine1}, {activeQuote.deliveryAddress.city}, {activeQuote.deliveryAddress.state} ({activeQuote.deliveryAddress.postalCode})
                      </span>
                      <span className="text-slate-600 text-[11px]">
                        Contact: {activeQuote.deliveryAddress.contactName} • Phone: {activeQuote.deliveryAddress.contactPhone}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* STATUS WORKFLOW BANNERS */}

            {/* 1. SALES REP DECLINED REVISION REQUEST BANNER & CHOICES */}
            {wasRevisionRejectedByRep && (
              <div className="p-5 rounded-xl bg-rose-50 border-2 border-rose-300 text-xs text-rose-900 space-y-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-rose-950 uppercase tracking-wide">
                      Sales Representative Declined Revision Request
                    </h3>
                    <p className="text-xs text-rose-800 font-medium">
                      Sales Rep Message: <span className="font-bold text-rose-950 italic">"{lastRevision?.notes || 'Declined counter terms. Original proposal stands.'}"</span>
                    </p>
                    <p className="text-xs text-slate-700 font-medium mt-1">
                      The sales representative has maintained the current commercial terms. Please review your choices below to proceed:
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-rose-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={handleConfirmQuotation}
                    className="px-4 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-white" /> Accept Current Terms & Proceed Order
                  </button>

                  <button
                    onClick={() => {
                      setGeneralNotes('Resubmitting updated commercial revision request.');
                      const el = document.getElementById('customer-revision-form');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2.5 rounded-lg text-xs font-bold bg-[#0176D3] hover:bg-blue-700 text-white shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-white" /> Send Request Again
                  </button>
                </div>
              </div>
            )}

            {/* 1.5 PENDING CUSTOMER REVIEW BANNER */}
            {activeQuote.status === 'Pending Customer' && !wasRevisionRejectedByRep && (
              <div className="p-4 rounded-xl bg-blue-50 border-2 border-blue-300 text-xs text-blue-950 flex items-center justify-between shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-5 h-5 text-[#0176D3] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-extrabold text-blue-950 block">
                      Quotation Ready for Commercial Review
                    </span>
                    <span className="text-blue-800 font-medium block mt-0.5">
                      Please review the official commercial offer below. You may accept the quotation terms or submit a revision request.
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded bg-[#0176D3] text-white font-extrabold text-[11px] shrink-0 shadow-2xs">
                  📋 Pending Your Review
                </span>
              </div>
            )}

            {/* 2. CUSTOMER ACCEPTED — PENDING FINANCE WAIT BANNER */}
            {isPendingFinance && (
              <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-xs font-bold text-amber-900 flex items-center justify-between shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="text-sm font-extrabold text-amber-950 block">
                      Order Submitted — Awaiting Finance Manager Approval
                    </span>
                    <span className="text-amber-800 font-medium block mt-0.5">
                      Please wait, we will update you soon. Your quotation acceptance has been submitted for Finance audit & final approval.
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded bg-amber-600 text-white font-extrabold text-[11px] shrink-0 shadow-2xs">
                  ⏳ Wait, We Will Update Soon
                </span>
              </div>
            )}

            {/* 3. CONFIRMED ORDER & FULFILLMENT / INVOICED BANNER */}
            {isConfirmed && (
              <div className="p-5 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-xs text-emerald-950 space-y-2 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    <div>
                      <h3 className="text-sm font-extrabold text-emerald-950 uppercase tracking-wide">
                        Order Confirmed & Fulfillment Active!
                      </h3>
                      <p className="text-xs text-emerald-800 font-medium mt-0.5">
                        Your order has been officially confirmed by Finance. Invoice has been generated and stock allocation is complete.
                      </p>
                    </div>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-extrabold text-xs shadow-2xs">
                    ✓ Order Confirmed
                  </span>
                </div>
              </div>
            )}

            {/* 4. AWAITING SALES REP REVISION RESPONSE BANNER */}
            {isAwaitingRep && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
                  <span>
                    <strong>Revision Request Submitted!</strong> Awaiting response from Sales Representative ({activeQuote.salesRep}). Once Sales reviews your request, you will be notified.
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

            {/* ORIGINAL COMMERCIAL OFFER TABLE */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Original Commercial Offer
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Values offered by Sales Representative ({activeQuote.salesRep})
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Product / Service</th>
                      <th className="p-3.5 text-center">Quantity</th>
                      <th className="p-3.5">Original Discount</th>
                      <th className="p-3.5 font-mono">List Price</th>
                      <th className="p-3.5 text-right font-mono">Original Net Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {activeQuote.lines.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-slate-900 font-bold block">{l.productName}</span>
                            {l.isRecurring && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-purple-100 to-indigo-100 text-indigo-900 border border-indigo-200 shadow-2xs">
                                ⚡ Recurring ({l.billingPeriod || 'Monthly'})
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 capitalize">
                            {l.category} {l.isRecurring ? '• SaaS Cloud Subscription' : '• One-Time Product'}
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-bold text-slate-800">{l.quantity}</td>
                        <td className="p-3.5 font-bold text-slate-900">{l.discountPercent}%</td>
                        <td className="p-3.5 font-mono text-slate-700">₹{l.unitListPrice.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-900">
                          ₹{l.netAmount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
                <div className="space-y-1 text-xs">
                  <div className="text-slate-600">
                    Catalog Total:{' '}
                    <span className="line-through text-slate-400">
                      ₹{activeQuote.totalListAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {activeQuote.lines.some((l) => l.isRecurring) && (
                    <div className="text-indigo-700 font-bold font-sans flex items-center gap-1">
                      <span>⚡ Ongoing Recurring Fee:</span>
                      <span className="font-mono">
                        ₹
                        {activeQuote.lines
                          .filter((l) => l.isRecurring)
                          .reduce(
                            (s, l) =>
                              s +
                              (l.billingPeriod === 'yearly'
                                ? Math.round(l.netAmount / 12)
                                : l.netAmount),
                            0
                          )
                          .toLocaleString('en-IN')}
                        /month
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-base font-extrabold text-slate-900">
                  Total Contract Amount Payable:{' '}
                  <span className="text-[#0176D3]">
                    ₹{activeQuote.totalNetAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Recurring Subscription Terms Banner for Customer */}
              {activeQuote.lines.some((l) => l.isRecurring) && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 via-indigo-50/70 to-blue-50 border border-indigo-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow-2xs">
                        Included Subscription
                      </span>
                      <h4 className="text-xs font-black text-slate-900">
                        Enterprise SaaS Recurring Services & SLA Terms
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Auto-Renewal Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-indigo-100 space-y-0.5">
                      <span className="text-slate-500 text-[10px] font-bold uppercase block">
                        Subscription Plans
                      </span>
                      <span className="font-bold text-slate-900 block">
                        {activeQuote.lines
                          .filter((l) => l.isRecurring)
                          .map((l) => l.productName)
                          .join(', ')}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-indigo-100 space-y-0.5">
                      <span className="text-slate-500 text-[10px] font-bold uppercase block">
                        Billing Cadence
                      </span>
                      <span className="font-bold text-indigo-700 block">
                        Automated Monthly Invoicing (Net-30)
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-indigo-100 space-y-0.5">
                      <span className="text-slate-500 text-[10px] font-bold uppercase block">
                        Support SLA
                      </span>
                      <span className="font-bold text-emerald-700 block">
                        24/7 Priority Resolution • 99.99% Uptime
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CUSTOMER REVISION REQUEST FORM */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Customer Revision Request Form
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Propose requested discounts or a revised delivery date. This submits a formal request to your Sales Rep without altering original quote records directly.
                  </p>
                </div>
                {isAwaitingRep && (
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    Request Pending Response
                  </span>
                )}
              </div>

              {/* Requested Line Discounts */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-700 block">Requested Discount Changes (Line Item Level)</span>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                      <tr>
                        <th className="p-3">Line</th>
                        <th className="p-3">Current Offered Discount</th>
                        <th className="p-3 w-36">Requested Discount %</th>
                        <th className="p-3">Optional Line Comment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {activeQuote.lines.map((l) => {
                        const currentCounter =
                          counterDiscounts[l.id] !== undefined
                            ? counterDiscounts[l.id]
                            : l.discountPercent;

                        return (
                          <tr key={l.id}>
                            <td className="p-3 font-bold text-slate-900">{l.productName}</td>
                            <td className="p-3 text-slate-700 font-semibold">{l.discountPercent}%</td>
                            <td className="p-3">
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
                            <td className="p-3">
                              <input
                                type="text"
                                disabled={!canInteract}
                                placeholder={canInteract ? "e.g. Requesting 15% discount for long term engagement" : "Locked"}
                                value={lineComments[l.id] || ''}
                                onChange={(e) => handleLineCommentChange(l.id, e.target.value)}
                                className="w-full px-3 py-1 rounded bg-slate-50 border border-slate-300 text-slate-900 text-xs font-normal outline-none focus:border-[#0176D3] focus:bg-white disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Message & Requested Delivery Date */}
              <form id="customer-revision-form" onSubmit={handleSubmitCounterRequest} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2">
                      Reason / Message *
                    </label>
                    <textarea
                      rows={3}
                      disabled={!canInteract}
                      value={generalNotes}
                      onChange={(e) => setGeneralNotes(e.target.value)}
                      placeholder={canInteract ? "Please review the requested discount and revised delivery schedule..." : "Remarks locked for current status"}
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
                      Original Promised Delivery: <span className="font-bold text-slate-700">{formatDateDisplay(activeQuote.promisedDeliveryDate || '15 October 2026')}</span>
                    </p>
                  </div>
                </div>

                {/* Main Actions Bar: Accept Quotation & Request Revision */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 font-medium">
                    {canInteract ? (
                      hasUserChanges ? (
                        <span className="text-blue-700 font-bold">
                          Changes specified. Click <strong>[Submit Revision Request]</strong> to send to Sales Rep.
                        </span>
                      ) : (
                        <span>
                          Modify discount %, requested date, or message to submit a revision request. Or click <strong>[Accept Quotation]</strong>.
                        </span>
                      )
                    ) : (
                      <span>Quotation actions locked for current workflow status ({activeQuote.status}).</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Accept Quotation Button */}
                    <button
                      type="button"
                      onClick={handleConfirmQuotation}
                      disabled={!canInteract}
                      className={`px-5 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-2xs ${
                        canInteract
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" /> Accept Quotation
                    </button>

                    {/* Request Revision Button */}
                    <button
                      type="submit"
                      disabled={!canInteract || !hasUserChanges}
                      className={`px-5 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-2xs ${
                        canInteract && hasUserChanges
                          ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                      }`}
                    >
                      {isAwaitingRep ? (
                        <>
                          <Clock className="w-4 h-4 text-amber-500 animate-pulse" /> ⏳ Request Pending Response
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-blue-400" /> Request Revision
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
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
              <div className="bg-white rounded-xl border border-slate-200 p-6 card-3d space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-slate-200">
                  <div className="relative group shrink-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-blue-100 text-[#0176D3] flex items-center justify-center font-bold border-2 border-white shadow-md ring-2 ring-blue-500/20">
                      {currentUser?.avatarUrl ? (
                        <img
                          src={currentUser.avatarUrl}
                          alt={matchedCompany.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building className="w-8 h-8 text-[#0176D3]" />
                      )}
                    </div>
                    <button
                      onClick={() => setIsProfileModalOpen(true)}
                      title="Upload photo / avatar"
                      className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#0176D3] text-white shadow-md hover:bg-blue-700 transition cursor-pointer border-2 border-white"
                    >
                      <Camera className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-extrabold text-slate-900">{matchedCompany.name}</h2>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 badge-3d">
                        {matchedCompany.tierId} Tier
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Client ID: <code className="font-mono font-bold text-slate-800">{matchedCompany.id}</code> • Industry: {matchedCompany.industry}
                    </p>
                    <button
                      onClick={() => setIsProfileModalOpen(true)}
                      className="mt-1 text-xs font-bold text-[#0176D3] hover:text-blue-800 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="w-3 h-3" /> Change Profile Photo / Account Settings
                    </button>
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
                          onClick={() => {
                            setSelectedQuoteId(q.id);
                            setActiveTab('quotation');
                          }}
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
                  <span className="text-[11px] text-slate-500 font-medium italic">
                    * Payment settlement verified & recorded by Finance / System Administrator
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
