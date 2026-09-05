import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SalesDashboardView } from './dashboards/SalesDashboardView';
import { ManagerDashboardView } from './dashboards/ManagerDashboardView';
import { FinanceDashboardView } from './dashboards/FinanceDashboardView';
import { AdminDashboardView } from './dashboards/AdminDashboardView';
import { CustomerPortalView } from './CustomerPortalView';

export const DashboardView: React.FC = () => {
  const { userRole } = useAppStore();

  switch (userRole) {
    case 'sales_rep':
      return <SalesDashboardView />;
    case 'sales_manager':
      return <ManagerDashboardView />;
    case 'finance':
      return <FinanceDashboardView />;
    case 'customer':
      return <CustomerPortalView />;
    case 'admin':
    default:
      return <AdminDashboardView />;
  }
};


