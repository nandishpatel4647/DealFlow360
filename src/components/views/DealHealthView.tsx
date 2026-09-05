import React from 'react';
import {
  AlertTriangle,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { MetricCard } from '../design-system/MetricCard';
import { DealHealthCard } from '../design-system/DealHealthCard';
import { ActivityTimeline } from '../design-system/ActivityTimeline';

export const DealHealthView: React.FC = () => {
  const {
    anomalies,
    quotes,
    resolveAnomaly,
    setSelectedQuoteId,
    setActiveView,
    auditLogs,
  } = useAppStore();

  const criticalCount = anomalies.filter((a) => a.severity === 'Critical' && !a.isResolved).length;
  const atRiskCount = anomalies.filter((a) => a.severity === 'At Risk' && !a.isResolved).length;
  const healthyCount = quotes.length - (criticalCount + atRiskCount);

  const handleNudge = (anomalyId: string) => {
    resolveAnomaly(anomalyId, 'Dispatched automated notification & follow-up nudge to Sales Rep');
  };

  const handleEscalate = (anomalyId: string) => {
    resolveAnomaly(anomalyId, 'Escalated to VP of Sales for immediate commercial review');
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
            Deal Health Monitor
            {criticalCount > 0 && (
              <span
                className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                style={{ backgroundColor: 'var(--danger-soft)', color: 'var(--danger)' }}
              >
                {criticalCount} Critical
              </span>
            )}
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Monitors deal velocity, discount spikes, and delivery promises to intercept risks.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <MetricCard
          title="Critical Anomalies"
          value={criticalCount}
          subtitle="Immediate action required"
          icon={AlertTriangle}
          variant="danger"
        />
        <MetricCard
          title="At-Risk Deals"
          value={atRiskCount}
          subtitle="Negotiation slippage"
          icon={Clock}
          variant="warning"
        />
        <MetricCard
          title="Healthy Deals"
          value={Math.max(0, healthyCount)}
          subtitle="Progressing within SLAs"
          icon={ShieldCheck}
          variant="success"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Anomaly Cards */}
        <div className="lg:col-span-2 space-y-4">
          <span className="section-heading block pb-1">
            Detected Anomalies ({anomalies.length})
          </span>

          <div className="space-y-3">
            {anomalies.map((anom) => (
              <DealHealthCard
                key={anom.id}
                anomaly={anom}
                onNudge={handleNudge}
                onEscalate={handleEscalate}
                onSelectQuote={(quoteId) => {
                  setSelectedQuoteId(quoteId);
                  setActiveView('builder');
                }}
              />
            ))}
          </div>
        </div>

        {/* Audit Trail */}
        <div className="space-y-4">
          <ActivityTimeline logs={auditLogs} />
        </div>
      </div>
    </div>
  );
};
