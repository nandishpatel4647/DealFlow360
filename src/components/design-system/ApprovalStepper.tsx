import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
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
      label: '1. Quote Draft',
      isCompleted: status !== 'Draft',
      isCurrent: status === 'Draft',
    },
    {
      id: 'manager',
      label: '2. Sales Manager',
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
            label: '3. Finance Approver',
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
      label: isHighRisk ? '4. Customer Portal' : '3. Customer Portal',
      isCompleted:
        status === 'Fulfillment' || status === 'Invoiced' || status === 'Paid',
      isCurrent: status === 'Under Negotiation' || status === 'Fully Approved',
    },
    {
      id: 'fulfillment',
      label: isHighRisk ? '5. Fulfillment & Pay' : '4. Fulfillment & Pay',
      isCompleted: status === 'Paid',
      isCurrent: status === 'Fulfillment' || status === 'Invoiced',
    },
  ];

  return (
    <div className="surface-card p-4">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition ${
                    step.isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : step.isCurrent
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 ring-2 ring-cyan-500/20'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  {step.isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : step.isCurrent ? (
                    <Clock className="w-3.5 h-3.5 pulse-indicator" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={`text-[11px] font-medium tracking-tight text-center ${
                    step.isCompleted
                      ? 'text-slate-300'
                      : step.isCurrent
                      ? 'text-cyan-400 font-semibold'
                      : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 -mt-4 transition ${
                    step.isCompleted ? 'bg-emerald-500/40' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
