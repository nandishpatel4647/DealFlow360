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
    selectedQuoteId,
    setSelectedQuoteId,
    acceptFulfillment,
    setActiveView,
    userRole,
  } = useAppStore();

  const [isAccepting, setIsAccepting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const activeQuote = quotes.find((q) => q.id === selectedQuoteId) || quotes[0];
  const fulfillmentPlan = generateOptimalFulfillment(
    activeQuote?.id || 'Q-1042',
    activeQuote?.lines || [],
    warehouses,
    inventory
  );

  const isAllocated =
    activeQuote?.status === 'Allocated' ||
    activeQuote?.status === 'Invoiced' ||
    activeQuote?.status === 'Paid';

  const handleAcceptAllocation = () => {
    if (!activeQuote) return;
    setIsAccepting(true);
    setTimeout(() => {
      const res = acceptFulfillment(activeQuote.id);
      setIsAccepting(false);
      if (res.success) {
        setActionFeedback(res.message || 'Allocation split confirmed and invoice generated.');
      } else {
        alert(res.message || 'Failed to accept allocation.');
      }
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
            Fulfillment Intelligence
            <span
              className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--accent-primary-soft)', color: 'var(--accent-primary)' }}
            >
              Multi-Warehouse
            </span>
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Optimized order allocation across Gujarat and Mumbai hubs for minimal freight cost.
          </p>
        </div>

        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-default)' }}
        >
          <span className="text-xs text-[var(--text-muted)]">Deal:</span>
          <select
            value={activeQuote?.id}
            onChange={(e) => setSelectedQuoteId(e.target.value)}
            className="select-field !border-0 !bg-transparent !text-xs font-mono font-bold !text-[var(--accent-primary)] !p-0 !pr-6"
          >
            {quotes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.id} — {q.companyName} ({q.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Warehouse Inventory */}
      <div className="surface-card p-5">
        <div
          className="flex items-center justify-between pb-3"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-2">
            <Boxes className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Warehouse Network
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)]">3 hubs active</span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
          {warehouses.map((wh) => {
            const whStock = inventory.filter((inv) => inv.warehouseId === wh.id);
            const totalUnits = whStock.reduce((sum, item) => sum + item.quantityOnHand, 0);

            return (
              <div
                key={wh.id}
                className="p-4 rounded-lg space-y-3"
                style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-default)' }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[var(--accent-primary)]" /> {wh.name}
                    </h3>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{wh.location}</p>
                  </div>
                  <span
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
                  >
                    {totalUnits} units
                  </span>
                </div>

                <div
                  className="space-y-1.5 pt-2 text-xs font-mono"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  {whStock.map((item) => {
                    const prod = products.find((p) => p.id === item.productId);
                    return (
                      <div key={item.id} className="flex justify-between">
                        <span className="text-[11px] text-[var(--text-muted)] truncate max-w-[160px] font-sans">
                          {prod?.name || item.productId}
                        </span>
                        <span className="text-[var(--text-secondary)] font-semibold">
                          {item.quantityOnHand}{' '}
                          <span className="text-[var(--text-muted)] font-normal">
                            ({item.quantityReserved} res)
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div
                  className="pt-2 text-[11px] text-[var(--text-muted)] flex justify-between font-mono"
                  style={{ borderTop: '1px solid var(--border-subtle)' }}
                >
                  <span>Base: ₹{wh.shippingCostBase}</span>
                  <span>₹{wh.weightMultiplier}/unit</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Allocation & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="surface-card overflow-hidden">
            <div
              className="px-5 py-3.5 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--border-default)' }}
            >
              <div>
                <span className="text-sm font-semibold text-[var(--text-primary)] block">
                  Optimal Split for {activeQuote?.id}
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {activeQuote?.companyName} • {activeQuote?.tier} Tier
                </span>
              </div>
              <StatusBadge status={activeQuote?.status || 'Draft'} />
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Warehouse</th>
                  <th className="text-center">Qty</th>
                  <th>Freight</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {fulfillmentPlan.allocations.map((alloc) => (
                  <tr key={alloc.id}>
                    <td className="text-[var(--text-primary)] font-medium">{alloc.productName}</td>
                    <td className="text-[var(--accent-primary)]">{alloc.warehouseName}</td>
                    <td className="text-center font-mono font-bold text-[var(--text-primary)]">
                      {alloc.allocatedQty}
                    </td>
                    <td className="font-mono text-[var(--text-secondary)]">
                      ₹{alloc.estimatedFreight.toLocaleString('en-IN')}
                    </td>
                    <td>
                      {alloc.isBackorder ? (
                        <span className="text-[11px] font-semibold text-[var(--danger)] bg-[var(--danger-soft)] px-2 py-0.5 rounded-full">
                          Backorder
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-[var(--success)] bg-[var(--success-soft)] px-2 py-0.5 rounded-full">
                          Available
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Explanation */}
            <div
              className="mx-5 mb-5 mt-4 p-3 rounded-lg flex items-start gap-2 text-xs"
              style={{
                backgroundColor: 'var(--accent-primary-soft)',
                border: '1px solid var(--accent-primary-border)',
                color: 'var(--accent-primary)',
              }}
            >
              <Truck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{fulfillmentPlan.explanation}</span>
            </div>

            {/* Actions */}
            <div
              className="px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3"
              style={{ borderTop: '1px solid var(--border-default)' }}
            >
              <div className="text-xs text-[var(--text-tertiary)]">
                Total Freight:{' '}
                <span className="font-mono font-bold text-[var(--text-primary)]">
                  ₹{fulfillmentPlan.totalFreightCost.toLocaleString('en-IN')}
                </span>
                {actionFeedback && (
                  <span className="ml-3 text-[var(--success)] font-medium">
                    ✓ {actionFeedback}
                  </span>
                )}
              </div>

              <div>
                {isAllocated ? (
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[var(--success-soft)] border border-[var(--success-border)] text-[var(--success)] font-semibold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                      <span>✓ Allocation Confirmed & Locked</span>
                    </div>
                    <button
                      onClick={() => setActiveView('billing')}
                      className="btn-secondary text-xs py-1.5"
                    >
                      View Invoice →
                    </button>
                  </div>
                ) : userRole !== 'admin' ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[var(--surface-sunken)] border border-[var(--border-default)] text-xs text-[var(--text-tertiary)]">
                    <span>View Only — Dispatch Reserved for Platform Admin</span>
                  </div>
                ) : (
                  <button
                    onClick={handleAcceptAllocation}
                    disabled={isAccepting}
                    className="btn-primary flex items-center gap-2 text-xs py-2 px-4 shadow-sm"
                    style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)', color: '#ffffff' }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isAccepting ? 'Confirming Split...' : 'Accept Allocation'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-4">
          <div className="surface-card p-5 space-y-3">
            <span
              className="section-heading block pb-2"
              style={{ borderBottom: '1px solid var(--border-default)' }}
            >
              Shipment Metrics
            </span>

            <div className="space-y-2.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-[var(--text-tertiary)]">Total Shipments:</span>
                <span className="text-[var(--text-primary)] font-bold font-mono">
                  {fulfillmentPlan.totalShipments}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-tertiary)]">Estimated Freight:</span>
                <span className="text-[var(--accent-primary)] font-bold font-mono">
                  ₹{fulfillmentPlan.totalFreightCost.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-tertiary)]">Delivery SLA:</span>
                <span className="text-[var(--success)] font-bold">48h Guaranteed</span>
              </div>
            </div>

            {fulfillmentPlan.hasBackorder && (
              <div
                className="p-3 rounded-lg text-xs space-y-1 mt-3"
                style={{ backgroundColor: 'var(--warning-soft)', border: '1px solid var(--warning-border)', color: 'var(--warning)' }}
              >
                <span className="font-bold block">Backorder Alert</span>
                <p>
                  {fulfillmentPlan.backorderQuantity} units queued for auto-consolidation upon replenishment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
