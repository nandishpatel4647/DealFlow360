import React from 'react';
import { ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { RiskBreakdown, RiskLevel } from '../../types';

interface ExplainableRiskCardProps {
  breakdown: RiskBreakdown;
  riskLevel: RiskLevel;
  approvalStage: string;
  assignedTo: string;
}

export const ExplainableRiskCard: React.FC<ExplainableRiskCardProps> = ({
  breakdown,
  riskLevel,
  approvalStage,
  assignedTo,
}) => {
  const isHigh = riskLevel === 'HIGH';
  const isMed = riskLevel === 'MEDIUM';

  return (
    <div
      className={`surface-card p-5 border ${
        isHigh
          ? 'border-rose-500/40 bg-rose-950/10'
          : isMed
          ? 'border-amber-500/40 bg-amber-950/10'
          : 'border-emerald-500/30 bg-emerald-950/10'
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          {isHigh || isMed ? (
            <ShieldAlert className={`w-5 h-5 ${isHigh ? 'text-rose-400' : 'text-amber-400'}`} />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          )}
          <span className="text-sm font-semibold tracking-wide uppercase text-white">
            {isHigh || isMed ? 'Why This Deal Is At Risk' : 'Risk & Governance Status'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Total Blended Score:</span>
          <span
            className={`font-mono text-base font-bold px-2 py-0.5 rounded ${
              isHigh
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : isMed
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {breakdown.totalScore.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Point Contribution Breakdown */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="p-2.5 rounded-md bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Service / Line Overage</span>
          <span className="text-sm font-mono font-semibold text-rose-400">
            +{breakdown.serviceDeviationPts.toFixed(1)} pts
          </span>
        </div>
        <div className="p-2.5 rounded-md bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Margin Erosion</span>
          <span className="text-sm font-mono font-semibold text-amber-400">
            +{breakdown.marginErosionPts.toFixed(1)} pts
          </span>
        </div>
        <div className="p-2.5 rounded-md bg-slate-900/90 border border-slate-800">
          <span className="text-[11px] text-slate-400 block">Customer Tier Baseline</span>
          <span className="text-sm font-mono font-semibold text-cyan-400">
            +{breakdown.tierRiskPts.toFixed(1)} pts
          </span>
        </div>
      </div>

      {/* Itemized Reasons List */}
      <div className="mt-3 space-y-1.5">
        {breakdown.reasons.map((reason, index) => (
          <div key={index} className="flex items-start gap-2 text-xs text-slate-300">
            <span className="text-rose-400 font-bold mt-0.5">•</span>
            <span>{reason}</span>
          </div>
        ))}
      </div>

      {/* Required Approval Routing */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">Required Approval Chain:</span>
        <div className="flex items-center gap-1.5 font-medium">
          {approvalStage === 'None' || approvalStage === 'Fully Approved' ? (
            <span className="text-emerald-400">Auto-Approved (No Escalation Needed)</span>
          ) : isHigh ? (
            <span className="flex items-center gap-1 text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-800">
              Sales Manager <ArrowRight className="w-3 h-3 text-purple-400" /> Finance (R. Iyer)
            </span>
          ) : (
            <span className="text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800">
              Sales Manager (M. Shah)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
