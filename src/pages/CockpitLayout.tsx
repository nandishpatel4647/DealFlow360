import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  FilePlus2,
  ShieldCheck,
  Building,
  Warehouse,
  Zap,
  Sun,
  Moon,
  LogOut,
  Search,
  Bell,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

const nav = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutGrid, tid: 'nav-dashboard' },
  { to: '/app/builder', label: 'CPQ Builder', icon: FilePlus2, tid: 'nav-builder' },
  { to: '/app/approvals', label: 'Approvals & Risk', icon: ShieldCheck, tid: 'nav-approvals' },
  { to: '/app/portal', label: 'Buyer Portal', icon: Building, tid: 'nav-portal' },
  { to: '/app/fulfillment', label: 'Fulfillment', icon: Warehouse, tid: 'nav-fulfillment' },
];

export default function CockpitLayout() {
  const { theme, toggleTheme, user, logout } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--df-bg)] flex">
      {/* Sidebar */}
      <aside
        className="w-64 border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col p-4 sticky top-0 h-screen shrink-0"
        data-testid="cockpit-sidebar"
      >
        <div className="flex items-center gap-2.5 px-2 py-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <div>
            <div className="font-display font-bold text-heading text-[15px]">DealFlow360</div>
            <div className="text-[10px] text-muted-df -mt-0.5">Command Cockpit</div>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {nav.map((n) => {
            const Icon = n.icon;
            return (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={n.tid}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition ${
                    isActive
                      ? 'bg-gradient-to-b from-indigo-500 to-indigo-700 text-white shadow-md shadow-indigo-500/30 font-semibold'
                      : 'text-body hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-700 dark:hover:text-indigo-300'
                  }`
                }
              >
                <Icon className="w-4 h-4" /> {n.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="embossed-card p-3 mt-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || 'D'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-heading truncate">{user?.email}</div>
              <div className="text-[10px] text-muted-df">{user?.role}</div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="text-muted-df hover:text-rose-500 transition cursor-pointer p-1"
              data-testid="cockpit-logout"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200/60 dark:border-slate-800/60 px-6 flex items-center gap-4 sticky top-0 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 z-40">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
            <input
              placeholder="Search deals, customers, HSN codes…"
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 border border-transparent focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 text-sm text-heading focus:outline-none"
              data-testid="cockpit-search"
            />
          </div>
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-df hover:bg-slate-100 dark:hover:bg-slate-900 relative cursor-pointer"
            data-testid="cockpit-bell"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 pulse-dot" />
          </button>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted-df hover:bg-slate-100 dark:hover:bg-slate-900 cursor-pointer"
            data-testid="cockpit-theme-toggle"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
