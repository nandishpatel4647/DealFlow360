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

  const colorClass = isHealthy
    ? 'text-emerald-400'
    : isWarning
    ? 'text-amber-400'
    : 'text-rose-400';

  const barColor = isHealthy
    ? 'bg-emerald-500'
    : isWarning
    ? 'bg-amber-500'
    : 'bg-rose-500';

  const clampedWidth = Math.min(100, Math.max(0, marginPercent * 2)); // 50% margin fills bar

  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Live Gross Margin
        </span>
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {isHealthy ? (
            <span className="flex items-center text-emerald-400 gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Healthy Margin
            </span>
          ) : isWarning ? (
            <span className="flex items-center text-amber-400 gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Moderate Margin
            </span>
          ) : (
            <span className="flex items-center text-rose-400 gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> Margin Erosion
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className={`text-3xl font-bold font-mono tracking-tight ${colorClass}`}>
            {marginPercent.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-400">blended</span>
        </div>
        <span className="text-xs text-slate-400">
          Target: <span className="text-slate-300 font-medium">{targetMargin}%</span>
        </span>
      </div>

      {/* Visual Bar */}
      <div className="mt-3 h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
        {/* Target Marker */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
          style={{ left: `${targetMargin * 2}%` }}
          title={`Target ${targetMargin}%`}
        />
        <div
          className={`h-full ${barColor} transition-all duration-300 rounded-full`}
          style={{ width: `${clampedWidth}%` }}
        />
      </div>
    </div>
  );
};
