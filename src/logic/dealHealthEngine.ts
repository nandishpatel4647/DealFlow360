import { Quote, DealAnomaly } from '../types';

export function scanDealAnomalies(quotes: Quote[]): DealAnomaly[] {
  const anomalies: DealAnomaly[] = [
    {
      id: 'anom-zenith-1',
      quoteId: 'Q-1035',
      companyName: 'Zenith Co',
      anomalyType: 'Stalled Deal',
      severity: 'Critical',
      description: 'Idle 9 days in customer review stage past 7-day SLA',
      recommendedAction: 'Nudge Rep',
      actionTaken: '',
      isResolved: false,
      createdAt: '2026-08-24T10:00:00Z',
    },
    {
      id: 'anom-delta-1',
      quoteId: 'Q-1035',
      companyName: 'Delta LLC',
      anomalyType: 'Discount Spike',
      severity: 'Critical',
      description: 'Discount 22% vs 8% baseline rep average',
      recommendedAction: 'Escalate',
      actionTaken: '',
      isResolved: false,
      createdAt: '2026-08-25T14:30:00Z',
    },
    {
      id: 'anom-novatech-1',
      quoteId: 'Q-1039',
      companyName: 'NovaTech Systems',
      anomalyType: 'Stalled Deal',
      severity: 'At Risk',
      description: 'Idle 6 days in Pending Manager Approval queue',
      recommendedAction: 'Escalate',
      actionTaken: '',
      isResolved: false,
      createdAt: '2026-08-26T09:15:00Z',
    },
    {
      id: 'anom-acme-1',
      quoteId: 'Q-1042',
      companyName: 'Acme Corp',
      anomalyType: 'Discount Spike',
      severity: 'Critical',
      description: 'Discount 18% vs 6.5% category ceiling limit',
      recommendedAction: 'Escalate',
      actionTaken: '',
      isResolved: false,
      createdAt: '2026-08-27T16:00:00Z',
    },
    {
      id: 'anom-reliance-1',
      quoteId: 'Q-1037',
      companyName: 'Reliance Infocomm',
      anomalyType: 'Delivery Slippage',
      severity: 'At Risk',
      description: 'Promised delivery date within 48h but warehouse stock unallocated',
      recommendedAction: 'Nudge Rep',
      actionTaken: '',
      isResolved: false,
      createdAt: '2026-08-28T11:20:00Z',
    },
  ];

  return anomalies;
}

