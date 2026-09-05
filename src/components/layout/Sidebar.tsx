import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  Kanban,
  FilePlus2,
  CheckSquare,
  Truck,
  ExternalLink,
  CreditCard,
  HeartPulse,
  Settings,
  RotateCcw,
  LogOut,
  ChevronDown,
  UserCheck,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface SidebarProps {
  onOpenAuth?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenAuth }) => {
  const {
    activeView,
    setActiveView,
    userRole,
    activeUser,
    users,
    loginAsRole,
    logout,
    quotes,
    anomalies,
    resetToSeedData,
    setCurrentRoute,
  } = useAppStore();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pendingApprovalsCount = quotes.filter(
    (q) => q.status === 'Pending Manager' || q.status === 'Pending Finance'
  ).length;
  const activeAnomaliesCount = anomalies.filter((a) => !a.isResolved).length;

  const workspaceNavItems = [
    {
      id: 'dashboard',
      label: 'Command Center',
      icon: LayoutDashboard,
      roles: ['sales_rep', 'sales_manager', 'finance', 'admin'],
    },
    {
      id: 'pipeline',
      label: 'Pipeline',
      icon: Kanban,
      roles: ['sales_rep', 'sales_manager', 'finance', 'admin'],
    },
    {
      id: 'builder',
      label: 'Quote Builder',
      icon: FilePlus2,
      roles: ['sales_rep', 'sales_manager', 'admin'],
    },
    {
      id: 'approvals',
      label: 'Approvals & Risk',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      roles: ['sales_rep', 'sales_manager', 'finance', 'admin'],
    },
    {
      id: 'fulfillment',
      label: 'Fulfillment',
      icon: Truck,
      roles: ['sales_rep', 'sales_manager', 'finance', 'admin'],
    },
    {
      id: 'portal',
      label: 'Customer Portal',
      icon: ExternalLink,
      badge: 'Client',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      roles: ['sales_rep', 'sales_manager', 'finance', 'customer', 'admin'],
    },
    {
      id: 'billing',
      label: 'Billing & Subs',
      icon: CreditCard,
      roles: ['sales_rep', 'sales_manager', 'finance', 'admin'],
    },
    {
      id: 'deal_health',
      label: 'Deal Health',
      icon: HeartPulse,
      badge: activeAnomaliesCount > 0 ? activeAnomaliesCount : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      roles: ['sales_rep', 'sales_manager', 'admin'],
    },
  ];

  const managementNavItems = [
    {
      id: 'admin_config',
      label: 'Admin Config',
      icon: Settings,
      roles: ['admin'],
    },
  ];

  const filteredWorkspace = workspaceNavItems.filter((item) =>
    item.roles.includes(userRole)
  );
  const filteredManagement = managementNavItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside
      className="w-60 shrink-0 h-screen sticky top-0 flex flex-col z-30 transition-all select-none"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)',
      }}
    >
      {/* Brand Header */}
      <div
        className="h-16 px-4 flex items-center justify-between cursor-pointer border-b"
        style={{ borderColor: 'var(--border-default)' }}
        onClick={() => setCurrentRoute('landing')}
        title="View Landing Page"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center shadow-xs text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
                DealFlow<span className="text-[var(--accent-primary)] font-mono">360</span>
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)] font-medium tracking-tight">
              Govern. Grow. Close.
            </p>
          </div>
        </div>

        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          v2.0
        </span>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {/* Workspace Group */}
        <div>
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            Workspace
          </span>
          <div className="mt-1.5 space-y-0.5">
            {filteredWorkspace.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer text-left ${
                    isActive
                      ? 'bg-[var(--accent-primary)] text-white shadow-xs font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-[var(--text-tertiary)]'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                        isActive
                          ? 'bg-white/20 text-white border-white/30'
                          : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Management Group (if allowed for role) */}
        {filteredManagement.length > 0 && (
          <div>
            <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Management
            </span>
            <div className="mt-1.5 space-y-0.5">
              {filteredManagement.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-[var(--accent-primary)] text-white shadow-xs font-semibold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-[var(--text-tertiary)]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Customer Portal Restricted Session Notice */}
        {userRole === 'customer' && (
          <div className="p-3 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              Secure Buyer Session
            </div>
            <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
              Logged in as Acme Industries. Internal margins and risk scores are protected and hidden.
            </p>
          </div>
        )}
      </div>

      {/* Footer Profile & Demo Environment */}
      <div
        className="p-3 border-t relative"
        style={{ borderColor: 'var(--border-default)' }}
        ref={popoverRef}
      >
        {/* Subtle Demo Environment Indicator */}
        <div className="flex items-center justify-between mb-2 px-1 text-[11px]">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Demo Environment
          </span>
          <button
            onClick={() => {
              resetToSeedData();
              alert('Demo state restored to baseline seed data.');
            }}
            title="Reset to clean baseline data"
            className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            Reset
          </button>
        </div>

        {/* User Card trigger */}
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-[var(--bg-muted)] transition-colors cursor-pointer text-left border border-transparent hover:border-[var(--border-default)]"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={activeUser.avatar}
              alt={activeUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                {activeUser.name}
              </p>
              <p className="text-[10px] text-[var(--text-tertiary)] truncate">
                {activeUser.title.split('•')[0]}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-[var(--text-tertiary)] transition-transform ${
              isProfileOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Role Switcher & Profile Popover */}
        {isProfileOpen && (
          <div
            className="absolute bottom-full left-3 right-3 mb-2 p-2 rounded-xl shadow-lg border animate-slide-up z-50 text-xs"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-default)',
            }}
          >
            <div className="px-2 py-1.5 border-b pb-2 mb-2" style={{ borderColor: 'var(--border-subtle)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                Active User & Role
              </p>
              <p className="text-xs font-bold text-[var(--text-primary)] mt-0.5">
                {activeUser.name}
              </p>
              <p className="text-[11px] text-[var(--text-secondary)] truncate">
                {activeUser.email}
              </p>
            </div>

            <div className="space-y-1">
              <p className="px-2 text-[10px] font-semibold text-[var(--text-muted)]">
                Switch Demo Persona:
              </p>
              {users.map((u) => {
                const isCurrent = u.role === userRole;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      loginAsRole(u.role);
                      setIsProfileOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] font-semibold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs truncate">{u.name}</p>
                      <p className="text-[10px] opacity-75 capitalize truncate">{u.role.replace('_', ' ')}</p>
                    </div>
                    {isCurrent && <UserCheck className="w-3.5 h-3.5 text-[var(--accent-primary)] shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 pt-2 border-t space-y-1" style={{ borderColor: 'var(--border-subtle)' }}>
              <button
                onClick={() => {
                  setCurrentRoute('landing');
                  setIsProfileOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>Visit Landing Page</span>
              </button>

              <button
                onClick={() => {
                  logout();
                  setIsProfileOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
