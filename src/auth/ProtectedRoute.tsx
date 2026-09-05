import React, { ReactNode } from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { hasPermission, Permission, getDefaultViewForRole } from './permissions';

interface ProtectedRouteProps {
  permission: Permission;
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ permission, children }) => {
  const { userRole, setActiveView } = useAppStore();

  const isAllowed = hasPermission(userRole, permission);

  if (!isAllowed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-slate-900">403 — Access Denied</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Your logged-in role (<span className="font-bold text-slate-800 uppercase">{userRole.replace('_', ' ')}</span>) does not have authorization to access this view.
            </p>
          </div>

          <button
            onClick={() => setActiveView(getDefaultViewForRole(userRole))}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Authorized Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
