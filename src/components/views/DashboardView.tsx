import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileText,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
  CheckCircle2,
  Layers,
  Search,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { MetricCard } from '../design-system/MetricCard';
import { StatusBadge } from '../design-system/StatusBadge';
import { RiskBadge } from '../design-system/RiskBadge';
import { ActivityTimeline } from '../design-system/ActivityTimeline';

export const DashboardView: React.FC = () => {
  const {
    quotes,
    anomalies,
    auditLogs,
    setActiveView,
    setSelectedQuoteId,
    createNewQuote,
    companies,
    activeUser,
    userRole,
  } = useAppStore();

  const [filterStage, setFilterStage] = useState<'all' | 'pending' | 'negotiation' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const totalPipelineRevenue = quotes.reduce((acc, q) => acc + q.totalNetAmount, 0);
  const avgMargin = quotes.length > 0
    ? (quotes.reduce((acc, q) => acc + q.overallMarginPercent, 0) / quotes.length).toFixed(1)
    : '0';
  const pendingApprovals = quotes.filter(
    (q) => q.status === 'Pending Manager' || q.status === 'Pending Finance'
  );
  const criticalAnomalies = anomalies.filter((a) => !a.isResolved);

  // Stage distribution counts
  const stageCounts = {
    draft: quotes.filter((q) => q.status === 'Draft').length,
    pending: pendingApprovals.length,
    negotiation: quotes.filter((q) => q.status === 'Under Negotiation').length,
    approved: quotes.filter((q) => q.status === 'Fully Approved' || q.status === 'Fulfillment').length,
    invoiced: quotes.filter((q) => q.status === 'Invoiced' || q.status === 'Paid').length,
  };

  // Filtered quotes
  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.companyName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStage === 'pending') {
      return q.status === 'Pending Manager' || q.status === 'Pending Finance';
    }
    if (filterStage === 'negotiation') {
      return q.status === 'Under Negotiation';
    }
    if (filterStage === 'approved') {
      return q.status === 'Fully Approved' || q.status === 'Fulfillment' || q.status === 'Invoiced' || q.status === 'Paid';
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header with Personalized Greeting */}
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
              Good afternoon, {activeUser.name.split(' ')[0]}
            </h1>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: 'var(--success-soft)',
                color: 'var(--success)',
              }}
            >
              Live Operations
            </span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Here is what is happening across your governed deals, approval queues, and margin thresholds today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {userRole !== 'customer' && (
            <button
              onClick={() => {
                const newId = createNewQuote(companies[0].id);
                setSelectedQuoteId(newId);
                setActiveView('builder');
              }}
              className="btn-primary !py-2 !px-3.5 !text-xs !gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> New Quotation
            </button>
          )}
          <button
            onClick={() => setActiveView('approvals')}
            className="btn-secondary !py-2 !px-3.5 !text-xs !gap-1.5"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" /> Approvals ({pendingApprovals.length})
          </button>
        </div>
      </div>

      {/* 4 Information-Rich KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Pipeline Value"
          value={`₹${(totalPipelineRevenue / 100000).toFixed(2)}L`}
          subtitle={`${quotes.length} quotations tracked`}
          delta="+18.4%"
          isPositive={true}
          icon={DollarSign}
          variant="primary"
          onClick={() => setActiveView('pipeline')}
        />
        <MetricCard
          title="Average Blended Margin"
          value={`${avgMargin}%`}
          subtitle="Target threshold: 30.0%"
          delta="+2.8 pts"
          isPositive={true}
          icon={TrendingUp}
          variant="success"
        />
        <MetricCard
          title="Pending Approvals"
          value={pendingApprovals.length}
          subtitle="Manager & Finance queue"
          icon={ShieldCheck}
          variant={pendingApprovals.length > 0 ? 'warning' : 'default'}
          onClick={() => setActiveView('approvals')}
        />
        <MetricCard
          title="At-Risk Anomalies"
          value={criticalAnomalies.length}
          subtitle="Stalled & discount deviations"
          icon={AlertTriangle}
          variant={criticalAnomalies.length > 0 ? 'danger' : 'default'}
          onClick={() => setActiveView('deal_health')}
        />
      </div>

      {/* Pipeline Stage Distribution Bar */}
      <div
        className="p-4 rounded-xl border bg-[var(--bg-surface)] space-y-3"
        style={{ borderColor: 'var(--border-default)' }}
      >
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[var(--accent-primary)]" />
            Pipeline Stage Distribution
          </span>
          <span className="text-[11px] text-[var(--text-tertiary)] font-medium">
            Total {quotes.length} Governed Quotations
          </span>
        </div>

        {/* Multi-segment distribution track */}
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
          <div
            style={{ width: `${(stageCounts.draft / quotes.length) * 100}%` }}
            className="bg-slate-400"
            title={`Draft: ${stageCounts.draft}`}
          />
          <div
            style={{ width: `${(stageCounts.pending / quotes.length) * 100}%` }}
            className="bg-amber-500"
            title={`Pending Approval: ${stageCounts.pending}`}
          />
          <div
            style={{ width: `${(stageCounts.negotiation / quotes.length) * 100}%` }}
            className="bg-blue-500"
            title={`Under Negotiation: ${stageCounts.negotiation}`}
          />
          <div
            style={{ width: `${(stageCounts.approved / quotes.length) * 100}%` }}
            className="bg-emerald-500"
            title={`Approved / Fulfillment: ${stageCounts.approved}`}
          />
          <div
            style={{ width: `${(stageCounts.invoiced / quotes.length) * 100}%` }}
            className="bg-purple-500"
            title={`Invoiced & Settled: ${stageCounts.invoiced}`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-[var(--text-secondary)] pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Draft ({stageCounts.draft})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Pending Approval ({stageCounts.pending})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Negotiation ({stageCounts.negotiation})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Approved ({stageCounts.approved})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <span>Invoiced ({stageCounts.invoiced})</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Deals + Real-time Audit Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Governed Deals Table */}
        <div
          className="lg:col-span-2 rounded-xl border bg-[var(--bg-surface)] overflow-hidden flex flex-col"
          style={{ borderColor: 'var(--border-default)' }}
        >
          {/* Header & Filter Controls */}
          <div
            className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                Active Governed Quotations
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--bg-muted)] text-[var(--text-secondary)]">
                {filteredQuotes.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter Pills */}
              <div className="flex p-0.5 rounded-lg bg-[var(--bg-muted)] text-[11px] font-semibold">
                <button
                  onClick={() => setFilterStage('all')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    filterStage === 'all'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStage('pending')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    filterStage === 'pending'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Approvals
                </button>
                <button
                  onClick={() => setFilterStage('negotiation')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    filterStage === 'negotiation'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Negotiation
                </button>
                <button
                  onClick={() => setFilterStage('approved')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    filterStage === 'approved'
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  Approved
                </button>
              </div>

              <button
                onClick={() => setActiveView('pipeline')}
                className="text-xs font-semibold text-[var(--accent-primary)] hover:underline flex items-center gap-1 cursor-pointer ml-1"
              >
                Kanban
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  className="border-b text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] bg-[var(--bg-muted)]"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <th className="py-2.5 px-4">Quote</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3 text-right">Net Value</th>
                  <th className="py-2.5 px-3 text-right">Margin</th>
                  <th className="py-2.5 px-3">Risk Assessment</th>
                  <th className="py-2.5 px-3">Stage / Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredQuotes.map((q) => (
                  <tr
                    key={q.id}
                    onClick={() => {
                      setSelectedQuoteId(q.id);
                      setActiveView('builder');
                    }}
                    className="hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[var(--text-primary)]">
                      {q.id}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[var(--text-primary)]">
                        {q.companyName}
                      </div>
                      <div className="text-[10px] text-[var(--text-tertiary)]">
                        {q.tier} Tier • Rep: {q.salesRep}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[var(--text-primary)]">
                      ₹{q.totalNetAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold">
                      <span
                        className={
                          q.overallMarginPercent < 25
                            ? 'text-rose-600 dark:text-rose-400'
                            : q.overallMarginPercent < 30
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }
                      >
                        {q.overallMarginPercent}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <RiskBadge level={q.riskLevel} score={q.blendedRiskScore} />
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedQuoteId(q.id);
                          if (q.status === 'Pending Manager' || q.status === 'Pending Finance') {
                            setActiveView('approvals');
                          } else if (q.status === 'Under Negotiation') {
                            setActiveView('portal');
                          } else if (q.status === 'Fulfillment') {
                            setActiveView('fulfillment');
                          } else {
                            setActiveView('builder');
                          }
                        }}
                        className="text-[11px] font-semibold text-[var(--accent-primary)] group-hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        Manage
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Live Governance Audit Trail */}
        <div className="lg:col-span-1">
          <ActivityTimeline logs={auditLogs} />
        </div>
      </div>
    </div>
  );
};
