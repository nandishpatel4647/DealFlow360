import React, { useState } from 'react';
import { Sparkles, Search, ArrowRight, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { executeAskDealFlowQuery } from '../../logic/aiEngine';
import { RiskBadge } from '../design-system/RiskBadge';

export const AskDealFlowModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { quotes, setSelectedQuoteId, setActiveView } = useAppStore();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{
    headline: string;
    matchedQuotes: typeof quotes;
    summary: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleRunQuery = (qText: string) => {
    setQuery(qText);
    const res = executeAskDealFlowQuery(qText, quotes);
    setResult(res);
  };

  const sampleQueries = [
    'Which quotations require finance approval?',
    'Show stalled deals with risk anomalies',
    'Which deal has the highest margin?',
    'Which deals are most likely to close this week?',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full border border-slate-200 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 text-blue-700">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Ask DealFlow — Deal Intelligence Assistant
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Ask anything about active deals, risk scores, margins, or finance approvals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query) {
                handleRunQuery(query);
              }
            }}
            className="w-full pl-10 pr-24 py-2.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-medium"
          />
          <button
            onClick={() => query && handleRunQuery(query)}
            className="absolute right-2 top-2 px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            Ask
          </button>
        </div>

        {/* Suggested Queries */}
        <div className="flex flex-wrap gap-1.5">
          {sampleQueries.map((sq) => (
            <button
              key={sq}
              onClick={() => handleRunQuery(sq)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-medium transition cursor-pointer"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Results Box */}
        {result && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900">{result.headline}</span>
              <span className="text-[11px] font-mono text-slate-500 font-medium">
                {result.matchedQuotes.length} Deals Matched
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">{result.summary}</p>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              {result.matchedQuotes.map((q) => (
                <div
                  key={q.id}
                  onClick={() => {
                    setSelectedQuoteId(q.id);
                    setActiveView('builder');
                    onClose();
                  }}
                  className="p-3 rounded-lg bg-white hover:bg-slate-100/80 border border-slate-200 flex items-center justify-between cursor-pointer transition text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-700">{q.id}</span>
                    <span className="font-sans text-slate-900 font-semibold">{q.companyName}</span>
                    <span className="text-slate-500 font-sans text-[11px]">({q.tier} Tier)</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-slate-900 font-bold">
                      ₹{q.totalNetAmount.toLocaleString('en-IN')}
                    </span>
                    <RiskBadge level={q.riskLevel} score={q.blendedRiskScore} size="sm" />
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

