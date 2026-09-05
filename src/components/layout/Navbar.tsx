import React from 'react';
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
      label: 'Approvals & Risk',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    { id: 'fulfillment', label: 'Fulfillment', icon: Truck },
    {
      id: 'portal',
      label: 'Customer Portal',
      icon: ExternalLink,
      badge: 'Live',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    },
    { id: 'billing', label: 'Billing & Subs', icon: CreditCard },
    {
      id: 'deal_health',
      label: 'Deal Health',
      icon: HeartPulse,
      badge: activeAnomaliesCount > 0 ? activeAnomaliesCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    { id: 'admin_config', label: 'Admin Rules', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#080B12]/95 backdrop-blur-md border-b border-[#202938]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveView('dashboard')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <div className="w-full h-full bg-[#080B12] rounded-[6px] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                DealFlow<span className="text-cyan-400 font-mono">360</span>
              </span>
            </div>
          </div>

          <span className="hidden lg:inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
            Self-Governing CPQ
          </span>
        </div>

        {/* Center Nav Modules */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer relative whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Tools: Role Switcher & Reset */}
        <div className="flex items-center gap-2">
          {/* Ask DealFlow AI Button */}
          {onOpenAskDealFlow && (
            <button
              onClick={onOpenAskDealFlow}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-cyan-950/40 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/50 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ask DealFlow</span>
            </button>
          )}

          {/* Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
            <span className="text-[11px] text-slate-500 font-medium">Role:</span>
            <select
              value={userRole}
              onChange={(e) => {
                const newRole = e.target.value as UserRole;
                setUserRole(newRole);
                if (newRole === 'customer') {
                  setActiveView('portal');
                }
              }}
              className="bg-transparent text-xs font-semibold text-cyan-300 outline-none cursor-pointer"
            >
              <option value="sales_rep" className="bg-slate-900 text-slate-200">
                👔 Sales Rep (P. Mehta)
              </option>
              <option value="sales_manager" className="bg-slate-900 text-slate-200">
                🛡️ Sales Manager (M. Shah)
              </option>
              <option value="finance" className="bg-slate-900 text-slate-200">
                💰 Finance Approver (R. Iyer)
              </option>
              <option value="customer" className="bg-slate-900 text-slate-200">
                🌐 Customer Portal View
              </option>
              <option value="admin" className="bg-slate-900 text-slate-200">
                ⚙️ Admin (Operations)
              </option>
            </select>
          </div>

          {/* Reset Demo Seed Data */}
          <button
            onClick={() => {
              resetToSeedData();
              alert('Seed demo state restored to baseline!');
            }}
            title="Reset to clean demo data"
            className="p-2 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
