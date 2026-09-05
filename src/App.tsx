import React, { useState } from 'react';
import { AppProvider, useAppStore } from './store/useAppStore';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginView } from './components/views/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { QuoteKanbanView } from './components/views/QuoteKanbanView';
import { QuoteBuilderView } from './components/views/QuoteBuilderView';
import { ApprovalsView } from './components/views/ApprovalsView';
import { FulfillmentView } from './components/views/FulfillmentView';
import { CustomerPortalView } from './components/views/CustomerPortalView';
import { SubscriptionsView } from './components/views/SubscriptionsView';
import { InvoicesView } from './components/views/InvoicesView';
import { BillingView } from './components/views/BillingView';
import { DealHealthView } from './components/views/DealHealthView';
import { ReportsView } from './components/views/ReportsView';
import { AdminConfigView } from './components/views/AdminConfigView';
import { ProductsView } from './components/views/ProductsView';
import { AskDealFlowModal } from './components/modals/AskDealFlowModal';

import { ProtectedRoute } from './auth/ProtectedRoute';

const AppContent: React.FC = () => {
  const { isAuthenticated, userRole, activeView, selectedQuoteId } = useAppStore();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);

  // Unauthenticated -> Show Login Page
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Customer Role -> Render ONLY Customer Portal (No internal shell)
  if (userRole === 'customer') {
    return (
      <div className="min-h-screen bg-[#F5F7FA] text-slate-900 font-sans">
        <CustomerPortalView />
      </div>
    );
  }

  // Internal Users -> Enterprise CRM/ERP Shell (Sidebar + Header + Main Area)
  const renderCurrentView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <ProtectedRoute permission="dashboard.view">
            <DashboardView />
          </ProtectedRoute>
        );
      case 'pipeline':
      case 'builder':
        return (
          <ProtectedRoute permission="quotations.view">
            {selectedQuoteId ? <QuoteBuilderView /> : <QuoteKanbanView />}
          </ProtectedRoute>
        );
      case 'products':
        return (
          <ProtectedRoute permission="quotations.view">
            <ProductsView />
          </ProtectedRoute>
        );
      case 'approvals':
        return (
          <ProtectedRoute permission="approvals.view">
            <ApprovalsView />
          </ProtectedRoute>
        );
      case 'fulfillment':
        return (
          <ProtectedRoute permission="fulfillment.view">
            <FulfillmentView />
          </ProtectedRoute>
        );
      case 'portal':
        return (
          <ProtectedRoute permission="customer_portal.access">
            <CustomerPortalView />
          </ProtectedRoute>
        );
      case 'subscriptions':
        return (
          <ProtectedRoute permission="billing.view">
            <SubscriptionsView />
          </ProtectedRoute>
        );
      case 'invoices':
        return (
          <ProtectedRoute permission="billing.view">
            <InvoicesView />
          </ProtectedRoute>
        );
      case 'billing':
        return (
          <ProtectedRoute permission="billing.view">
            <InvoicesView />
          </ProtectedRoute>
        );
      case 'deal_health':
        return (
          <ProtectedRoute permission="deal_health.view">
            <DealHealthView />
          </ProtectedRoute>
        );
      case 'reports':
        return (
          <ProtectedRoute permission="reports.view">
            <ReportsView />
          </ProtectedRoute>
        );
      case 'admin_config':
        return (
          <ProtectedRoute permission="admin.configure">
            <AdminConfigView />
          </ProtectedRoute>
        );
      default:
        return (
          <ProtectedRoute permission="dashboard.view">
            <DashboardView />
          </ProtectedRoute>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900 flex font-sans selection:bg-blue-500 selection:text-white">
      {/* Left Sidebar */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenAskDealFlow={() => setIsAskModalOpen(true)}
      />

      {/* Main Right Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0">
        {/* Top Header */}
        <Header onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* View Content */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 space-y-6">
          {renderCurrentView()}
        </main>

        {/* Enterprise Footer */}
        <footer className="border-t border-slate-200 py-3 text-center text-xs text-slate-500 font-medium bg-white no-print">
          DealFlow360 Enterprise • Self-Governing B2B CPQ Platform
        </footer>
      </div>

      {/* Ask DealFlow AI Modal */}
      <AskDealFlowModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

