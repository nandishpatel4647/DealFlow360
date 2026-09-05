import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface MarginGaugeProps {
  marginPercent: number;
  targetMargin?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const MarginGauge: React.FC<MarginGaugeProps> = ({
  marginPercent,
  targetMargin = 30,
  size = 'md',
}) => {
  const isHealthy = marginPercent >= 35;
  const isWarning = marginPercent >= 25 && marginPercent < 35;
  const isDanger = marginPercent < 25;

  const statusColor = isHealthy
    ? 'var(--success)'
    : isWarning
    ? 'var(--warning)'
    : 'var(--danger)';

  const statusBg = isHealthy
    ? 'var(--success-soft)'
    : isWarning
    ? 'var(--warning-soft)'
    : 'var(--danger-soft)';

  const clampedWidth = Math.min(100, Math.max(0, marginPercent * 2));

  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between">
        <span className="section-heading">Live Gross Margin</span>
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {isHealthy ? (
            <span className="flex items-center gap-1" style={{ color: statusColor }}>
              <TrendingUp className="w-3.5 h-3.5" /> Healthy
            </span>
          ) : isWarning ? (
            <span className="flex items-center gap-1" style={{ color: statusColor }}>
              <AlertTriangle className="w-3.5 h-3.5" /> Moderate
            </span>
          ) : (
            <span className="flex items-center gap-1" style={{ color: statusColor }}>
              <TrendingDown className="w-3.5 h-3.5" /> Erosion
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span
            className="text-3xl font-bold font-mono tracking-tight"
            style={{ color: statusColor }}
          >
            {marginPercent.toFixed(1)}%
          </span>
          <span className="text-xs text-[var(--text-muted)]">blended</span>
        </div>
        <span className="text-xs text-[var(--text-tertiary)]">
          Target: <span className="text-[var(--text-secondary)] font-medium">{targetMargin}%</span>
        </span>
      </div>

      {/* Visual Bar */}
      <div
        className="mt-3 h-2 w-full rounded-full overflow-hidden relative"
        style={{ backgroundColor: 'var(--bg-muted)' }}
      >
        <div
          className="absolute top-0 bottom-0 w-0.5 z-10"
          style={{
            left: `${targetMargin * 2}%`,
            backgroundColor: 'var(--text-muted)',
          }}
          title={`Target ${targetMargin}%`}
        />
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${clampedWidth}%`,
            backgroundColor: statusColor,
          }}
        />
      </div>
    </div>
  );
};
