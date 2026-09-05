import React, { useState } from 'react';
import { AppProvider, useAppStore } from './store/useAppStore';
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './components/views/DashboardView';
import { QuoteKanbanView } from './components/views/QuoteKanbanView';
import { QuoteBuilderView } from './components/views/QuoteBuilderView';
import { ApprovalsView } from './components/views/ApprovalsView';
import { FulfillmentView } from './components/views/FulfillmentView';
import { CustomerPortalView } from './components/views/CustomerPortalView';
import { BillingView } from './components/views/BillingView';
import { DealHealthView } from './components/views/DealHealthView';
import { AdminConfigView } from './components/views/AdminConfigView';
import { AskDealFlowModal } from './components/modals/AskDealFlowModal';

const AppContent: React.FC = () => {
  const { activeView } = useAppStore();
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);

  const renderCurrentView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'pipeline':
        return <QuoteKanbanView />;
      case 'builder':
        return <QuoteBuilderView />;
      case 'approvals':
        return <ApprovalsView />;
      case 'fulfillment':
        return <FulfillmentView />;
      case 'portal':
        return <CustomerPortalView />;
      case 'billing':
        return <BillingView />;
      case 'deal_health':
        return <DealHealthView />;
      case 'admin_config':
        return <AdminConfigView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{
        backgroundColor: 'var(--bg-base)',
        color: 'var(--text-primary)',
      }}
    >
      <Navbar onOpenAskDealFlow={() => setIsAskModalOpen(true)} />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 animate-fade-in">
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <footer
        className="py-4 text-center text-xs font-medium"
        style={{
          borderTop: '1px solid var(--border-default)',
          color: 'var(--text-muted)',
        }}
      >
        DealFlow360 • Self-Governing B2B Sales Operations Platform
      </footer>

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
