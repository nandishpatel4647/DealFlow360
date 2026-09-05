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
import { isViewAllowedForRole } from './logic/permissions';
import { ShieldAlert } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    currentRoute,
    activeView,
    setActiveView,
    userRole,
    isCustomerPortalPreview,
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
  } = useAppStore();

  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Global Scroll Reset on View or Route Change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const scrollContainer = document.getElementById('main-content-scroll');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [activeView, currentRoute]);

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

  // Dedicated Standalone Customer Workspace (No internal enterprise sidebar or header)
  if (userRole === 'customer') {
    return (
      <div
        className="min-h-screen h-screen overflow-y-auto font-sans"
        id="main-content-scroll"
        style={{
          backgroundColor: 'var(--bg-base)',
          color: 'var(--text-primary)',
        }}
      >
        <CustomerPortalView />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  // Protected View Rendering with Route Guards
  const renderCurrentView = () => {
    // Admin previewing customer portal check
    if (activeView === 'portal' && userRole === 'admin' && isCustomerPortalPreview) {
      return <CustomerPortalView />;
    }

    // Role-based permission guard
    if (!isViewAllowedForRole(activeView, userRole)) {
      return (
        <div className="py-20 text-center max-w-md mx-auto space-y-4 animate-scale-in">
          <div className="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Access Restricted</h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Your role (<strong>{userRole.replace('_', ' ')}</strong>) does not have authorization to access the <strong>{activeView.replace('_', ' ')}</strong> workspace.
            </p>
          </div>
          <button
            onClick={() => setActiveView('dashboard')}
            className="btn-primary !px-4 !py-2 !text-xs cursor-pointer"
          >
            Return to My Workspace
          </button>
        </div>
      );
    }

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
      <div
        className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto"
        id="main-content-scroll"
      >
        <Header
          onOpenAskDealFlow={() => setIsAskModalOpen(true)}
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
        />

        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto page-enter-transition">
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
