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
    default: 'bg-slate-100 text-slate-700 border-slate-200 group-hover:bg-slate-200',
    cyan: 'bg-blue-50 text-blue-600 border-blue-200 group-hover:bg-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200 group-hover:bg-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-200 group-hover:bg-amber-100',
    crimson: 'bg-rose-50 text-rose-600 border-rose-200 group-hover:bg-rose-100',
  };

  return (
    <div
      onClick={onClick}
      className={`group bg-white rounded-xl border border-slate-200 p-5 card-hover-3d relative overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Top subtle light bevel */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-700 transition">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border transition-all duration-200 group-hover:scale-110 shadow-2xs ${iconContainerStyles[variant]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-900 transition font-sans">{value}</span>
        {delta && (
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-md badge-3d ${
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

