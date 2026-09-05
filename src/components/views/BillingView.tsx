import React from 'react';
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  Clock,
  DollarSign,
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Hybrid Billing & Subscription Hub
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
              Proration & Revenue Recognition
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Reconciles one-time hardware deliveries upon physical dispatch with automated recurring subscription billing schedules.
          </p>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Invoiced Receivables"
          value={`₹${(totalInvoiced / 100000).toFixed(2)} Lakh`}
          subtitle={`${invoices.length} invoices generated`}
          icon={CreditCard}
          variant="cyan"
        />
        <MetricCard
          title="Settled Revenue Paid"
          value={`₹${(totalPaid / 100000).toFixed(2)} Lakh`}
          subtitle="Verified bank settlements"
          delta="100% compliant"
          isPositive={true}
          icon={CheckCircle2}
          variant="emerald"
        />
        <MetricCard
          title="Active Annualized ARR"
          value={`₹${(totalMonthlyARR / 100000).toFixed(2)} Lakh`}
          subtitle={`${subscriptions.length} recurring SaaS contracts`}
          icon={Calendar}
          variant="cyan"
        />
      </div>

      {/* Invoices Master Table */}
      <div className="surface-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Tax Invoices & Revenue Deliverables
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            GST Compliant (18% Output Tax)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-sans">
                <th className="pb-2">Invoice #</th>
                <th className="pb-2">Customer Name</th>
                <th className="pb-2">Invoice Type</th>
                <th className="pb-2">Subtotal</th>
                <th className="pb-2">GST (18%)</th>
                <th className="pb-2">Total Amount</th>
                <th className="pb-2">Due Date</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Payment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invoices.map((inv) => (
                <tr key={inv.id} className="py-3">
                  <td className="py-3 font-bold text-cyan-400">{inv.id}</td>
                  <td className="py-3 font-sans text-white font-medium">{inv.companyName}</td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 font-sans">
                      {inv.invoiceType}
                    </span>
                  </td>
                  <td className="py-3 text-slate-300">₹{inv.subtotal.toLocaleString('en-IN')}</td>
                  <td className="py-3 text-slate-400">₹{inv.taxAmount.toLocaleString('en-IN')}</td>
                  <td className="py-3 text-white font-bold text-sm">
                    ₹{inv.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 text-slate-400">{inv.dueDate}</td>
                  <td className="py-3 font-sans">
                    {inv.status === 'Paid' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Paid & Settled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        <Clock className="w-3 h-3" /> Payment Awaited
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {inv.status !== 'Paid' ? (
                      <button
                        onClick={() => recordPayment(inv.id)}
                        className="px-3 py-1 rounded text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer shadow-sm"
                      >
                        [Record Payment]
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500">Settled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Subscriptions Schedule */}
      <div className="surface-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Active Recurring SaaS Subscriptions & Billing Schedules
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {subscriptions.length} Active Plans
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-sans">
                <th className="pb-2">Subscription ID</th>
                <th className="pb-2">Client Company</th>
                <th className="pb-2">Service Plan</th>
                <th className="pb-2">Frequency</th>
                <th className="pb-2">Recurring Amount</th>
                <th className="pb-2">Current Period</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="py-3">
                  <td className="py-3 text-cyan-400 font-bold">{sub.id}</td>
                  <td className="py-3 font-sans text-white font-medium">{sub.companyName}</td>
                  <td className="py-3 font-sans text-slate-200">{sub.productName}</td>
                  <td className="py-3 capitalize text-slate-300">{sub.billingFrequency}</td>
                  <td className="py-3 text-white font-bold">
                    ₹{sub.amountPerPeriod.toLocaleString('en-IN')} /mo
                  </td>
                  <td className="py-3 text-slate-400">
                    {sub.currentPeriodStart} to {sub.currentPeriodEnd}
                  </td>
                  <td className="py-3 font-sans">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
