import React, { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  Building,
  Boxes,
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  PackageCheck,
  Package,
  AlertTriangle,
  FileText,
  User,
  Phone,
  Mail,
  ShieldAlert,
  Plus,
  X,
  Warehouse as WarehouseIcon,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { generateOptimalFulfillment } from '../../logic/fulfillmentEngine';
import { StatusBadge } from '../design-system/StatusBadge';
import { AddressModal } from '../modals/AddressModal';
import { FulfillmentStage, Quote } from '../../types';
import { formatDateDisplay } from '../../logic/dateUtils';

export const FulfillmentView: React.FC = () => {
  const {
    quotes,
    warehouses,
    inventory,
    products,
    invoices,
    selectedQuoteId,
    setSelectedQuoteId,
    acceptFulfillment,
    setActiveView,
    updateDeliveryAddress,
    advanceFulfillmentStage,
    userRole,
    currentUser,
    addCustomAuditLog,
    addWarehouse,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAddWarehouseOpen, setIsAddWarehouseOpen] = useState(false);
  const [manualWarehouseAssignments, setManualWarehouseAssignments] = useState<Record<string, string>>({});

  // Add Warehouse Form State
  const [whName, setWhName] = useState('');
  const [whLocation, setWhLocation] = useState('');
  const [whFreightBase, setWhFreightBase] = useState(1500);
  const [whWeightMult, setWhWeightMult] = useState(250);

  // Helper to identify non-physical lines (services, SaaS, warranties, care plans)
  const isNonPhysicalLine = (l: { category?: string; productName?: string; isRecurring?: boolean }) => {
    const cat = (l.category || '').toLowerCase();
    const name = (l.productName || '').toLowerCase();
    return (
      cat === 'services' ||
      cat === 'subscription' ||
      Boolean(l.isRecurring) ||
      name.includes('service') ||
      name.includes('plan') ||
      name.includes('care') ||
      name.includes('warranty') ||
      name.includes('setup')
    );
  };

  // Active Quote Selection
  const activeQuote =
    quotes.find((q) => q.id === selectedQuoteId) ||
    quotes.find(
      (q) =>
        q.status === 'Finance Approved' ||
        q.status === 'Fully Approved' ||
        q.status === 'Confirmed' ||
        q.status === 'Fulfillment'
    ) ||
    quotes[0];

  // Active quote backorder status check for physical hardware lines
  const activeHasPhysicalBackorder = activeQuote
    ? activeQuote.lines.some((l) => {
        if (isNonPhysicalLine(l)) return false;
        const assignedWhId = manualWarehouseAssignments[l.id] || warehouses[0]?.id;
        const invRecord = inventory.find(
          (i) =>
            i.warehouseId === assignedWhId &&
            (i.productId === l.productId || i.productId === products.find((p) => p.id === l.productId)?.sku)
        );
        const availInWh = invRecord ? Math.max(0, invRecord.quantityOnHand - invRecord.quantityReserved) : 0;
        return availInWh < l.quantity;
      })
    : false;

  // Filter Active Pending Fulfillment Queue (EXCLUDES orders whose invoice has already been generated!)
  const pendingFulfillmentQuotes = quotes.filter((q) => {
    const isAuthorized =
      q.status === 'Finance Approved' ||
      q.status === 'Fully Approved' ||
      q.status === 'Confirmed' ||
      q.status === 'Fulfillment';
    const hasInvoice = invoices.some((inv) => inv.quoteId === q.id) || q.status === 'Invoiced' || q.status === 'Paid';
    return isAuthorized && !hasInvoice;
  });

  // Completed & Invoiced Fulfillment Orders
  const invoicedFulfillmentQuotes = quotes.filter((q) => {
    return invoices.some((inv) => inv.quoteId === q.id) || q.status === 'Invoiced' || q.status === 'Paid';
  });

  // Ineligible & Blocked Quotation Orders (Commercial approval pending)
  const blockedQuotes = quotes.filter((q) => {
    const isAuthorized =
      q.status === 'Finance Approved' ||
      q.status === 'Fully Approved' ||
      q.status === 'Confirmed' ||
      q.status === 'Fulfillment';
    const hasInvoice = invoices.some((inv) => inv.quoteId === q.id) || q.status === 'Invoiced' || q.status === 'Paid';
    return !isAuthorized && !hasInvoice;
  });

  const filteredPendingFulfillment = pendingFulfillmentQuotes.filter((q) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      q.id.toLowerCase().includes(term) ||
      q.companyName.toLowerCase().includes(term) ||
      q.salesRep.toLowerCase().includes(term) ||
      (q.deliveryAddress?.city || '').toLowerCase().includes(term)
    );
  });

  // Calculate Summary KPI Counts
  const readyCount = pendingFulfillmentQuotes.filter(
    (q) => !q.fulfillmentStage || q.fulfillmentStage === 'Ready for Fulfillment'
  ).length;
  const inProgressCount = pendingFulfillmentQuotes.filter(
    (q) => q.fulfillmentStage === 'Warehouse Allocated' || q.fulfillmentStage === 'Stock Reserved'
  ).length;
  const partiallyFulfilledCount = pendingFulfillmentQuotes.filter(
    (q) => q.fulfillmentStage === 'Partially Shipped' || q.fulfillmentStage === 'Shipment Created'
  ).length;
  const backorderCount = pendingFulfillmentQuotes.filter(
    (q) =>
      q.fulfillmentStage === 'Not Ready' ||
      q.lines.some((l) => {
        if (isNonPhysicalLine(l)) return false;
        const invTotal = inventory
          .filter((i) => i.productId === l.productId || i.productId === products.find((p) => p.id === l.productId)?.sku)
          .reduce((sum, i) => sum + Math.max(0, i.quantityOnHand - i.quantityReserved), 0);
        return invTotal < l.quantity;
      })
  ).length;
  const shippedCount = invoicedFulfillmentQuotes.length;

  const existingInvoice = invoices.find((inv) => inv.quoteId === activeQuote?.id);
  const isAlreadyInvoiced =
    Boolean(existingInvoice) || activeQuote?.status === 'Invoiced' || activeQuote?.status === 'Paid' || Boolean(activeQuote?.fulfillmentLocked);

  const fulfillmentPlan = activeQuote
    ? generateOptimalFulfillment(activeQuote.id, activeQuote.lines, warehouses, inventory)
    : null;

  // Determine current stage for active quote
  const currentStage: FulfillmentStage =
    activeQuote?.fulfillmentStage || (isAlreadyInvoiced ? 'Shipped' : 'Ready for Fulfillment');

  const handleOpenDetail = (quoteId: string) => {
    setSelectedQuoteId(quoteId);
    setViewMode('detail');
  };

  // Role Access Checks
  const canEditFulfillment = userRole === 'admin' || userRole === 'finance';

  return (
    <div className="space-y-6 font-sans">
      {/* VIEWMODE 1: FULFILLMENT LIST PAGE */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#0176D3]" />
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                  Fulfillment Orders
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                  {pendingFulfillmentQuotes.length} Active Pending Orders
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Orders ready for warehouse allocation, shipment and delivery.
              </p>
            </div>

            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search quote, customer, city..."
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs font-medium text-slate-900 outline-none focus:border-[#0176D3] focus:bg-white"
              />
            </div>
          </div>

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">READY FOR FULFILLMENT</span>
              <div className="text-2xl font-extrabold text-blue-700 font-mono">{readyCount}</div>
              <span className="text-[10px] text-slate-400 font-medium">Commercial approvals clear</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">IN PROGRESS</span>
              <div className="text-2xl font-extrabold text-amber-600 font-mono">{inProgressCount}</div>
              <span className="text-[10px] text-slate-400 font-medium">Warehouse allocated/reserved</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">PARTIALLY FULFILLED</span>
              <div className="text-2xl font-extrabold text-indigo-600 font-mono">{partiallyFulfilledCount}</div>
              <span className="text-[10px] text-slate-400 font-medium">Split shipment in transit</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">BACKORDER</span>
              <div className="text-2xl font-extrabold text-rose-600 font-mono">{backorderCount}</div>
              <span className="text-[10px] text-slate-400 font-medium">Stock allocation pending restock</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 col-span-2 md:col-span-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">SHIPPED</span>
              <div className="text-2xl font-extrabold text-emerald-600 font-mono">{shippedCount}</div>
              <span className="text-[10px] text-slate-400 font-medium">Dispatched & invoiced</span>
            </div>
          </div>

          {/* FULFILLABLE ORDERS TABLE (UN-INVOICED PENDING QUEUE) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Active Pending Fulfillment Queue ({filteredPendingFulfillment.length})
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Only un-invoiced orders pending fulfillment appear here
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="p-3 font-mono">Order / Quote</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Sales Rep</th>
                    <th className="p-3 font-mono">Order Value</th>
                    <th className="p-3">Delivery Date</th>
                    <th className="p-3">Delivery Location</th>
                    <th className="p-3">Fulfillment Status</th>
                    <th className="p-3">Warehouse</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {filteredPendingFulfillment.length > 0 ? (
                    filteredPendingFulfillment.map((q) => {
                      const isBackorder = q.lines.some((l) => {
                        if (isNonPhysicalLine(l)) return false;
                        const totalStock = inventory
                          .filter((i) => i.productId === l.productId || i.productId === products.find(p => p.id === l.productId)?.sku)
                          .reduce((sum, i) => sum + Math.max(0, i.quantityOnHand - i.quantityReserved), 0);
                        return totalStock < l.quantity;
                      });

                      const statusText = q.fulfillmentStage || 'Ready for Fulfillment';
                      
                      const plan = generateOptimalFulfillment(q.id, q.lines, warehouses, inventory);
                      const whNames = Array.from(new Set(plan.allocations.filter((a) => !a.isBackorder).map((a) => a.warehouseName)));
                      const allocatedWh = whNames.length > 1
                        ? `Split (${whNames.join(' + ')})`
                        : whNames.length === 1
                        ? whNames[0]
                        : 'Ahmedabad Central Hub';

                      return (
                        <tr key={q.id} className="hover:bg-slate-50/60 transition">
                          <td className="p-3 font-mono font-bold text-slate-900">{q.id}</td>
                          <td className="p-3 font-bold text-slate-800">{q.companyName}</td>
                          <td className="p-3 text-slate-600">{q.salesRep}</td>
                          <td className="p-3 font-mono font-bold text-slate-900">
                            ₹{q.totalNetAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3 font-semibold text-blue-700 font-mono">
                            {formatDateDisplay(q.promisedDeliveryDate || '15 Oct 2026')}
                          </td>
                          <td className="p-3 text-slate-600">
                            {q.deliveryAddress ? `${q.deliveryAddress.city}, ${q.deliveryAddress.state}` : 'Ahmedabad, Gujarat'}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col gap-1">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 w-max">
                                ✓ Eligible — Finance Approved
                              </span>
                              {isBackorder ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 w-max">
                                  Partial / Backorder
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 w-max">
                                  {statusText}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-slate-800 text-[11px] font-bold">
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 inline-block">
                              🏢 {allocatedWh}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {canEditFulfillment && (
                                isBackorder ? (
                                  <button
                                    disabled
                                    title="Physical hardware inventory is backordered. Cannot ship until restocked."
                                    className="px-2.5 py-1 rounded bg-slate-200 text-slate-500 border border-slate-300 font-bold text-xs cursor-not-allowed font-sans"
                                  >
                                    [🚫 Stock Insufficient]
                                  </button>
                                ) : q.fulfillmentLocked || invoices.some((i) => i.quoteId === q.id) || q.status === 'Invoiced' || q.status === 'Paid' ? (
                                  <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold font-sans">
                                    ✓ Allocated & Invoiced
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      advanceFulfillmentStage(q.id, 'Warehouse Allocated');
                                      acceptFulfillment(q.id);
                                    }}
                                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-2xs font-sans"
                                  >
                                    [Assign & Fulfill]
                                  </button>
                                )
                              )}
                              <button
                                onClick={() => handleOpenDetail(q.id)}
                                className="px-3 py-1 rounded bg-[#0176D3] hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-2xs font-sans"
                              >
                                [Open]
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-500 font-medium">
                        No active un-invoiced orders currently in fulfillment queue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* COMPLETED & INVOICED FULFILLMENT ORDERS HISTORY */}
          {invoicedFulfillmentQuotes.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Completed & Invoiced Fulfillment Orders ({invoicedFulfillmentQuotes.length})
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Orders whose invoice has been generated are archived here
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5 font-mono">Order / Quote</th>
                      <th className="p-2.5">Customer</th>
                      <th className="p-2.5">Sales Rep</th>
                      <th className="p-2.5 font-mono">Order Value</th>
                      <th className="p-2.5">Generated Invoice</th>
                      <th className="p-2.5">Fulfillment Status</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {invoicedFulfillmentQuotes.map((q) => {
                      const inv = invoices.find((i) => i.quoteId === q.id);
                      return (
                        <tr key={q.id} className="bg-slate-50/40 hover:bg-slate-100/60 transition">
                          <td className="p-2.5 font-mono font-bold text-slate-800">{q.id}</td>
                          <td className="p-2.5 text-slate-800 font-bold">{q.companyName}</td>
                          <td className="p-2.5 text-slate-600">{q.salesRep}</td>
                          <td className="p-2.5 font-mono font-bold text-slate-900">₹{q.totalNetAmount.toLocaleString('en-IN')}</td>
                          <td className="p-2.5 font-mono text-emerald-700 font-bold">{inv?.id || 'INV-Generated'}</td>
                          <td className="p-2.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ✓ Order Invoiced & Dispatched
                            </span>
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => {
                                setSelectedQuoteId(q.id);
                                setActiveView('invoices');
                              }}
                              className="px-3 py-1 rounded bg-[#0176D3] hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer"
                            >
                              View Invoice &rarr;
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BLOCKED / INELIGIBLE QUOTATIONS SECTION (REQUIREMENT B) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Ineligible & Blocked Quotation Orders ({blockedQuotes.length})
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Fulfillment is strictly blocked until commercial governance is complete
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Quotation</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Current Status</th>
                    <th className="p-2.5">Fulfillment Eligibility Status</th>
                    <th className="p-2.5 text-rose-700">Reason Blocked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {blockedQuotes.map((q) => {
                    let blockReason = 'Commercial authorization pending.';
                    if (q.status === 'Draft') blockReason = 'Quotation is in Draft state.';
                    if (q.status === 'Pending Manager') blockReason = 'Sales Manager review pending.';
                    if (q.status === 'Pending Customer') blockReason = 'Customer sign-off pending.';
                    if (q.status === 'Customer Revision Requested') blockReason = 'Customer revision requested.';
                    if (q.status === 'Pending Finance') blockReason = 'Finance approval pending.';
                    if (q.status === 'Returned for Revision') blockReason = 'Returned for revision.';
                    if (q.status.includes('Rejected')) blockReason = 'Quotation rejected.';

                    return (
                      <tr key={q.id} className="bg-slate-50/50">
                        <td className="p-2.5 font-mono font-bold text-slate-800">{q.id}</td>
                        <td className="p-2.5 text-slate-800 font-bold">{q.companyName}</td>
                        <td className="p-2.5">
                          <StatusBadge status={q.status} />
                        </td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Fulfillment Blocked
                          </span>
                        </td>
                        <td className="p-2.5 text-rose-700 font-semibold">{blockReason}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEWMODE 2: FULFILLMENT DETAIL PAGE */}
      {viewMode === 'detail' && activeQuote && (
        <div className="space-y-6">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setViewMode('list')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0176D3] hover:text-blue-800 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> &larr; Back to Fulfillment List
            </button>
          </div>

          {/* PHYSICAL STOCK BACKORDER WARNING BANNER */}
          {activeHasPhysicalBackorder && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-start gap-3 shadow-2xs">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-extrabold text-rose-800 block text-sm">
                  🚫 SHIPMENT BLOCKED: Insufficient Physical Inventory Stock
                </span>
                <p>
                  Real-World Logistics Rule: Physical goods cannot be shipped with zero or missing warehouse stock. Non-physical items (Services, SaaS & Digital Care Plans) are auto-activated.
                </p>
                <p className="text-slate-700 font-medium">
                  👉 Go to <strong>Admin & Governance &rarr; Warehouses & Live Stock</strong> to restock inventory, or select another warehouse with available stock in the table below.
                </p>
              </div>
            </div>
          )}

          {/* TOP HEADER SUMMARY CARD */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-mono">
                    Fulfillment Detail: {activeQuote.id}
                  </h1>
                  <span className="text-base font-bold text-slate-800 font-sans">
                    ({activeQuote.companyName})
                  </span>
                  <StatusBadge status={activeQuote.status} />
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Sales Rep: <span className="text-slate-900 font-bold">{activeQuote.salesRep}</span> • Order Value:{' '}
                  <span className="font-mono font-bold text-slate-900">₹{activeQuote.totalNetAmount.toLocaleString('en-IN')}</span>
                </p>
              </div>

              {/* SEQUENTIAL FULFILLMENT ACTIONS */}
              <div className="flex flex-wrap items-center gap-2">
                {currentStage === 'Ready for Fulfillment' && canEditFulfillment && (
                  activeHasPhysicalBackorder ? (
                    <button
                      disabled
                      title="Physical hardware inventory is backordered. Restock in Admin before shipping."
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed flex items-center gap-1.5 font-sans"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600" /> [🚫 Shipping Blocked — Stock Insufficient]
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        advanceFulfillmentStage(activeQuote.id, 'Warehouse Allocated');
                        alert(`Optimal warehouse allocation generated and assigned for ${activeQuote.id}.`);
                      }}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0176D3] hover:bg-blue-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer font-sans"
                    >
                      <Boxes className="w-4 h-4" /> [Accept Suggested Allocation]
                    </button>
                  )
                )}

                {currentStage === 'Warehouse Allocated' && canEditFulfillment && (
                  activeHasPhysicalBackorder ? (
                    <button
                      disabled
                      title="Physical hardware inventory is backordered. Restock in Admin."
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed flex items-center gap-1.5 font-sans"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600" /> [🚫 Stock Insufficient — Reserve Blocked]
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        advanceFulfillmentStage(activeQuote.id, 'Stock Reserved');
                        alert(`Inventory stock successfully reserved in hub warehouses for ${activeQuote.id}.`);
                      }}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer font-sans"
                    >
                      <PackageCheck className="w-4 h-4" /> [Reserve Stock]
                    </button>
                  )
                )}

                {currentStage === 'Stock Reserved' && canEditFulfillment && (
                  activeHasPhysicalBackorder ? (
                    <button
                      disabled
                      title="Physical hardware inventory is backordered. Cannot ship."
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed flex items-center gap-1.5 font-sans"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600" /> [🚫 Stock Insufficient — Shipment Blocked]
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        advanceFulfillmentStage(activeQuote.id, 'Shipment Created');
                        alert(`Shipment SHP-${activeQuote.id.replace('Q-', '')} created and waybill dispatched.`);
                      }}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer font-sans"
                    >
                      <Truck className="w-4 h-4" /> [Create Shipment]
                    </button>
                  )
                )}

                {currentStage === 'Shipment Created' && canEditFulfillment && (
                  activeHasPhysicalBackorder ? (
                    <button
                      disabled
                      title="Physical hardware inventory is backordered."
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed flex items-center gap-1.5 font-sans"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600" /> [🚫 Stock Insufficient — Mark as Shipped Blocked]
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        advanceFulfillmentStage(activeQuote.id, 'Shipped');
                        alert(`Marked order ${activeQuote.id} as SHIPPED. Proceeding to invoice generation.`);
                      }}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer font-sans"
                    >
                      <CheckCircle2 className="w-4 h-4" /> [Mark as Shipped]
                    </button>
                  )
                )}

                {(currentStage === 'Shipped' || currentStage === 'Delivered') && (
                  <button
                    disabled
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-200 text-slate-500 border border-slate-300 cursor-not-allowed flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ✓ Order Dispatched & Shipped
                  </button>
                )}

                {/* INVOICE GENERATION BUTTON */}
                {isAlreadyInvoiced ? (
                  <button
                    onClick={() => setActiveView('invoices')}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0176D3] text-white hover:bg-blue-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    View Invoice ({existingInvoice?.id || 'INV-Generated'}) &rarr;
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const res = acceptFulfillment(activeQuote.id);
                      if (res?.isNew) {
                        alert(`Invoice ${res.invoiceId} generated successfully for Order ${activeQuote.id}! Redirecting to Invoices Page.`);
                      }
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" /> Generate Invoice
                  </button>
                )}
              </div>
            </div>

            {/* Top Quick Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium pt-1">
              <div>
                <span className="text-slate-500 text-[11px] block uppercase">Promised Delivery Date</span>
                <span className="font-bold text-blue-700 text-sm font-mono flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {formatDateDisplay(activeQuote.promisedDeliveryDate || '15 October 2026')}
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block uppercase">Fulfillment Stage</span>
                <span className="font-bold text-slate-900 text-sm">{currentStage}</span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block uppercase">Sales Representative</span>
                <span className="font-bold text-slate-900 text-sm">{activeQuote.salesRep}</span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block uppercase">Customer Tier</span>
                <span className="font-bold text-slate-900 text-sm">{activeQuote.tier} Tier</span>
              </div>
            </div>
          </div>

          {/* DEDICATED DELIVERY INFORMATION CARD (REQUIRED BY USER) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#0176D3]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  DELIVERY INFORMATION & CUSTOMER CONTACT
                </span>
              </div>
              {canEditFulfillment && (
                <button
                  onClick={() => setIsAddressModalOpen(true)}
                  className="px-3 py-1 rounded text-xs font-bold bg-blue-50 hover:bg-blue-100 text-[#0176D3] border border-blue-200 cursor-pointer transition"
                >
                  [Edit Shipping Address]
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold block uppercase">Customer & Contact</span>
                <span className="font-bold text-slate-900 block text-sm">{activeQuote.companyName}</span>
                <span className="text-slate-700 block flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {activeQuote.deliveryAddress?.contactName || 'Procurement Lead'}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold block uppercase">Phone & Email</span>
                <span className="font-bold text-slate-900 block flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {activeQuote.deliveryAddress?.contactPhone || '+91 98250 12345'}
                </span>
                <span className="text-slate-600 block text-[11px] flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {activeQuote.deliveryAddress?.contactEmail || 'procurement@customer.com'}
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold block uppercase">Billing Address</span>
                <span className="text-slate-800 block text-[11px] leading-relaxed">
                  101 Corporate Towers, SG Highway, Ahmedabad, Gujarat 380054
                </span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[11px] text-slate-500 font-semibold block uppercase">Shipping / Delivery Address</span>
                <span className="font-bold text-slate-900 block text-[11px] leading-relaxed">
                  {activeQuote.deliveryAddress
                    ? `${activeQuote.deliveryAddress.addressLine1}, ${activeQuote.deliveryAddress.city}, ${activeQuote.deliveryAddress.state} ${activeQuote.deliveryAddress.postalCode}`
                    : 'Plot 45 GIDC Industrial Estate, Naroda, Ahmedabad, Gujarat 382330'}
                </span>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT GRID: ORDER ITEMS TABLE & ALLOCATION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Order Items & Warehouse Allocation */}
            <div className="lg:col-span-2 space-y-6">
              {/* ORDER ITEMS TABLE & INVENTORY AVAILABILITY */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    ORDER ITEMS & LIVE WAREHOUSE INVENTORY CHECK
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Stock verified across network hubs
                  </span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px]">
                      <tr>
                        <th className="p-3">Product Deliverable</th>
                        <th className="p-3 text-center">Ordered Qty</th>
                        <th className="p-3 text-center">Available Stock</th>
                        <th className="p-3 text-center">Reserved Qty</th>
                        <th className="p-3 text-center">To Fulfill</th>
                        <th className="p-3">Assigned Warehouse Hub</th>
                        <th className="p-3">Warehouse Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {activeQuote.lines.map((line) => {
                        const isNonPhysical = isNonPhysicalLine(line);

                        if (isNonPhysical) {
                          return (
                            <tr key={line.id} className="hover:bg-slate-50/60 transition bg-indigo-50/20">
                              <td className="p-3">
                                <span className="font-bold text-slate-900 block">{line.productName}</span>
                                <span className="text-[11px] text-indigo-700 font-semibold capitalize">{line.category} • Service / Care Plan</span>
                              </td>
                              <td className="p-3 text-center font-bold text-slate-900 font-mono">
                                {line.quantity}
                              </td>
                              <td className="p-3 text-center font-bold text-indigo-700 font-mono text-[11px]">
                                Unlimited
                              </td>
                              <td className="p-3 text-center text-slate-400 font-mono">
                                0
                              </td>
                              <td className="p-3 text-center font-bold text-indigo-700 font-mono">
                                {line.quantity}
                              </td>
                              <td className="p-3">
                                <span className="text-xs font-semibold text-slate-600 italic">
                                  ⚡ Auto-Activated Service
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                                  ✓ Service / Digital Plan — Auto-Activated
                                </span>
                              </td>
                            </tr>
                          );
                        }

                        const assignedWhId = manualWarehouseAssignments[line.id] || warehouses[0]?.id;
                        const currentWh = warehouses.find((w) => w.id === assignedWhId) || warehouses[0];
                        const invRecord = inventory.find(
                          (i) =>
                            i.warehouseId === assignedWhId &&
                            (i.productId === line.productId || i.productId === products.find((p) => p.id === line.productId)?.sku)
                        );

                        const availInWh = invRecord ? Math.max(0, invRecord.quantityOnHand - invRecord.quantityReserved) : 0;
                        const reservedInWh = invRecord ? invRecord.quantityReserved : 0;
                        const isLineBackordered = availInWh < line.quantity;
                        const fulfillQty = Math.min(availInWh, line.quantity);
                        const lineBackorderQty = isLineBackordered ? line.quantity - availInWh : 0;

                        return (
                          <tr key={line.id} className="hover:bg-slate-50/60 transition">
                            <td className="p-3">
                              <span className="font-bold text-slate-900 block">{line.productName}</span>
                              <span className="text-[11px] text-slate-500 capitalize">{line.category} • Hardware</span>
                            </td>
                            <td className="p-3 text-center font-bold text-slate-900 font-mono">
                              {line.quantity}
                            </td>
                            <td className={`p-3 text-center font-bold font-mono ${availInWh >= line.quantity ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {availInWh}
                            </td>
                            <td className="p-3 text-center text-slate-600 font-mono">
                              {reservedInWh}
                            </td>
                            <td className="p-3 text-center font-bold text-blue-700 font-mono">
                              {fulfillQty}
                            </td>
                            <td className="p-3">
                              {canEditFulfillment ? (
                                <select
                                  value={assignedWhId}
                                  onChange={(e) => {
                                    const newWhId = e.target.value;
                                    setManualWarehouseAssignments((prev) => ({ ...prev, [line.id]: newWhId }));
                                    const whObj = warehouses.find((w) => w.id === newWhId);
                                    addCustomAuditLog(
                                      activeQuote.id,
                                      currentUser?.name || 'Finance & Ops',
                                      `Assigned Warehouse "${whObj?.name}" for ${line.productName}`
                                    );
                                  }}
                                  className="px-2.5 py-1.5 rounded border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:border-[#0176D3] outline-none cursor-pointer"
                                >
                                  {warehouses.map((w) => {
                                    const wInv = inventory.find(
                                      (i) =>
                                        i.warehouseId === w.id &&
                                        (i.productId === line.productId || i.productId === products.find((p) => p.id === line.productId)?.sku)
                                    );
                                    const wAvail = wInv ? Math.max(0, wInv.quantityOnHand - wInv.quantityReserved) : 0;
                                    return (
                                      <option key={w.id} value={w.id}>
                                        🏢 {w.name} ({wAvail} units in stock)
                                      </option>
                                    );
                                  })}
                                </select>
                              ) : (
                                <span className="px-2 py-1 rounded bg-slate-100 border border-slate-200 font-bold text-slate-800 text-xs">
                                  🏢 {currentWh?.name || 'Ahmedabad Central Hub'}
                                </span>
                              )}
                            </td>
                            <td className="p-3">
                              {isLineBackordered ? (
                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                  🚫 {availInWh} Available / {lineBackorderQty} Backordered
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  ✓ Fully In-Stock ({currentWh?.name})
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RECOMMENDED WAREHOUSE ALLOCATION CARD */}
              {fulfillmentPlan && (
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      RECOMMENDED WAREHOUSE ALLOCATION & FREIGHT SPLIT
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-700">
                      Est. Freight: ₹{fulfillmentPlan.totalFreightCost.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium">
                    {fulfillmentPlan.explanation}
                  </p>

                  <div className="space-y-3 pt-2">
                    {fulfillmentPlan.allocations.map((alloc, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-900 block">{alloc.productName}</span>
                          <span className="text-slate-500 text-[11px]">
                            Hub: <strong className="text-slate-800">{alloc.warehouseName}</strong> • Qty: <strong className="text-blue-700">{alloc.allocatedQty} units</strong>
                          </span>
                        </div>

                        <div className="text-right font-mono">
                          <span className="text-slate-900 font-bold block">
                            Freight: ₹{alloc.estimatedFreight.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Available
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 1 Col: Fulfillment Summary Sidebar */}
            <div className="space-y-6">
              {/* FULFILLMENT SUMMARY CARD */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block pb-2 border-b border-slate-200">
                  FULFILLMENT SUMMARY
                </span>

                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Order Value</span>
                    <span className="text-slate-900 font-bold">
                      ₹{activeQuote.totalNetAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Line Items</span>
                    <span className="text-slate-900 font-bold">{activeQuote.lines.length} Items</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Total Units</span>
                    <span className="text-slate-900 font-bold">
                      {activeQuote.lines.reduce((sum, l) => sum + l.quantity, 0)} Units
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Warehouses</span>
                    <span className="text-slate-900 font-bold">2 Hubs (Ahmedabad & Mumbai)</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Estimated Freight</span>
                    <span className="text-blue-700 font-bold">
                      ₹{(fulfillmentPlan?.totalFreightCost || 2900).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between font-sans">
                    <span className="text-slate-600 font-semibold">Delivery Date</span>
                    <span className="text-blue-700 font-bold">
                      {formatDateDisplay(activeQuote.promisedDeliveryDate || '15 Oct 2026')}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 font-sans space-y-1">
                    <span className="text-slate-600 font-semibold block">Delivery Location</span>
                    <span className="text-slate-900 font-bold block text-[11px]">
                      {activeQuote.deliveryAddress ? `${activeQuote.deliveryAddress.city}, ${activeQuote.deliveryAddress.state}` : 'Ahmedabad, Gujarat'}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 font-sans flex justify-between">
                    <span className="text-slate-600 font-semibold">Current Status</span>
                    <span className="text-emerald-700 font-bold">{currentStage}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Address Edit Modal */}
      {activeQuote && (
        <AddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          initialAddress={activeQuote.deliveryAddress}
          companyName={activeQuote.companyName}
          onSave={(addr) => updateDeliveryAddress(activeQuote.id, addr)}
        />
      )}

      {/* Add Warehouse Modal for Admin / Finance */}
      {isAddWarehouseOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <WarehouseIcon className="w-4 h-4 text-[#0176D3]" /> Add New Warehouse Center
              </h3>
              <button onClick={() => setIsAddWarehouseOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!whName.trim() || !whLocation.trim()) return;
                addWarehouse({
                  id: `wh-${Date.now()}`,
                  name: whName.trim(),
                  location: whLocation.trim(),
                  shippingCostBase: whFreightBase,
                  weightMultiplier: whWeightMult,
                });
                setIsAddWarehouseOpen(false);
                setWhName('');
                setWhLocation('');
                alert(`Warehouse "${whName}" added successfully! Initial catalog inventory generated.`);
              }}
              className="space-y-4 text-xs font-medium"
            >
              <div>
                <label className="block text-slate-700 font-bold mb-1">Warehouse Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delhi Regional Fulfillment Hub"
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-slate-50 border border-slate-300 text-slate-900 font-bold outline-none focus:border-[#0176D3]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">City / Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delhi NCR, India"
                  value={whLocation}
                  onChange={(e) => setWhLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-slate-50 border border-slate-300 text-slate-900 outline-none focus:border-[#0176D3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Base Shipping Cost (₹)</label>
                  <input
                    type="number"
                    value={whFreightBase}
                    onChange={(e) => setWhFreightBase(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-slate-50 border border-slate-300 text-slate-900 font-mono outline-none focus:border-[#0176D3]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Per-Unit Freight (₹)</label>
                  <input
                    type="number"
                    value={whWeightMult}
                    onChange={(e) => setWhWeightMult(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded bg-slate-50 border border-slate-300 text-slate-900 font-mono outline-none focus:border-[#0176D3]"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddWarehouseOpen(false)}
                  className="px-4 py-2 rounded bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#0176D3] text-white font-bold text-xs hover:bg-blue-700 cursor-pointer"
                >
                  Save Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
