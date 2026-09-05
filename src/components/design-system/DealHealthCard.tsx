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
      className={`surface-card p-5 border transition-all ${
        anomaly.isResolved
          ? 'opacity-60 border-slate-800 bg-slate-900/30'
          : isCritical
          ? 'border-rose-500/40 bg-rose-950/10'
          : 'border-amber-500/40 bg-amber-950/10'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {isCritical ? (
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          ) : (
            <Clock className="w-5 h-5 text-amber-400" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span
                onClick={() => onSelectQuote && onSelectQuote(anomaly.quoteId)}
                className="text-sm font-semibold text-white hover:text-cyan-400 cursor-pointer underline decoration-slate-600 underline-offset-2"
              >
                {anomaly.quoteId} — {anomaly.companyName}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  isCritical
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {anomaly.anomalyType}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">{anomaly.description}</p>
          </div>
        </div>

        {anomaly.isResolved && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
            <Check className="w-3.5 h-3.5" /> Action Logged
          </span>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          Recommended: <span className="text-slate-200">{anomaly.recommendedAction}</span>
        </div>

        {!anomaly.isResolved && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNudge(anomaly.id)}
              className="px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-400" /> Nudge Rep
            </button>
            <button
              onClick={() => onEscalate(anomaly.id)}
              className="px-3 py-1.5 rounded text-xs font-medium bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-rose-400" /> Escalate to VP
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
