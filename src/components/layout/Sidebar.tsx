import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard,
  FilePlus2,
  Kanban,
  CheckSquare,
  Truck,
  CreditCard,
  HeartPulse,
  Settings,
  ShieldCheck,
  ChevronDown,
  RotateCcw,
  Sparkles,
  LogOut,
  UserCheck,
  Users,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface SidebarProps {
  onOpenAuth: () => void;
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
    setCurrentRoute,
    quotes,
    anomalies,
    resetToSeedData,
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
  const pendingUsersCount = users.filter((u) => u.status === 'pending').length;

  // Strict Role-Specific Navigation Definitions
  const getNavItemsForRole = () => {
    switch (userRole) {
      case 'sales_rep':
        return [
          { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
          { id: 'pipeline', label: 'Pipeline', icon: Kanban },
          { id: 'builder', label: 'Quote Builder', icon: FilePlus2 },
          { id: 'deal_health', label: 'Deal Intelligence', icon: HeartPulse, badge: activeAnomaliesCount > 0 ? activeAnomaliesCount : undefined, badgeColor: 'bg-rose-100 text-rose-800 border-rose-200' },
        ];
      case 'sales_manager':
        return [
          { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
          { id: 'pipeline', label: 'Pipeline', icon: Kanban },
          { id: 'approvals', label: 'Approvals & Risk', icon: CheckSquare, badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined, badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
          { id: 'deal_health', label: 'Deal Health', icon: HeartPulse, badge: activeAnomaliesCount > 0 ? activeAnomaliesCount : undefined, badgeColor: 'bg-rose-100 text-rose-800 border-rose-200' },
        ];
      case 'finance':
        return [
          { id: 'dashboard', label: 'Financial Overview', icon: LayoutDashboard },
          { id: 'approvals', label: 'Approvals & Margin', icon: CheckSquare, badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined, badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
          { id: 'billing', label: 'Billing & Subs', icon: CreditCard },
          { id: 'deal_health', label: 'Deal Health', icon: HeartPulse, badge: activeAnomaliesCount > 0 ? activeAnomaliesCount : undefined, badgeColor: 'bg-rose-100 text-rose-800 border-rose-200' },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
          { id: 'admin_config', label: 'Admin Control Center', icon: Settings, badge: pendingUsersCount > 0 ? `${pendingUsersCount} New` : undefined, badgeColor: 'bg-blue-100 text-blue-800 border-blue-200' },
          { id: 'pipeline', label: 'Pipeline Review', icon: Kanban },
          { id: 'fulfillment', label: 'Warehouse Hubs', icon: Truck },
          { id: 'deal_health', label: 'Deal Health', icon: HeartPulse },
        ];
      default:
        return [
          { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
        ];
    }
  };

  const navItems = getNavItemsForRole();

  return (
    <aside
      className="w-60 shrink-0 h-screen sticky top-0 flex flex-col z-30 transition-all select-none border-r"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-default)',
      }}
    >
      {/* Brand Header — Clean institutional logo (No v2.0 badge) */}
      <div
        className="h-16 px-4 flex items-center justify-between cursor-pointer border-b"
        style={{ borderColor: 'var(--border-default)' }}
        onClick={() => setCurrentRoute('landing')}
        title="View Product Landing Page"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center shadow-xs text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
              DealFlow<span className="text-[var(--accent-primary)] font-mono">360</span>
            </span>
            <p className="text-[10px] text-[var(--text-tertiary)] font-medium tracking-tight">
              Govern. Grow. Close.
            </p>
          </div>
        </div>
      </div>

      {/* Role-Specific Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
            {userRole === 'finance'
              ? 'Finance Workspace'
              : userRole === 'admin'
              ? 'Operations & Control'
              : userRole === 'sales_manager'
              ? 'Sales Leadership'
              : 'Commercial Sales'}
          </span>

          <div className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer text-left ${
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
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-white text-[var(--accent-primary)] border-white'
                          : item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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
      </div>

      {/* Footer Profile & Demo Switcher */}
      <div
        className="p-3 border-t relative"
        style={{ borderColor: 'var(--border-default)' }}
        ref={popoverRef}
      >
        <div className="flex items-center justify-between px-2 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
              {userRole.replace('_', ' ')}
            </span>
          </div>

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

        {/* Role Switcher Popover */}
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
              {users
                .filter((u) => u.status === 'active')
                .map((u) => {
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
                  onOpenAuth();
                  setIsProfileOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Sign In / Sign Up</span>
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
