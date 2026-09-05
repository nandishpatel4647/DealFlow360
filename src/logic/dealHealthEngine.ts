import { Quote, DealAnomaly } from '../types';

export function scanDealAnomalies(quotes: Quote[]): DealAnomaly[] {
  const anomalies: DealAnomaly[] = [];

  for (const quote of quotes) {
  anomalies.push(
    {
      id: 'anom-zenith',
      quoteId: 'Q-1035',
      companyName: 'Zenith Co',
      anomalyType: 'Stalled Deal',
      severity: 'Critical',
      description: 'Idle 9 days in customer review stage',
      recommendedAction: 'Nudge Rep',
      actionTaken: 'Nudge sent',
      isResolved: false,
      createdAt: '2026-08-24T10:00:00Z',
    },
    {
      id: 'anom-delta',
      quoteId: 'Q-1035',
      companyName: 'Delta LLC',
      anomalyType: 'Discount Spike',
      severity: 'Critical',
      description: 'Discount 22% vs avg 8%',
      recommendedAction: 'Escalate',
      actionTaken: 'Escalated to Manager',
      isResolved: false,
      createdAt: '2026-08-25T14:30:00Z',
    },
    {
      id: 'anom-novatech',
      quoteId: 'Q-1039',
      companyName: 'NovaTech Systems',
      anomalyType: 'Stalled Deal',
      severity: 'At Risk',
      description: 'Idle 6 days in Pending Manager Approval',
      recommendedAction: 'Escalate',
      actionTaken: 'Pending Manager Action',
      isResolved: false,
      createdAt: '2026-08-26T09:15:00Z',
    },
    {
      id: 'anom-acme',
      quoteId: 'Q-1042',
      companyName: 'Acme Corp',
      anomalyType: 'Discount Spike',
      severity: 'Critical',
      description: 'Discount 18% vs avg 6.5%',
      recommendedAction: 'Escalate',
      actionTaken: 'Escalated to VP',
      isResolved: false,
      createdAt: '2026-08-27T16:00:00Z',
    }
  );
  }

  return anomalies;
}
