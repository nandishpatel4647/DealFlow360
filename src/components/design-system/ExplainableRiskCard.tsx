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
  const isRisky = isHigh || isMed;

  const accentColor = isHigh ? 'var(--danger)' : isMed ? 'var(--warning)' : 'var(--success)';

  return (
    <div
      className="surface-card p-5"
      style={isRisky ? { borderLeft: `3px solid ${accentColor}` } : undefined}
    >
      <div
        className="flex items-center justify-between pb-3"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center gap-2">
          {isRisky ? (
            <ShieldAlert className="w-5 h-5" style={{ color: accentColor }} />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />
          )}
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {isRisky ? 'Risk Assessment' : 'Governance Status'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-tertiary)]">Blended Score:</span>
          <span
            className="font-mono text-base font-bold px-2.5 py-0.5 rounded-md"
            style={{
              backgroundColor: isHigh
                ? 'var(--danger-soft)'
                : isMed
                ? 'var(--warning-soft)'
                : 'var(--success-soft)',
              color: accentColor,
            }}
          >
            {breakdown.totalScore.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Point Contribution Breakdown */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: 'Service / Line Overage', value: breakdown.serviceDeviationPts, color: 'var(--danger)' },
          { label: 'Margin Erosion', value: breakdown.marginErosionPts, color: 'var(--warning)' },
          { label: 'Customer Tier Factor', value: breakdown.tierRiskPts, color: 'var(--accent-primary)' },
        ].map((item) => (
          <div
            key={item.label}
            className="p-3 rounded-lg"
            style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-subtle)' }}
          >
            <span className="text-[11px] text-[var(--text-muted)] block">{item.label}</span>
            <span
              className="text-sm font-mono font-semibold mt-0.5 block"
              style={{ color: item.color }}
            >
              +{item.value.toFixed(1)} pts
            </span>
          </div>
        ))}
      </div>

      {/* Itemized Reasons */}
      <div className="mt-3 space-y-1.5">
        {breakdown.reasons.map((reason, index) => (
          <div key={index} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
            <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: accentColor }} />
            <span>{reason}</span>
          </div>
        ))}
      </div>

      {/* Required Approval Routing */}
      <div
        className="mt-4 pt-3 flex items-center justify-between text-xs"
        style={{ borderTop: '1px solid var(--border-default)' }}
      >
        <span className="text-[var(--text-tertiary)] font-medium">Required Approval:</span>
        <div className="flex items-center gap-1.5 font-medium">
          {approvalStage === 'None' || approvalStage === 'Fully Approved' ? (
            <span className="text-[var(--success)] bg-[var(--success-soft)] px-2.5 py-1 rounded-full text-xs">
              Auto-Approved
            </span>
          ) : isHigh ? (
            <span className="flex items-center gap-1 text-[var(--info)] bg-[var(--info-soft)] px-2.5 py-1 rounded-full">
              Sales Manager <ArrowRight className="w-3 h-3" /> Finance
            </span>
          ) : (
            <span className="text-[var(--warning)] bg-[var(--warning-soft)] px-2.5 py-1 rounded-full">
              Sales Manager
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
