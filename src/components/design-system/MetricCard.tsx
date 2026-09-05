import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  delta?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  variant?: 'default' | 'cyan' | 'emerald' | 'amber' | 'crimson';
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
  const variantStyles = {
    default: 'text-slate-400 group-hover:text-slate-200',
    cyan: 'text-cyan-400 group-hover:text-cyan-300',
    emerald: 'text-emerald-400 group-hover:text-emerald-300',
    amber: 'text-amber-400 group-hover:text-amber-300',
    crimson: 'text-rose-400 group-hover:text-rose-300',
  };

  return (
    <div
      onClick={onClick}
      className={`group surface-card p-5 surface-interactive relative overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-2 rounded-lg bg-slate-900/80 border border-slate-800 ${variantStyles[variant]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-white">{value}</span>
        {delta && (
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {delta}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};
