import React from 'react';
import { RiskLevel } from '../../types';
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, size = 'md' }) => {
  const config = {
    LOW: {
      bg: 'bg-[var(--success-soft)]',
      text: 'text-[var(--success)]',
      icon: ShieldCheck,
      label: 'Low Risk',
    },
    MEDIUM: {
      bg: 'bg-[var(--warning-soft)]',
      text: 'text-[var(--warning)]',
      icon: Shield,
      label: 'Medium Risk',
    },
    HIGH: {
      bg: 'bg-[var(--danger-soft)]',
      text: 'text-[var(--danger)]',
      icon: ShieldAlert,
      label: 'High Risk',
    },
  };

  const current = config[level] || config.LOW;
  const Icon = current.icon;
  const sizing = size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${current.bg} ${current.text} ${sizing}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{current.label}</span>
      {score !== undefined && (
        <span className="opacity-60 font-mono text-[10px]">({score.toFixed(1)})</span>
      )}
    </span>
  );
};
