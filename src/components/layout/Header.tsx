import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  RotateCcw,
  User,
  LogOut,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { UserRole } from '../../types';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const {
    userRole,
    setUserRole,
    activeView,
    setActiveView,
    selectedQuoteId,
    setSelectedQuoteId,
    quotes,
    anomalies,
    resetToSeedData,
    logout,
    currentUser,
  } = useAppStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeAnomalies = anomalies.filter((a) => !a.isResolved);
  const pendingApprovals = quotes.filter(
    (q) => q.status === 'Pending Manager' || q.status === 'Pending Finance'
  );

  const viewTitles: Record<string, { title: string; category: string }> = {
    dashboard: { title: 'Dashboard', category: 'Main Navigation' },
    pipeline: { title: 'Quotations Pipeline', category: 'Main Navigation' },
    quotations: { title: 'Quotations Pipeline', category: 'Main Navigation' },
    builder: { title: selectedQuoteId ? `Quotation Builder (${selectedQuoteId})` : 'Quotation Builder', category: 'Main Navigation' },
    products: { title: 'Product Catalog', category: 'Main Navigation' },
    approvals: { title: 'Approvals & Governance', category: 'Operations & Workflow' },
    fulfillment: { title: 'Warehouse Fulfillment', category: 'Operations & Workflow' },
    subscriptions: { title: 'Recurring Subscriptions', category: 'Operations & Workflow' },
    invoices: { title: 'Invoices & Billing', category: 'Operations & Workflow' },
    billing: { title: 'Invoices & Billing', category: 'Operations & Workflow' },
    deal_health: { title: 'Deal Health & Risk Anomalies', category: 'Analytics & Intelligence' },
    reports: { title: 'Reports & Analytics', category: 'Analytics & Intelligence' },
    admin_config: { title: 'System Configuration', category: 'System Administration' },
    portal: { title: 'Customer Self-Service Portal', category: 'Customer Portal' },
    landing: { title: 'Overview & Simulator', category: 'DealFlow360' },
  };

  const currentViewInfo = viewTitles[activeView] || { title: activeView.replace('_', ' ').toUpperCase(), category: 'Portal' };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs px-4 sm:px-6 py-3 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">{currentViewInfo.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold text-sm sm:text-base tracking-tight">
            {currentViewInfo.title}
          </span>
        </div>
      </div>

      {/* Right: Quick Search, Role Switcher, Notifications, Reset */}
      <div className="flex items-center gap-3">
        {/* Global Search */}
        <div className="relative hidden lg:block">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search quote #, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery) {
                const match = quotes.find(
                  (q) =>
                    q.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    q.companyName.toLowerCase().includes(searchQuery.toLowerCase())
                );
                if (match) {
                  setSelectedQuoteId(match.id);
                  setActiveView('builder');
                }
              }
            }}
            className="pl-9 pr-4 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-blue-600 focus:bg-white w-52 transition font-medium"
          />
        </div>

        {/* Reset Demo State Button */}
        <button
          onClick={() => {
            resetToSeedData();
            alert('Clean baseline demo data restored!');
          }}
          title="Reset to Baseline Seed Data"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer border border-slate-200 bg-white shadow-2xs btn-3d"
        >
          <RotateCcw className="w-4 h-4 text-slate-600" />
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer relative border border-slate-200 bg-white shadow-2xs btn-3d"
          >
            <Bell className="w-4 h-4" />
            {activeAnomalies.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {activeAnomalies.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Popup */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-2xl z-50 p-3 space-y-2 card-3d">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-900">Governance Alerts</span>
                <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full badge-3d">
                  {activeAnomalies.length} Active
                </span>
              </div>

              {activeAnomalies.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-3">No active anomalies.</p>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {activeAnomalies.map((a) => (
                    <div
                      key={a.id}
                      onClick={() => {
                        setSelectedQuoteId(a.quoteId);
                        setActiveView('deal_health');
                        setShowNotifications(false);
                      }}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer text-xs transition"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{a.companyName}</span>
                        <span className="text-[10px] text-rose-700 uppercase font-mono">
                          {a.anomalyType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5">{a.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <div className="pl-2 border-l border-slate-200">
          <button
            onClick={logout}
            title="Sign Out / Switch Demo Role"
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 transition cursor-pointer flex items-center gap-1.5 shadow-2xs btn-3d"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
