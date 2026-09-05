import React from 'react';
import { Check, Clock, Circle } from 'lucide-react';
import { QuoteStatus, RiskLevel } from '../../types';

interface ApprovalStepperProps {
  status: QuoteStatus;
  riskLevel: RiskLevel;
}

export const ApprovalStepper: React.FC<ApprovalStepperProps> = ({ status, riskLevel }) => {
  const isHighRisk = riskLevel === 'HIGH';

  const steps = [
    {
      id: 'draft',
      label: 'Quote Draft',
      isCompleted: status !== 'Draft',
      isCurrent: status === 'Draft',
    },
    {
      id: 'manager',
      label: 'Sales Manager',
      isCompleted:
        status === 'Pending Finance' ||
        status === 'Fully Approved' ||
        status === 'Under Negotiation' ||
        status === 'Fulfillment' ||
        status === 'Invoiced' ||
        status === 'Paid',
      isCurrent: status === 'Pending Manager',
    },
    ...(isHighRisk
      ? [
          {
            id: 'finance',
            label: 'Finance Approver',
            isCompleted:
              status === 'Fully Approved' ||
              status === 'Under Negotiation' ||
              status === 'Fulfillment' ||
              status === 'Invoiced' ||
              status === 'Paid',
            isCurrent: status === 'Pending Finance',
          },
        ]
      : []),
    {
      id: 'customer',
      label: 'Customer Portal',
      isCompleted:
        status === 'Fulfillment' || status === 'Invoiced' || status === 'Paid',
      isCurrent: status === 'Under Negotiation' || status === 'Fully Approved',
    },
    {
      id: 'fulfillment',
      label: 'Fulfillment & Pay',
      isCompleted: status === 'Paid',
      isCurrent: status === 'Fulfillment' || status === 'Invoiced',
    },
  ];

  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                  step.isCompleted
                    ? 'bg-[var(--success)] text-white shadow-sm'
                    : step.isCurrent
                    ? 'bg-[var(--accent-primary)] text-white shadow-sm ring-4 ring-[var(--accent-primary-soft)]'
                    : 'bg-[var(--bg-muted)] text-[var(--text-muted)] border border-[var(--border-default)]'
                }`}
              >
                {step.isCompleted ? (
                  <Check className="w-3.5 h-3.5" />
                ) : step.isCurrent ? (
                  <Clock className="w-3.5 h-3.5" />
                ) : (
                  <Circle className="w-2.5 h-2.5" />
                )}
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight text-center leading-tight ${
                  step.isCompleted
                    ? 'text-[var(--text-secondary)]'
                    : step.isCurrent
                    ? 'text-[var(--accent-primary)] font-semibold'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                {step.label}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 -mt-5 rounded-full transition-colors ${
                  step.isCompleted ? 'bg-[var(--success)]' : 'bg-[var(--border-default)]'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
