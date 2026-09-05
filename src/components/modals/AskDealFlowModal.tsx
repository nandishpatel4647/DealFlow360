import React, { useState } from 'react';
import { Sparkles, Search, ArrowRight, X, ShieldAlert, TrendingUp } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { executeAskDealFlowQuery } from '../../logic/aiEngine';
import { RiskBadge } from '../design-system/RiskBadge';
import { StatusBadge } from '../design-system/StatusBadge';

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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="surface-card p-6 max-w-2xl w-full border border-cyan-500/40 shadow-2xl shadow-cyan-950/50 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Ask DealFlow — Natural Language Deal Intelligence
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-cyan-400" />
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
            className="w-full pl-10 pr-24 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 font-medium"
          />
          <button
            onClick={() => query && handleRunQuery(query)}
            className="absolute right-2 top-2 px-3 py-1 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition cursor-pointer"
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
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition cursor-pointer"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Results Box */}
        {result && (
          <div className="mt-4 p-4 rounded-lg bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300">{result.headline}</span>
              <span className="text-[11px] font-mono text-slate-400">
                {result.matchedQuotes.length} Deals Matched
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{result.summary}</p>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              {result.matchedQuotes.map((q) => (
                <div
                  key={q.id}
                  onClick={() => {
                    setSelectedQuoteId(q.id);
                    setActiveView('builder');
                    onClose();
                  }}
                  className="p-2.5 rounded bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between cursor-pointer transition text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-400">{q.id}</span>
                    <span className="font-sans text-white font-medium">{q.companyName}</span>
                    <span className="text-slate-400 font-sans text-[11px]">({q.tier} Tier)</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold">
                      ₹{q.totalNetAmount.toLocaleString('en-IN')}
                    </span>
                    <RiskBadge level={q.riskLevel} score={q.blendedRiskScore} size="sm" />
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
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
