import React, { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  Building,
  Boxes,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { generateOptimalFulfillment } from '../../logic/fulfillmentEngine';
import { StatusBadge } from '../design-system/StatusBadge';

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
  } = useAppStore();

  const activeQuote = quotes.find((q) => q.id === selectedQuoteId) || quotes[0];

  const existingInvoice = invoices.find((inv) => inv.quoteId === activeQuote?.id);
  const isAlreadyInvoiced =
    Boolean(existingInvoice) || activeQuote?.status === 'Invoiced' || activeQuote?.status === 'Paid';

  const fulfillmentPlan = generateOptimalFulfillment(
    activeQuote?.id || 'Q-1042',
    activeQuote?.lines || [],
    warehouses,
    inventory
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Multi-Warehouse Fulfillment Operations
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
              Automated Freight Splitter
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Optimizes order stock allocation across Gujarat and Mumbai hubs to minimize split shipments and freight cost.
          </p>
        </div>

        {/* Selected Quote Indicator */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
          <span className="text-xs text-slate-600 font-semibold">Fulfill Quote:</span>
          <select
            value={activeQuote?.id}
            onChange={(e) => setSelectedQuoteId(e.target.value)}
            className="bg-transparent text-xs font-mono font-bold text-blue-700 outline-none cursor-pointer"
          >
            {quotes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.id} — {q.companyName} ({q.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Warehouse Inventory Stock Level Matrix */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Live Network Warehouse Inventory (On-Hand & Reserved)
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 font-medium">
            3 Logistics Hubs Synchronized
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses.map((wh) => {
            const whStock = inventory.filter((inv) => inv.warehouseId === wh.id);
            const totalUnits = whStock.reduce((sum, item) => sum + item.quantityOnHand, 0);

            return (
              <div
                key={wh.id}
                className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-blue-600" /> {wh.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">{wh.location}</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                    {totalUnits} Units
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs font-mono">
                  {whStock.map((item) => {
                    const prod = products.find((p) => p.id === item.productId);
                    return (
                      <div key={item.id} className="flex justify-between text-slate-700">
                        <span className="font-sans text-[11px] text-slate-600 font-medium truncate max-w-[160px]">
                          {prod?.name || item.productId}
                        </span>
                        <span className="font-bold">
                          {item.quantityOnHand} on hand{' '}
                          <span className="text-slate-400 font-normal">
                            ({item.quantityReserved} res)
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 font-medium flex justify-between font-mono">
                  <span>Base Freight: ₹{wh.shippingCostBase}</span>
                  <span>Rate: ₹{wh.weightMultiplier}/unit</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Split Engine Execution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Allocation Matrix */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                  Optimal Warehouse Split Recommendation for {activeQuote?.id}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Customer: <span className="text-slate-900 font-bold">{activeQuote?.companyName}</span> • Terms:{' '}
                  {activeQuote?.tier} Tier
                </span>
              </div>
              <StatusBadge status={activeQuote?.status || 'Draft'} />
            </div>

            {/* Allocation Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-sans font-semibold bg-slate-50">
                    <th className="p-2.5">Product Item</th>
                    <th className="p-2.5">Allocated Warehouse</th>
                    <th className="p-2.5 text-center">Allocated Qty</th>
                    <th className="p-2.5">Estimated Freight</th>
                    <th className="p-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {fulfillmentPlan.allocations.map((alloc) => (
                    <tr key={alloc.id} className="py-3">
                      <td className="p-2.5 font-sans text-slate-900 font-bold">
                        {alloc.productName}
                      </td>
                      <td className="p-2.5 text-blue-700 font-sans font-bold">
                        {alloc.warehouseName}
                      </td>
                      <td className="p-2.5 text-center font-bold text-slate-900 text-sm">
                        {alloc.allocatedQty} units
                      </td>
                      <td className="p-2.5 text-slate-700">
                        ₹{alloc.estimatedFreight.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2.5 font-sans">
                        {alloc.isBackorder ? (
                          <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            Backorder Pending
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Available in Depot
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Explanation Note */}
            <div className="p-3 rounded-md bg-blue-50 border border-blue-200 text-xs text-blue-900 font-medium flex items-start gap-2">
              <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>{fulfillmentPlan.explanation}</span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-600 font-semibold">
                Total Estimated Freight:{' '}
                <span className="font-mono font-bold text-slate-900 text-sm">
                  ₹{fulfillmentPlan.totalFreightCost.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {isAlreadyInvoiced ? (
                  <>
                    <button
                      disabled
                      title={`Invoice ${existingInvoice?.id || ''} has already been generated for Order ${activeQuote?.id}.`}
                      className="px-4 py-2 rounded-md text-xs font-bold bg-slate-200 text-slate-500 border border-slate-300 transition flex items-center gap-1.5 cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ✓ Invoice Generated ({existingInvoice?.id || 'Invoiced'})
                    </button>
                    <button
                      onClick={() => setActiveView('invoices')}
                      className="px-4 py-2 rounded-md text-xs font-bold bg-[#0176D3] hover:bg-blue-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs font-sans"
                    >
                      View Invoices &rarr;
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      if (activeQuote) {
                        const res = acceptFulfillment(activeQuote.id);
                        if (res?.isNew) {
                          alert(`Invoice ${res.invoiceId} generated successfully for Order ${activeQuote.id}! Redirecting to Invoices Page.`);
                        } else if (res?.invoiceId) {
                          alert(`Invoice ${res.invoiceId} was already generated for Order ${activeQuote.id}. Redirecting to Invoices Page.`);
                        }
                      }
                    }}
                    className="px-4 py-2 rounded-md text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Accept Optimal Split & Generate Invoice
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Shipment Optimization Highlights */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block pb-2 border-b border-slate-200">
              Fulfillment & Freight Summary
            </span>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Total Shipments:</span>
                <span className="text-slate-900 font-bold">{fulfillmentPlan.totalShipments} Dispatches</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Estimated Freight:</span>
                <span className="text-blue-700 font-bold">
                  ₹{fulfillmentPlan.totalFreightCost.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Delivery SLA Commitment:</span>
                <span className="text-emerald-700 font-bold">48 Hours SLA</span>
              </div>
            </div>

            {fulfillmentPlan.hasBackorder && (
              <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1 mt-3 font-medium">
                <span className="font-bold block text-amber-950">Backorder Queue Active:</span>
                <p>
                  {fulfillmentPlan.backorderQuantity} units queued for auto-consolidation upon vendor replenishment arrival.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

