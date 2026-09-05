import React from 'react';
import { QuoteStatus } from '../../types';

interface StatusBadgeProps {
  status: QuoteStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<QuoteStatus, { bg: string; text: string; border: string }> = {
    Draft: {
      bg: 'bg-slate-800/60',
      text: 'text-slate-300',
      border: 'border-slate-700',
    },
    'Pending Manager': {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
    },
    'Pending Finance': {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      border: 'border-purple-500/30',
    },
    'Fully Approved': {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
    },
    'Under Negotiation': {
      bg: 'bg-cyan-500/10',
      text: 'text-cyan-400',
      border: 'border-cyan-500/30',
    },
    Fulfillment: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
    },
    Invoiced: {
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      border: 'border-indigo-500/30',
    },
    Paid: {
      bg: 'bg-teal-500/10',
      text: 'text-teal-400',
      border: 'border-teal-500/30',
    },
    Rejected: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
    },
  };

  const current = styles[status] || styles.Draft;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${current.bg} ${current.text} ${current.border}`}
    >
      {status}
    </span>
  );
};
