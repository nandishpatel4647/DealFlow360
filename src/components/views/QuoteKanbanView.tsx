import React, { useState } from 'react';
import {
  Plus,
  Search,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { QuoteStatus } from '../../types';
import { RiskBadge } from '../design-system/RiskBadge';

export const QuoteKanbanView: React.FC = () => {
  const { quotes, setSelectedQuoteId, setActiveView, createNewQuote, companies } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  const columns: { id: string; title: string; statuses: QuoteStatus[]; accent: string }[] = [
    { id: 'draft', title: 'Draft', statuses: ['Draft'], accent: 'var(--text-muted)' },
    {
      id: 'pending',
      title: 'Pending Approval',
      statuses: ['Pending Manager', 'Pending Finance'],
      accent: 'var(--warning)',
    },
    {
      id: 'negotiation',
      title: 'Negotiation',
      statuses: ['Under Negotiation'],
      accent: 'var(--accent-primary)',
    },
    {
      id: 'approved',
      title: 'Approved',
      statuses: ['Fully Approved'],
      accent: 'var(--success)',
    },
    {
      id: 'fulfillment',
      title: 'Fulfillment & Paid',
      statuses: ['Fulfillment', 'Invoiced', 'Paid'],
      accent: 'var(--info)',
    },
  ];

  const filteredQuotes = quotes.filter(
    (q) =>
      q.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.salesRep.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div
        className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
            Deal Pipeline
          </h1>
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field !pl-9 !py-1.5 !text-xs"
            />
          </div>
          <span className="text-xs text-[var(--text-tertiary)] font-medium">
            {filteredQuotes.length} deals
          </span>
        </div>

        <button
          onClick={() => {
            const newId = createNewQuote(companies[0].id);
            setSelectedQuoteId(newId);
            setActiveView('builder');
          }}
          className="btn-primary"
        >
          <Plus className="w-3.5 h-3.5" /> New Quotation
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start min-h-[600px] pb-6">
        {columns.map((col) => {
          const colQuotes = filteredQuotes.filter((q) => col.statuses.includes(q.status));
          const colTotal = colQuotes.reduce((sum, q) => sum + q.totalNetAmount, 0);

          return (
            <div
              key={col.id}
              className="rounded-xl flex flex-col gap-3 min-h-[500px] p-3"
              style={{
                backgroundColor: 'var(--bg-muted)',
                borderTop: `3px solid ${col.accent}`,
              }}
            >
              {/* Column Header */}
              <div
                className="flex items-center justify-between pb-2.5"
                style={{ borderBottom: '1px solid var(--border-default)' }}
              >
                <div>
                  <span className="text-xs font-semibold text-[var(--text-primary)] block">
                    {col.title}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    ₹{(colTotal / 1000).toFixed(0)}k • {colQuotes.length} deals
                  </span>
                </div>
                <span
                  className="w-5 h-5 rounded-full text-[11px] font-mono flex items-center justify-center font-semibold"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-tertiary)',
                    border: '1px solid var(--border-default)',
                  }}
                >
                  {colQuotes.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2.5 flex-1">
                {colQuotes.map((q, idx) => (
                  <div
                    key={q.id}
                    onClick={() => {
                      setSelectedQuoteId(q.id);
                      setActiveView('builder');
                    }}
                    className="surface-card-interactive p-3.5 animate-slide-up"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-mono font-semibold text-[var(--accent-primary)]">
                        {q.id}
                      </span>
                      <RiskBadge level={q.riskLevel} score={q.blendedRiskScore} size="sm" />
                    </div>

                    <h4 className="mt-2 text-[13px] font-semibold text-[var(--text-primary)] line-clamp-1">
                      {q.companyName}
                    </h4>

                    <div className="mt-2 flex items-baseline justify-between text-xs font-mono">
                      <span className="text-[var(--text-primary)] font-bold">
                        ₹{q.totalNetAmount.toLocaleString('en-IN')}
                      </span>
                      <span
                        className="font-semibold"
                        style={{
                          color:
                            q.overallMarginPercent >= 30
                              ? 'var(--success)'
                              : 'var(--warning)',
                        }}
                      >
                        {q.overallMarginPercent}%
                      </span>
                    </div>

                    <div
                      className="mt-2 pt-2 flex items-center justify-between text-[11px] text-[var(--text-muted)]"
                      style={{ borderTop: '1px solid var(--border-subtle)' }}
                    >
                      <span>{q.tier} Tier</span>
                      <span className="font-mono font-medium text-[var(--accent-primary)]">
                        {q.dealConfidence}% conf.
                      </span>
                    </div>
                  </div>
                ))}

                {colQuotes.length === 0 && (
                  <div
                    className="h-32 rounded-lg flex items-center justify-center text-xs"
                    style={{
                      border: '2px dashed var(--border-default)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    No deals in stage
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
