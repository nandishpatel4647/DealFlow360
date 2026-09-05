import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  Clock,
  FileCheck,
  RefreshCw,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { MetricCard } from '../design-system/MetricCard';

export const BillingView: React.FC = () => {
  const { invoices, subscriptions, recordPayment, userRole } = useAppStore();

  const [selectedSubProrate, setSelectedSubProrate] = useState<string | null>(null);
  const [prorateMessage, setProrateMessage] = useState<string | null>(null);

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalMonthlyARR = subscriptions
    .filter((s) => s.status === 'Active')
    .reduce((acc, s) => acc + s.amountPerPeriod * 12, 0);

  const handleProrateCalculation = (subId: string) => {
    const sub = subscriptions.find((s) => s.id === subId);
    if (!sub) return;
    setProrateMessage(
      `Proration calculated for ${sub.companyName} (${sub.productName}): Mid-cycle quantity increase (+2 units). Prorated credit/charge: ₹4,800 applied to next billing period.`
    );
    setSelectedSubProrate(null);
    setTimeout(() => setProrateMessage(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Hybrid Billing & Subscription Hub
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              Proration & Revenue Recognition
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reconciles one-time hardware deliveries upon physical dispatch with automated recurring subscription billing schedules.
          </p>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Invoiced Receivables"
          value={`₹${(totalInvoiced / 100000).toFixed(2)} Lakh`}
          subtitle={`${invoices.length} total tax invoices`}
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
          subtitle={`${subscriptions.length} active SaaS contracts`}
          icon={Calendar}
          variant="cyan"
        />
      </div>

      {prorateMessage && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2 shadow-xs">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>{prorateMessage}</span>
        </div>
      )}

      {/* Invoices Master Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Tax Invoices & Revenue Deliverables
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            GST Compliant (18% Output Tax)
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Invoice #</th>
                <th className="py-3 px-3">Customer Name</th>
                <th className="py-3 px-3">Invoice Type</th>
                <th className="py-3 px-3">Subtotal</th>
                <th className="py-3 px-3">GST (18%)</th>
                <th className="py-3 px-3">Total Amount</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Payment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-bold text-blue-700 font-mono">{inv.id}</td>
                  <td className="py-3 px-3 text-slate-900 font-semibold">{inv.companyName}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium border border-slate-200">
                      {inv.invoiceType}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono">₹{inv.subtotal.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono">₹{inv.taxAmount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-slate-900 font-bold font-mono text-sm">
                    ₹{inv.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-slate-500">{inv.dueDate}</td>
                  <td className="py-3 px-3">
                    {inv.status === 'Paid' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid & Settled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" /> Awaiting Payment
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {inv.status !== 'Paid' ? (
                      (userRole === 'finance' || userRole === 'admin') ? (
                        <button
                          onClick={() => recordPayment(inv.id)}
                          className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-xs"
                        >
                          Record Payment
                        </button>
                      ) : (
                        <span className="text-[11px] text-amber-700 font-medium">Awaiting Finance Settlement</span>
                      )
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">Settled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Subscriptions Schedule */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active Recurring SaaS Subscriptions & Billing Schedules
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            {subscriptions.length} Active Plans
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-3">Subscription ID</th>
                <th className="py-3 px-3">Client Company</th>
                <th className="py-3 px-3">Service Plan</th>
                <th className="py-3 px-3">Frequency</th>
                <th className="py-3 px-3">Recurring Amount</th>
                <th className="py-3 px-3">Current Period</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Proration Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 text-blue-700 font-bold font-mono">{sub.id}</td>
                  <td className="py-3 px-3 text-slate-900 font-semibold">{sub.companyName}</td>
                  <td className="py-3 px-3 text-slate-700">{sub.productName}</td>
                  <td className="py-3 px-3 capitalize text-slate-600">{sub.billingFrequency}</td>
                  <td className="py-3 px-3 text-slate-900 font-bold font-mono">
                    ₹{sub.amountPerPeriod.toLocaleString('en-IN')} /mo
                  </td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    {sub.currentPeriodStart} to {sub.currentPeriodEnd}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Active
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleProrateCalculation(sub.id)}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition cursor-pointer flex items-center gap-1 ml-auto shadow-2xs"
                    >
                      <RefreshCw className="w-3 h-3 text-blue-600" /> Prorate Mid-Cycle
                    </button>
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

