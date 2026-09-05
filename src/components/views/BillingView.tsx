import React from 'react';
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  Clock,
  FileCheck,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { MetricCard } from '../design-system/MetricCard';

export const BillingView: React.FC = () => {
  const { invoices, subscriptions, recordPayment } = useAppStore();

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalMonthlyARR = subscriptions
    .filter((s) => s.status === 'Active')
    .reduce((acc, s) => acc + s.amountPerPeriod * 12, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
            Billing & Subscriptions
            <span
              className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--accent-primary-soft)', color: 'var(--accent-primary)' }}
            >
              Revenue Recognition
            </span>
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Reconciles one-time deliveries with recurring subscription billing schedules.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <MetricCard
          title="Total Invoiced"
          value={`₹${(totalInvoiced / 100000).toFixed(2)}L`}
          subtitle={`${invoices.length} invoices generated`}
          icon={CreditCard}
          variant="primary"
        />
        <MetricCard
          title="Revenue Settled"
          value={`₹${(totalPaid / 100000).toFixed(2)}L`}
          subtitle="Verified payments"
          delta="100%"
          isPositive={true}
          icon={CheckCircle2}
          variant="success"
        />
        <MetricCard
          title="Annualized ARR"
          value={`₹${(totalMonthlyARR / 100000).toFixed(2)}L`}
          subtitle={`${subscriptions.length} active plans`}
          icon={Calendar}
          variant="primary"
        />
      </div>

      {/* Invoices */}
      <div className="surface-card overflow-hidden">
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Tax Invoices
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)]">GST 18%</span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Type</th>
              <th>Subtotal</th>
              <th>GST</th>
              <th>Total</th>
              <th>Due Date</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id}>
                <td className="font-mono font-bold text-[var(--accent-primary)]">{inv.id}</td>
                <td className="text-[var(--text-primary)] font-medium">{inv.companyName}</td>
                <td>
                  <span
                    className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                    style={{
                      backgroundColor: 'var(--bg-muted)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-default)',
                    }}
                  >
                    {inv.invoiceType}
                  </span>
                </td>
                <td className="font-mono text-[var(--text-secondary)]">
                  ₹{inv.subtotal.toLocaleString('en-IN')}
                </td>
                <td className="font-mono text-[var(--text-muted)]">
                  ₹{inv.taxAmount.toLocaleString('en-IN')}
                </td>
                <td className="font-mono font-bold text-[var(--text-primary)]">
                  ₹{inv.totalAmount.toLocaleString('en-IN')}
                </td>
                <td className="text-[var(--text-muted)]">{inv.dueDate}</td>
                <td>
                  {inv.status === 'Paid' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--success)] bg-[var(--success-soft)] px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--warning)] bg-[var(--warning-soft)] px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" /> Awaiting
                    </span>
                  )}
                </td>
                <td className="text-right">
                  {inv.status !== 'Paid' ? (
                    <button
                      onClick={() => recordPayment(inv.id)}
                      className="btn-primary !py-1.5 !px-3 !text-[11px]"
                      style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
                    >
                      Record Payment
                    </button>
                  ) : (
                    <span className="text-[11px] text-[var(--text-muted)]">Settled</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Subscriptions */}
      <div className="surface-card overflow-hidden">
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Active Subscriptions
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)]">{subscriptions.length} plans</span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Service</th>
              <th>Frequency</th>
              <th>Amount</th>
              <th>Period</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id}>
                <td className="font-mono font-bold text-[var(--accent-primary)]">{sub.id}</td>
                <td className="text-[var(--text-primary)] font-medium">{sub.companyName}</td>
                <td className="text-[var(--text-secondary)]">{sub.productName}</td>
                <td className="capitalize text-[var(--text-secondary)]">{sub.billingFrequency}</td>
                <td className="font-mono font-bold text-[var(--text-primary)]">
                  ₹{sub.amountPerPeriod.toLocaleString('en-IN')} /mo
                </td>
                <td className="text-[var(--text-muted)] text-[11px]">
                  {sub.currentPeriodStart} → {sub.currentPeriodEnd}
                </td>
                <td>
                  <span className="text-[11px] font-medium text-[var(--success)] bg-[var(--success-soft)] px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
