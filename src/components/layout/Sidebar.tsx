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
  FileCheck,
  RefreshCw,
  HeartPulse,
  Package,
  Settings,
  BarChart3,
  Sparkles,
  LogOut,
  UserCheck,
  X,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { hasPermission, Permission } from '../../auth/permissions';
import { UserRole, Quote, DealAnomaly } from '../../types';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenAskDealFlow: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: Permission;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile,
  onCloseMobile,
  onOpenAskDealFlow,
}) => {
  const { userRole, activeView, setActiveView, setSelectedQuoteId, quotes, anomalies, logout, currentUser } =
    useAppStore();

  const pendingApprovalsCount = quotes.filter(
    (q: Quote) => q.status === 'Pending Manager' || q.status === 'Pending Finance'
  ).length;

  const activeAnomaliesCount = anomalies.filter((a: DealAnomaly) => !a.isResolved).length;

  // Define nav sections based on permissions
  const isCustomer = userRole === 'customer';

  const mainNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard.view' },
    { id: 'pipeline', label: 'Sales Pipeline', icon: Kanban, permission: 'pipeline.view' },
    { id: 'builder', label: 'Quotations', icon: FilePlus2, permission: 'quotations.view' },
    { id: 'products', label: 'Products', icon: Package, permission: 'quotations.view' },
  ];

  const opsNav: NavItem[] = [
    {
      id: 'approvals',
      label: 'Approvals',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
      permission: 'approvals.view',
    },
    { id: 'fulfillment', label: 'Fulfillment', icon: Truck, permission: 'fulfillment.view' },
    { id: 'subscriptions', label: 'Subscriptions', icon: RefreshCw, permission: 'billing.view' },
    { id: 'invoices', label: 'Invoices', icon: FileCheck, permission: 'billing.view' },
  ];

  const customerNav: NavItem[] = [
    { id: 'portal', label: 'Customer Portal', icon: ExternalLink, badge: 'Live', badgeColor: 'bg-blue-600 text-white', permission: 'customer_portal.access' },
  ];

  const insightsNav: NavItem[] = [
    {
      id: 'deal_health',
      label: 'Deal Health',
      icon: HeartPulse,
      badge: activeAnomaliesCount > 0 ? activeAnomaliesCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
      permission: 'deal_health.view',
    },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, permission: 'reports.view' },
  ];

  const adminNav: NavItem[] = [
    { id: 'admin_config', label: 'Configuration', icon: Settings, permission: 'admin.configure' },
  ];

  const filterByPermission = (items: NavItem[]) =>
    items.filter((item) => hasPermission(userRole, item.permission));

  const roleDisplayNames: Record<UserRole, { title: string; badgeBg: string }> = {
    sales_rep: { title: 'Sales Rep (P. Mehta)', badgeBg: 'bg-blue-600' },
    sales_manager: { title: 'Sales Manager (M. Shah)', badgeBg: 'bg-purple-600' },
    finance: { title: 'Finance & Ops (R. Iyer)', badgeBg: 'bg-emerald-600' },
    customer: { title: 'Customer Portal (Acme)', badgeBg: 'bg-indigo-600' },
    admin: { title: 'Administrator', badgeBg: 'bg-slate-700' },
  };

  const renderNavGroup = (title: string, items: NavItem[]) => {
    const filtered = filterByPermission(items);
    if (filtered.length === 0) return null;

    return (
      <div className="space-y-1">
        <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
          {title}
        </div>
        {filtered.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'builder' || item.id === 'pipeline') {
                  setSelectedQuoteId(null);
                }
                setActiveView(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                isActive
                  ? 'bg-[#0176D3] text-white font-bold shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container - Salesforce Light Canvas */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#EEF4F9] border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out shadow-xs ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header */}
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0176D3] flex items-center justify-center text-white shadow-xs font-bold">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-tight">
                DealFlow<span className="text-[#0176D3]">360</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Salesforce Light Enterprise CPQ
              </span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="md:hidden text-slate-500 hover:text-slate-800 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {renderNavGroup('Main Navigation', mainNav)}
          {renderNavGroup('Operations & Workflow', opsNav)}
          {renderNavGroup('Analytics & Intelligence', insightsNav)}
          {renderNavGroup('System Administration', adminNav)}
        </div>

        {/* Bottom Actions & User Profile */}
        <div className="p-3 border-t border-slate-200 space-y-3 bg-white">
          {/* Ask DealFlow AI Button */}
          {!isCustomer && (
            <button
              onClick={() => {
                onOpenAskDealFlow();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-blue-50 text-[#0176D3] border border-blue-200 hover:bg-blue-100 transition cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-[#0176D3]" />
              <span>Ask DealFlow AI</span>
            </button>
          )}

          {/* User Card */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#0176D3] font-bold shrink-0 border border-blue-200">
                <UserCheck className="w-4 h-4 text-[#0176D3]" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 block truncate">
                  {currentUser?.name || (roleDisplayNames[userRole as UserRole]?.title) || 'Current User'}
                </span>
                <span
                  className={`inline-block text-[9px] font-bold uppercase text-white px-1.5 py-0.2 rounded ${roleDisplayNames[userRole as UserRole]?.badgeBg || 'bg-slate-700'}`}
                >
                  {userRole ? userRole.replace('_', ' ') : 'User'}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
