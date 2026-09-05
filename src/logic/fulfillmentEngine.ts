import { Warehouse, WarehouseInventory, WarehouseAllocation, QuoteLine } from '../types';

export interface FulfillmentPlan {
  allocations: WarehouseAllocation[];
  totalShipments: number;
  totalFreightCost: number;
  hasBackorder: boolean;
  backorderQuantity: number;
  explanation: string;
}

export function generateOptimalFulfillment(
  quoteId: string,
  lines: QuoteLine[],
  warehouses: Warehouse[],
  inventory: WarehouseInventory[]
): FulfillmentPlan {
  const physicalLines = lines.filter((l) => !l.isRecurring && l.category !== 'services');
  const allocations: WarehouseAllocation[] = [];
  let totalFreightCost = 0;
  let hasBackorder = false;
  let backorderQuantity = 0;
  const usedWarehouses = new Set<string>();

  for (const line of physicalLines) {
    let remainingQtyToFulfill = line.quantity;

    // Get inventory for this product across warehouses sorted by inventory count descending
    const productStocks = inventory
      .filter((inv) => inv.productId === line.productId)
      .map((inv) => {
        const wh = warehouses.find((w) => w.id === inv.warehouseId);
        return {
          warehouseId: inv.warehouseId,
          warehouseName: wh ? wh.name : inv.warehouseId,
          available: Math.max(0, inv.quantityOnHand - inv.quantityReserved),
          baseFreight: wh ? wh.shippingCostBase : 1500,
          weightMultiplier: wh ? wh.weightMultiplier : 250,
        };
      })
      .sort((a, b) => b.available - a.available);

    // Try single warehouse fulfillment first
    const singleWh = productStocks.find((s) => s.available >= remainingQtyToFulfill);
    if (singleWh) {
      const freight = singleWh.baseFreight + remainingQtyToFulfill * singleWh.weightMultiplier;
      allocations.push({
        id: `alloc-${quoteId}-${line.productId}-${singleWh.warehouseId}`,
        quoteId,
        productId: line.productId,
        productName: line.productName,
        warehouseId: singleWh.warehouseId,
        warehouseName: singleWh.warehouseName,
        allocatedQty: remainingQtyToFulfill,
        isBackorder: false,
        estimatedFreight: freight,
      });
      usedWarehouses.add(singleWh.warehouseId);
      totalFreightCost += freight;
      remainingQtyToFulfill = 0;
    } else {
      // Split across warehouses
      for (const stock of productStocks) {
        if (remainingQtyToFulfill <= 0) break;
        if (stock.available > 0) {
          const allocateQty = Math.min(remainingQtyToFulfill, stock.available);
          const freight = stock.baseFreight + allocateQty * stock.weightMultiplier;
          allocations.push({
            id: `alloc-${quoteId}-${line.productId}-${stock.warehouseId}`,
            quoteId,
            productId: line.productId,
            productName: line.productName,
            warehouseId: stock.warehouseId,
            warehouseName: stock.warehouseName,
            allocatedQty: allocateQty,
            isBackorder: false,
            estimatedFreight: freight,
          });
          usedWarehouses.add(stock.warehouseId);
          totalFreightCost += freight;
          remainingQtyToFulfill -= allocateQty;
        }
      }

      // If still not fulfilled, mark remaining as backorder
      if (remainingQtyToFulfill > 0) {
        hasBackorder = true;
        backorderQuantity += remainingQtyToFulfill;
        allocations.push({
          id: `alloc-backorder-${quoteId}-${line.productId}`,
          quoteId,
          productId: line.productId,
          productName: line.productName,
          warehouseId: 'backorder',
          warehouseName: 'Central Backorder Queue',
          allocatedQty: remainingQtyToFulfill,
          isBackorder: true,
          estimatedFreight: 0,
        });
      }
    }
  }

  const totalShipments = usedWarehouses.size;
  const explanation =
    totalShipments > 1
      ? `Order split across ${totalShipments} fulfillment centers to meet immediate delivery commitment with minimum freight overhead.`
      : totalShipments === 1
      ? `Full order fulfilled directly from ${Array.from(usedWarehouses)[0] ?? 'Primary Warehouse'} in a single consolidated shipment.`
      : 'No physical deliverable lines required.';

  return {
    allocations,
    totalShipments,
    totalFreightCost,
    hasBackorder,
    backorderQuantity,
    explanation,
  };
}
