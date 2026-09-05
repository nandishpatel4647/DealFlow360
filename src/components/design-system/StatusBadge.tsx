import React from 'react';
import { QuoteStatus } from '../../types';

interface StatusBadgeProps {
  status: QuoteStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<QuoteStatus, { bg: string; text: string; border: string }> = {
    Draft: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
    },
    'Pending Manager': {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
    },
    'Manager Approved': {
      bg: 'bg-[#EAF5FE]',
      text: 'text-[#0176D3]',
      border: 'border-blue-200',
    },
    'Pending Customer': {
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
    },
    'Customer Revision Requested': {
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      border: 'border-orange-200',
    },
    'Customer Approved': {
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-200',
    },
    'Pending Finance': {
      bg: 'bg-purple-50',
      text: 'text-purple-800',
      border: 'border-purple-200',
    },
    'Finance Approved': {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
    },
    'Fully Approved': {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
    },
    'Under Negotiation': {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
    },
    Confirmed: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
    },
    Fulfillment: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      border: 'border-indigo-200',
    },
    Invoiced: {
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      border: 'border-sky-200',
    },
    Paid: {
      bg: 'bg-teal-50',
      text: 'text-teal-800',
      border: 'border-teal-200',
    },
    'Returned for Revision': {
      bg: 'bg-[#FFF4E5]',
      text: 'text-[#B76E00]',
      border: 'border-[#FFD599]',
    },
    Rejected: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
    },
    'Rejected by Sales Manager': {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
    },
    'Rejected by Finance': {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200',
    },
  };

  const current = styles[status] || styles.Draft;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${current.bg} ${current.text} ${current.border}`}
    >
      {status}
    </span>
  );
};

