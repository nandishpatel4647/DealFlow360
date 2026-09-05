import React, { useState } from 'react';
import {
  Truck,
  Package,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building,
  DollarSign,
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
    selectedQuoteId,
    setSelectedQuoteId,
    acceptFulfillment,
    setActiveView,
  } = useAppStore();

  const [demoOrderQty, setDemoOrderQty] = useState<number>(20);

  const activeQuote = quotes.find((q) => q.id === selectedQuoteId) || quotes[0];
  const fulfillmentPlan = generateOptimalFulfillment(
    activeQuote?.id || 'Q-1042',
    activeQuote?.lines || [],
    warehouses,
    inventory
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Multi-Warehouse Fulfillment Intelligence
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
              Automated Freight Splitter
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Optimizes order allocation across Gujarat and Mumbai hubs to minimize split shipments and eliminate backorder latency.
          </p>
        </div>

        {/* Selected Quote Indicator */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400">Inspecting Deal:</span>
          <select
            value={activeQuote?.id}
            onChange={(e) => setSelectedQuoteId(e.target.value)}
            className="bg-transparent text-xs font-mono font-bold text-cyan-400 outline-none cursor-pointer"
          >
            {quotes.map((q) => (
              <option key={q.id} value={q.id} className="bg-slate-900 text-white">
                {q.id} — {q.companyName} ({q.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Warehouse Inventory Stock Level Matrix */}
      <div className="surface-card p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Live Network Warehouse Inventory (On-Hand & Reserved)
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
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
                className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-cyan-400" /> {wh.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{wh.location}</p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                    {totalUnits} Units Total
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs font-mono">
                  {whStock.map((item) => {
                    const prod = products.find((p) => p.id === item.productId);
                    return (
                      <div key={item.id} className="flex justify-between text-slate-300">
                        <span className="font-sans text-[11px] text-slate-400 truncate max-w-[160px]">
                          {prod?.name || item.productId}
                        </span>
                        <span className="font-bold">
                          {item.quantityOnHand} on hand{' '}
                          <span className="text-slate-500 font-normal">
                            ({item.quantityReserved} res)
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex justify-between font-mono">
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
          <div className="surface-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block">
                  Optimal Warehouse Split Recommendation for {activeQuote?.id}
                </span>
                <span className="text-[11px] text-slate-400">
                  Customer: <span className="text-white">{activeQuote?.companyName}</span> • Terms:{' '}
                  {activeQuote?.tier}
                </span>
              </div>
              <StatusBadge status={activeQuote?.status || 'Draft'} />
            </div>

            {/* Allocation Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-sans">
                    <th className="pb-2">Product Item</th>
                    <th className="pb-2">Allocated Warehouse</th>
                    <th className="pb-2 text-center">Allocated Qty</th>
                    <th className="pb-2">Estimated Freight</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {fulfillmentPlan.allocations.map((alloc) => (
                    <tr key={alloc.id} className="py-3">
                      <td className="py-3 font-sans text-white font-medium">
                        {alloc.productName}
                      </td>
                      <td className="py-3 text-cyan-300 font-sans">
                        {alloc.warehouseName}
                      </td>
                      <td className="py-3 text-center font-bold text-white text-sm">
                        {alloc.allocatedQty} units
                      </td>
                      <td className="py-3 text-slate-300">
                        ₹{alloc.estimatedFreight.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 font-sans">
                        {alloc.isBackorder ? (
                          <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30">
                            Backorder Pending
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
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
            <div className="p-3 rounded bg-blue-950/20 border border-blue-800/40 text-xs text-blue-200 flex items-start gap-2">
              <Truck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>{fulfillmentPlan.explanation}</span>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Total Freight Cost:{' '}
                <span className="font-mono font-bold text-white">
                  ₹{fulfillmentPlan.totalFreightCost.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (activeQuote) {
                      acceptFulfillment(activeQuote.id);
                      alert('Optimal split accepted! Hybrid invoice generated and order marked Invoiced.');
                    }
                  }}
                  className="px-4 py-2 rounded-md text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  <CheckCircle2 className="w-4 h-4" /> [Accept Optimal Allocation]
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Live Shipment Optimization Highlights */}
        <div className="space-y-4">
          <div className="surface-card p-5 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block pb-2 border-b border-slate-800">
              Shipment Metrics
            </span>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Shipments:</span>
                <span className="text-white font-bold">{fulfillmentPlan.totalShipments} Dispatches</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Freight:</span>
                <span className="text-cyan-400 font-bold">
                  ₹{fulfillmentPlan.totalFreightCost.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery SLA:</span>
                <span className="text-emerald-400 font-bold">48 Hours (Guaranteed)</span>
              </div>
            </div>

            {fulfillmentPlan.hasBackorder && (
              <div className="p-3 rounded bg-amber-950/30 border border-amber-500/40 text-xs text-amber-300 space-y-1 mt-3">
                <span className="font-bold block">Backorder Alert:</span>
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
