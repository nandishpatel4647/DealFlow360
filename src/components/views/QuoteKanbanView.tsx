import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  ArrowRight,
  TrendingUp,
  Building,
  User,
  ShieldAlert,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Quote, QuoteStatus } from '../../types';
import { RiskBadge } from '../design-system/RiskBadge';

export const QuoteKanbanView: React.FC = () => {
  const { quotes, setSelectedQuoteId, setActiveView, createNewQuote, companies } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  const columns: { id: string; title: string; statuses: QuoteStatus[]; color: string }[] = [
    { id: 'draft', title: 'Draft Deals', statuses: ['Draft'], color: 'border-slate-700' },
    {
      id: 'pending',
      title: 'Pending Approvals',
      statuses: ['Pending Manager', 'Pending Finance'],
      color: 'border-amber-500/40',
    },
    {
      id: 'negotiation',
      title: 'Portal Negotiation',
      statuses: ['Under Negotiation'],
      color: 'border-cyan-500/40',
    },
    {
      id: 'approved',
      title: 'Fully Approved',
      statuses: ['Fully Approved'],
      color: 'border-emerald-500/40',
    },
    {
      id: 'fulfillment',
      title: 'Fulfillment & Invoicing',
      statuses: ['Fulfillment', 'Invoiced', 'Paid'],
      color: 'border-blue-500/40',
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by quote, company, or rep..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md bg-slate-900 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-cyan-500 transition"
            />
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredQuotes.length} Deals in Pipeline
          </span>
        </div>

        <button
          onClick={() => {
            const newId = createNewQuote(companies[0].id);
            setSelectedQuoteId(newId);
            setActiveView('builder');
          }}
          className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> New Quotation
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto min-h-[600px] pb-6">
        {columns.map((col) => {
          const colQuotes = filteredQuotes.filter((q) => col.statuses.includes(q.status));
          const colTotal = colQuotes.reduce((sum, q) => sum + q.totalNetAmount, 0);

          return (
            <div
              key={col.id}
              className={`surface-card p-3 border-t-2 ${col.color} flex flex-col gap-3 min-h-[500px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold text-white tracking-wide block">
                    {col.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ₹{(colTotal / 1000).toFixed(0)}k • {colQuotes.length} deals
                  </span>
                </div>
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[11px] font-mono flex items-center justify-center">
                  {colQuotes.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2.5 flex-1">
                {colQuotes.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => {
                      setSelectedQuoteId(q.id);
                      setActiveView('builder');
                    }}
                    className="p-3 rounded-lg bg-[#151B26] hover:bg-[#1C2433] border border-slate-800 hover:border-slate-700 transition cursor-pointer shadow-sm group"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-mono font-semibold text-cyan-400">
                        {q.id}
                      </span>
                      <RiskBadge level={q.riskLevel} score={q.blendedRiskScore} size="sm" />
                    </div>

                    <h4 className="mt-2 text-xs font-semibold text-white group-hover:text-cyan-300 transition line-clamp-1">
                      {q.companyName}
                    </h4>

                    <div className="mt-2 flex items-baseline justify-between text-xs font-mono">
                      <span className="text-slate-200 font-bold">
                        ₹{q.totalNetAmount.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={
                          q.overallMarginPercent >= 30
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }
                      >
                        {q.overallMarginPercent}% Margin
                      </span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{q.tier} Tier</span>
                      <span className="text-cyan-400 font-mono font-medium">
                        {q.dealConfidence}% Confidence
                      </span>
                    </div>
                  </div>
                ))}

                {colQuotes.length === 0 && (
                  <div className="h-32 border border-dashed border-slate-800 rounded-lg flex items-center justify-center text-slate-600 text-xs">
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
