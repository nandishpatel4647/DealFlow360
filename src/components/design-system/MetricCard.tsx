import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  delta?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  delta,
  isPositive = true,
  icon: Icon,
  variant = 'default',
  onClick,
}) => {
  const iconColors: Record<string, string> = {
    default: 'text-[var(--text-tertiary)]',
    primary: 'text-[var(--accent-primary)]',
    success: 'text-[var(--success)]',
    warning: 'text-[var(--warning)]',
    danger: 'text-[var(--danger)]',
  };

  const iconBg: Record<string, string> = {
    default: 'bg-[var(--bg-muted)]',
    primary: 'bg-[var(--accent-primary-soft)]',
    success: 'bg-[var(--success-soft)]',
    warning: 'bg-[var(--warning-soft)]',
    danger: 'bg-[var(--danger-soft)]',
  };

  return (
    <div
      onClick={onClick}
      className={`group p-5 animate-slide-up ${
        onClick ? 'surface-card-interactive' : 'surface-card'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="section-heading">{title}</span>
        <div className={`p-2 rounded-lg ${iconBg[variant]}`}>
          <Icon className={`w-4 h-4 ${iconColors[variant]}`} />
        </div>
      </div>

      <div className="flex items-baseline gap-2.5">
        <span className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
          {value}
        </span>
        {delta && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-md ${
              isPositive
                ? 'bg-[var(--success-soft)] text-[var(--success)]'
                : 'bg-[var(--danger-soft)] text-[var(--danger)]'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {delta}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-[var(--text-tertiary)]">{subtitle}</p>
      )}
    </div>
  );
};
