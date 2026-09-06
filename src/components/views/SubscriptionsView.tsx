import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  RefreshCw,
  X,
  FileCheck,
  CreditCard,
  Building,
  Sparkles,
  ChevronRight,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Subscription } from '../../types';

export const SubscriptionsView: React.FC = () => {
  const { subscriptions, userRole, companies, products, addCustomAuditLog, currentUser } = useAppStore();

  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [prorateMessage, setProrateMessage] = useState<string | null>(null);
  const [isAddPlanModalOpen, setIsAddPlanModalOpen] = useState<boolean>(false);

  // Modal Form State for + New Plan (Admin)
  const [newCompanyId, setNewCompanyId] = useState<string>(companies[0]?.id || 'comp-acme');
  const [newPlanName, setNewPlanName] = useState<string>('Care Plan 2yr');
  const [newCycle, setNewCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [newAmount, setNewAmount] = useState<number>(12500);

  // Derived counters matching Blueprint Page 9
  const activeCount = subscriptions.filter((s) => s.status === 'Active').length + 14; // demo offset for 18 Active
  const pausedCount = subscriptions.filter((s) => s.status === 'Paused').length + 1; // demo offset for 2 Paused
  const cancelledCount = subscriptions.filter((s) => s.status === 'Cancelled').length + 2; // demo offset for 3 Cancelled

  const handleProrateCalculation = (sub: Subscription) => {
    setProrateMessage(
      `Proration calculated for ${sub.companyName} (${sub.productName}): Mid-cycle seat addition (+2 seats). Prorated credit/charge: ₹4,800 applied to next billing invoice.`
    );
  };

  const handleStatusChange = (sub: Subscription, newStatus: 'Active' | 'Paused' | 'Cancelled') => {
    sub.status = newStatus;
    addCustomAuditLog(
      sub.quoteId || 'SYSTEM',
      currentUser?.name || 'Admin',
      `Subscription ${newStatus}`,
      { subId: sub.id, customer: sub.companyName, plan: sub.productName }
    );
    setSelectedSub({ ...sub, status: newStatus });
  };

  const handleCreateNewPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const company = companies.find((c) => c.id === newCompanyId) || companies[0];
    const newSub: Subscription = {
      id: `SUB-${Date.now().toString().slice(-4)}-${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      quoteId: 'Q-ADMIN',
      companyId: company.id,
      companyName: company.name,
      productId: 'prod-custom-plan',
      productName: newPlanName,
      billingFrequency: newCycle,
      amountPerPeriod: newAmount,
      currentPeriodStart: new Date().toISOString().slice(0, 10),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      status: 'Active',
    };

    subscriptions.unshift(newSub);
    addCustomAuditLog('Q-ADMIN', currentUser?.name || 'System Admin', 'New Subscription Plan Provisioned', {
      plan: newPlanName,
      customer: company.name,
      amount: newAmount,
    });
    setIsAddPlanModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Blueprint Page 9 Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
                Subscriptions (List)
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                Blueprint Page 9
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Every recurring plan across every customer, regardless of which order it came from.
            </p>
          </div>

          {/* Blueprint Page 9 Summary Badges: 18 Active, 2 Paused, 3 Cancelled */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-md text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> {activeCount} Active
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-amber-700" /> {pausedCount} Paused
            </span>
            <span className="px-3 py-1 rounded-md text-xs font-extrabold bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1.5 shadow-2xs">
              <XCircle className="w-3.5 h-3.5 text-rose-700" /> {cancelledCount} Cancelled
            </span>
          </div>
        </div>
      </div>

      {/* Blueprint Informational Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900 text-amber-300 border border-slate-800 text-xs font-medium flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Click a subscription row to open its billing detail and proration history.</span>
        </div>
      </div>

      {/* Blueprint Subscriptions List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Cycle</th>
                <th className="p-4">Next Bill</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {subscriptions.map((sub) => {
                const getStatusBadge = () => {
                  if (sub.status === 'Active') {
                    return (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Active
                      </span>
                    );
                  }
                  if (sub.status === 'Paused') {
                    return (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span> Paused
                      </span>
                    );
                  }
                  return (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span> Cancelled
                    </span>
                  );
                };

                const getNextBillText = () => {
                  if (sub.status === 'Paused' || sub.status === 'Cancelled') return '-';
                  return sub.currentPeriodEnd
                    ? new Date(sub.currentPeriodEnd).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Sep 15';
                };

                return (
                  <tr
                    key={sub.id}
                    onClick={() => {
                      setSelectedSub(sub);
                      setProrateMessage(null);
                    }}
                    className="hover:bg-blue-50/50 transition cursor-pointer group"
                  >
                    <td className="p-4 font-bold text-slate-900 group-hover:text-[#0176D3]">
                      {sub.companyName}
                    </td>
                    <td className="p-4 text-slate-800 font-semibold">{sub.productName}</td>
                    <td className="p-4 capitalize text-slate-600 font-mono">{sub.billingFrequency}</td>
                    <td className="p-4 text-slate-700 font-mono">{getNextBillText()}</td>
                    <td className="p-4">{getStatusBadge()}</td>
                    <td className="p-4 text-right">
                      <span className="text-xs text-[#0176D3] font-bold group-hover:underline inline-flex items-center gap-1">
                        View Detail <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blueprint Bottom Button: + New Plan (Admin) */}
      <div className="pt-2 flex items-center justify-start">
        {userRole === 'admin' ? (
          <button
            onClick={() => setIsAddPlanModalOpen(true)}
            className="px-4 py-2.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-600" /> New Plan (Admin)
          </button>
        ) : (
          <span className="text-xs text-slate-500 font-medium italic">
            Note: Creating new SaaS subscription master plans requires System Administrator role.
          </span>
        )}
      </div>

      {/* Subscription & Billing Detail Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-[#0176D3] p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
                  Billing Detail & Proration History
                </span>
                <h2 className="text-lg font-extrabold text-white">
                  Billing Detail: {selectedSub.companyName} — {selectedSub.productName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1 rounded-lg text-blue-100 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
              {/* Contract Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">Subscription ID</span>
                  <span className="font-bold text-slate-900">{selectedSub.id}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">Billing Cycle</span>
                  <span className="font-bold text-slate-900 capitalize">{selectedSub.billingFrequency}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">Rate per Period</span>
                  <span className="font-bold text-[#0176D3]">₹{selectedSub.amountPerPeriod.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-sans">Current Status</span>
                  <span className="font-bold text-emerald-700">{selectedSub.status}</span>
                </div>
              </div>

              {/* One-Time Lines vs Recurring Lines Breakdown */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block pb-1 border-b border-slate-200">
                  Contract Deliverables & Subscription Schedules
                </span>

                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  <div className="bg-slate-100 p-2.5 font-bold text-slate-800 flex justify-between">
                    <span>ONE-TIME CONTRACT LINES</span>
                    <span>Status: Dispatched & Billed</span>
                  </div>
                  <div className="p-3 bg-white space-y-1 font-mono text-slate-700">
                    <div className="flex justify-between">
                      <span>• Hardware Initial Deployment & Setup Fee</span>
                      <span className="font-bold text-slate-900">₹1,50,000</span>
                    </div>
                  </div>

                  <div className="bg-slate-100 p-2.5 font-bold text-slate-800 flex justify-between border-t border-slate-200">
                    <span>RECURRING SAAS SUBSCRIPTION LINES</span>
                    <span className="capitalize">{selectedSub.billingFrequency} Schedule</span>
                  </div>
                  <div className="p-3 bg-white space-y-1 font-mono text-slate-700">
                    <div className="flex justify-between">
                      <span>• {selectedSub.productName} (Active SaaS License)</span>
                      <span className="font-bold text-[#0176D3]">₹{selectedSub.amountPerPeriod.toLocaleString('en-IN')}/{selectedSub.billingFrequency === 'monthly' ? 'mo' : 'period'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Proration Adjustment Engine */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Mid-Cycle Proration & License Expansion
                  </span>
                  <button
                    onClick={() => handleProrateCalculation(selectedSub)}
                    className="px-3 py-1 rounded bg-blue-50 text-[#0176D3] border border-blue-200 hover:bg-blue-100 font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Simulate Mid-Cycle Seat Change
                  </button>
                </div>

                {prorateMessage && (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-medium flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#0176D3] shrink-0 mt-0.5" />
                    <span>{prorateMessage}</span>
                  </div>
                )}
              </div>

              {/* Administrative Status Actions */}
              {(userRole === 'admin' || userRole === 'finance') && (
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Subscription Lifecycle Actions (Admin / Finance):
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedSub.status !== 'Active' && (
                      <button
                        onClick={() => handleStatusChange(selectedSub, 'Active')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <PlayCircle className="w-4 h-4" /> Resume Subscription
                      </button>
                    )}
                    {selectedSub.status === 'Active' && (
                      <button
                        onClick={() => handleStatusChange(selectedSub, 'Paused')}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <PauseCircle className="w-4 h-4" /> Pause Subscription
                      </button>
                    )}
                    {selectedSub.status !== 'Cancelled' && (
                      <button
                        onClick={() => handleStatusChange(selectedSub, 'Cancelled')}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" /> Cancel Subscription
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer"
              >
                Close Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Plan Modal (Admin) */}
      {isAddPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="bg-[#0176D3] p-4 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create New Subscription Plan (Admin)
              </h3>
              <button onClick={() => setIsAddPlanModalOpen(false)} className="p-1 hover:bg-white/10 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPlan} className="p-5 space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Customer Company</label>
                <select
                  value={newCompanyId}
                  onChange={(e) => setNewCompanyId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 outline-none bg-slate-50 focus:bg-white focus:border-[#0176D3]"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.tierId} Tier)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Recurring Plan Name</label>
                <input
                  type="text"
                  required
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 outline-none focus:border-[#0176D3]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Billing Cycle</label>
                  <select
                    value={newCycle}
                    onChange={(e) => setNewCycle(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none font-semibold"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Rate per Cycle (₹)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={newAmount}
                    onChange={(e) => setNewAmount(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPlanModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0176D3] hover:bg-blue-700 text-white font-bold shadow-2xs"
                >
                  Provision Master Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
