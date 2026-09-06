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
  Camera,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { hasPermission, Permission } from '../../auth/permissions';
import { UserRole, Quote, DealAnomaly } from '../../types';
import { ROLE_DEFAULT_AVATARS } from '../../auth/demoUsers';
import { BrandLogo } from '../common/BrandLogo';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenAskDealFlow?: () => void;
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
}) => {
  const { userRole, activeView, setActiveView, setSelectedQuoteId, quotes, anomalies, logout, currentUser, setIsProfileModalOpen } =
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
    { id: 'products', label: 'Products', icon: Package, permission: 'products.view' },
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
    sales_rep: { title: currentUser?.name ? `Sales Rep (${currentUser.name.split(' ')[0]})` : 'Sales Rep (P. Mehta)', badgeBg: 'bg-blue-600' },
    sales_manager: { title: currentUser?.name ? `Sales Manager (${currentUser.name.split(' ')[0]})` : 'Sales Manager (M. Shah)', badgeBg: 'bg-purple-600' },
    finance: { title: currentUser?.name ? `Finance & Ops (${currentUser.name.split(' ')[0]})` : 'Finance & Ops (R. Iyer)', badgeBg: 'bg-emerald-600' },
    customer: { title: currentUser?.name ? `Customer Portal (${currentUser.name})` : 'Customer Portal', badgeBg: 'bg-indigo-600' },
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
          <button
            onClick={() => {
              setActiveView('landing');
              onCloseMobile();
            }}
            title="View Public Landing Page"
            className="flex items-center text-left cursor-pointer transition hover:opacity-90"
          >
            <BrandLogo size="md" subtitle="Salesforce Light CPQ" />
          </button>

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
          {/* User Profile Card with 3D Embossed Depth & Avatar Settings */}
          <div className="p-2 rounded-xl bg-white border border-slate-200 card-3d flex items-center justify-between shadow-xs">
            <button
              onClick={() => {
                setIsProfileModalOpen(true);
                onCloseMobile();
              }}
              title="Click to customize profile photo & settings"
              className="flex items-center gap-2.5 overflow-hidden text-left flex-1 min-w-0 group cursor-pointer"
            >
              {/* Profile Avatar with Camera Indicator */}
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full ring-2 ring-blue-500/20 shadow-xs overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-300">
                  {currentUser?.avatarUrl ? (
                    <img
                      key={currentUser.avatarUrl}
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = ROLE_DEFAULT_AVATARS[userRole] || '';
                      }}
                    />
                  ) : (
                    <span className="text-xs font-extrabold text-[#0176D3]">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                {/* Camera upload badge */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#0176D3] text-white flex items-center justify-center shadow-xs border border-white group-hover:scale-115 transition">
                  <Camera className="w-2 h-2 text-white" />
                </div>
              </div>

              {/* Name and Role Title */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-slate-900 truncate block group-hover:text-[#0176D3] transition">
                    {currentUser?.name || (roleDisplayNames[userRole as UserRole]?.title) || 'Current User'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {currentUser?.title || roleDisplayNames[userRole as UserRole]?.title || 'Active Session'}
                </p>
              </div>
            </button>

            {/* Logout action */}
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer shrink-0 ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
