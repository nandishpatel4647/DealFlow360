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
      className={`rounded-xl border p-5 transition-all card-3d ${
        isHigh
          ? 'border-rose-300 bg-rose-50/25'
          : isMed
          ? 'border-amber-300 bg-amber-50/25'
          : 'border-emerald-300 bg-emerald-50/25'
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          {isHigh || isMed ? (
            <div className={`p-1.5 rounded-lg ${isHigh ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'} shadow-2xs`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 shadow-2xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          <span className="text-sm font-extrabold tracking-wide uppercase text-slate-900">
            {isHigh || isMed ? 'Why This Deal Requires Approval' : 'Risk & Governance Assessment'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-semibold">Blended Risk Score:</span>
          <span
            className={`font-mono text-sm font-extrabold px-3 py-0.5 rounded-lg badge-3d ${
              isHigh
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : isMed
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
          >
            {breakdown.totalScore.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Point Contribution Breakdown */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium block">Line Discount Deviation</span>
          <span className="text-sm font-mono font-bold text-rose-700">
            +{breakdown.serviceDeviationPts.toFixed(1)} pts
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium block">Margin Erosion Impact</span>
          <span className="text-sm font-mono font-bold text-amber-700">
            +{breakdown.marginErosionPts.toFixed(1)} pts
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
          <span className="text-[11px] text-slate-500 font-medium block">Customer Tier Weight</span>
          <span className="text-sm font-mono font-bold text-blue-700">
            +{breakdown.tierRiskPts.toFixed(1)} pts
          </span>
        </div>
      </div>

      {/* Itemized Reasons List */}
      <div className="mt-3 space-y-1.5">
        {breakdown.reasons.map((reason, index) => (
          <div key={index} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
            <span className="text-rose-500 font-bold mt-0.5">•</span>
            <span>{reason}</span>
          </div>
        ))}
      </div>

      {/* Required Approval Routing */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
        <span className="text-slate-600 font-semibold">Required Approval Path:</span>
        <div className="flex items-center gap-1.5 font-medium">
          {approvalStage === 'None' || approvalStage === 'Fully Approved' ? (
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Auto-Approved (Low Risk)
            </span>
          ) : isHigh ? (
            <span className="flex items-center gap-1 text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200 font-semibold">
              Sales Manager <ArrowRight className="w-3 h-3 text-purple-600" /> Finance (R. Iyer)
            </span>
          ) : (
            <span className="text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200 font-semibold">
              Sales Manager (M. Shah)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

