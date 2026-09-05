import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Send,
  ShieldAlert,
  Package,
  Sparkles,
  Save,
  CheckCircle2,
  MessageSquare,
  X,
  ArrowLeft,
  RotateCcw,
  XCircle,
  FileText,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { MarginGauge } from '../design-system/MarginGauge';
import { ExplainableRiskCard } from '../design-system/ExplainableRiskCard';
import { ApprovalStepper } from '../design-system/ApprovalStepper';
import { StatusBadge } from '../design-system/StatusBadge';
import { ActivityTimeline } from '../design-system/ActivityTimeline';
import { RiskBadge } from '../design-system/RiskBadge';
import { AddressModal } from '../modals/AddressModal';
import { getUpsellRecommendations } from '../../logic/upsellEngine';
import { formatDateDisplay, calculateDaysDifference, formatDateInput } from '../../logic/dateUtils';

export const QuoteBuilderView: React.FC = () => {
  const {
    activeQuote,
    products,
    companies,
    updateQuoteLine,
    addLineToQuote,
    removeLineFromQuote,
    submitForApproval,
    sendToCustomer,
    sendRevisedQuoteToCustomer,
    managerApprove,
    financeApprove,
    returnForRevision,
    rejectQuote,
    acceptCustomerRevision,
    rejectCustomerRevision,
    updateDeliveryAddress,
    updatePromisedDeliveryDate,
    setActiveView,
    setSelectedQuoteId,
    auditLogs,
    addCustomAuditLog,
    currentUser,
    userRole,
    messages,
    sendMessage,
  } = useAppStore();

  const [selectedProductToAdd, setSelectedProductToAdd] = useState<string>('');
  const [saveSuccessToast, setSaveSuccessToast] = useState<boolean>(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);
  const [repReplyText, setRepReplyText] = useState<string>('');

  // Modal State for Return / Reject Comments
  const [modalAction, setModalAction] = useState<'return' | 'reject' | null>(null);
  const [modalComments, setModalComments] = useState<string>('');

  if (!activeQuote) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 shadow-2xs font-medium space-y-3">
        <FileText className="w-12 h-12 text-slate-400 mx-auto" />
        <p className="text-sm font-bold text-slate-800">No quotation selected.</p>
        <button
          onClick={() => {
            setSelectedQuoteId(null);
            setActiveView('builder');
          }}
          className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0176D3] text-white shadow-xs"
        >
          Return to Quotations List
        </button>
      </div>
    );
  }

  // Strict Role-based Commercial Term Editing Permission
  const canEditQuote =
    (userRole === 'sales_rep' || userRole === 'admin') &&
    (activeQuote.status === 'Draft' ||
      activeQuote.status === 'Returned for Revision' ||
      activeQuote.status === 'Customer Revision Requested');

  const upsellRecommendations = getUpsellRecommendations(activeQuote.lines, products);
  const quoteAuditLogs = auditLogs.filter((log) => log.quoteId === activeQuote.id);

  const overallDiscountPct = activeQuote.totalListAmount > 0 
    ? Math.round((activeQuote.totalDiscountAmount / activeQuote.totalListAmount) * 100)
    : 0;

  const handleSaveDraft = () => {
    addCustomAuditLog(
      activeQuote.id,
      currentUser?.name || 'Sales Representative',
      'Quotation Draft Saved',
      { lines: activeQuote.lines.length, netTotal: activeQuote.totalNetAmount }
    );
    setSaveSuccessToast(true);
    setTimeout(() => setSaveSuccessToast(false), 3000);
  };

  const handleBackToList = () => {
    setSelectedQuoteId(null);
    setActiveView('builder');
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Navigation Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBackToList}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0176D3] hover:text-blue-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> &larr; Back to Quotations
        </button>
      </div>

      {/* HEADER SECTION: Quotation Metadata & Dynamic Action Buttons */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-mono flex items-center gap-2">
                Quotation Detail: {activeQuote.id}
                <span className="font-sans text-base font-bold text-slate-700">
                  ({activeQuote.companyName})
                </span>
              </h1>
              <StatusBadge status={activeQuote.status} />
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300 font-bold">
                {activeQuote.tier} Tier Customer
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium mt-1">
              Sales Rep: <span className="text-slate-900 font-bold">{activeQuote.salesRep}</span> • Created:{' '}
              {new Date(activeQuote.createdAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })} • Price List: Standard Commercial INR (₹)
            </p>
          </div>

          {/* DYNAMIC ACTION BUTTONS (STRICT PERMISSION SCOPING) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
              className="px-3.5 py-2 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 shadow-2xs transition flex items-center gap-1.5 cursor-pointer relative"
            >
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Customer Messages</span>
              {messages.filter((m) => m.quoteId === activeQuote.id).length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold">
                  {messages.filter((m) => m.quoteId === activeQuote.id).length}
                </span>
              )}
            </button>

            {/* SALES REP ACTIONS */}
            {canEditQuote && (
              <button
                onClick={handleSaveDraft}
                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4 text-slate-600" /> Save Draft
              </button>
            )}

            {canEditQuote && (activeQuote.status === 'Draft' || activeQuote.status === 'Returned for Revision') && (
              <button
                onClick={() => submitForApproval(activeQuote.id)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0176D3] hover:bg-blue-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" /> {activeQuote.status === 'Returned for Revision' ? 'Resubmit Quotation' : 'Submit for Approval'}
              </button>
            )}

            {(userRole === 'sales_rep' || userRole === 'admin') && activeQuote.status === 'Customer Revision Requested' && (
              <button
                onClick={() => sendRevisedQuoteToCustomer(activeQuote.id)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0176D3] hover:bg-blue-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" /> Send Revised Quote to Customer
              </button>
            )}

            {/* SALES MANAGER ACTIONS */}
            {userRole === 'sales_manager' && activeQuote.status === 'Pending Manager' && (
              <>
                <button
                  onClick={() => managerApprove(activeQuote.id, 'Commercial terms approved by Sales Manager.')}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>

                <button
                  onClick={() => setModalAction('return')}
                  className="px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Return for Revision
                </button>

                <button
                  onClick={() => setModalAction('reject')}
                  className="px-3.5 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </>
            )}

            {/* FINANCE ACTIONS */}
            {userRole === 'finance' && activeQuote.status === 'Pending Finance' && (
              <>
                <button
                  onClick={() => financeApprove(activeQuote.id, 'High-risk commercial terms approved by Finance.')}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve High Risk Quote
                </button>

                <button
                  onClick={() => setModalAction('return')}
                  className="px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Return for Revision
                </button>

                <button
                  onClick={() => setModalAction('reject')}
                  className="px-3.5 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </>
            )}

            {(userRole === 'admin' || userRole === 'finance') && (activeQuote.status === 'Customer Approved' || activeQuote.status === 'Fulfillment') && (
              <button
                onClick={() => setActiveView('fulfillment')}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Package className="w-4 h-4" /> Fulfillment & Invoicing
              </button>
            )}
          </div>
        </div>

        {/* DELIVERY INFORMATION CARD (REQUIRED) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-sans shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>DELIVERY INFORMATION</span>
            </div>
            {canEditQuote && (
              <button
                onClick={() => setIsAddressModalOpen(true)}
                className="px-3 py-1 rounded-md text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 border border-blue-200 shadow-2xs transition cursor-pointer"
              >
                [Edit / Select Delivery Address]
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase mb-1">
                Promised Delivery Date
              </span>
              {canEditQuote ? (
                <div className="flex flex-col gap-1">
                  <input
                    type="date"
                    value={formatDateInput(activeQuote.promisedDeliveryDate)}
                    onChange={(e) => updatePromisedDeliveryDate(activeQuote.id, e.target.value)}
                    className="w-full font-bold font-mono text-[#0176D3] bg-blue-50 border border-blue-300 rounded px-2 py-1 outline-none focus:border-blue-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-500 font-sans">
                    Formatted: <strong className="text-slate-800">{formatDateDisplay(activeQuote.promisedDeliveryDate)}</strong>
                  </span>
                </div>
              ) : (
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {formatDateDisplay(activeQuote.promisedDeliveryDate || '15 October 2026')}
                </span>
              )}
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase mb-1">
                Customer Requested Delivery Date
              </span>
              <span className="font-bold text-blue-700 font-mono text-sm">
                {formatDateDisplay(
                  activeQuote.customerRevisionRequest?.requestedDeliveryDate ||
                  activeQuote.requestedDeliveryDate
                )}
              </span>
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase mb-1">
                Delivery Location
              </span>
              {activeQuote.deliveryAddress ? (
                <div>
                  <span className="font-bold text-slate-900 block">
                    {activeQuote.deliveryAddress.city}, {activeQuote.deliveryAddress.state} ({activeQuote.deliveryAddress.postalCode})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {activeQuote.deliveryAddress.addressLine1}
                  </span>
                </div>
              ) : (
                <span className="text-slate-400 italic">No delivery address selected</span>
              )}
            </div>
          </div>
        </div>

        {/* PROMINENT CUSTOMER REVISION REQUEST COMPARISON PANEL */}
        {(activeQuote.customerRevisionRequest || activeQuote.status === 'Customer Revision Requested') && (
          <div className="bg-amber-50/80 border-2 border-amber-300 rounded-xl p-5 space-y-5 shadow-xs">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h3 className="text-sm font-extrabold text-amber-950 uppercase tracking-wide">
                    CUSTOMER REVISION REQUEST
                  </h3>
                  <p className="text-xs text-amber-800 font-medium">
                    Status: <span className="font-bold text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">Action Required</span> • Customer: <span className="font-bold text-amber-950">{activeQuote.companyName}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons: Accept / Modify / Reject */}
              {(userRole === 'sales_rep' || userRole === 'admin') && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      acceptCustomerRevision(activeQuote.id);
                      alert(`Accepted customer revision terms for ${activeQuote.id}. Governance rules re-evaluated.`);
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" /> [Accept Requested Change]
                  </button>
                  <button
                    onClick={() => {
                      alert('Sales Rep editing mode active. Adjust discounts or quantities in the line item table below.');
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#0176D3] hover:bg-blue-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    [Modify / Negotiate]
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter reason for rejecting customer revision request:', 'Declined requested discount. Original proposal stands.');
                      if (reason !== null) {
                        rejectCustomerRevision(activeQuote.id, reason);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-rose-50 text-rose-700 border border-rose-300 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" /> [Reject Request]
                  </button>
                </div>
              )}
            </div>

            {/* Customer Message */}
            <div className="bg-white p-3.5 rounded-lg border border-amber-200 text-xs">
              <span className="text-amber-900 font-extrabold uppercase text-[11px] block mb-1">
                Customer Message:
              </span>
              <p className="text-slate-900 font-medium italic text-xs">
                "{activeQuote.customerRevisionRequest?.message || activeQuote.customerCounterNotes || 'Please review the requested discount and revised delivery schedule.'}"
              </p>
            </div>

            {/* DELIVERY DATE COMPARISON */}
            <div className="bg-white p-3.5 rounded-lg border border-amber-200 space-y-2 text-xs">
              <span className="text-amber-900 font-extrabold uppercase text-[11px] block border-b border-amber-100 pb-1">
                DELIVERY DATE COMPARISON
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                <div>
                  <span className="text-slate-500 text-[11px] font-semibold block">Promised / Revised Delivery:</span>
                  {canEditQuote ? (
                    <div className="mt-1 flex items-center gap-2">
                      <input
                        type="date"
                        value={formatDateInput(activeQuote.promisedDeliveryDate)}
                        onChange={(e) => updatePromisedDeliveryDate(activeQuote.id, e.target.value)}
                        className="font-bold text-[#0176D3] font-mono text-xs bg-blue-50 border border-blue-300 rounded px-2 py-1 outline-none focus:border-blue-600 cursor-pointer"
                      />
                      <span className="text-[11px] text-slate-700 font-sans font-bold">
                        {formatDateDisplay(activeQuote.promisedDeliveryDate)}
                      </span>
                    </div>
                  ) : (
                    <span className="font-bold text-slate-900 text-sm">
                      {formatDateDisplay(activeQuote.promisedDeliveryDate || '15 October 2026')}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] font-semibold block">Customer Requested Delivery:</span>
                  <span className="font-bold text-blue-700 text-sm">
                    {formatDateDisplay(
                      activeQuote.customerRevisionRequest?.requestedDeliveryDate ||
                      activeQuote.requestedDeliveryDate ||
                      '20 October 2026'
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] font-semibold block">Schedule Difference:</span>
                  <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded text-xs inline-block">
                    {calculateDaysDifference(
                      activeQuote.promisedDeliveryDate || '15 October 2026',
                      activeQuote.customerRevisionRequest?.requestedDeliveryDate ||
                      activeQuote.requestedDeliveryDate ||
                      '20 October 2026'
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* COMMERCIAL CHANGE REQUESTS COMPARISON TABLE */}
            <div className="bg-white p-3.5 rounded-lg border border-amber-200 space-y-2">
              <span className="text-amber-900 font-extrabold uppercase text-[11px] block border-b border-amber-100 pb-1">
                COMMERCIAL CHANGE REQUESTS (Original vs Customer Requested)
              </span>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Product / Service</th>
                      <th className="p-2.5">Original Discount</th>
                      <th className="p-2.5 text-blue-700">Customer Requested</th>
                      <th className="p-2.5 font-mono">Original Price</th>
                      <th className="p-2.5 text-rose-700">Requested Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {(activeQuote.customerRevisionRequest?.lineRequests || activeQuote.lines.map(l => ({
                      lineId: l.id,
                      productId: l.productId,
                      productName: l.productName,
                      originalDiscountPercent: l.discountPercent,
                      requestedDiscountPercent: l.counterDiscountPercent || l.discountPercent + 5,
                      unitListPrice: l.unitListPrice,
                    }))).map((reqLine) => {
                      const diff = reqLine.requestedDiscountPercent - reqLine.originalDiscountPercent;
                      return (
                        <tr key={reqLine.lineId}>
                          <td className="p-2.5 font-bold text-slate-900">{reqLine.productName}</td>
                          <td className="p-2.5 font-semibold text-slate-800">{reqLine.originalDiscountPercent}%</td>
                          <td className="p-2.5 font-bold text-blue-700 bg-blue-50/50">{reqLine.requestedDiscountPercent}%</td>
                          <td className="p-2.5 font-mono text-slate-700">₹{reqLine.unitListPrice.toLocaleString('en-IN')}</td>
                          <td className="p-2.5 font-bold text-rose-700">
                            {diff > 0 ? `+${diff} percentage points` : 'No change'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Read-Only Governance Alert for Non-Sales Reps or Locked States */}
        {!canEditQuote && (
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between font-medium">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Read-Only Mode:</strong> Commercial terms are locked for your role ({userRole.replace('_', ' ')}) or current workflow state ({activeQuote.status}).
              </span>
            </div>
          </div>
        )}

        {saveSuccessToast && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Quotation draft {activeQuote.id} saved successfully! Data persisted into central state.</span>
          </div>
        )}
      </div>

      {/* DYNAMIC WORKFLOW PROGRESS STEPPER (7-STAGE TRACKER) */}
      <ApprovalStepper status={activeQuote.status} riskLevel={activeQuote.riskLevel} />

      {/* MAIN CONTENT GRID: Line Items Table & Financial Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Quotation Line Items Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Quotation Line Items ({activeQuote.lines.length} Items)
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Governance status calculated automatically
              </span>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600 font-semibold bg-slate-50 uppercase text-[11px] tracking-wider">
                    <th className="p-3">Product / Service</th>
                    <th className="p-3 w-16 text-center">Qty</th>
                    <th className="p-3">List Price</th>
                    <th className="p-3 w-28">Discount %</th>
                    <th className="p-3">Ceiling Limit</th>
                    <th className="p-3">Governance Status</th>
                    <th className="p-3">Net Total</th>
                    <th className="p-3">Margin</th>
                    <th className="p-3 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {activeQuote.lines.map((line) => (
                    <tr key={line.id} className="hover:bg-slate-50/60 transition">
                      <td className="p-3 font-sans">
                        <span className="text-slate-900 font-bold block">
                          {line.productName}
                        </span>
                        <span className="text-[11px] text-slate-500 capitalize font-medium">
                          {line.category} {line.isRecurring && '• Monthly SaaS'}
                        </span>
                      </td>

                      {/* Qty Input (Strictly Read-only if !canEditQuote) */}
                      <td className="p-3 text-center">
                        {canEditQuote ? (
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
                            className="w-12 text-center py-1 rounded bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs font-bold outline-none focus:border-[#0176D3] focus:bg-white"
                          />
                        ) : (
                          <span className="font-mono text-xs font-bold text-slate-800">
                            {line.quantity}
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-slate-700 font-mono">
                        ₹{line.unitListPrice.toLocaleString('en-IN')}
                      </td>

                      {/* Discount % Input (Strictly Read-only if !canEditQuote) */}
                      <td className="p-3">
                        {canEditQuote ? (
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
                              className={`w-14 px-2 py-1 rounded font-mono text-xs font-bold outline-none transition ${
                                line.isOverLimit
                                  ? 'bg-rose-50 border border-rose-400 text-rose-800 font-extrabold'
                                  : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-[#0176D3] focus:bg-white'
                              }`}
                            />
                            <span className="text-slate-500 font-bold">%</span>
                          </div>
                        ) : (
                          <span className={`font-mono text-xs font-bold ${line.isOverLimit ? 'text-rose-700' : 'text-slate-800'}`}>
                            {line.discountPercent}%
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-slate-600 font-mono">
                        {line.discountCeiling}%
                      </td>

                      {/* Governance Status Indicator */}
                      <td className="p-3">
                        {line.isOverLimit ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                            OVER LIMIT (+{line.overLimitPoints}pt)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            COMPLIANT
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-slate-900 font-bold font-mono">
                        ₹{line.netAmount.toLocaleString('en-IN')}
                      </td>

                      <td className="p-3 font-mono font-bold">
                        <span
                          className={
                            line.marginPercent >= 30
                              ? 'text-emerald-700'
                              : line.marginPercent >= 15
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }
                        >
                          {line.marginPercent}%
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        {canEditQuote && (
                          <button
                            onClick={() => removeLineFromQuote(activeQuote.id, line.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Add Product Bar */}
            {canEditQuote && (
              <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-3">
                <select
                  value={selectedProductToAdd}
                  onChange={(e) => setSelectedProductToAdd(e.target.value)}
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 font-semibold outline-none focus:border-[#0176D3] cursor-pointer"
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
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white disabled:opacity-40 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>
            )}
          </div>

          {/* Governance Risk Card */}
          <ExplainableRiskCard
            breakdown={activeQuote.riskBreakdown}
            riskLevel={activeQuote.riskLevel}
            approvalStage={activeQuote.approvalStage}
            assignedTo={activeQuote.approvalAssignedTo}
          />

          {/* REVISION HISTORY TIMELINE (REQUIRED) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                REVISION HISTORY ({activeQuote.revisionHistory?.length || 1} Versions)
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Version snapshot tracking
              </span>
            </div>

            <div className="space-y-3">
              {(activeQuote.revisionHistory || [
                {
                  version: 1,
                  updatedBy: activeQuote.salesRep,
                  timestamp: activeQuote.createdAt,
                  promisedDeliveryDate: activeQuote.promisedDeliveryDate || '15 Oct 2026',
                  discountSummary: 'Initial proposal created',
                  status: activeQuote.status,
                },
              ]).map((rev) => (
                <div key={rev.version} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-sans">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 font-mono">
                      Version {rev.version}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {new Date(rev.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-slate-700 font-semibold">
                    Updated by: <span className="text-slate-900 font-bold">{rev.updatedBy}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-slate-600 font-medium text-[11px]">
                    <span>Promised Delivery: <strong>{rev.promisedDeliveryDate || '15 Oct 2026'}</strong></span>
                    {rev.requestedDeliveryDate && (
                      <span>Requested Delivery: <strong className="text-blue-700">{rev.requestedDeliveryDate}</strong></span>
                    )}
                    <span>Status: <strong>{rev.status}</strong></span>
                  </div>
                  <p className="text-slate-600 italic bg-white p-2 rounded border border-slate-200 text-[11px]">
                    {rev.discountSummary}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Trail History */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block pb-2 border-b border-slate-200">
              Activity & Audit Trail ({quoteAuditLogs.length})
            </span>
            <ActivityTimeline logs={quoteAuditLogs} />
          </div>
        </div>

        {/* Right 1 Col: Quotation Summary Card & Margin Gauge */}
        <div className="space-y-6">
          {/* QUOTATION SUMMARY CARD (PART 2 REQUIREMENT) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block pb-2 border-b border-slate-200">
              Quotation Detail Summary
            </span>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Total List Value</span>
                <span className="text-slate-900 font-bold">
                  ₹{activeQuote.totalListAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-slate-600 font-medium">
                <span>Total Discount ({overallDiscountPct}%)</span>
                <span className="text-rose-700 font-bold">
                  -₹{activeQuote.totalDiscountAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold">
                <span className="text-slate-900">Net Contract Total</span>
                <span className="text-[#0176D3]">
                  ₹{activeQuote.totalNetAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Blended Margin</span>
                  <span className={activeQuote.overallMarginPercent >= 30 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                    {activeQuote.overallMarginPercent}%
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Target Margin</span>
                  <span className="text-slate-900 font-bold">30%</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Risk Level & Score</span>
                  <RiskBadge level={activeQuote.riskLevel} score={activeQuote.blendedRiskScore} size="sm" />
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Customer Tier</span>
                  <span className="text-slate-900 font-bold">{activeQuote.tier} Tier</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Current Approval Stage</span>
                  <span className="text-[#0176D3] font-bold">{activeQuote.approvalStage}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Margin Gauge */}
          <MarginGauge marginPercent={activeQuote.overallMarginPercent} targetMargin={30} />

          {/* Upsell Recommendations */}
          <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-[#0176D3] pb-2 border-b border-blue-100">
              <Sparkles className="w-4 h-4 text-[#0176D3]" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Cross-Sell & Upsell Recommendations
              </span>
            </div>

            {upsellRecommendations.length > 0 ? (
              <div className="space-y-3">
                {upsellRecommendations.slice(0, 2).map((rec) => (
                  <div
                    key={rec.productId}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        {rec.productName}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                        +₹{rec.expectedMarginImpact.toLocaleString('en-IN')} Margin
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                      {rec.reason}
                    </p>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-600 font-semibold">
                        Promo: ₹{rec.netPrice.toLocaleString('en-IN')} ({rec.promoDiscount}% off)
                      </span>
                      {canEditQuote && (
                        <button
                          onClick={() =>
                            addLineToQuote(
                              activeQuote.id,
                              rec.productId,
                              1,
                              rec.promoDiscount
                            )
                          }
                          className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#0176D3] hover:bg-blue-700 text-white transition flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add to Quote
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-medium">
                All optimal upsell add-ons attached to this quotation.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Return / Reject Modal */}
      {modalAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4 font-sans">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              {modalAction === 'return' ? (
                <>
                  <RotateCcw className="w-4 h-4 text-amber-600" /> Reason for Revision
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-600" /> Reason for Rejection
                </>
              )}
            </h3>

            <p className="text-xs text-slate-600 font-medium">
              {modalAction === 'return'
                ? 'Provide required comments and guidance for the Sales Rep before returning.'
                : 'Provide reason for rejecting this quotation. The workflow will stop.'}
            </p>

            <textarea
              rows={3}
              value={modalComments}
              onChange={(e) => setModalComments(e.target.value)}
              placeholder={modalAction === 'return' ? 'e.g. Reduce line 1 discount to 10% ceiling limit...' : 'e.g. Unacceptable margin erosion below risk policy threshold...'}
              className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 font-medium outline-none focus:border-blue-600 focus:bg-white"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setModalAction(null);
                  setModalComments('');
                }}
                className="px-3.5 py-1.5 rounded text-xs text-slate-600 hover:text-slate-900 font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (modalAction === 'return') {
                    returnForRevision(activeQuote.id, modalComments || 'Returned for revision.');
                  } else {
                    rejectQuote(activeQuote.id, modalComments || 'Quotation rejected.', userRole as any);
                  }
                  setModalAction(null);
                  setModalComments('');
                }}
                className={`px-4 py-1.5 rounded text-xs font-bold text-white shadow-xs ${
                  modalAction === 'return' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Submit Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Negotiation Chat Drawer Modal */}
      {isChatDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-end p-4 sm:p-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full h-[620px] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-[#0176D3] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-5 h-5" />
                <div>
                  <h3 className="text-sm font-bold">
                    Negotiation Chat: {activeQuote.companyName}
                  </h3>
                  <span className="text-[11px] text-blue-100 font-mono">
                    Quote {activeQuote.id} • Live Portal Sync
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsChatDrawerOpen(false)}
                className="p-1 rounded text-white/80 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
              {messages.filter((m) => m.quoteId === activeQuote.id).length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic text-xs">
                  No messages yet for quote {activeQuote.id}. Type a message below to reach out to {activeQuote.companyName}.
                </div>
              ) : (
                messages
                  .filter((m) => m.quoteId === activeQuote.id)
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'rep' || msg.sender === 'manager' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {msg.senderName}
                        </span>
                        <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                      </div>
                      <div
                        className={`max-w-xs p-3 rounded-xl text-xs font-medium leading-relaxed shadow-2xs ${
                          msg.sender === 'rep' || msg.sender === 'manager'
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

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!repReplyText.trim()) return;
                sendMessage(
                  activeQuote.id,
                  repReplyText,
                  userRole === 'sales_manager' ? 'manager' : 'rep',
                  currentUser?.name || (userRole === 'sales_manager' ? 'M. Shah (Manager)' : 'P. Mehta (Sales Rep)')
                );
                setRepReplyText('');
              }}
              className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type reply or commercial clarification..."
                value={repReplyText}
                onChange={(e) => setRepReplyText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 outline-none focus:border-[#0176D3] focus:bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#0176D3] hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Address Selection / Add Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        initialAddress={activeQuote.deliveryAddress}
        companyName={activeQuote.companyName}
        onSave={(addr) => updateDeliveryAddress(activeQuote.id, addr)}
      />
    </div>
  );
};
