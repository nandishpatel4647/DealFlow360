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
  ExternalLink,
  Check,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { DealAnomaly } from '../../types';

export const DealHealthView: React.FC = () => {
  const { anomalies, resolveAnomaly, addCustomAuditLog, currentUser, setSelectedQuoteId, setActiveView } =
    useAppStore();

  const [activeTab, setActiveTab] = useState<'active' | 'resolved' | 'all'>('active');
  const [selectedAnomalyId, setSelectedAnomalyId] = useState<string>(
    anomalies.find((a) => !a.isResolved)?.id || anomalies[0]?.id || ''
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeAnomalies = anomalies.filter((a) => !a.isResolved);
  const resolvedAnomalies = anomalies.filter((a) => a.isResolved);

  const displayedAnomalies =
    activeTab === 'active'
      ? activeAnomalies
      : activeTab === 'resolved'
      ? resolvedAnomalies
      : anomalies;

  const selectedAnomaly =
    anomalies.find((a) => a.id === selectedAnomalyId) || displayedAnomalies[0] || anomalies[0];

  const handleNudgeRep = (anom: DealAnomaly) => {
    resolveAnomaly(anom.id, 'Nudge sent');
    addCustomAuditLog(
      anom.quoteId,
      currentUser?.name || 'Operations Lead',
      `Sent Automated Follow-Up Nudge to Sales Rep for ${anom.companyName}`,
      { issue: anom.description }
    );
    setToastMessage(`Automated nudge dispatched to Sales Rep for ${anom.companyName}. Anomaly marked addressed and counter decremented.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleEscalate = (anom: DealAnomaly) => {
    resolveAnomaly(anom.id, 'Escalated to Manager');
    addCustomAuditLog(
      anom.quoteId,
      currentUser?.name || 'Operations Lead',
      `Escalated Deal Anomaly (${anom.companyName}) to Sales Manager`,
      { issue: anom.description }
    );
    setToastMessage(`Deal anomaly for ${anom.companyName} escalated to Sales Manager. Anomaly marked in governance review.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleMarkResolved = (anom: DealAnomaly) => {
    resolveAnomaly(anom.id, 'Manually Resolved');
    setToastMessage(`Anomaly flag for ${anom.companyName} marked resolved.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleOpenQuote = (quoteId: string) => {
    setSelectedQuoteId(quoteId);
    setActiveView('builder');
  };

  const stalledCount = anomalies.filter((a) => !a.isResolved && a.anomalyType === 'Stalled Deal').length;
  const discountCount = anomalies.filter((a) => !a.isResolved && a.anomalyType === 'Discount Spike').length;
  const slippageCount = anomalies.filter((a) => !a.isResolved && a.anomalyType === 'Delivery Slippage').length;

  return (
    <div className="space-y-6">
      {/* Blueprint Page 14 Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs card-3d space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-rose-600" />
                Deal Health & Risk Surveillance Engine
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 badge-3d">
                Blueprint Page 14
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Autonomous AI risk detection flagging stalled deals, rogue discounts, and fulfillment delays before revenue slips.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-1.5 shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              {activeAnomalies.length} Active Platform Flags
            </span>
          </div>
        </div>
      </div>

      {/* Blueprint Page 14 - 3 Dynamic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Stalled Deals */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs card-3d space-y-1">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Stalled Deals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </span>
          <div className="text-xl font-extrabold text-slate-900 font-sans">
            {stalledCount} quote{stalledCount === 1 ? '' : 's'} idle 7+ days
          </div>
          <span className="text-[11px] text-slate-500 font-medium block">
            Requires sales rep nudge or proactive customer follow-up
          </span>
        </div>

        {/* Card 2: Discount Anomalies */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs card-3d space-y-1">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Discount Anomalies</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </span>
          <div className="text-xl font-extrabold text-slate-900 font-sans">
            {discountCount} above rep average
          </div>
          <span className="text-[11px] text-slate-500 font-medium block">
            Exceeds 90-day baseline discount ceilings and policy margins
          </span>
        </div>

        {/* Card 3: Delivery Slippage */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs card-3d space-y-1">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Delivery Slippage</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </span>
          <div className="text-xl font-extrabold text-slate-900 font-sans">
            {slippageCount} promise date{slippageCount === 1 ? '' : 's'} at risk
          </div>
          <span className="text-[11px] text-slate-500 font-medium block">
            Warehouse stock split allocation or expediting required
          </span>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5 shadow-xs animate-in fade-in duration-200">
          <Sparkles className="w-5 h-5 text-[#0176D3] shrink-0 mt-0.5" />
          <span className="font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Blueprint Page 14 Anomaly Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs card-3d space-y-4">
        {/* Table Toolbar & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
              Detected Deal Health Flags & Intervention Queue
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Click a row to inspect or execute real-time interventions
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                activeTab === 'active'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active Flags ({activeAnomalies.length})
            </button>
            <button
              onClick={() => setActiveTab('resolved')}
              className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                activeTab === 'resolved'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolved ({resolvedAnomalies.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-md font-bold transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({anomalies.length})
            </button>
          </div>
        </div>

        {displayedAnomalies.length === 0 ? (
          <div className="p-10 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold text-slate-800">
              {activeTab === 'active'
                ? 'All deal health anomalies are resolved! Zero commercial risks flagged.'
                : 'No flags in this category.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="p-3.5">Deal & Account</th>
                  <th className="p-3.5">Quotation #</th>
                  <th className="p-3.5">Detected Issue</th>
                  <th className="p-3.5">Type & Severity</th>
                  <th className="p-3.5">Flagged Date</th>
                  <th className="p-3.5">Status / Action</th>
                  <th className="p-3.5 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {displayedAnomalies.map((anom) => {
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
                          : anom.isResolved
                          ? 'bg-slate-50/40 opacity-75 hover:opacity-100 hover:bg-slate-50'
                          : 'hover:bg-slate-50/70'
                      }`}
                    >
                      <td className="p-3.5 font-extrabold text-slate-900">
                        {anom.companyName}
                      </td>
                      <td className="p-3.5 font-mono">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenQuote(anom.quoteId);
                          }}
                          className="text-[#0176D3] hover:underline font-bold flex items-center gap-1"
                        >
                          {anom.quoteId} <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-800">
                        {anom.description}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            anom.severity === 'Critical'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {anom.anomalyType}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-mono text-[11px]">
                        {formattedDate}
                      </td>
                      <td className="p-3.5 font-bold">
                        {anom.isResolved ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                            <Check className="w-3 h-3" /> {anom.actionTaken || 'Resolved'}
                          </span>
                        ) : (
                          <span className="text-[#0176D3] bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                            {anom.actionTaken || anom.recommendedAction || 'Action Required'}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        {!anom.isResolved ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleNudgeRep(anom)}
                              title="Send automated SLA follow-up nudge to sales rep"
                              className="px-2.5 py-1 text-[11px] font-bold bg-[#0176D3] hover:bg-blue-700 text-white rounded transition shadow-2xs flex items-center gap-1 cursor-pointer"
                            >
                              <BellRing className="w-3 h-3" /> Nudge
                            </button>
                            <button
                              onClick={() => handleEscalate(anom)}
                              title="Escalate discount or blocked deal to Sales Manager"
                              className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded transition shadow-2xs flex items-center gap-1 cursor-pointer"
                            >
                              <ArrowUpRight className="w-3 h-3" /> Escalate
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-semibold">Done</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Blueprint Action Buttons: Escalate (Red) & Nudge Rep (Blue) for Selected Anomaly */}
        {selectedAnomaly && !selectedAnomaly.isResolved && (
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 p-3 rounded-lg">
            <div className="text-xs text-slate-700 font-medium">
              Active Selection: <strong className="text-slate-900">{selectedAnomaly.companyName}</strong> ({selectedAnomaly.quoteId}) —{' '}
              <span className="text-slate-600">{selectedAnomaly.description}</span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => handleMarkResolved(selectedAnomaly)}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition cursor-pointer shadow-2xs flex items-center gap-1.5 btn-3d"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" /> Mark Resolved
              </button>

              {/* Escalate Button matching Blueprint Page 14 (Rose/Red Button) */}
              <button
                onClick={() => handleEscalate(selectedAnomaly)}
                className="px-4 py-2 rounded-lg text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white transition cursor-pointer shadow-2xs flex items-center gap-1.5 btn-3d"
              >
                <ArrowUpRight className="w-3.5 h-3.5" /> Escalate to Manager
              </button>

              {/* Nudge Rep Button matching Blueprint Page 14 (Blue Button) */}
              <button
                onClick={() => handleNudgeRep(selectedAnomaly)}
                className="px-4 py-2 rounded-lg text-xs font-extrabold bg-[#0176D3] hover:bg-blue-700 text-white transition cursor-pointer shadow-xs flex items-center gap-1.5 btn-3d"
              >
                <BellRing className="w-3.5 h-3.5" /> Nudge Rep
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
