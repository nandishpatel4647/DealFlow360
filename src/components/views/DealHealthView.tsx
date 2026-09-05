import React, { useState } from 'react';
import {
  HeartPulse,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Send,
  ArrowUpRight,
  CheckCircle2,
  BellRing,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { DealAnomaly } from '../../types';

export const DealHealthView: React.FC = () => {
  const { anomalies, resolveAnomaly, addCustomAuditLog, currentUser, setSelectedQuoteId, setActiveView } =
    useAppStore();

  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string>(anomalies[0]?.id || 'anom-zenith');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedAnomaly = anomalies.find((a) => a.id === selectedAnomalyId) || anomalies[0];

  const handleNudgeRep = (anom: DealAnomaly) => {
    anom.actionTaken = 'Nudge sent';
    addCustomAuditLog(
      anom.quoteId,
      currentUser?.name || 'Operations Lead',
      `Sent Automated Follow-Up Nudge to Sales Rep for ${anom.companyName}`,
      { issue: anom.description }
    );
    setToastMessage(`Automated nudge sent to Sales Rep for ${anom.companyName}. Action updated to "Nudge sent".`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleEscalate = (anom: DealAnomaly) => {
    anom.actionTaken = 'Escalated to Manager';
    addCustomAuditLog(
      anom.quoteId,
      currentUser?.name || 'Operations Lead',
      `Escalated Deal Anomaly (${anom.companyName}) to Sales Manager`,
      { issue: anom.description }
    );
    setToastMessage(`Deal anomaly for ${anom.companyName} escalated to Sales Manager. Action updated to "Escalated to Manager".`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Blueprint Page 14 Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
            Deal Health and Anomaly Dashboard
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
            Blueprint Page 14
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Real-time flags for stalled deals and unusual discount patterns
        </p>
      </div>

      {/* Blueprint Page 14 - 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Stalled Deals */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Stalled Deals
          </span>
          <div className="text-lg font-extrabold text-slate-900 font-sans">
            5 quotes idle 7+ days
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Requires sales rep nudge or customer follow-up
          </span>
        </div>

        {/* Card 2: Discount Anomalies */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Discount Anomalies
          </span>
          <div className="text-lg font-extrabold text-slate-900 font-sans">
            2 above rep average
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Exceeds 90-day baseline discount ceilings
          </span>
        </div>

        {/* Card 3: Delivery Slippage */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Delivery Slippage
          </span>
          <div className="text-lg font-extrabold text-slate-900 font-sans">
            3 promise dates at risk
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Warehouse stock split allocation required
          </span>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5 shadow-xs">
          <Sparkles className="w-5 h-5 text-[#0176D3] shrink-0 mt-0.5" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Blueprint Page 14 Anomaly Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Detected Deal Health Flags & Anomaly Intervention Queue
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Click row to select for action
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-4">Deal</th>
                <th className="p-4">Issue</th>
                <th className="p-4">Flagged</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {anomalies.map((anom) => {
                const isSelected = selectedAnomalyId === anom.id;
                const formattedDate = anom.createdAt
                  ? new Date(anom.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Aug 24';

                return (
                  <tr
                    key={anom.id}
                    onClick={() => setSelectedAnomalyId(anom.id)}
                    className={`transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-l-[#0176D3]'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    <td className="p-4 font-extrabold text-slate-900">{anom.companyName}</td>
                    <td className="p-4 font-bold text-slate-800">{anom.description}</td>
                    <td className="p-4 text-slate-600 font-mono">{formattedDate}</td>
                    <td className="p-4 font-extrabold text-[#0176D3]">
                      {anom.actionTaken || anom.recommendedAction}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Blueprint Action Buttons: Escalate (Red) & Nudge Rep (Blue) */}
        {selectedAnomaly && (
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-600 font-medium">
              Selected Deal: <strong className="text-slate-900">{selectedAnomaly.companyName}</strong> —{' '}
              <span className="text-slate-500">{selectedAnomaly.description}</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Escalate Button matching Blueprint Page 14 (Rose/Red Button) */}
              <button
                onClick={() => handleEscalate(selectedAnomaly)}
                className="px-5 py-2.5 rounded-lg text-xs font-extrabold bg-rose-500 hover:bg-rose-600 text-white transition cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                <ArrowUpRight className="w-4 h-4" /> Escalate
              </button>

              {/* Nudge Rep Button matching Blueprint Page 14 (Blue Button) */}
              <button
                onClick={() => handleNudgeRep(selectedAnomaly)}
                className="px-5 py-2.5 rounded-lg text-xs font-extrabold bg-[#0176D3] hover:bg-blue-700 text-white transition cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <BellRing className="w-4 h-4" /> Nudge Rep
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
