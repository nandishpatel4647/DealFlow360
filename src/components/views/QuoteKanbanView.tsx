import React, { useState } from 'react';
import { Plus, Search, LayoutList, Kanban, ChevronRight, Filter } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { QuoteStatus, RiskLevel } from '../../types';
import { RiskBadge } from '../design-system/RiskBadge';
import { StatusBadge } from '../design-system/StatusBadge';

export const QuoteKanbanView: React.FC = () => {
  const { quotes, setSelectedQuoteId, setActiveView, createNewQuote, companies, userRole } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [customerFilter, setCustomerFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [repFilter, setRepFilter] = useState<string>('ALL');

  const canCreate = userRole === 'sales_rep' || userRole === 'admin';

  // Extract unique sales reps for filter dropdown
  const uniqueReps = Array.from(new Set(quotes.map((q) => q.salesRep)));

  const columns: { id: string; title: string; statuses: QuoteStatus[]; color: string }[] = [
    { id: 'draft', title: 'Draft Deals', statuses: ['Draft', 'Returned for Revision'], color: 'border-t-slate-400' },
    {
      id: 'pending',
      title: 'Pending Approvals',
      statuses: ['Pending Manager', 'Pending Finance'],
      color: 'border-t-amber-500',
    },
    {
      id: 'negotiation',
      title: 'Customer Review & Negotiation',
      statuses: ['Manager Approved', 'Pending Customer', 'Under Negotiation', 'Customer Revision Requested'],
      color: 'border-t-blue-500',
    },
    {
      id: 'approved',
      title: 'Customer & Finance Approved',
      statuses: ['Customer Approved', 'Finance Approved', 'Fully Approved', 'Confirmed'],
      color: 'border-t-emerald-500',
    },
    {
      id: 'fulfillment',
      title: 'Fulfillment & Invoiced',
      statuses: ['Fulfillment', 'Invoiced', 'Paid'],
      color: 'border-t-indigo-500',
    },
  ];

  // Helper to resolve stage label from status
  const getStageLabel = (status: QuoteStatus): string => {
    switch (status) {
      case 'Draft':
        return 'Quote Draft';
      case 'Pending Manager':
        return 'Sales Manager Review';
      case 'Manager Approved':
        return 'Sales Rep Confirmation';
      case 'Pending Customer':
      case 'Under Negotiation':
        return 'Customer Review';
      case 'Customer Revision Requested':
        return 'Sales Rep Action';
      case 'Customer Approved':
      case 'Pending Finance':
        return 'Finance Review';
      case 'Finance Approved':
      case 'Fully Approved':
      case 'Confirmed':
      case 'Fulfillment':
        return 'Fulfillment';
      case 'Invoiced':
      case 'Paid':
        return 'Invoice';
      case 'Rejected':
      case 'Rejected by Sales Manager':
      case 'Rejected by Finance':
        return 'Closed (Rejected)';
      default:
        return 'Quote Draft';
    }
  };

  // Real-time Filtering logic across search and all 4 dropdowns
  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.salesRep.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;
    if (customerFilter !== 'ALL' && q.companyId !== customerFilter) return false;
    if (riskFilter !== 'ALL' && q.riskLevel !== riskFilter) return false;
    if (repFilter !== 'ALL' && q.salesRep !== repFilter) return false;

    if (statusFilter === 'ALL') return true;
    return q.status === statusFilter;
  });

  const handleOpenQuote = (id: string) => {
    setSelectedQuoteId(id);
    setActiveView('builder');
  };

  return (
    <div className="space-y-4 font-sans">
      {/* HEADER PART 1: Title & Subtitle */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
            Quotations
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage, review and track all customer quotations.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => {
              const newId = createNewQuote(companies[0].id);
              setSelectedQuoteId(newId);
              setActiveView('builder');
            }}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0176D3] hover:bg-blue-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> + New Quotation
          </button>
        )}
      </div>

      {/* FILTER TOOLBAR & SEARCH BOX */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Quotation ID, customer name, sales rep..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 outline-none focus:border-[#0176D3] focus:bg-white font-medium"
            />
          </div>

          {/* View Switcher: Table List vs Kanban Board */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded-md font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-[#0176D3] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" /> Table List
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1 rounded-md font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white text-[#0176D3] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" /> Kanban Board
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-slate-500 font-bold uppercase text-[10px]">
            <Filter className="w-3.5 h-3.5 text-[#0176D3]" /> Filters:
          </div>

          {/* Customer Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Customer:</span>
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-300 font-bold text-slate-900 text-xs outline-none focus:border-[#0176D3]"
            >
              <option value="ALL">All Customers ({companies.length})</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.tierId})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter with exact specified options */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-300 font-bold text-slate-900 text-xs outline-none focus:border-[#0176D3]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Pending Manager">Pending Sales Manager</option>
              <option value="Manager Approved">Manager Approved</option>
              <option value="Pending Customer">Pending Customer</option>
              <option value="Customer Revision Requested">Customer Revision Requested</option>
              <option value="Customer Approved">Customer Approved</option>
              <option value="Pending Finance">Pending Finance</option>
              <option value="Finance Approved">Finance Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Fulfillment">Fulfillment</option>
              <option value="Invoiced">Invoiced</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Risk Level:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-300 font-bold text-slate-900 text-xs outline-none focus:border-[#0176D3]"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* Sales Representative Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-600">Sales Rep:</span>
            <select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-300 font-bold text-slate-900 text-xs outline-none focus:border-[#0176D3]"
            >
              <option value="ALL">All Sales Reps</option>
              {uniqueReps.map((rep) => (
                <option key={rep} value={rep}>
                  {rep}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: TABLE LIST VIEW (PART 1 PRIMARY REQUIREMENT) */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Quotation ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Sales Rep</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Risk</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Current Stage</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {filteredQuotes.map((q) => {
                  const overallDiscountPct = q.totalListAmount > 0 
                    ? Math.round((q.totalDiscountAmount / q.totalListAmount) * 100)
                    : 0;

                  return (
                    <tr
                      key={q.id}
                      onClick={() => handleOpenQuote(q.id)}
                      className="hover:bg-blue-50/40 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0176D3] group-hover:underline">
                        {q.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{q.companyName}</td>
                      <td className="py-3.5 px-4 text-slate-700">{q.salesRep}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ₹{q.totalNetAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {overallDiscountPct}%
                      </td>
                      <td className="py-3.5 px-4">
                        <RiskBadge level={q.riskLevel} score={q.blendedRiskScore} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={q.status} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium text-[11px]">
                        {getStageLabel(q.status)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(q.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-xs font-bold text-[#0176D3] group-hover:translate-x-1 transition inline-flex items-center gap-0.5">
                          View Detail <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredQuotes.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-8 text-center text-slate-500 text-xs">
                      No quotations found matching your search and filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto min-h-[600px] pb-6">
          {columns.map((col) => {
            const colQuotes = filteredQuotes.filter((q) => col.statuses.includes(q.status));
            const colTotal = colQuotes.reduce((sum, q) => sum + q.totalNetAmount, 0);

            return (
              <div
                key={col.id}
                className={`bg-slate-100/70 rounded-xl p-3 border border-slate-200 ${col.color} border-t-4 flex flex-col gap-3 min-h-[500px] shadow-2xs`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-900 tracking-wide block">
                      {col.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-semibold">
                      ₹{(colTotal / 1000).toFixed(0)}k • {colQuotes.length} deals
                    </span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold font-mono flex items-center justify-center">
                    {colQuotes.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2.5 flex-1">
                  {colQuotes.map((q) => (
                    <div
                      key={q.id}
                      onClick={() => handleOpenQuote(q.id)}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 card-hover-3d cursor-pointer shadow-xs group relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-mono font-bold text-[#0176D3]">
                          {q.id}
                        </span>
                        <RiskBadge level={q.riskLevel} score={q.blendedRiskScore} size="sm" />
                      </div>

                      <h4 className="mt-2 text-xs font-bold text-slate-900 group-hover:text-[#0176D3] transition line-clamp-1">
                        {q.companyName}
                      </h4>

                      <div className="mt-2 flex items-baseline justify-between text-xs font-mono">
                        <span className="text-slate-900 font-bold">
                          ₹{q.totalNetAmount.toLocaleString('en-IN')}
                        </span>
                        <span
                          className={`font-bold px-1.5 py-0.2 rounded text-[10px] badge-3d ${
                            q.overallMarginPercent >= 30
                              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                              : 'text-amber-700 bg-amber-50 border border-amber-200'
                          }`}
                        >
                          {q.overallMarginPercent}% Margin
                        </span>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <StatusBadge status={q.status} />
                        <span className="text-slate-500 font-medium">{q.salesRep}</span>
                      </div>
                    </div>
                  ))}

                  {colQuotes.length === 0 && (
                    <div className="h-32 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-xs font-medium">
                      No deals in stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
