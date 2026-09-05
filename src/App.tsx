import React, { useState, useEffect } from 'react';
import { AppProvider, useAppStore } from './store/useAppStore';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/views/DashboardView';
import { QuoteKanbanView } from './components/views/QuoteKanbanView';
import { QuoteBuilderView } from './components/views/QuoteBuilderView';
import { ApprovalsView } from './components/views/ApprovalsView';
import { FulfillmentView } from './components/views/FulfillmentView';
import { CustomerPortalView } from './components/views/CustomerPortalView';
import { BillingView } from './components/views/BillingView';
import { DealHealthView } from './components/views/DealHealthView';
import { AdminConfigView } from './components/views/AdminConfigView';
import { LandingPageView } from './components/views/LandingPageView';
import { AskDealFlowModal } from './components/modals/AskDealFlowModal';
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { AuthModal } from './components/modals/AuthModal';

const AppContent: React.FC = () => {
  const {
    currentRoute,
    activeView,
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
  } = useAppStore();

  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(!isGlobalSearchOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  // If on landing route, display public landing experience
  if (currentRoute === 'landing') {
    return (
      <>
        <LandingPageView onOpenAuth={() => setIsAuthModalOpen(true)} />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </>
    );
  }

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
      className="min-h-screen h-screen flex overflow-hidden font-sans"
      style={{
        backgroundColor: 'var(--bg-base)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Compact Left Sidebar */}
      <Sidebar onOpenAuth={() => setIsAuthModalOpen(true)} />

      {/* Main Content Area with Header */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Header
          onOpenAskDealFlow={() => setIsAskModalOpen(true)}
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
        />

        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto">
          {renderCurrentView()}
        </main>

        <footer
          className="py-3 px-6 text-center text-xs font-medium"
          style={{
            borderTop: '1px solid var(--border-default)',
            color: 'var(--text-muted)',
          }}
        >
          DealFlow360 • Institutional Self-Governing B2B Sales Operations Platform
        </footer>
      </div>

      {/* Modals */}
      <AskDealFlowModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
      />

      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
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
