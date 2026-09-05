import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Download, Printer, Filter, FileText, CheckCircle2, Clock, Sparkles, Building, User, Tag } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const ReportsView: React.FC = () => {
  const { quotes, products, companies } = useAppStore();

  // 4 Top Filter Selectors matching Blueprint Page 15
  const [timeframe, setTimeframe] = useState<string>('This Month');
  const [salesTeamFilter, setSalesTeamFilter] = useState<string>('ALL');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<string>('ALL');
  const [productFilter, setProductFilter] = useState<string>('ALL');

  // Filtered Quotes calculation
  const filteredQuotes = quotes.filter((q) => {
    const matchesTeam = salesTeamFilter === 'ALL' || q.salesRep.toLowerCase().includes(salesTeamFilter.toLowerCase());
    const matchesStatus = approvalStatusFilter === 'ALL' || q.status === approvalStatusFilter;
    const matchesProduct =
      productFilter === 'ALL' || q.lines.some((l) => l.productName.toLowerCase().includes(productFilter.toLowerCase()));

    return matchesTeam && matchesStatus && matchesProduct;
  });

  // Export to XLS (CSV) matching Blueprint Page 15
  const handleExportXLS = () => {
    const headers = [
      'Quote ID',
      'Customer',
      'Tier',
      'Sales Rep',
      'Status',
      'List Amount (INR)',
      'Discount Amount (INR)',
      'Net Total (INR)',
      'Margin %',
      'Risk Score',
    ];

    const rows = filteredQuotes.map((q) => [
      q.id,
      `"${q.companyName}"`,
      q.tier,
      `"${q.salesRep}"`,
      q.status,
      q.totalListAmount,
      q.totalDiscountAmount,
      q.totalNetAmount,
      `${q.overallMarginPercent}%`,
      q.blendedRiskScore,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DealFlow360_Admin_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF (Native Print Formatting) matching Blueprint Page 15
  const handleExportPDF = () => {
    window.print();
  };

  // Data for Charts
  const statusCounts = filteredQuotes.reduce((acc, q) => {
    acc[q.status] = (acc[q.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#0176D3', '#F59E0B', '#10B981', '#6366F1', '#8B5CF6', '#EC4899', '#EF4444'];

  const companyRevenueData = companies.map((comp) => {
    const compQuotes = filteredQuotes.filter((q) => q.companyId === comp.id);
    const rev = compQuotes.reduce((acc, q) => acc + q.totalNetAmount, 0);
    return {
      name: comp.name,
      Revenue: rev,
    };
  });

  return (
    <div className="space-y-6">
      {/* Blueprint Page 15 Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
            Admin / Reporting Dashboard (Optional)
          </h1>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
            Blueprint Page 15
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Sales trends, approval bottlenecks and platform usage
        </p>
      </div>

      {/* Blueprint Page 15 Top 4 Filter Bar Selectors */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-medium">
        {/* Filter 1: Timeframe */}
        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
            Timeframe / Date Range
          </label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-full p-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-bold outline-none focus:border-[#0176D3] cursor-pointer"
          >
            <option value="This Month">This Month</option>
            <option value="Last Quarter">Last Quarter</option>
            <option value="Year to Date">Year to Date</option>
            <option value="All Time">All Time</option>
          </select>
        </div>

        {/* Filter 2: Sales Team */}
        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
            Sales Team / Representative
          </label>
          <select
            value={salesTeamFilter}
            onChange={(e) => setSalesTeamFilter(e.target.value)}
            className="w-full p-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-bold outline-none focus:border-[#0176D3] cursor-pointer"
          >
            <option value="ALL">All Sales Reps</option>
            <option value="Mehta">P. Mehta</option>
            <option value="Shah">M. Shah</option>
            <option value="Sharma">A. Sharma</option>
            <option value="Verma">R. Verma</option>
          </select>
        </div>

        {/* Filter 3: Approval Status */}
        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
            Approval Status
          </label>
          <select
            value={approvalStatusFilter}
            onChange={(e) => setApprovalStatusFilter(e.target.value)}
            className="w-full p-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-bold outline-none focus:border-[#0176D3] cursor-pointer"
          >
            <option value="ALL">All Approval Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Pending Manager">Pending Manager</option>
            <option value="Pending Finance">Pending Finance</option>
            <option value="Fully Approved">Fully Approved</option>
            <option value="Under Negotiation">Under Negotiation</option>
            <option value="Returned for Revision">Returned for Revision</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Filter 4: Product */}
        <div>
          <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">
            Product / Deliverable
          </label>
          <select
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            className="w-full p-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-900 font-bold outline-none focus:border-[#0176D3] cursor-pointer"
          >
            <option value="ALL">All Products & Services</option>
            {products.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Blueprint Page 15 - 3 Executive Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Quotes Created */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Quotes Created
          </span>
          <div className="text-xl font-extrabold text-slate-900 font-sans">
            148 this month
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Active commercial proposals generated
          </span>
        </div>

        {/* Card 2: Avg Approval Time */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Avg Approval Time
          </span>
          <div className="text-xl font-extrabold text-slate-900 font-sans">
            6.4 hours
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Average manager/finance turn-around SLA
          </span>
        </div>

        {/* Card 3: Top Upsold Product */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Top Upsold Product
          </span>
          <div className="text-xl font-extrabold text-[#0176D3] font-sans">
            Care Plan 2yr
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Highest margin cross-sell attachment
          </span>
        </div>
      </div>

      {/* Blueprint Page 15 Action Buttons: Export PDF & Export XLS */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleExportPDF}
          className="px-5 py-2.5 rounded-lg text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs transition flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-[#0176D3]" /> Export PDF
        </button>

        <button
          onClick={handleExportXLS}
          className="px-5 py-2.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer shadow-xs flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-blue-400" /> Export XLS
        </button>
      </div>

      {/* Analytics Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Revenue Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block pb-2 border-b border-slate-200">
            Client Account Revenue Performance (INR ₹)
          </span>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={companyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip />
                <Bar dataKey="Revenue" fill="#0176D3" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Stage Distribution Pie Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block pb-2 border-b border-slate-200">
            Governance Approval Stage Breakdown
          </span>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
