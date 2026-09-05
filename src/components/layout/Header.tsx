import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  PlusCircle,
  Moon,
  Sun,
  Check,
  Building2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface HeaderProps {
  onOpenAskDealFlow: () => void;
  onOpenGlobalSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAskDealFlow,
  onOpenGlobalSearch,
}) => {
  const {
    activeView,
    setActiveView,
    selectedQuoteId,
    activeUser,
    userRole,
    createNewQuote,
    companies,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    clearNotifications,
    setSelectedQuoteId,
  } = useAppStore();

  const [isDark, setIsDark] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const viewTitles: Record<string, string> = {
    dashboard: 'Command Center',
    pipeline: 'Deal Pipeline',
    builder: `Quote Builder ${selectedQuoteId ? `(${selectedQuoteId})` : ''}`,
    approvals: 'Approvals & Risk Center',
    fulfillment: 'Fulfillment & Logistics',
    portal: 'Customer Negotiation Portal',
    billing: 'Billing & Subscriptions',
    deal_health: 'Deal Health Monitor',
    admin_config: 'Admin Configuration',
  };

  return (
    <header
      className="h-16 px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-surface) 90%, transparent)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      {/* Left: Breadcrumb Context */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[var(--text-tertiary)] font-medium">Workspace</span>
        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]" />
        <span className="font-semibold text-[var(--text-primary)]">
          {viewTitles[activeView] || 'Overview'}
        </span>

        {activeView === 'portal' && (
          <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Live Client Session
          </span>
        )}
      </div>

      {/* Right: Actions & Tools */}
      <div className="flex items-center gap-2.5">
        {/* Global Search Button */}
        <button
          onClick={onOpenGlobalSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] hover:bg-[var(--bg-hover)] text-xs text-[var(--text-secondary)] transition-colors cursor-pointer w-48 sm:w-64 justify-between"
          title="Search quotes, customers, products (Ctrl+K)"
        >
          <div className="flex items-center gap-1.5 truncate">
            <Search className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
            <span className="truncate">Search quotes, accounts...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono text-[var(--text-tertiary)] px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            ⌘K
          </kbd>
        </button>

        {/* Ask AI Copilot */}
        <button
          onClick={onOpenAskDealFlow}
          className="btn-secondary !py-1.5 !px-3 !text-xs !gap-1.5"
          title="Ask DealFlow AI Copilot"
        >
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>

        {/* Notifications Drawer */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors cursor-pointer relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotifOpen && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-xl border z-50 p-3 space-y-2 animate-slide-up"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-default)',
              }}
            >
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[var(--text-primary)]">
                    Notifications
                  </span>
                  {unreadNotificationCount > 0 && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                      {unreadNotificationCount} new
                    </span>
                  )}
                </div>
                {unreadNotificationCount > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-[11px] text-[var(--accent-primary)] hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.quoteId) {
                        setSelectedQuoteId(n.quoteId);
                        if (n.type === 'approval') setActiveView('approvals');
                        else if (n.type === 'fulfillment') setActiveView('fulfillment');
                        else if (n.type === 'anomaly') setActiveView('deal_health');
                      }
                      setIsNotifOpen(false);
                    }}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      n.read
                        ? 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                        : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-[var(--text-primary)]">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-[var(--text-tertiary)]">
                        {n.timestamp}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-[var(--border-default)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Primary Action Button */}
        {userRole !== 'customer' && (
          <button
            onClick={() => {
              const newId = createNewQuote(companies[0].id);
              setSelectedQuoteId(newId);
              setActiveView('builder');
            }}
            className="btn-primary !py-1.5 !px-3 !text-xs !gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Quotation</span>
          </button>
        )}
      </div>
    </header>
  );
};
