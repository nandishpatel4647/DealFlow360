import React, { useState } from 'react';
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
  Sparkles,
  Moon,
  Sun,
  ChevronDown,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { UserRole } from '../../types';

export const Navbar: React.FC<{ onOpenAskDealFlow?: () => void }> = ({ onOpenAskDealFlow }) => {
  const {
    userRole,
    setUserRole,
    activeView,
    setActiveView,
    quotes,
    anomalies,
    resetToSeedData,
  } = useAppStore();

  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const pendingApprovalsCount = quotes.filter(
    (q) => q.status === 'Pending Manager' || q.status === 'Pending Finance'
  ).length;

  const activeAnomaliesCount = anomalies.filter((a) => !a.isResolved).length;

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'pipeline', label: 'Pipeline', icon: Kanban },
    { id: 'builder', label: 'Quote Builder', icon: FilePlus2 },
    {
      id: 'approvals',
      label: 'Approvals',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeVariant: 'warning' as const,
    },
    { id: 'fulfillment', label: 'Fulfillment', icon: Truck },
    {
      id: 'portal',
      label: 'Portal',
      icon: ExternalLink,
      badge: 'Live' as string | number | undefined,
      badgeVariant: 'primary' as const,
    },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    {
      id: 'deal_health',
      label: 'Health',
      icon: HeartPulse,
      badge: activeAnomaliesCount > 0 ? activeAnomaliesCount : undefined,
      badgeVariant: 'danger' as const,
    },
    { id: 'admin_config', label: 'Admin', icon: Settings },
  ];

  const badgeColors: Record<string, string> = {
    primary: 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]',
    warning: 'bg-[var(--warning-soft)] text-[var(--warning)]',
    danger: 'bg-[var(--danger-soft)] text-[var(--danger)]',
    success: 'bg-[var(--success-soft)] text-[var(--success)]',
  };

  const roleLabels: Record<UserRole, string> = {
    sales_rep: 'P. Mehta (Sales)',
    sales_manager: 'M. Shah (Manager)',
    finance: 'R. Iyer (Finance)',
    customer: 'Customer Portal',
    admin: 'Admin (Ops)',
  };

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-lg"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-surface) 92%, transparent)',
        borderBottom: '1px solid var(--border-default)',
      }}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => setActiveView('dashboard')}
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
              <ShieldCheck className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <span className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">
                DealFlow<span className="text-[var(--accent-primary)] font-mono">360</span>
              </span>
            </div>
          </div>
        </div>

        {/* Center Nav */}
        <nav className="flex items-center gap-0.5 overflow-x-auto py-1 mx-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-all duration-150 cursor-pointer relative whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)]'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                      badgeColors[item.badgeVariant || 'primary']
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Ask AI */}
          {onOpenAskDealFlow && (
            <button
              onClick={onOpenAskDealFlow}
              className="hidden md:flex btn-secondary !py-1.5 !px-3 !text-xs !gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              Ask AI
            </button>
          )}

          {/* Role Switcher */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md"
            style={{
              backgroundColor: 'var(--bg-muted)',
              border: '1px solid var(--border-default)',
            }}
          >
            <span className="text-[11px] text-[var(--text-muted)] font-medium">Role:</span>
            <select
              value={userRole}
              onChange={(e) => {
                const newRole = e.target.value as UserRole;
                setUserRole(newRole);
                if (newRole === 'customer') {
                  setActiveView('portal');
                }
              }}
              className="bg-transparent text-xs font-semibold text-[var(--accent-primary)] outline-none cursor-pointer"
            >
              <option value="sales_rep">Sales Rep</option>
              <option value="sales_manager">Sales Manager</option>
              <option value="finance">Finance</option>
              <option value="customer">Customer Portal</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md transition-colors cursor-pointer"
            style={{ color: 'var(--text-tertiary)' }}
            title={isDark ? 'Switch to Light' : 'Switch to Dark'}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            }}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Reset */}
          <button
            onClick={() => {
              resetToSeedData();
              alert('Seed demo state restored to baseline!');
            }}
            title="Reset to clean demo data"
            className="p-2 rounded-md transition-colors cursor-pointer"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-hover)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
