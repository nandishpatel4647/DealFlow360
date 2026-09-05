import React from 'react';
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
  const iconContainerStyles = {
    default: 'bg-slate-100 text-slate-600 border-slate-200',
    cyan: 'bg-blue-50 text-blue-600 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    crimson: 'bg-rose-50 text-rose-600 border-rose-200',
  };

  return (
    <div
      onClick={onClick}
      className={`group bg-white rounded-lg border border-slate-200 p-5 shadow-xs transition hover:shadow-md hover:border-slate-300 relative overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg border ${iconContainerStyles[variant]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {delta && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-md ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {delta}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-500 font-medium">{subtitle}</p>}
    </div>
  );
};

