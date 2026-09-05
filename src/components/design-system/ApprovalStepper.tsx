import React from 'react';
import { Check, Clock } from 'lucide-react';
import { QuoteStatus, RiskLevel } from '../../types';

interface ApprovalStepperProps {
  status: QuoteStatus;
  riskLevel?: RiskLevel;
}

export const ApprovalStepper: React.FC<ApprovalStepperProps> = ({ status }) => {
  const steps = [
    {
      id: 'draft',
      label: '1. Quote Draft',
      isCompleted: status !== 'Draft' && status !== 'Returned for Revision',
      isCurrent: status === 'Draft' || status === 'Returned for Revision',
    },
    {
      id: 'manager',
      label: '2. Sales Manager',
      isCompleted:
        status === 'Manager Approved' ||
        status === 'Pending Customer' ||
        status === 'Under Negotiation' ||
        status === 'Customer Revision Requested' ||
        status === 'Customer Approved' ||
        status === 'Pending Finance' ||
        status === 'Finance Approved' ||
        status === 'Fully Approved' ||
        status === 'Confirmed' ||
        status === 'Fulfillment' ||
        status === 'Invoiced' ||
        status === 'Paid',
      isCurrent: status === 'Pending Manager',
    },
    {
      id: 'rep_confirm',
      label: '3. Rep Confirmation',
      isCompleted:
        status === 'Pending Customer' ||
        status === 'Under Negotiation' ||
        status === 'Customer Revision Requested' ||
        status === 'Customer Approved' ||
        status === 'Pending Finance' ||
        status === 'Finance Approved' ||
        status === 'Fully Approved' ||
        status === 'Confirmed' ||
        status === 'Fulfillment' ||
        status === 'Invoiced' ||
        status === 'Paid',
      isCurrent: status === 'Manager Approved',
    },
    {
      id: 'customer',
      label: '4. Customer Review',
      isCompleted:
        status === 'Customer Approved' ||
        status === 'Pending Finance' ||
        status === 'Finance Approved' ||
        status === 'Fully Approved' ||
        status === 'Confirmed' ||
        status === 'Fulfillment' ||
        status === 'Invoiced' ||
        status === 'Paid',
      isCurrent:
        status === 'Pending Customer' ||
        status === 'Under Negotiation' ||
        status === 'Customer Revision Requested',
    },
    {
      id: 'finance',
      label: '5. Finance Review',
      isCompleted:
        status === 'Finance Approved' ||
        status === 'Fully Approved' ||
        status === 'Confirmed' ||
        status === 'Fulfillment' ||
        status === 'Invoiced' ||
        status === 'Paid',
      isCurrent: status === 'Pending Finance',
    },
    {
      id: 'fulfillment',
      label: '6. Fulfillment',
      isCompleted: status === 'Invoiced' || status === 'Paid',
      isCurrent:
        status === 'Finance Approved' ||
        status === 'Customer Approved' ||
        status === 'Fully Approved' ||
        status === 'Confirmed' ||
        status === 'Fulfillment',
    },
    {
      id: 'invoice',
      label: '7. Invoice',
      isCompleted: status === 'Paid',
      isCurrent: status === 'Invoiced',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
      <div className="flex items-center justify-between overflow-x-auto gap-2">
        {steps.map((step, idx) => {
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-1.5 min-w-[90px] flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    step.isCompleted
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : step.isCurrent
                      ? 'bg-blue-100 text-blue-700 border border-blue-400 ring-2 ring-blue-100'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {step.isCompleted ? (
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  ) : step.isCurrent ? (
                    <Clock className="w-3.5 h-3.5 text-blue-700 animate-pulse" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={`text-[11px] font-medium tracking-tight text-center leading-tight ${
                    step.isCompleted
                      ? 'text-slate-700 font-semibold'
                      : step.isCurrent
                      ? 'text-blue-700 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 min-w-[12px] -mt-4 transition ${
                    step.isCompleted ? 'bg-emerald-400' : 'bg-slate-200'
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
