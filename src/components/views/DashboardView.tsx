import React from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileText,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
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
  } = useAppStore();

  const totalPipelineRevenue = quotes.reduce((acc, q) => acc + q.totalNetAmount, 0);
  const avgMargin = quotes.length > 0
    ? (quotes.reduce((acc, q) => acc + q.overallMarginPercent, 0) / quotes.length).toFixed(1)
    : '0';
  const pendingApprovals = quotes.filter(
    (q) => q.status === 'Pending Manager' || q.status === 'Pending Finance'
  );
  const criticalAnomalies = anomalies.filter((a) => !a.isResolved);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
            Command Center
            <span
              className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: 'var(--success-soft)',
                color: 'var(--success)',
              }}
            >
              Live
            </span>
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Real-time deal operations, discount governance, and pipeline intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const newId = createNewQuote(companies[0].id);
              setSelectedQuoteId(newId);
              setActiveView('builder');
            }}
            className="btn-primary"
          >
            <PlusCircle className="w-4 h-4" /> New Quotation
          </button>
          <button
            onClick={() => setActiveView('approvals')}
            className="btn-secondary"
          >
            <ShieldCheck className="w-4 h-4" /> Approvals ({pendingApprovals.length})
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <MetricCard
          title="Active Pipeline Value"
          value={`₹${(totalPipelineRevenue / 100000).toFixed(2)}L`}
          subtitle={`${quotes.length} quotations tracked`}
          delta="+18.4%"
          isPositive={true}
          icon={DollarSign}
          variant="primary"
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Deals Table */}
        <div className="lg:col-span-2">
          <div className="surface-card overflow-hidden">
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: '1px solid var(--border-default)' }}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  Active Deals
                </span>
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: 'var(--bg-muted)',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  {quotes.length}
                </span>
              </div>
              <button
                onClick={() => setActiveView('pipeline')}
                className="btn-ghost !text-xs !py-1 !px-2"
              >
                View Pipeline <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Quote</th>
                  <th>Customer</th>
                  <th>Net Amount</th>
                  <th>Margin</th>
                  <th>Risk</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr
                    key={q.id}
                    onClick={() => {
                      setSelectedQuoteId(q.id);
                      setActiveView('builder');
                    }}
                    className="cursor-pointer group"
                  >
                    <td className="font-semibold text-[var(--accent-primary)] font-mono text-[13px]">
                      {q.id}
                    </td>
                    <td>
                      <span className="text-[var(--text-primary)] font-medium block text-[13px]">
                        {q.companyName}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {q.tier} Tier • {q.salesRep}
                      </span>
                    </td>
                    <td className="text-[var(--text-primary)] font-mono text-[13px] font-medium">
                      ₹{q.totalNetAmount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span
                        className="font-mono text-[13px] font-semibold"
                        style={{
                          color:
                            q.overallMarginPercent >= 30
                              ? 'var(--success)'
                              : 'var(--warning)',
                        }}
                      >
                        {q.overallMarginPercent}%
                      </span>
                    </td>
                    <td>
                      <RiskBadge level={q.riskLevel} score={q.blendedRiskScore} size="sm" />
                    </td>
                    <td>
                      <StatusBadge status={q.status} size="sm" />
                    </td>
                    <td className="text-right">
                      <button className="btn-ghost !py-1 !px-2.5 !text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">
                        Open →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Audit Stream */}
        <div>
          <ActivityTimeline logs={auditLogs} />
        </div>
      </div>
    </div>
  );
};
