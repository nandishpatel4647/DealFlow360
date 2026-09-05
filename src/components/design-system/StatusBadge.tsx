import React from 'react';
import { QuoteStatus } from '../../types';

interface StatusBadgeProps {
  status: QuoteStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config: Record<QuoteStatus, { bg: string; text: string; dot: string }> = {
    Draft: {
      bg: 'bg-[var(--bg-muted)]',
      text: 'text-[var(--text-tertiary)]',
      dot: 'bg-[var(--text-muted)]',
    },
    'Pending Manager': {
      bg: 'bg-[var(--warning-soft)]',
      text: 'text-[var(--warning)]',
      dot: 'bg-[var(--warning)]',
    },
    'Pending Finance': {
      bg: 'bg-[var(--info-soft)]',
      text: 'text-[var(--info)]',
      dot: 'bg-[var(--info)]',
    },
    'Fully Approved': {
      bg: 'bg-[var(--success-soft)]',
      text: 'text-[var(--success)]',
      dot: 'bg-[var(--success)]',
    },
    'Under Negotiation': {
      bg: 'bg-[var(--accent-primary-soft)]',
      text: 'text-[var(--accent-primary)]',
      dot: 'bg-[var(--accent-primary)]',
    },
    Fulfillment: {
      bg: 'bg-blue-50 dark:bg-blue-500/12',
      text: 'text-blue-600 dark:text-blue-400',
      dot: 'bg-blue-500',
    },
    Invoiced: {
      bg: 'bg-indigo-50 dark:bg-indigo-500/12',
      text: 'text-indigo-600 dark:text-indigo-400',
      dot: 'bg-indigo-500',
    },
    Paid: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/12',
      text: 'text-emerald-700 dark:text-emerald-400',
      dot: 'bg-emerald-500',
    },
    'Customer Accepted': {
      bg: 'bg-emerald-50 dark:bg-emerald-500/12',
      text: 'text-emerald-700 dark:text-emerald-400',
      dot: 'bg-emerald-500',
    },
    Allocated: {
      bg: 'bg-blue-50 dark:bg-blue-500/12',
      text: 'text-blue-600 dark:text-blue-400',
      dot: 'bg-blue-500',
    },
    Submitted: {
      bg: 'bg-[var(--warning-soft)]',
      text: 'text-[var(--warning)]',
      dot: 'bg-[var(--warning)]',
    },
    Superseded: {
      bg: 'bg-[var(--surface-sunken)]',
      text: 'text-[var(--text-tertiary)]',
      dot: 'bg-[var(--text-muted)]',
    },
    Rejected: {
      bg: 'bg-[var(--danger-soft)]',
      text: 'text-[var(--danger)]',
      dot: 'bg-[var(--danger)]',
    },
  };

  const current = config[status] || config.Draft;
  const sizing = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${current.bg} ${current.text} ${sizing}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} shrink-0`} />
      {status}
    </span>
  );
};
