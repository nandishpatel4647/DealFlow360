import React from 'react';
import { AlertTriangle, Clock, Zap, Check, BellRing } from 'lucide-react';
import { DealAnomaly } from '../../types';

interface DealHealthCardProps {
  anomaly: DealAnomaly;
  onNudge: (anomalyId: string) => void;
  onEscalate: (anomalyId: string) => void;
  onSelectQuote?: (quoteId: string) => void;
}

export const DealHealthCard: React.FC<DealHealthCardProps> = ({
  anomaly,
  onNudge,
  onEscalate,
  onSelectQuote,
}) => {
  const isCritical = anomaly.severity === 'Critical';

  return (
    <div
      className={`surface-card p-5 transition-all animate-slide-up ${
        anomaly.isResolved ? 'opacity-50' : ''
      }`}
      style={
        !anomaly.isResolved
          ? {
              borderLeft: `3px solid ${isCritical ? 'var(--danger)' : 'var(--warning)'}`,
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`p-2 rounded-lg shrink-0 ${
              isCritical ? 'bg-[var(--danger-soft)]' : 'bg-[var(--warning-soft)]'
            }`}
          >
            {isCritical ? (
              <AlertTriangle className="w-4 h-4 text-[var(--danger)]" />
            ) : (
              <Clock className="w-4 h-4 text-[var(--warning)]" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                onClick={() => onSelectQuote && onSelectQuote(anomaly.quoteId)}
                className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent-primary)] cursor-pointer transition-colors"
              >
                {anomaly.quoteId} — {anomaly.companyName}
              </span>
              <span
                className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                  isCritical
                    ? 'bg-[var(--danger-soft)] text-[var(--danger)]'
                    : 'bg-[var(--warning-soft)] text-[var(--warning)]'
                }`}
              >
                {anomaly.anomalyType}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
              {anomaly.description}
            </p>
          </div>
        </div>

        {anomaly.isResolved && (
          <span className="inline-flex items-center gap-1 text-xs text-[var(--success)] font-medium px-2 py-0.5 rounded-full bg-[var(--success-soft)] shrink-0">
            <Check className="w-3.5 h-3.5" /> Resolved
          </span>
        )}
      </div>

      <div
        className="mt-4 pt-3 flex items-center justify-between gap-4"
        style={{ borderTop: '1px solid var(--border-default)' }}
      >
        <div className="text-xs text-[var(--text-tertiary)] min-w-0">
          Recommended:{' '}
          <span className="text-[var(--text-secondary)] font-medium">
            {anomaly.recommendedAction}
          </span>
        </div>

        {!anomaly.isResolved && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNudge(anomaly.id)}
              className="btn-secondary !py-1.5 !px-3 !text-xs"
            >
              <BellRing className="w-3.5 h-3.5 text-[var(--warning)]" /> Nudge Rep
            </button>
            <button
              onClick={() => onEscalate(anomaly.id)}
              className="btn-danger !py-1.5 !px-3 !text-xs"
            >
              <Zap className="w-3.5 h-3.5" /> Escalate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
