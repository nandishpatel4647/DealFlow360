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
  CheckCheck,
  Clock,
  Check,
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
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAppStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifTab, setNotifTab] = useState<'events' | 'anomalies'>('events');
  const [searchQuery, setSearchQuery] = useState('');

  const relevantNotifications = (notifications || []).filter(
    (n) => !n.targetRole || n.targetRole === 'all' || n.targetRole === userRole
  );
  const unreadNotifications = relevantNotifications.filter((n) => !n.read);
  const activeAnomalies = (anomalies || []).filter((a) => !a.isResolved);
  const totalAlertCount = unreadNotifications.length + activeAnomalies.length;
  const pendingApprovals = quotes.filter(
    (q) => q.status === 'Pending Manager' || q.status === 'Pending Finance'
  );

  const viewTitles: Record<string, { title: string; category: string }> = {
    dashboard: { title: 'Dashboard', category: 'Main Navigation' },
    pipeline: { title: 'Quotations Pipeline', category: 'Main Navigation' },
    quotations: { title: 'Quotations Pipeline', category: 'Main Navigation' },
    builder: { title: selectedQuoteId ? `Quotation Builder (${selectedQuoteId})` : 'Quotation Builder', category: 'Main Navigation' },
    messages: { title: 'Customer Messages & Collaboration', category: 'Main Navigation' },
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
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-2xs px-4 sm:px-6 h-16 flex items-center justify-between shrink-0">
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
      <div className="flex items-center gap-3 shrink-0">
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
        <div className="relative shrink-0">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer relative border border-slate-200 bg-white shadow-2xs btn-3d"
          >
            <Bell className="w-4 h-4" />
            {totalAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {totalAlertCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Popup */}
          {showNotifications && (
            <>
              {/* Click-away backdrop overlay */}
              <div
                className="fixed inset-0 z-40 bg-slate-900/10"
                onClick={() => setShowNotifications(false)}
              />

              <div className="absolute right-0 top-[calc(100%+8px)] w-80 sm:w-[420px] bg-white rounded-xl border border-slate-200 shadow-2xl z-50 p-4 space-y-3">
                {/* Header with Tabs */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setNotifTab('events')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        notifTab === 'events'
                          ? 'bg-[#0176D3] text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Events ({unreadNotifications.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotifTab('anomalies')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        notifTab === 'anomalies'
                          ? 'bg-[#0176D3] text-white shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Governance ({activeAnomalies.length})
                    </button>
                  </div>

                  {notifTab === 'events' && unreadNotifications.length > 0 && (
                    <button
                      type="button"
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-bold text-[#0176D3] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3 h-3" /> Mark all read
                    </button>
                  )}
                </div>

                {/* TAB 1: Real Action Event Notifications */}
                {notifTab === 'events' && (
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
                    {relevantNotifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">No notifications yet.</p>
                    ) : (
                      relevantNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            if (notif.relatedId) {
                              if (notif.relatedId.startsWith('Q-')) {
                                setSelectedQuoteId(notif.relatedId);
                                if (notif.type === 'approval') {
                                  setActiveView(userRole === 'sales_manager' || userRole === 'finance' ? 'approvals' : 'builder');
                                } else if (notif.type === 'fulfillment') {
                                  setActiveView('fulfillment');
                                } else {
                                  setActiveView('builder');
                                }
                              } else if (notif.relatedId.startsWith('INV-')) {
                                setActiveView('invoices');
                              }
                            }
                            setShowNotifications(false);
                          }}
                          className={`p-2.5 rounded-lg border transition cursor-pointer text-xs space-y-1 ${
                            notif.read
                              ? 'bg-white border-slate-200 hover:bg-slate-50 opacity-75'
                              : 'bg-blue-50/50 border-blue-200 hover:bg-blue-50/90'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-[#0176D3]" />}
                              {notif.title}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* TAB 2: Governance Deal Health Anomalies */}
                {notifTab === 'anomalies' && (
                  <div className="space-y-1.5 max-h-80 overflow-y-auto pr-0.5">
                    {activeAnomalies.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">No active governance anomalies.</p>
                    ) : (
                      activeAnomalies.map((a) => (
                        <div
                          key={a.id}
                          onClick={() => {
                            setSelectedQuoteId(a.quoteId);
                            setActiveView('deal_health');
                            setShowNotifications(false);
                          }}
                          className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer text-xs transition space-y-1"
                        >
                          <div className="flex items-center justify-between font-bold text-slate-900">
                            <span>{a.companyName}</span>
                            <span className="text-[10px] text-rose-700 uppercase font-mono px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200">
                              {a.anomalyType}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2">{a.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
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
