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
      className={`rounded-xl border p-5 transition-all card-hover-3d ${
        anomaly.isResolved
          ? 'opacity-60 border-slate-200 bg-slate-50'
          : isCritical
          ? 'border-rose-300 bg-rose-50/30'
          : 'border-amber-300 bg-amber-50/30'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {isCritical ? (
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 shadow-2xs border border-rose-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shadow-2xs border border-amber-200">
              <Clock className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span
                onClick={() => onSelectQuote && onSelectQuote(anomaly.quoteId)}
                className="text-sm font-extrabold text-[#0176D3] hover:text-blue-800 cursor-pointer underline underline-offset-2"
              >
                {anomaly.quoteId} — {anomaly.companyName}
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full badge-3d ${
                  isCritical
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                {anomaly.anomalyType}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-700 font-medium leading-relaxed">{anomaly.description}</p>
          </div>
        </div>

        {anomaly.isResolved && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-800 font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 badge-3d">
            <Check className="w-3.5 h-3.5" /> Action Logged
          </span>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-600">
          Recommended Action: <span className="text-slate-900 font-bold">{anomaly.recommendedAction}</span>
        </div>

        {!anomaly.isResolved && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNudge(anomaly.id)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition flex items-center gap-1.5 cursor-pointer shadow-2xs btn-3d"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-600" /> Nudge Rep
            </button>
            <button
              onClick={() => onEscalate(anomaly.id)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-2xs btn-3d"
            >
              <Zap className="w-3.5 h-3.5 text-white" /> Escalate to VP
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

