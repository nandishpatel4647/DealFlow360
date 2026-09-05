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
    <div className="modal-overlay flex items-center justify-center p-4">
      <div className="modal-content p-6 max-w-2xl w-full space-y-4">
        {/* Header */}
        <div
          className="flex items-center justify-between pb-3"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-2 text-[var(--accent-primary)]">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Ask DealFlow — Deal Intelligence
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded cursor-pointer transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Ask about deals, risks, margins, or approvals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query) handleRunQuery(query);
            }}
            className="input-field !pl-10 !pr-24 !py-2.5 !text-xs font-medium"
          />
          <button
            onClick={() => query && handleRunQuery(query)}
            className="absolute right-2 top-2 btn-primary !py-1 !px-3 !text-xs"
          >
            Ask
          </button>
        </div>

        {/* Suggested */}
        <div className="flex flex-wrap gap-1.5">
          {sampleQueries.map((sq) => (
            <button
              key={sq}
              onClick={() => handleRunQuery(sq)}
              className="text-[11px] px-2.5 py-1 rounded-full transition cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-muted)',
                color: 'var(--text-tertiary)',
                border: '1px solid var(--border-default)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-muted)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)';
              }}
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Results */}
        {result && (
          <div
            className="mt-4 p-4 rounded-lg space-y-3 animate-slide-up"
            style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-default)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--accent-primary)]">{result.headline}</span>
              <span className="text-[11px] font-mono text-[var(--text-muted)]">
                {result.matchedQuotes.length} matched
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{result.summary}</p>

            <div
              className="space-y-2 pt-2"
              style={{ borderTop: '1px solid var(--border-default)' }}
            >
              {result.matchedQuotes.map((q) => (
                <div
                  key={q.id}
                  onClick={() => {
                    setSelectedQuoteId(q.id);
                    setActiveView('builder');
                    onClose();
                  }}
                  className="surface-card-interactive p-2.5 flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--accent-primary)]">{q.id}</span>
                    <span className="font-sans text-[var(--text-primary)] font-medium">{q.companyName}</span>
                    <span className="text-[var(--text-muted)] font-sans text-[11px]">({q.tier})</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[var(--text-primary)] font-bold">
                      ₹{q.totalNetAmount.toLocaleString('en-IN')}
                    </span>
                    <RiskBadge level={q.riskLevel} score={q.blendedRiskScore} size="sm" />
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
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
