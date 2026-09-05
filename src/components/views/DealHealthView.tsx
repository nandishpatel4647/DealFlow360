import React from 'react';
import {
  HeartPulse,
  AlertTriangle,
  Clock,
  Zap,
  ShieldCheck,
  CheckCircle2,
  BellRing,
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Deal Health & Anomaly Governance Center
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
              Proactive Risk Interception
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Continuously monitors deal velocity, discount spikes, and fulfillment delivery promises to intercept stalled deals before revenue leakage.
          </p>
        </div>
      </div>

      {/* KPI Severity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Critical Anomalies"
          value={criticalCount}
          subtitle="Immediate action required"
          icon={AlertTriangle}
          variant="crimson"
        />
        <MetricCard
          title="At-Risk Deals"
          value={atRiskCount}
          subtitle="Delivery & negotiation slippage"
          icon={Clock}
          variant="amber"
        />
        <MetricCard
          title="Healthy Governed Deals"
          value={Math.max(0, healthyCount)}
          subtitle="Progressing within SLAs"
          icon={ShieldCheck}
          variant="emerald"
        />
      </div>

      {/* Main Grid: Active Anomalies on Left, Audit Stream on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Anomaly Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Detected Risk Anomalies & Automated Interventions ({anomalies.length})
            </span>
          </div>

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

        {/* Right 1 Col: Audit History */}
        <div className="space-y-4">
          <ActivityTimeline logs={auditLogs} />
        </div>
      </div>
    </div>
  );
};
