import { Quote, Invoice, InvoiceLineItem, Subscription } from '../types';

export function generateHybridBilling(quote: Quote): {
  invoice: Invoice;
  subscriptions: Subscription[];
} {
  const oneTimeLines: InvoiceLineItem[] = [];
  const recurringLines: InvoiceLineItem[] = [];
  const subscriptions: Subscription[] = [];

  const now = new Date();
  const currentDay = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay);
  const prorationRatio = Number((daysRemaining / daysInMonth).toFixed(2));

  for (const line of quote.lines) {
    if (line.isRecurring) {
      const fullMonthlyAmount = line.netAmount;
      const proratedInitialAmount = Math.round(fullMonthlyAmount * prorationRatio);

      recurringLines.push({
        id: `inv-line-rec-${line.id}`,
        description: `${line.productName} (Initial Prorated ${daysRemaining}/${daysInMonth} days)`,
        type: 'Prorated Fee',
        quantity: line.quantity,
        unitPrice: proratedInitialAmount,
        total: proratedInitialAmount,
      });

      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const endOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);

      subscriptions.push({
        id: `SUB-${quote.id.replace('Q-', '')}-${line.productId}`,
        quoteId: quote.id,
        companyId: quote.companyId,
        companyName: quote.companyName,
        productId: line.productId,
        productName: line.productName,
        billingFrequency: line.billingPeriod || 'monthly',
        amountPerPeriod: fullMonthlyAmount,
        currentPeriodStart: nextMonth.toISOString().split('T')[0],
        currentPeriodEnd: endOfNextMonth.toISOString().split('T')[0],
        status: 'Active',
      });
    } else {
      oneTimeLines.push({
        id: `inv-line-one-${line.id}`,
        description: `${line.productName} (Physical/Service Deliverable)`,
        type: line.category === 'services' ? 'One-Time Goods' : 'One-Time Goods',
        quantity: line.quantity,
        unitPrice: Math.round(line.netAmount / line.quantity),
        total: line.netAmount,
      });
    }
  }

  const allLines = [...oneTimeLines, ...recurringLines];
  const subtotal = allLines.reduce((acc, l) => acc + l.total, 0);
  const taxAmount = Math.round(subtotal * 0.18); // 18% GST standard in India
  const totalAmount = subtotal + taxAmount;

  const dueDateObj = new Date();
  dueDateObj.setDate(dueDateObj.getDate() + 30);

  const invoice: Invoice = {
    id: `INV-50${quote.id.replace('Q-', '')}`,
    quoteId: quote.id,
    companyId: quote.companyId,
    companyName: quote.companyName,
    invoiceType:
      oneTimeLines.length > 0 && recurringLines.length > 0
        ? 'Hybrid'
        : recurringLines.length > 0
        ? 'Recurring Subscription'
        : 'One-Time Goods',
    subtotal,
    taxAmount,
    totalAmount,
    status: 'Sent',
    dueDate: dueDateObj.toISOString().split('T')[0],
    lines: allLines,
  };

  return {
    invoice,
    subscriptions,
  };
}
