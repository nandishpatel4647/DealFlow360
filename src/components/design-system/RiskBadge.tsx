import React from 'react';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, size = 'md' }) => {
  const styles = {
    LOW: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-500',
    },
    MEDIUM: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    HIGH: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
      dot: 'bg-rose-500',
    },
  };

  const current = styles[level] || styles.LOW;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${current.bg} ${current.text} ${current.border} ${padding}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} pulse-indicator`} />
      <span>{level} RISK</span>
      {score !== undefined && (
        <span className="opacity-80 text-[10px] font-mono">({score.toFixed(1)})</span>
      )}
    </span>
  );
};

