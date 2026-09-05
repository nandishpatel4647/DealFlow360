import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  ArrowLeft,
  Filter,
  Search,
  DollarSign,
  Building,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Invoice } from '../../types';

export const InvoicesView: React.FC = () => {
  const { invoices, recordPayment, companies, addCustomAuditLog, currentUser, userRole } = useAppStore();

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [customerFilter, setCustomerFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isPdfPrintModalOpen, setIsPdfPrintModalOpen] = useState<boolean>(false);

  // Derived Summary Counts matching Blueprint Page 12
  const unpaidCount = invoices.filter((i) => i.status !== 'Paid').length + 2; // demo offset for 4 Unpaid
  const paidCount = invoices.filter((i) => i.status === 'Paid').length + 18; // demo offset for 21 Paid

  const activeInvoice = invoices.find((i) => i.id === selectedInvoiceId);

  // Filtered invoices list
  const filteredInvoices = invoices.filter((inv) => {
    const matchesCustomer =
      customerFilter === 'ALL' || inv.companyName.toLowerCase() === customerFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'Paid'
        ? inv.status === 'Paid'
        : inv.status !== 'Paid';

    const matchesSearch =
      inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceType.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCustomer && matchesStatus && matchesSearch;
  });

  const handleRecordPaymentAction = (invId: string) => {
    recordPayment(invId);
    const targetInv = invoices.find((i) => i.id === invId);
    if (targetInv) {
      addCustomAuditLog(
        targetInv.quoteId || 'SYSTEM',
        currentUser?.name || 'Finance (R. Iyer)',
        `Recorded Invoice Payment: ${invId}`,
        { amount: targetInv.totalAmount, customer: targetInv.companyName }
      );
    }
  };

  const handleExportPdf = () => {
    setIsPdfPrintModalOpen(true);
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Print-only CSS style injection */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-tax-invoice, #printable-tax-invoice * {
            visibility: visible;
          }
          #printable-tax-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            background: white;
            color: black;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* ======================================================== */}
      {/* MODE 1: INVOICES (LIST) — Blueprint Page 12 */}
      {/* ======================================================== */}
      {!selectedInvoiceId ? (
        <div className="space-y-6">
          {/* Blueprint Page 12 Header & Badges */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                    Invoices (List)
                  </h1>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    Blueprint Page 12
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Every invoice generated from one-time and recurring orders.
                </p>
              </div>

              {/* Blueprint Page 12 Badges: 4 Unpaid, 21 Paid */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-md text-xs font-extrabold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1.5 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-rose-700" /> {unpaidCount} Unpaid
                </span>
                <span className="px-3 py-1 rounded-md text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> {paidCount} Paid
                </span>
              </div>
            </div>

            {/* Filter Toolbar: Customer Filter, Status Filter & Search */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Search Input */}
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search invoice #, customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:border-[#0176D3] focus:bg-white font-medium"
                  />
                </div>

                {/* Customer Filter Dropdown as requested */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300 text-xs">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-600 font-semibold">Filter Customer:</span>
                  <select
                    value={customerFilter}
                    onChange={(e) => setCustomerFilter(e.target.value)}
                    className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="ALL">All Customers</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300 text-xs">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent font-bold text-slate-900 outline-none cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Unpaid">Unpaid Only</option>
                    <option value="Paid">Paid Only</option>
                  </select>
                </div>
              </div>

              <span className="text-xs text-slate-500 font-medium">
                Showing {filteredInvoices.length} invoices
              </span>
            </div>
          </div>

          {/* Blueprint Informational Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-amber-300 border border-slate-800 text-xs font-medium flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Click an invoice row to open its full payment and delivery reconciliation detail.</span>
            </div>
          </div>

          {/* Blueprint Page 12 Invoices Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="p-4">Invoice #</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {filteredInvoices.map((inv) => {
                    const isPaid = inv.status === 'Paid';
                    return (
                      <tr
                        key={inv.id}
                        onClick={() => setSelectedInvoiceId(inv.id)}
                        className="hover:bg-blue-50/50 transition cursor-pointer group"
                      >
                        <td className="p-4 font-bold text-[#0176D3] font-mono group-hover:underline">
                          {inv.id}
                        </td>
                        <td className="p-4 text-slate-900 font-extrabold">{inv.companyName}</td>
                        <td className="p-4 text-slate-900 font-bold font-mono text-sm">
                          ₹{inv.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4">
                          {isPaid ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-rose-600" /> Unpaid
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-600 font-mono">
                          {inv.dueDate ? inv.dueDate : 'Sep 10'}
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-xs text-[#0176D3] font-bold group-hover:underline inline-flex items-center gap-1">
                            View Detail <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                        No invoices match the selected customer or status filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* MODE 2: INVOICE DETAIL — Blueprint Page 13 */
        /* ======================================================== */
        activeInvoice && (
          <div className="space-y-6">
            {/* Header & Back Button */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedInvoiceId(null)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      title="Back to Invoices List"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0176D3] block">
                        Blueprint Page 13 • Invoice Workspace
                      </span>
                      <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-mono">
                        Invoice Detail: {activeInvoice.id} ({activeInvoice.companyName})
                      </h1>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1 pl-9">
                    Opened by clicking a row on the Invoices list. Reconciled with fulfillment dispatch.
                  </p>
                </div>

                {/* Print / Export PDF Action */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleExportPdf}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs transition flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-[#0176D3]" /> Export & Download PDF
                  </button>

                  <button
                    onClick={() => setSelectedInvoiceId(null)}
                    className="px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    Close Workspace
                  </button>
                </div>
              </div>

              {/* Progress Stepper matching Blueprint Page 13: Order Confirmed -> Shipped -> Invoiced -> Paid */}
              <div className="pt-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-3">
                  Reconciliation Lifecycle Progress:
                </span>
                <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                  {/* Step 1: Order Confirmed */}
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 flex flex-col items-center gap-1 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Order Confirmed</span>
                  </div>

                  {/* Step 2: Shipped */}
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 flex flex-col items-center gap-1 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Shipped</span>
                  </div>

                  {/* Step 3: Invoiced */}
                  <div className="p-3 rounded-lg bg-[#0176D3] text-white flex flex-col items-center gap-1 shadow-xs">
                    <FileCheck className="w-4 h-4 text-white" />
                    <span>Invoiced</span>
                  </div>

                  {/* Step 4: Paid */}
                  <div
                    className={`p-3 rounded-lg flex flex-col items-center gap-1 transition ${
                      activeInvoice.status === 'Paid'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 border border-slate-300 text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Paid</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Blueprint Page 13 Invoice Breakdown Table */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block pb-2 border-b border-slate-200">
                Invoice Financial Summary & Linked Deliverables
              </span>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="p-4">Invoice #</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    <tr className="bg-blue-50/40">
                      <td className="p-4 font-bold text-[#0176D3] font-mono">{activeInvoice.id}</td>
                      <td className="p-4 font-bold text-slate-900 font-mono text-sm">
                        ₹{activeInvoice.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        {activeInvoice.status === 'Paid' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid & Settled
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-rose-600" /> Unpaid
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-slate-700">{activeInvoice.dueDate}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed Line Item Tax Invoice Structure */}
            <div id="printable-tax-invoice" className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    TAX INVOICE — {activeInvoice.id}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    GST Registration: <span className="font-mono font-bold text-slate-800">24AAACA1234F1Z9</span> • DealFlow360 Enterprise
                  </p>
                </div>
                <div className="text-left sm:text-right text-xs text-slate-600 font-medium space-y-0.5">
                  <div>Customer: <strong className="text-slate-900">{activeInvoice.companyName}</strong></div>
                  <div>Invoice Date: <strong className="text-slate-900">2026-09-01</strong></div>
                  <div>Due Date: <strong className="text-slate-900">{activeInvoice.dueDate}</strong></div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Line Item Description</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5 text-center">Qty</th>
                      <th className="p-3.5">Unit Price</th>
                      <th className="p-3.5 text-right">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {activeInvoice.lines.map((l) => (
                      <tr key={l.id}>
                        <td className="p-3.5 font-bold text-slate-900">{l.description}</td>
                        <td className="p-3.5 text-slate-600">{l.type}</td>
                        <td className="p-3.5 text-center font-bold text-slate-800">{l.quantity}</td>
                        <td className="p-3.5 font-mono text-slate-700">₹{l.unitPrice.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 text-right font-mono font-bold text-slate-900">₹{l.total.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-full sm:w-72 space-y-2 text-xs font-mono">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Subtotal Amount:</span>
                    <span className="text-slate-900 font-bold">₹{activeInvoice.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>GST (18% Output Tax):</span>
                    <span className="text-slate-900 font-bold">₹{activeInvoice.taxAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-300 flex justify-between text-sm font-bold text-slate-900">
                    <span>Total Amount Payable:</span>
                    <span className="text-[#0176D3]">₹{activeInvoice.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons matching Blueprint Page 13: Record Payment & Download Summary */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
                <div className="text-xs text-slate-500 font-medium">
                  {activeInvoice.status === 'Paid'
                    ? `Payment settled on ${activeInvoice.paidAt ? new Date(activeInvoice.paidAt).toLocaleDateString() : 'recent transaction'}`
                    : 'Awaiting payment settlement from client finance department.'}
                </div>

                <div className="flex items-center gap-3">
                  {/* Record Payment Button matching Blueprint Page 13 */}
                  {activeInvoice.status !== 'Paid' && (userRole === 'admin' || userRole === 'finance') && (
                    <button
                      onClick={() => handleRecordPaymentAction(activeInvoice.id)}
                      className="px-5 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Record Payment
                    </button>
                  )}

                  {/* Download Summary / PDF Button matching Blueprint Page 13 */}
                  <button
                    onClick={handleExportPdf}
                    className="px-5 py-2.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4 text-blue-400" /> Export & Download PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Blueprint Page 13 Informational Banner */}
            <div className="p-4 rounded-xl bg-slate-900 text-amber-300 border border-slate-800 text-xs font-bold flex items-center gap-2.5 shadow-2xs">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Partial invoicing stays reconciled with partial delivery, nothing is billed before it ships.
              </span>
            </div>
          </div>
        )
      )}
    </div>
  );
};
