import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserRole,
  Company,
  Product,
  Warehouse,
  WarehouseInventory,
  Quote,
  QuoteLine,
  Invoice,
  Subscription,
  DealAnomaly,
  AuditLog,
  ConfigPolicy,
  ChatMessage,
  DeliveryAddress,
  FulfillmentStage,
  QuoteRevisionVersion,
  CustomerRevisionRequest,
  CustomerRevisionRequestLine,
  QuoteStatus,
  AppNotification,
} from '../types';
import {
  SEED_COMPANIES,
  SEED_PRODUCTS,
  SEED_WAREHOUSES,
  SEED_INVENTORY,
  SEED_QUOTES,
  SEED_INVOICES,
  SEED_SUBSCRIPTIONS,
  SEED_AUDIT_LOGS,
} from '../data/seedData';
import { DEFAULT_CONFIG_POLICY, evaluateBlendedRisk } from '../logic/riskEngine';
import { calculateQuoteTotals, calculateLineMetrics } from '../logic/pricingEngine';
import { scanDealAnomalies } from '../logic/dealHealthEngine';
import { generateOptimalFulfillment } from '../logic/fulfillmentEngine';
import { generateHybridBilling } from '../logic/billingEngine';
import { calculateDealCloseConfidence } from '../logic/aiEngine';
import { DemoUser, DEMO_USERS, ROLE_DEFAULT_AVATARS, findDemoUser } from '../auth/demoUsers';
import {
  PostgresHealth,
  checkPostgresHealth,
  fetchPostgresQuotes,
  fetchPostgresCompanies,
  fetchPostgresProducts,
  savePostgresQuote,
  updatePostgresQuoteStatus,
  savePostgresCompany,
  savePostgresUser,
  savePostgresProduct,
  savePostgresProductsBatch,
} from '../lib/postgresClient';

export interface AuthUser {
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  avatarUrl?: string;
  title?: string;
  phoneNumber?: string;
  address?: DeliveryAddress;
  gstin?: string;
  contactPerson?: string;
}

interface AppContextType {
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  login: (email: string, password: string, role?: UserRole) => void;
  loginAsRole: (role: UserRole) => void;
  loginAsCustomer: (token: string) => void;
  logout: () => void;

  updateUserProfile: (updates: {
    name?: string;
    title?: string;
    avatarUrl?: string;
    phoneNumber?: string;
    address?: DeliveryAddress;
    gstin?: string;
  }) => void;
  updateCustomerCompanyProfile: (
    companyId: string,
    updates: {
      contactPerson?: string;
      name?: string;
      phoneNumber?: string;
      contactEmail?: string;
      avatarUrl?: string;
      address?: DeliveryAddress;
      gstin?: string;
    }
  ) => void;
  resetUserAvatar: () => void;
  getCustomAvatar: (role: UserRole, email?: string) => string;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;

  // PostgreSQL Local Database Integration
  isPostgresConnected: boolean;
  postgresHealth: PostgresHealth | null;
  syncWithPostgres: () => Promise<void>;

  activeView: string;
  setActiveView: (view: string, quoteId?: string | null) => void;
  selectedQuoteId: string | null;
  setSelectedQuoteId: (id: string | null) => void;
  customerPortalToken: string | null;
  setCustomerPortalToken: (token: string | null) => void;

  // Data
  users: DemoUser[];
  companies: Company[];
  products: Product[];
  warehouses: Warehouse[];
  inventory: WarehouseInventory[];
  quotes: Quote[];
  invoices: Invoice[];
  subscriptions: Subscription[];
  anomalies: DealAnomaly[];
  auditLogs: AuditLog[];
  configPolicy: ConfigPolicy;
  messages: ChatMessage[];
  activeQuote: Quote | null;

  // Operations
  addUser: (user: DemoUser) => void;
  addCompany: (company: Company) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  addWarehouse: (warehouse: Warehouse) => void;
  updateWarehouse: (warehouse: Warehouse) => void;
  updateInventoryStock: (warehouseId: string, productId: string, quantityOnHand: number) => void;
  sendMessage: (quoteId: string, text: string, sender: 'customer' | 'rep' | 'manager' | 'system', senderName: string, companyId?: string) => void;
  createNewQuote: (companyId: string) => string;
  updateQuoteLine: (quoteId: string, lineId: string, quantity: number, discountPercent: number) => void;
  addLineToQuote: (quoteId: string, productId: string, quantity?: number, discountPercent?: number) => void;
  removeLineFromQuote: (quoteId: string, lineId: string) => void;
  submitForApproval: (quoteId: string) => void;
  sendToCustomer: (quoteId: string) => void;
  sendRevisedQuoteToCustomer: (quoteId: string) => void;
  managerApprove: (quoteId: string, comments?: string) => void;
  financeApprove: (quoteId: string, comments?: string) => void;
  returnForRevision: (quoteId: string, comments: string) => void;
  rejectQuote: (quoteId: string, comments: string, rejectorRole?: 'sales_manager' | 'finance') => void;
  customerCounterOffer: (
    quoteId: string,
    notes: string,
    lineDiscounts: Record<string, number>,
    requestedDelivery?: string,
    lineComments?: Record<string, string>
  ) => void;
  acceptCustomerRevision: (quoteId: string) => void;
  rejectCustomerRevision: (quoteId: string, reason?: string) => void;
  updateDeliveryAddress: (quoteId: string, address: DeliveryAddress) => void;
  updatePromisedDeliveryDate: (quoteId: string, date: string) => void;
  advanceFulfillmentStage: (quoteId: string, stage: FulfillmentStage) => void;
  customerAcceptQuote: (quoteId: string) => void;
  acceptFulfillment: (quoteId: string) => { invoiceId: string; isNew: boolean } | null;
  recordPayment: (invoiceId: string) => void;
  resolveAnomaly: (anomalyId: string, actionTaken: string) => void;
  updatePolicy: (updates: Partial<ConfigPolicy>) => void;
  addCustomAuditLog: (quoteId: string, actor: string, action: string, details?: any) => void;
  resetToSeedData: () => void;

  // Assignments & Governance
  customerAssignments: Record<string, string>;
  repManagerAssignments: Record<string, string>;
  assignCustomerToRep: (companyId: string, repEmail: string) => void;
  assignRepToManager: (repEmail: string, managerEmail: string) => void;

  // Admin Operations
  deleteQuote: (quoteId: string) => boolean;

  // Real-time Event Notifications
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'dealflow360_app_state_v2';
const AUTH_STORAGE_KEY = 'dealflow360_auth_v2';

export const DEFAULT_CUSTOMER_ASSIGNMENTS: Record<string, string> = {
  'comp-acme': 'rep@dealflow360.com',
  'comp-novatech': 'asharma@dealflow360.com',
  'comp-orbit': 'rep@dealflow360.com',
  'comp-zenith': 'asharma@dealflow360.com',
};

export const DEFAULT_REP_MANAGER_ASSIGNMENTS: Record<string, string> = {
  'rep@dealflow360.com': 'manager@dealflow360.com',
  'asharma@dealflow360.com': 'manager@dealflow360.com',
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Commercial Approval Required',
    message: 'Quotation Q-1039 (NovaTech Systems) requires Sales Manager approval.',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    read: false,
    type: 'approval',
    relatedId: 'Q-1039',
    targetRole: 'sales_manager',
  },
  {
    id: 'notif-2',
    title: 'Customer Revision Requested',
    message: 'Acme Industries submitted a counter-offer for quotation Q-1048.',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    read: false,
    type: 'negotiation',
    relatedId: 'Q-1048',
    targetRole: 'sales_rep',
  },
  {
    id: 'notif-3',
    title: 'Order Ready for Fulfillment',
    message: 'Quotation Q-1042 fully approved by Finance. Ready for warehouse allocation.',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    read: false,
    type: 'fulfillment',
    relatedId: 'Q-1042',
    targetRole: 'all',
  },
];

const INITIAL_SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    quoteId: 'Q-1042',
    companyId: 'comp-1',
    sender: 'rep',
    senderName: 'P. Mehta (Sales Rep)',
    text: 'Hello Acme Procurement! We have generated quotation Q-1042 with standard commercial terms. Please review the deliverables.',
    timestamp: '10:15 AM',
  },
  {
    id: 'msg-2',
    quoteId: 'Q-1042',
    companyId: 'comp-1',
    sender: 'customer',
    senderName: 'Rajesh Verma (Acme)',
    text: 'Thanks P. Mehta. We are reviewing the Installation & Setup line item discounts and requested delivery date.',
    timestamp: '11:30 AM',
  },
  {
    id: 'msg-3',
    quoteId: 'Q-1039',
    companyId: 'comp-2',
    sender: 'rep',
    senderName: 'A. Sharma (Sales Rep)',
    text: 'Hello Priya, proposal Q-1039 for NovaTech Systems is ready. We have configured the high-availability server cluster.',
    timestamp: '09:45 AM',
  },
  {
    id: 'msg-4',
    quoteId: 'Q-1039',
    companyId: 'comp-2',
    sender: 'customer',
    senderName: 'Priya Sharma (NovaTech)',
    text: 'Could you review the software subscription line? We are requesting 30-day net payment terms.',
    timestamp: '10:20 AM',
  },
  {
    id: 'msg-5',
    quoteId: 'Q-1035',
    companyId: 'comp-3',
    sender: 'rep',
    senderName: 'P. Mehta (Sales Rep)',
    text: 'Quotation Q-1035 for Zenith Retail has entered fulfillment dispatch from Mumbai Logistics Center.',
    timestamp: '01:10 PM',
  },
  {
    id: 'msg-6',
    quoteId: 'Q-1035',
    companyId: 'comp-3',
    sender: 'customer',
    senderName: 'Anand Kulkarni (Zenith)',
    text: 'Noted! Please confirm dispatch tracking number once shipment departs.',
    timestamp: '01:45 PM',
  },
  {
    id: 'msg-7',
    quoteId: 'Q-1040',
    companyId: 'comp-4',
    sender: 'customer',
    senderName: 'Dr. Anita Desai (Vertex)',
    text: 'Can we reduce the biotech consulting fee by 15% for annual engagement?',
    timestamp: '02:15 PM',
  },
  {
    id: 'msg-8',
    quoteId: 'Q-1040',
    companyId: 'comp-4',
    sender: 'rep',
    senderName: 'V. Patel (Sales Rep)',
    text: 'Hello Dr. Desai, submitting revision request to sales management for commercial approval.',
    timestamp: '02:40 PM',
  },
  {
    id: 'msg-9',
    quoteId: 'Q-1031',
    companyId: 'comp-5',
    sender: 'rep',
    senderName: 'P. Mehta (Sales Rep)',
    text: 'Tax invoice INV-5016 generated for Orbit Manufacturing. Ready for settlement.',
    timestamp: '03:15 PM',
  },
  {
    id: 'msg-10',
    quoteId: 'Q-1031',
    companyId: 'comp-5',
    sender: 'customer',
    senderName: 'Vikramaditya Patel (Orbit)',
    text: 'Finance desk has approved the invoice. Payment is scheduled.',
    timestamp: '03:50 PM',
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Helper to retrieve custom uploaded avatar per role or email from localStorage
  const getCustomAvatar = (role: UserRole, email?: string): string => {
    try {
      if (email) {
        const savedByEmail = localStorage.getItem(`dealflow360_avatar_${email.trim().toLowerCase()}`);
        if (savedByEmail) return savedByEmail;
      }
      const saved = localStorage.getItem(`dealflow360_avatar_${role}`);
      if (saved) return saved;
    } catch {
      // ignore
    }
    return ROLE_DEFAULT_AVATARS[role] || '';
  };

  // Initialize Auth State from LocalStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    return savedAuth ? JSON.parse(savedAuth).isAuthenticated : false;
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!savedAuth) return null;
    try {
      const parsed = JSON.parse(savedAuth);
      const user: AuthUser = parsed.currentUser;
      if (user) {
        const role: UserRole = user.role || parsed.userRole || 'sales_rep';
        const customAvatar = getCustomAvatar(role, user.email);
        return {
          ...user,
          avatarUrl: customAvatar || user.avatarUrl || ROLE_DEFAULT_AVATARS[role],
          title: user.title || DEMO_USERS.find((u) => u.role === role)?.title || 'Team Member',
        };
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    return savedAuth ? JSON.parse(savedAuth).userRole : 'sales_rep';
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    const matched = users?.find((u) => u.role === role) || DEMO_USERS.find((u) => u.role === role);
    const customAvatar = getCustomAvatar(role, matched?.email);
    const updatedUser: AuthUser = {
      email: matched?.email || `${role}@dealflow360.com`,
      name: matched?.name || role.replace('_', ' '),
      role,
      title: matched?.title || 'Staff Specialist',
      companyId: matched?.companyId,
      avatarUrl: customAvatar || matched?.avatarUrl || ROLE_DEFAULT_AVATARS[role],
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ isAuthenticated, currentUser: updatedUser, userRole: role })
    );

    // On switching portals, it should start from the dashboard page only (or customer portal)
    const targetView = role === 'customer' ? 'portal' : 'dashboard';
    setActiveView(targetView);
    setSelectedQuoteId(null);
  };

  const loginAsRole = (role: UserRole) => {
    const matched = DEMO_USERS.find((u) => u.role === role);
    const email = matched?.email || `${role}@dealflow360.com`;
    const password = matched?.password || 'demo123';
    // For customer, use the first customer demo user's company token
    if (role === 'customer') {
      const customerUser = matched || DEMO_USERS.find((u) => u.role === 'customer');
      const comp = companies.find((c) => c.id === customerUser?.companyId) || companies.find((c) => c.portalToken === customerUser?.portalToken);
      loginAsCustomer(comp?.portalToken || 'token_acme');
    } else {
      login(email, password, role);
    }
  };

  const login = (email: string, _password: string, role?: UserRole) => {
    const assignedRole = role || 'sales_rep';
    const matched = findDemoUser(email) || DEMO_USERS.find((u) => u.role === assignedRole);
    const customAvatar = getCustomAvatar(assignedRole, email);

    let compId = matched?.companyId;
    let matchedCompany = compId ? companies.find((c) => c.id === compId) : undefined;
    if (!matchedCompany && assignedRole === 'customer') {
      matchedCompany =
        companies.find((c) => c.contactEmail.toLowerCase() === email.toLowerCase()) ||
        companies.find((c) => c.portalToken === matched?.portalToken) ||
        companies[0];
      compId = matchedCompany?.id;
    }

    const user: AuthUser = {
      email,
      name: matched?.name || matchedCompany?.contactPerson || email.split('@')[0],
      role: assignedRole,
      title: matched?.title || (matchedCompany ? `Client Account (${matchedCompany.name})` : 'Staff Specialist'),
      companyId: compId,
      avatarUrl: customAvatar || matched?.avatarUrl,
      phoneNumber: matched?.phoneNumber || matchedCompany?.phoneNumber,
      address: matched?.address || matchedCompany?.address,
      gstin: matched?.gstin || matchedCompany?.gstin,
      contactPerson: matchedCompany?.contactPerson || matched?.name,
    };

    setIsAuthenticated(true);
    setCurrentUser(user);
    setUserRoleState(assignedRole);
    if (assignedRole === 'customer') {
      if (matchedCompany?.portalToken) {
        setCustomerPortalToken(matchedCompany.portalToken);
      }
      const matchingQuote = quotes.find((q) => q.companyId === compId);
      if (matchingQuote) {
        setSelectedQuoteId(matchingQuote.id);
      }
    }
    setActiveView(assignedRole === 'customer' ? 'portal' : 'dashboard');

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ isAuthenticated: true, currentUser: user, userRole: assignedRole })
    );
  };

  // LOGIN AS CUSTOMER VIA PORTAL TOKEN
  // Resolves the FULL identity from DemoUser + Company, updates ALL dependent state
  const loginAsCustomer = (token: string) => {
    // 1. Find company by portal token (use LIVE state, not seed)
    const company = companies.find((c) => c.portalToken === token) || SEED_COMPANIES.find((c) => c.portalToken === token);
    if (!company) {
      alert('Invalid portal token. No matching company found.');
      return;
    }

    // 2. Find the matching DemoUser for this company (by companyId or portalToken)
    const demoUser = DEMO_USERS.find((u) => u.companyId === company.id) ||
      DEMO_USERS.find((u) => u.portalToken === token);
    const customAvatar = getCustomAvatar('customer', demoUser?.email || company.contactEmail);

    // 3. Build full identity AuthUser
    const user: AuthUser = {
      email: demoUser?.email || company.contactEmail,
      name: demoUser?.name || company.contactPerson || company.name,
      role: 'customer',
      title: demoUser?.title || `Client Account (${company.name})`,
      companyId: company.id,
      avatarUrl: customAvatar || demoUser?.avatarUrl,
      phoneNumber: demoUser?.phoneNumber || company.phoneNumber,
      address: demoUser?.address || company.address,
      gstin: demoUser?.gstin || company.gstin,
      contactPerson: company.contactPerson || demoUser?.name,
    };

    // 4. Update ALL state atomically
    setIsAuthenticated(true);
    setCurrentUser(user);
    setUserRoleState('customer');
    setCustomerPortalToken(token);

    // 5. Set selected quote to the first quote belonging to THIS company
    const companyQuote = quotes.find((q) => q.companyId === company.id);
    if (companyQuote) {
      setSelectedQuoteId(companyQuote.id);
    } else {
      setSelectedQuoteId(null as any);
    }

    setActiveView('portal');

    // 6. Persist to localStorage
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ isAuthenticated: true, currentUser: user, userRole: 'customer' })
    );
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUserRoleState('sales_rep');
    setActiveViewState('landing');
    localStorage.removeItem(AUTH_STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', '#/landing');
      scrollToTopGlobal();
    }
  };

  // State Persistence Initialization
  const loadSavedData = () => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved state:', e);
      }
    }
    return null;
  };

  const initialSaved = loadSavedData();

  // URL Hash Routing & Indexing Helper
  const parseRouteFromHash = (hash: string): { view: string; quoteId: string | null } => {
    const clean = hash.replace(/^#\/?/, '').trim();
    if (!clean) return { view: '', quoteId: null };

    const [path, query] = clean.split('?');
    const params = new URLSearchParams(query || '');
    const quoteId = params.get('id') || params.get('quoteId') || null;

    if (path.startsWith('quotes/')) {
      return { view: 'builder', quoteId: path.replace('quotes/', '') };
    }

    if (path === 'portal' || path.startsWith('portal/')) {
      return { view: 'portal', quoteId };
    }

    return { view: path, quoteId };
  };

  const scrollToTopGlobal = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const mainEl = document.querySelector('main');
      if (mainEl) mainEl.scrollTop = 0;
    }
  };

  const getInitialView = () => {
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    let isAuth = false;
    let role: UserRole = 'sales_rep';
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        isAuth = parsed.isAuthenticated || false;
        role = parsed.userRole || 'sales_rep';
      } catch {
        // ignore
      }
    }

    if (typeof window !== 'undefined' && window.location.hash) {
      const parsed = parseRouteFromHash(window.location.hash);
      if (parsed.view) {
        // If not authenticated, only allow 'login' or default to 'landing'
        if (!isAuth && parsed.view !== 'login') {
          return 'landing';
        }
        return parsed.view;
      }
    }

    if (!isAuth) return 'landing';
    return role === 'customer' ? 'portal' : 'dashboard';
  };

  const [activeView, setActiveViewState] = useState<string>(getInitialView);
  const [selectedQuoteId, setSelectedQuoteIdState] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const parsed = parseRouteFromHash(window.location.hash);
      if (parsed.quoteId) return parsed.quoteId;
    }
    return initialSaved?.selectedQuoteId || 'Q-1042';
  });

  const setSelectedQuoteId = (id: string | null) => {
    setSelectedQuoteIdState(id);
    if (typeof window !== 'undefined' && activeView === 'builder' && id) {
      const targetHash = `#/builder?id=${id}`;
      if (window.location.hash !== targetHash) {
        window.history.pushState(null, '', targetHash);
      }
    }
  };

  const setActiveView = (view: string, quoteId?: string | null) => {
    setActiveViewState(view);
    if (quoteId !== undefined) {
      setSelectedQuoteIdState(quoteId);
    }
    if (typeof window !== 'undefined') {
      const targetHash = quoteId ? `#/${view}?id=${quoteId}` : `#/${view}`;
      if (window.location.hash !== targetHash) {
        window.history.pushState(null, '', targetHash);
      }
      scrollToTopGlobal();
    }
  };

  // Listen to browser Back/Forward (hashchange & popstate)
  useEffect(() => {
    const handleNavigation = () => {
      if (typeof window === 'undefined') return;
      const { view, quoteId } = parseRouteFromHash(window.location.hash);
      if (view) {
        if (!isAuthenticated && view !== 'login' && view !== 'landing') {
          setActiveViewState('landing');
          window.history.replaceState(null, '', '#/landing');
          scrollToTopGlobal();
          return;
        }
        setActiveViewState(view);
        if (quoteId) {
          setSelectedQuoteIdState(quoteId);
        }
        scrollToTopGlobal();
      } else {
        const defaultView = isAuthenticated
          ? (userRole === 'customer' ? 'portal' : 'dashboard')
          : 'landing';
        setActiveViewState(defaultView);
        window.history.replaceState(null, '', `#/${defaultView}`);
        scrollToTopGlobal();
      }
    };

    window.addEventListener('hashchange', handleNavigation);
    window.addEventListener('popstate', handleNavigation);

    // Synchronize initial URL hash on mount
    if (typeof window !== 'undefined') {
      const currentInitial = getInitialView();
      if (!window.location.hash || (!isAuthenticated && (window.location.hash.startsWith('#/portal') || window.location.hash === '#/dashboard'))) {
        window.history.replaceState(null, '', `#/${currentInitial}`);
      }
    }

    return () => {
      window.removeEventListener('hashchange', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [isAuthenticated, userRole]);
  const [customerPortalToken, setCustomerPortalToken] = useState<string | null>(
    initialSaved?.customerPortalToken || 'token_acme'
  );

  const [users, setUsers] = useState<DemoUser[]>(() => {
    const base = initialSaved?.users || DEMO_USERS;
    return base.map((u: DemoUser) => {
      const customAv = getCustomAvatar(u.role);
      return {
        ...u,
        avatarUrl: customAv || u.avatarUrl || ROLE_DEFAULT_AVATARS[u.role],
      };
    });
  });

  const updateUserProfile = (updates: {
    name?: string;
    title?: string;
    avatarUrl?: string;
    phoneNumber?: string;
    address?: DeliveryAddress;
    gstin?: string;
  }) => {
    if (!currentUser) return;
    const updated: AuthUser = {
      ...currentUser,
      ...(updates.name ? { name: updates.name } : {}),
      ...(updates.title ? { title: updates.title } : {}),
      ...(updates.avatarUrl ? { avatarUrl: updates.avatarUrl } : {}),
      ...(updates.phoneNumber ? { phoneNumber: updates.phoneNumber } : {}),
      ...(updates.address ? { address: updates.address } : {}),
      ...(updates.gstin ? { gstin: updates.gstin } : {}),
    };
    setCurrentUser(updated);

    // Synchronize users state so instant role switcher and login screen update immediately
    setUsers((prev) =>
      prev.map((u) => {
        if (u.role === currentUser.role || u.email === currentUser.email) {
          return {
            ...u,
            ...(updates.name ? { name: updates.name } : {}),
            ...(updates.title ? { title: updates.title } : {}),
            ...(updates.avatarUrl ? { avatarUrl: updates.avatarUrl } : {}),
            ...(updates.phoneNumber ? { phoneNumber: updates.phoneNumber } : {}),
            ...(updates.address ? { address: updates.address } : {}),
          };
        }
        return u;
      })
    );

    // If customer, also synchronize matched company
    if (currentUser.role === 'customer' && currentUser.companyId) {
      setCompanies((prev) =>
        prev.map((c) => {
          if (c.id !== currentUser.companyId) return c;
          return {
            ...c,
            contactPerson: updates.name || c.contactPerson,
            phoneNumber: updates.phoneNumber || c.phoneNumber,
            address: updates.address || c.address,
            gstin: updates.gstin || c.gstin,
          };
        })
      );
    }

    if (updates.avatarUrl) {
      try {
        localStorage.setItem(`dealflow360_avatar_${currentUser.role}`, updates.avatarUrl);
        if (currentUser.email) {
          localStorage.setItem(`dealflow360_avatar_${currentUser.email.trim().toLowerCase()}`, updates.avatarUrl);
        }
      } catch (e) {
        console.error('Failed to save avatar to localStorage:', e);
      }
    }
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ isAuthenticated, currentUser: updated, userRole: currentUser.role })
    );
  };

  const resetUserAvatar = () => {
    if (!currentUser) return;
    try {
      localStorage.removeItem(`dealflow360_avatar_${currentUser.role}`);
      if (currentUser.email) {
        localStorage.removeItem(`dealflow360_avatar_${currentUser.email.trim().toLowerCase()}`);
      }
    } catch {
      // ignore
    }
    const defaultAv = ROLE_DEFAULT_AVATARS[currentUser.role] || '';
    const updated: AuthUser = { ...currentUser, avatarUrl: defaultAv };
    setCurrentUser(updated);

    setUsers((prev) =>
      prev.map((u) => {
        if (u.role === currentUser.role || u.email === currentUser.email) {
          return {
            ...u,
            avatarUrl: defaultAv,
          };
        }
        return u;
      })
    );

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ isAuthenticated, currentUser: updated, userRole: currentUser.role })
    );
  };

  const updateCustomerCompanyProfile = (
    companyId: string,
    updates: {
      contactPerson?: string;
      name?: string;
      phoneNumber?: string;
      contactEmail?: string;
      avatarUrl?: string;
      address?: DeliveryAddress;
      gstin?: string;
    }
  ) => {
    // 1. Update company in companies state
    setCompanies((prev) =>
      prev.map((c) => {
        if (c.id !== companyId && c.contactEmail?.toLowerCase() !== currentUser?.email?.toLowerCase()) return c;
        return {
          ...c,
          name: updates.name || c.name,
          contactEmail: updates.contactEmail || c.contactEmail,
          phoneNumber: updates.phoneNumber || c.phoneNumber,
          gstin: updates.gstin || c.gstin,
          address: updates.address || c.address,
          contactPerson: updates.contactPerson || c.contactPerson,
        };
      })
    );

    // 2. Update currentUser in store and localStorage
    if (currentUser) {
      const updatedUser: AuthUser = {
        ...currentUser,
        name: updates.contactPerson || updates.name || currentUser.name,
        email: updates.contactEmail || currentUser.email,
        phoneNumber: updates.phoneNumber || currentUser.phoneNumber,
        avatarUrl: updates.avatarUrl || currentUser.avatarUrl,
        address: updates.address || currentUser.address,
        gstin: updates.gstin || currentUser.gstin,
        title: updates.name ? `Client Account (${updates.name})` : currentUser.title,
      };
      setCurrentUser(updatedUser);
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ isAuthenticated: true, currentUser: updatedUser, userRole: currentUser.role })
      );
    }

    // 3. Update delivery address on active quotes for this company
    if (updates.address) {
      setQuotes((prev) =>
        prev.map((q) => {
          if (q.companyId !== companyId) return q;
          return {
            ...q,
            deliveryAddress: {
              ...q.deliveryAddress,
              ...updates.address,
              contactName: updates.contactPerson || q.deliveryAddress?.contactName || updates.name || '',
              contactPhone: updates.phoneNumber || q.deliveryAddress?.contactPhone || '',
              contactEmail: updates.contactEmail || q.deliveryAddress?.contactEmail || '',
            },
            updatedAt: new Date().toISOString(),
          };
        })
      );
    }

    // 4. Update users array
    setUsers((prev) =>
      prev.map((u) => {
        if (u.companyId === companyId || (currentUser && u.email === currentUser.email)) {
          return {
            ...u,
            name: updates.contactPerson || updates.name || u.name,
            avatarUrl: updates.avatarUrl || u.avatarUrl,
            phoneNumber: updates.phoneNumber || u.phoneNumber,
            address: updates.address || u.address,
          };
        }
        return u;
      })
    );

    addCustomAuditLog(
      companyId,
      currentUser?.name || 'Customer User',
      'Updated Customer Profile, Contact Number, and Billing Address'
    );
  };

  const [companies, setCompanies] = useState<Company[]>(initialSaved?.companies || SEED_COMPANIES);
  const [products, setProducts] = useState<Product[]>(() => {
    const rawList = initialSaved?.products || SEED_PRODUCTS;
    // Strictly sanitize and purge any accidental grocery items
    const sanitized = rawList.filter(
      (p: Product) => !['prod-bread', 'prod-milk', 'prod-butter'].includes(p.id) && !/bread|milk|butter|sourdough/i.test(p.name)
    );
    const mapped = sanitized.map((p: Product) => {
      const seed = SEED_PRODUCTS.find((sp) => sp.id === p.id);
      if (seed && p.listPrice <= 1500 && seed.listPrice >= 10000) {
        return {
          ...p,
          listPrice: seed.listPrice,
          costPrice: seed.costPrice,
          variants: p.variants?.map((v) => ({
            ...v,
            extraPrice: v.extraPrice ? v.extraPrice.replace('$', '₹') : v.extraPrice,
          })),
          pricelists: p.pricelists?.map((pl) => ({
            ...pl,
            currency: pl.currency === 'USD' ? 'INR' : pl.currency.replace('USD', 'INR'),
          })),
        };
      }
      return p;
    });
    const existingIds = new Set(mapped.map((p: Product) => p.id));
    const missingSeed = SEED_PRODUCTS.filter((sp) => !existingIds.has(sp.id) && !['prod-bread', 'prod-milk', 'prod-butter'].includes(sp.id));
    return [...mapped, ...missingSeed];
  });
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialSaved?.warehouses || SEED_WAREHOUSES);
  const [inventory, setInventory] = useState<WarehouseInventory[]>(initialSaved?.inventory || SEED_INVENTORY);
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    const rawQuotes = initialSaved?.quotes || SEED_QUOTES;
    // Clean out any lines referencing grocery items
    const cleaned = rawQuotes.map((q: Quote) => ({
      ...q,
      lines: (q.lines || []).filter((l) => !['prod-bread', 'prod-milk', 'prod-butter'].includes(l.productId) && !/bread|milk|butter|sourdough/i.test(l.productName)),
    }));
    const existingIds = new Set(cleaned.map((q: Quote) => q.id));
    const missingSeedQuotes = SEED_QUOTES.filter((q) => !existingIds.has(q.id));
    return [...cleaned, ...missingSeedQuotes];
  });
  const [invoices, setInvoices] = useState<Invoice[]>(initialSaved?.invoices || SEED_INVOICES);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(
    initialSaved?.subscriptions || SEED_SUBSCRIPTIONS
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialSaved?.auditLogs || SEED_AUDIT_LOGS);
  const [configPolicy, setConfigPolicy] = useState<ConfigPolicy>(
    initialSaved?.configPolicy || DEFAULT_CONFIG_POLICY
  );
  const [anomalies, setAnomalies] = useState<DealAnomaly[]>(() => {
    const rawAnomalies = initialSaved?.anomalies;
    if (!rawAnomalies || rawAnomalies.length === 0) {
      return scanDealAnomalies(initialSaved?.quotes || SEED_QUOTES, initialSaved?.companies || SEED_COMPANIES);
    }
    const ids = rawAnomalies.map((a: DealAnomaly) => a.id);
    const hasDuplicateIds = new Set(ids).size !== ids.length;
    if (hasDuplicateIds) {
      return scanDealAnomalies(initialSaved?.quotes || SEED_QUOTES, initialSaved?.companies || SEED_COMPANIES);
    }
    return rawAnomalies;
  });
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialSaved?.messages || INITIAL_SEED_MESSAGES
  );
  const [customerAssignments, setCustomerAssignments] = useState<Record<string, string>>(
    initialSaved?.customerAssignments || DEFAULT_CUSTOMER_ASSIGNMENTS
  );
  const [repManagerAssignments, setRepManagerAssignments] = useState<Record<string, string>>(
    initialSaved?.repManagerAssignments || DEFAULT_REP_MANAGER_ASSIGNMENTS
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(
    initialSaved?.notifications || INITIAL_NOTIFICATIONS
  );

  const activeQuote = quotes.find((q) => q.id === selectedQuoteId) || quotes[0] || null;

  // Persist State to LocalStorage on modifications
  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify({
        selectedQuoteId,
        customerPortalToken,
        users,
        companies,
        products,
        warehouses,
        inventory,
        quotes,
        invoices,
        subscriptions,
        auditLogs,
        configPolicy,
        anomalies,
        messages,
        customerAssignments,
        repManagerAssignments,
        notifications,
      })
    );
  }, [
    selectedQuoteId,
    customerPortalToken,
    users,
    companies,
    products,
    warehouses,
    inventory,
    quotes,
    invoices,
    subscriptions,
    auditLogs,
    configPolicy,
    anomalies,
    messages,
    customerAssignments,
    repManagerAssignments,
    notifications,
  ]);

  // Re-scan deal anomalies whenever quotes or companies change (data-driven)
  useEffect(() => {
    const freshAnomalies = scanDealAnomalies(quotes, companies);
    // Preserve resolved status from existing anomalies
    const resolvedMap = new Map(anomalies.filter((a) => a.isResolved).map((a) => [a.id, a.actionTaken]));
    const merged = freshAnomalies.map((a) => ({
      ...a,
      isResolved: resolvedMap.has(a.id),
      actionTaken: resolvedMap.get(a.id) || a.actionTaken,
      recommendedAction: resolvedMap.has(a.id) ? `Resolved (${resolvedMap.get(a.id)})` : a.recommendedAction,
    }));
    setAnomalies(merged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotes, companies]);

  // Realtime Broadcast Channel for cross-tab customer portal sync
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'dealflow_sync_event' && e.newValue) {
        try {
          const payload = JSON.parse(e.newValue);
          if (payload.type === 'QUOTE_UPDATED') {
            setQuotes((prev) =>
              prev.map((q) => (q.id === payload.quote.id ? payload.quote : q))
            );
          } else if (payload.type === 'NEW_MESSAGE') {
            setMessages((prev) => [...prev, payload.message]);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    window.addEventListener('storage', handleStorageEvent);
    return () => window.removeEventListener('storage', handleStorageEvent);
  }, []);

  // PostgreSQL 18 Database Integration State & Polling
  const [isPostgresConnected, setIsPostgresConnected] = useState<boolean>(false);
  const [postgresHealth, setPostgresHealth] = useState<PostgresHealth | null>(null);

  const syncWithPostgres = async () => {
    try {
      const health = await checkPostgresHealth();
      setPostgresHealth(health);
      setIsPostgresConnected(health.connected);

      if (health.connected) {
        // Sync products catalog with PostgreSQL 18
        fetchPostgresProducts().then((dbProducts) => {
          if (dbProducts && Array.isArray(dbProducts)) {
            const dbIds = new Set(dbProducts.map((dp: any) => dp.id));
            const unsaved = products.filter(
              (p) => !dbIds.has(p.id) && !['prod-bread', 'prod-milk', 'prod-butter'].includes(p.id)
            );
            if (unsaved.length > 0) {
              savePostgresProductsBatch(unsaved).catch((err) => console.warn('[PostgreSQL Sync Batch Error]:', err));
            }
          }
        }).catch((e) => console.warn('[PostgreSQL Products Sync Error]:', e));

        // Fetch live quotes from PostgreSQL
        const dbQuotes = await fetchPostgresQuotes();
        if (dbQuotes && Array.isArray(dbQuotes) && dbQuotes.length > 0) {
          setQuotes((prev) => {
            const dbMap = new Map(dbQuotes.map((dq: any) => [dq.id, dq]));
            const merged = prev.map((localQuote) => {
              const fromDb = dbMap.get(localQuote.id) || dbQuotes.find((dq: any) => dq.quote_number === localQuote.id);
              if (fromDb) {
                return {
                  ...localQuote,
                  status: fromDb.status || localQuote.status,
                  totalNetAmount: parseFloat(fromDb.total_net_price) || localQuote.totalNetAmount,
                  riskLevel: fromDb.risk_level || localQuote.riskLevel,
                };
              }
              return localQuote;
            });
            const localIds = new Set(prev.map((q) => q.id));
            for (const dq of dbQuotes) {
              if (!localIds.has(dq.id)) {
                merged.push({
                  id: dq.id,
                  companyId: dq.company_id || 'comp-1',
                  companyName: dq.company_name || 'Enterprise Client',
                  tier: 'Gold',
                  salesRep: 'Rajesh Sharma',
                  status: dq.status || 'Draft',
                  blendedRiskScore: parseFloat(dq.blended_risk_score) || 0,
                  riskLevel: dq.risk_level || 'LOW',
                  riskBreakdown: {
                    serviceDeviationPts: 0,
                    marginErosionPts: 0,
                    tierRiskPts: 0.5,
                    totalScore: 0.5,
                    reasons: ['Synced from PostgreSQL 18 Local Database'],
                  },
                  totalListAmount: parseFloat(dq.total_list_price) || 0,
                  totalDiscountAmount: parseFloat(dq.total_discount_amount) || 0,
                  totalNetAmount: parseFloat(dq.total_net_price) || 0,
                  overallMarginPercent: parseFloat(dq.margin_percentage) || 0,
                  approvalStage: 'None',
                  approvalAssignedTo: 'Auto-Approved',
                  dealConfidence: parseFloat(dq.deal_confidence) || 85,
                  lines: dq.lines && Array.isArray(dq.lines) ? dq.lines.map((l: any) => ({
                    id: l.id,
                    productId: l.productId || l.product_id,
                    productName: 'Enterprise Item',
                    quantity: parseInt(l.quantity, 10) || 1,
                    unitListPrice: parseFloat(l.unitPrice || l.unit_price) || 0,
                    unitCostPrice: parseFloat(l.unitCost || l.unit_cost) || 0,
                    discountPercent: parseFloat(l.discountPercent || l.discount_percent) || 0,
                    discountCeiling: 15,
                    netAmount: parseFloat(l.netPrice || l.net_price) || 0,
                    marginPercent: 30,
                    isOverLimit: false,
                    overLimitPoints: 0,
                  })) : [],
                  createdAt: dq.created_at || new Date().toISOString(),
                  updatedAt: dq.updated_at || new Date().toISOString(),
                  promisedDeliveryDate: '2026-10-15',
                  portalToken: `token_${dq.company_id || 'acme'}`,
                  deliveryAddress: {
                    contactName: (dq.company_name || 'Enterprise') + ' Lead',
                    contactPhone: '+91 98250 00000',
                    contactEmail: 'contact@enterprise.in',
                    addressLine1: 'Industrial Zone, Phase 1',
                    city: 'Ahmedabad',
                    state: 'Gujarat',
                    postalCode: '380015',
                    country: 'India',
                  },
                  revisionHistory: [
                    {
                      version: 1,
                      updatedBy: 'Rajesh Sharma',
                      timestamp: dq.created_at || new Date().toISOString(),
                      promisedDeliveryDate: '2026-10-15',
                      discountSummary: 'Imported from PostgreSQL 18 Local Database',
                      status: dq.status || 'Draft',
                    },
                  ],
                });
              }
            }
            return merged;
          });
        }

        // Fetch live companies from PostgreSQL
        const dbCompanies = await fetchPostgresCompanies();
        if (dbCompanies && Array.isArray(dbCompanies) && dbCompanies.length > 0) {
          setCompanies((prev) => {
            const localIds = new Set(prev.map((c) => c.id));
            const newComps: Company[] = [];
            for (const dc of dbCompanies) {
              if (!localIds.has(dc.id)) {
                newComps.push({
                  id: dc.id,
                  name: dc.name,
                  tierId: dc.tier_id === 'tier-1' ? 'Gold' : dc.tier_id === 'tier-3' ? 'Bronze' : 'Silver',
                  industry: dc.industry || 'Technology',
                  creditLimit: parseFloat(dc.credit_limit) || 1000000,
                  contactEmail: dc.contact_email,
                  portalToken: dc.portal_token,
                  historicalCloseRate: parseFloat(dc.historical_close_rate) || 80,
                  historicalAvgDiscount: parseFloat(dc.historical_avg_discount) || 8,
                });
              }
            }
            return newComps.length > 0 ? [...prev, ...newComps] : prev;
          });
        }
      }
    } catch (err) {
      console.warn('[PostgreSQL Sync Error]:', err);
    }
  };

  useEffect(() => {
    syncWithPostgres();
    const interval = setInterval(() => {
      checkPostgresHealth().then((h) => {
        setIsPostgresConnected(h.connected);
        setPostgresHealth(h);
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const broadcastSync = (type: string, data: any) => {
    localStorage.setItem(
      'dealflow_sync_event',
      JSON.stringify({ type, timestamp: Date.now(), ...data })
    );
    // If PostgreSQL is connected and a quote was updated, synchronize it directly to PostgreSQL
    if (type === 'QUOTE_UPDATED' && data?.quote) {
      savePostgresQuote(data.quote).catch((err) =>
        console.warn('[PostgreSQL Save Error]:', err)
      );
    }
  };

  const sendMessage = (
    quoteId: string,
    text: string,
    sender: 'customer' | 'rep' | 'manager' | 'system',
    senderName: string,
    companyId?: string
  ) => {
    // Resolve target companyId
    let resolvedCompanyId = companyId;
    if (!resolvedCompanyId) {
      const q = quotes.find((q) => q.id === quoteId);
      if (q) {
        resolvedCompanyId = q.companyId;
      } else {
        const c = companies.find((c) => c.id === quoteId || c.name.toLowerCase() === quoteId.toLowerCase());
        if (c) resolvedCompanyId = c.id;
      }
    }
    if (!resolvedCompanyId) {
      resolvedCompanyId = companies[0]?.id || 'comp-1';
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      quoteId,
      companyId: resolvedCompanyId,
      sender,
      senderName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    broadcastSync('NEW_MESSAGE', { message: newMsg });
    addCustomAuditLog(quoteId, senderName, `Sent Chat Message: "${text.slice(0, 40)}..."`);
    addNotification({
      title: `Message from ${senderName}`,
      message: text.slice(0, 60),
      type: 'negotiation',
      relatedId: quoteId,
      targetRole: sender === 'customer' ? 'sales_rep' : 'customer',
    });
  };

  const addCustomAuditLog = (quoteId: string, actor: string, action: string, details?: any) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      quoteId,
      actor,
      action,
      details,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addUser = (newUser: DemoUser) => {
    setUsers((prev) => [newUser, ...prev]);
    savePostgresUser(newUser).catch((err) => console.warn('[PostgreSQL User Save Error]:', err));
  };

  const addCompany = (newCompany: Company) => {
    setCompanies((prev) => [newCompany, ...prev]);
    savePostgresCompany(newCompany).catch((err) => console.warn('[PostgreSQL Company Save Error]:', err));
  };

  const addProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    savePostgresProduct(newProduct).catch((err) => console.warn('[PostgreSQL Product Save Error]:', err));
    // Optionally initialize inventory across warehouses
    setInventory((prev) => [
      ...prev,
      {
        id: `inv-${Date.now()}-w1`,
        warehouseId: warehouses[0]?.id || 'wh-west',
        productId: newProduct.id,
        quantityOnHand: newProduct.quantityOnHand ?? 150,
        quantityReserved: 0,
      },
    ]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    savePostgresProduct(updatedProduct).catch((err) => console.warn('[PostgreSQL Product Update Error]:', err));
  };

  const addWarehouse = (newWarehouse: Warehouse) => {
    setWarehouses((prev) => [...prev, newWarehouse]);
    const newInvEntries: WarehouseInventory[] = products.map((p, idx) => ({
      id: `inv-${Date.now()}-${idx}`,
      warehouseId: newWarehouse.id,
      productId: p.id,
      quantityOnHand: 250,
      quantityReserved: 0,
    }));
    setInventory((prev) => [...prev, ...newInvEntries]);
    addCustomAuditLog('SYSTEM', currentUser?.name || 'Admin', `Added New Warehouse: ${newWarehouse.name} (${newWarehouse.id})`);
  };

  const updateWarehouse = (updatedWarehouse: Warehouse) => {
    setWarehouses((prev) => prev.map((w) => (w.id === updatedWarehouse.id ? updatedWarehouse : w)));
    addCustomAuditLog('SYSTEM', currentUser?.name || 'Admin', `Updated Warehouse Details: ${updatedWarehouse.name}`);
  };

  const updateInventoryStock = (warehouseId: string, productId: string, newStock: number) => {
    setInventory((prev) => {
      const exists = prev.some((i) => i.warehouseId === warehouseId && i.productId === productId);
      if (exists) {
        return prev.map((item) =>
          item.warehouseId === warehouseId && item.productId === productId
            ? { ...item, quantityOnHand: Math.max(0, newStock) }
            : item
        );
      }
      return [
        ...prev,
        {
          id: `inv-${Date.now()}`,
          warehouseId,
          productId,
          quantityOnHand: Math.max(0, newStock),
          quantityReserved: 0,
        },
      ];
    });
    addCustomAuditLog('SYSTEM', currentUser?.name || 'Inventory Mgr', `Stock Updated for Warehouse ${warehouseId}: ${newStock} units`);
  };

  // Re-evaluate a quote's pricing, risk, and confidence
  const recomputeQuote = (quote: Quote, customPolicy?: ConfigPolicy): Quote => {
    const policy = customPolicy || configPolicy;
    const totals = calculateQuoteTotals(quote.lines);
    const riskEval = evaluateBlendedRisk(quote.lines, quote.tier, policy);
    const company = companies.find((c) => c.id === quote.companyId);
    const confidence = calculateDealCloseConfidence(
      {
        ...quote,
        ...totals,
        blendedRiskScore: riskEval.blendedScore,
        riskLevel: riskEval.riskLevel,
        overallMarginPercent: totals.overallMarginPercent,
      },
      company
    );

    return {
      ...quote,
      totalListAmount: totals.totalListAmount,
      totalDiscountAmount: totals.totalDiscountAmount,
      totalNetAmount: totals.totalNetAmount,
      overallMarginPercent: totals.overallMarginPercent,
      blendedRiskScore: riskEval.blendedScore,
      riskLevel: riskEval.riskLevel,
      riskBreakdown: riskEval.riskBreakdown,
      approvalStage:
        quote.status === 'Draft' || quote.status === 'Under Negotiation'
          ? riskEval.approvalStage
          : quote.approvalStage,
      approvalAssignedTo: riskEval.assignedTo,
      dealConfidence: confidence.score,
      updatedAt: new Date().toISOString(),
    };
  };

  const createNewQuote = (companyId: string): string => {
    const company = companies.find((c) => c.id === companyId) || companies[0];
    const newId = `Q-${Math.floor(1043 + quotes.length)}`;
    const newQuote: Quote = {
      id: newId,
      companyId: company.id,
      companyName: company.name,
      tier: company.tierId,
      salesRep: currentUser?.name || 'P. Mehta',
      status: 'Draft',
      blendedRiskScore: 0,
      riskLevel: 'LOW',
      riskBreakdown: {
        serviceDeviationPts: 0,
        marginErosionPts: 0,
        tierRiskPts: 0.5,
        totalScore: 0.5,
        reasons: ['New quotation initialized in Draft stage.'],
      },
      totalListAmount: 0,
      totalDiscountAmount: 0,
      totalNetAmount: 0,
      overallMarginPercent: 0,
      approvalStage: 'None',
      approvalAssignedTo: 'Auto-Approved',
      dealConfidence: 85,
      portalToken: company.portalToken,
      lines: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      promisedDeliveryDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
      deliveryAddress: {
        contactName: company.name + ' Representative',
        contactPhone: '+91 98250 00000',
        contactEmail: company.contactEmail,
        addressLine1: 'Corporate Park, Phase 1',
        city: 'Ahmedabad',
        state: 'Gujarat',
        postalCode: '380015',
        country: 'India',
      },
      revisionHistory: [
        {
          version: 1,
          updatedBy: currentUser?.name || 'P. Mehta (Sales Rep)',
          timestamp: new Date().toISOString(),
          promisedDeliveryDate: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
          discountSummary: 'Initial proposal created',
          status: 'Draft',
        },
      ],
    };

    setQuotes((prev) => [newQuote, ...prev]);
    savePostgresQuote(newQuote).catch((err) => console.warn('[PostgreSQL Save Error]:', err));
    setSelectedQuoteId(newId);
    setActiveView('builder');
    addCustomAuditLog(newId, currentUser?.name || 'Sales Rep (P. Mehta)', 'Draft Quote Created', { company: company.name });
    return newId;
  };

  const updateQuoteLine = (
    quoteId: string,
    lineId: string,
    quantity: number,
    discountPercent: number
  ) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;
        const updatedLines = q.lines.map((l) => {
          if (l.id !== lineId) return l;
          const metrics = calculateLineMetrics(
            quantity,
            l.unitListPrice,
            l.unitCostPrice,
            discountPercent,
            l.discountCeiling
          );
          return {
            ...l,
            quantity,
            discountPercent,
            netAmount: metrics.netAmount,
            marginPercent: metrics.marginPercent,
            isOverLimit: metrics.isOverLimit,
            overLimitPoints: metrics.overLimitPoints,
          };
        });

        const updatedQuote = recomputeQuote({ ...q, lines: updatedLines });
        broadcastSync('QUOTE_UPDATED', { quote: updatedQuote });
        return updatedQuote;
      })
    );
  };

  const addLineToQuote = (
    quoteId: string,
    productId: string,
    quantity = 1,
    discountPercent = 0
  ) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;
        const ceiling = configPolicy.categoryCeilings[product.categoryId] || 10;

        // Check if item already exists in quote lines -> increment quantity
        const existingLineIndex = q.lines.findIndex((l) => l.productId === productId);
        if (existingLineIndex >= 0) {
          const existingLine = q.lines[existingLineIndex];
          const newQuantity = existingLine.quantity + quantity;
          const metrics = calculateLineMetrics(
            newQuantity,
            product.listPrice,
            product.costPrice,
            existingLine.discountPercent,
            ceiling
          );

          const updatedLines = [...q.lines];
          updatedLines[existingLineIndex] = {
            ...existingLine,
            quantity: newQuantity,
            isOverLimit: metrics.isOverLimit,
            overLimitPoints: metrics.overLimitPoints,
            netAmount: metrics.netAmount,
            marginPercent: metrics.marginPercent,
          };

          const updatedQuote = recomputeQuote({ ...q, lines: updatedLines });
          addCustomAuditLog(
            quoteId,
            currentUser?.name || 'Sales Rep (P. Mehta)',
            `Increased ${product.name} quantity to ${newQuantity}`,
            {
              qty: newQuantity,
              discount: `${existingLine.discountPercent}%`,
              net: `₹${metrics.netAmount.toLocaleString('en-IN')}`,
            }
          );
          broadcastSync('QUOTE_UPDATED', { quote: updatedQuote });
          return updatedQuote;
        }

        const metrics = calculateLineMetrics(
          quantity,
          product.listPrice,
          product.costPrice,
          discountPercent,
          ceiling
        );

        const newLine: QuoteLine = {
          id: `ql-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          quoteId,
          productId: product.id,
          productName: product.name,
          category: product.categoryId,
          quantity,
          unitListPrice: product.listPrice,
          unitCostPrice: product.costPrice,
          discountPercent,
          discountCeiling: ceiling,
          isOverLimit: metrics.isOverLimit,
          overLimitPoints: metrics.overLimitPoints,
          netAmount: metrics.netAmount,
          marginPercent: metrics.marginPercent,
          isRecurring: product.isRecurring,
          billingPeriod: product.billingPeriod,
        };

        const updatedQuote = recomputeQuote({ ...q, lines: [...q.lines, newLine] });
        addCustomAuditLog(quoteId, currentUser?.name || 'Sales Rep (P. Mehta)', `Added ${product.name}`, {
          qty: quantity,
          discount: `${discountPercent}%`,
          net: `₹${metrics.netAmount.toLocaleString('en-IN')}`,
        });
        broadcastSync('QUOTE_UPDATED', { quote: updatedQuote });
        return updatedQuote;
      })
    );
  };

  const removeLineFromQuote = (quoteId: string, lineId: string) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;
        const targetLine = q.lines.find((l) => l.id === lineId);
        const updatedLines = q.lines.filter((l) => l.id !== lineId);
        const updatedQuote = recomputeQuote({ ...q, lines: updatedLines });
        if (targetLine) {
          addCustomAuditLog(quoteId, currentUser?.name || 'Sales Rep (P. Mehta)', `Removed ${targetLine.productName}`);
        }
        broadcastSync('QUOTE_UPDATED', { quote: updatedQuote });
        return updatedQuote;
      })
    );
  };

  const submitForApproval = (quoteId: string) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;
        const evalResult = evaluateBlendedRisk(q.lines, q.tier, configPolicy);

        let nextStatus: Quote['status'] = 'Draft';
        let stage: Quote['approvalStage'] = 'None';
        let assignedTo = 'Auto-Approved';

        if (evalResult.riskLevel === 'HIGH' || evalResult.riskLevel === 'MEDIUM') {
          nextStatus = 'Pending Manager';
          stage = 'Sales Manager';
          assignedTo = 'M. Shah (Sales Manager)';
          addCustomAuditLog(
            quoteId,
            currentUser?.name || 'Sales Rep (P. Mehta)',
            `Submitted for Manager Approval (${evalResult.riskLevel} Risk, Score ${evalResult.blendedScore})`,
            { reasons: evalResult.riskBreakdown.reasons }
          );
        } else {
          nextStatus = 'Manager Approved';
          stage = 'Fully Approved';
          assignedTo = 'P. Mehta (Sales Rep)';
          addCustomAuditLog(
            quoteId,
            'System Governance',
            'Compliant Deal Auto-Approved. Ready for Sales Rep to send to customer.'
          );
        }

        const updatedQuote: Quote = {
          ...q,
          status: nextStatus,
          approvalStage: stage,
          approvalAssignedTo: assignedTo,
          blendedRiskScore: evalResult.blendedScore,
          riskLevel: evalResult.riskLevel,
          riskBreakdown: evalResult.riskBreakdown,
        };
        broadcastSync('QUOTE_UPDATED', { quote: updatedQuote });
        addNotification({
          title: 'Quotation Submitted for Approval',
          message: `Quotation ${quoteId} (${q.companyName}) submitted for ${stage === 'Fully Approved' ? 'Customer Delivery' : stage} (${evalResult.riskLevel} Risk).`,
          type: 'approval',
          relatedId: quoteId,
          targetRole: nextStatus === 'Pending Manager' ? 'sales_manager' : 'all',
        });
        return updatedQuote;
      })
    );
  };

  const sendToCustomer = (quoteId: string) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;
        addCustomAuditLog(quoteId, currentUser?.name || 'Sales Rep (P. Mehta)', 'Sent Approved Quotation to Customer Portal');
        const updated: Quote = {
          ...q,
          status: 'Pending Customer',
          approvalStage: 'Customer Review' as any,
          approvalAssignedTo: 'Customer Portal',
        };
        broadcastSync('QUOTE_UPDATED', { quote: updated });
        addNotification({
          title: 'Quotation Sent to Customer',
          message: `Quotation ${quoteId} sent to Customer Portal (${q.companyName}).`,
          type: 'quote',
          relatedId: quoteId,
          targetRole: 'customer',
        });
        return updated;
      })
    );
  };

  const sendRevisedQuoteToCustomer = (quoteId: string) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;
        addCustomAuditLog(quoteId, currentUser?.name || 'Sales Rep (P. Mehta)', 'Sent Revised Quotation to Customer');
        const updated: Quote = {
          ...q,
          status: 'Pending Customer',
          approvalStage: 'Customer Review' as any,
          approvalAssignedTo: 'Customer Portal',
        };
        broadcastSync('QUOTE_UPDATED', { quote: updated });
        addNotification({
          title: 'Revised Quotation Sent',
          message: `Revised Quotation ${quoteId} sent to ${q.companyName}.`,
          type: 'quote',
          relatedId: quoteId,
          targetRole: 'customer',
        });
        return updated;
      })
    );
  };

  // Sales Manager Approval
  const managerApprove = (quoteId: string, comments = 'Commercial terms approved by Sales Manager.') => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;
        addCustomAuditLog(quoteId, 'Sales Manager (M. Shah)', 'Approved Quotation Terms & Sent to Customer', { comments });
        const updated: Quote = {
          ...q,
          status: 'Pending Customer',
          approvalStage: 'None',
          approvalAssignedTo: 'Customer',
        };
        broadcastSync('QUOTE_UPDATED', { quote: updated });
        addNotification({
          title: 'Approved by Sales Manager',
          message: `Quotation ${quoteId} (${q.companyName}) approved by Sales Manager.`,
          type: 'approval',
          relatedId: quoteId,
          targetRole: 'sales_rep',
        });
        return updated;
      })
    );
  };

  // Finance Approval
  const financeApprove = (quoteId: string, comments = 'Financial margins and credit exposure approved.') => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;
        addCustomAuditLog(quoteId, 'Finance (R. Iyer)', 'Approved High-Risk Quotation Terms (Final Approval)', {
          comments,
        });
        const updated: Quote = {
          ...q,
          status: 'Finance Approved',
          approvalStage: 'Fully Approved',
          approvalAssignedTo: 'Completed',
        };
        broadcastSync('QUOTE_UPDATED', { quote: updated });
        addNotification({
          title: 'Approved by Finance',
          message: `Quotation ${quoteId} (${q.companyName}) granted final Finance approval.`,
          type: 'approval',
          relatedId: quoteId,
          targetRole: 'all',
        });
        return updated;
      })
    );
  };

  // Return for Revision
  const returnForRevision = (quoteId: string, comments: string) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;
        const actor = userRole === 'finance' ? 'Finance (R. Iyer)' : 'Sales Manager (M. Shah)';
        addCustomAuditLog(quoteId, actor, 'Returned Quotation for Revision', {
          reason: comments,
        });
        const updated: Quote = {
          ...q,
          status: 'Returned for Revision',
          approvalStage: 'None',
          approvalAssignedTo: 'P. Mehta (Sales Rep)',
        };
        broadcastSync('QUOTE_UPDATED', { quote: updated });
        addNotification({
          title: 'Quotation Returned for Revision',
          message: `Quotation ${quoteId} (${q.companyName}) returned for revision: ${comments}`,
          type: 'approval',
          relatedId: quoteId,
          targetRole: 'sales_rep',
        });
        return updated;
      })
    );
  };

  // Reject Quote
  const rejectQuote = (quoteId: string, comments: string, rejectorRole?: 'sales_manager' | 'finance') => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;
        const isFinance = rejectorRole === 'finance' || userRole === 'finance';
        const actor = isFinance ? 'Finance (R. Iyer)' : 'Sales Manager (M. Shah)';
        const statusVal: Quote['status'] = isFinance ? 'Rejected by Finance' : 'Rejected by Sales Manager';

        addCustomAuditLog(quoteId, actor, `Rejected Quotation`, { reason: comments });
        const updated: Quote = {
          ...q,
          status: statusVal,
          approvalStage: 'None',
          approvalAssignedTo: 'Closed',
        };
        broadcastSync('QUOTE_UPDATED', { quote: updated });
        addNotification({
          title: 'Quotation Rejected',
          message: `Quotation ${quoteId} (${q.companyName}) was rejected: ${comments}`,
          type: 'approval',
          relatedId: quoteId,
          targetRole: 'sales_rep',
        });
        return updated;
      })
    );
  };

  // Customer Portal Counter Offer
  // Customer Portal Counter Offer (Stores request WITHOUT overwriting original quote terms)
  const customerCounterOffer = (
    quoteId: string,
    notes: string,
    lineDiscounts: Record<string, number>,
    requestedDelivery?: string,
    lineComments?: Record<string, string>
  ) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;

        const lineRequests: CustomerRevisionRequestLine[] = q.lines.map((l) => ({
          lineId: l.id,
          productId: l.productId,
          productName: l.productName,
          originalDiscountPercent: l.discountPercent,
          requestedDiscountPercent:
            lineDiscounts[l.id] !== undefined ? lineDiscounts[l.id] : l.discountPercent,
          unitListPrice: l.unitListPrice,
          comment: lineComments?.[l.id] || '',
        }));

        const revRequest: CustomerRevisionRequest = {
          requestedAt: new Date().toISOString(),
          message: notes,
          requestedDeliveryDate: requestedDelivery || q.requestedDeliveryDate,
          lineRequests,
        };

        const newVersion: QuoteRevisionVersion = {
          version: (q.revisionHistory?.length || 0) + 1,
          updatedBy: `Customer (${q.companyName})`,
          timestamp: new Date().toISOString(),
          promisedDeliveryDate: q.promisedDeliveryDate,
          requestedDeliveryDate: requestedDelivery || q.requestedDeliveryDate,
          discountSummary: `Customer requested revision on ${lineRequests.filter(r => r.requestedDiscountPercent !== r.originalDiscountPercent).length} lines & delivery ${requestedDelivery || 'schedule'}`,
          status: 'Customer Revision Requested',
          notes,
        };

        const updatedQuote: Quote = {
          ...q,
          status: 'Customer Revision Requested',
          approvalStage: 'None',
          approvalAssignedTo: `${q.salesRep} (Sales Rep)`,
          customerCounterNotes: notes,
          requestedDeliveryDate: requestedDelivery || q.requestedDeliveryDate,
          customerRevisionRequest: revRequest,
          revisionHistory: [...(q.revisionHistory || []), newVersion],
        };

        addCustomAuditLog(
          quoteId,
          `Customer (${q.companyName})`,
          'Submitted Commercial Term Revision Request',
          {
            notes,
            requestedDelivery: requestedDelivery || q.promisedDeliveryDate,
            lineRequestsCount: lineRequests.length,
          }
        );

        broadcastSync('QUOTE_UPDATED', { quote: updatedQuote });
        addNotification({
          title: 'Customer Revision Requested',
          message: `${q.companyName} submitted a commercial counter-offer on quote ${quoteId}.`,
          type: 'negotiation',
          relatedId: quoteId,
          targetRole: 'sales_rep',
        });
        return updatedQuote;
      })
    );
  };

  // Sales Rep Accepts Customer Revision Request
  const acceptCustomerRevision = (quoteId: string) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId || !q.customerRevisionRequest) return q;

        const req = q.customerRevisionRequest;
        const updatedLines = q.lines.map((l) => {
          const lineReq = req.lineRequests.find((r) => r.lineId === l.id);
          const newDiscount = lineReq ? lineReq.requestedDiscountPercent : l.discountPercent;
          const metrics = calculateLineMetrics(
            l.quantity,
            l.unitListPrice,
            l.unitCostPrice,
            newDiscount,
            l.discountCeiling
          );
          return {
            ...l,
            discountPercent: newDiscount,
            netAmount: metrics.netAmount,
            marginPercent: metrics.marginPercent,
            isOverLimit: metrics.isOverLimit,
            overLimitPoints: metrics.overLimitPoints,
          };
        });

        const newPromisedDelivery = req.requestedDeliveryDate || q.promisedDeliveryDate;

        const recomputed = recomputeQuote({
          ...q,
          lines: updatedLines,
          promisedDeliveryDate: newPromisedDelivery,
          customerRevisionRequest: undefined,
        });

        const hasOverLimitLine = updatedLines.some((l) => l.isOverLimit);
        let nextStatus: QuoteStatus = 'Pending Customer';
        let nextStage: 'None' | 'Sales Manager' | 'Finance' = 'None';
        let nextAssignee = 'Customer';

        if (hasOverLimitLine || recomputed.riskLevel === 'HIGH' || recomputed.riskLevel === 'MEDIUM') {
          nextStatus = 'Pending Manager';
          nextStage = 'Sales Manager';
          nextAssignee = 'M. Shah (Sales Manager)';
        }

        const newVersion: QuoteRevisionVersion = {
          version: (q.revisionHistory?.length || 0) + 1,
          updatedBy: `${q.salesRep} (Sales Rep)`,
          timestamp: new Date().toISOString(),
          promisedDeliveryDate: newPromisedDelivery,
          discountSummary: `Accepted customer requested terms. New promised delivery: ${newPromisedDelivery}`,
          status: nextStatus,
          notes: 'Accepted customer revision request and re-evaluated governance limits.',
        };

        const updatedQuote: Quote = {
          ...recomputed,
          status: nextStatus,
          approvalStage: nextStage,
          approvalAssignedTo: nextAssignee,
          revisionHistory: [...(q.revisionHistory || []), newVersion],
        };

        addCustomAuditLog(
          quoteId,
          `${q.salesRep} (Sales Rep)`,
          'Accepted Customer Revision Request & Updated Commercial Terms',
          {
            newPromisedDelivery,
            newBlendedRisk: recomputed.blendedRiskScore,
            status: nextStatus,
          }
        );

        broadcastSync('QUOTE_UPDATED', { quote: updatedQuote });
        return updatedQuote;
      })
    );
  };

  // Sales Rep Rejects Customer Revision Request
  const rejectCustomerRevision = (quoteId: string, reason?: string) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;

        const newVersion: QuoteRevisionVersion = {
          version: (q.revisionHistory?.length || 0) + 1,
          updatedBy: `${q.salesRep} (Sales Rep)`,
          timestamp: new Date().toISOString(),
          promisedDeliveryDate: q.promisedDeliveryDate,
          discountSummary: 'Rejected customer revision request. Original commercial terms maintained.',
          status: 'Pending Customer',
          notes: reason || 'Declined counter terms. Original proposal stands.',
        };

        const updatedQuote: Quote = {
          ...q,
          status: 'Pending Customer',
          approvalStage: 'None',
          approvalAssignedTo: 'Customer',
          customerRevisionRequest: undefined,
          revisionHistory: [...(q.revisionHistory || []), newVersion],
        };

        addCustomAuditLog(quoteId, `${q.salesRep} (Sales Rep)`, 'Rejected Customer Revision Request', { reason });

        broadcastSync('QUOTE_UPDATED', { quote: updatedQuote });
        return updatedQuote;
      })
    );
  };

  // Update Customer Shipping Delivery Address
  const updateDeliveryAddress = (quoteId: string, address: DeliveryAddress) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;
        const updated: Quote = { ...q, deliveryAddress: address, updatedAt: new Date().toISOString() };
        addCustomAuditLog(quoteId, 'System / Rep', 'Updated Shipping Delivery Address', address);
        broadcastSync('QUOTE_UPDATED', { quote: updated });
        return updated;
      })
    );
  };

  // Update Promised Delivery Date
  const updatePromisedDeliveryDate = (quoteId: string, date: string) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;
        const updated: Quote = { ...q, promisedDeliveryDate: date, updatedAt: new Date().toISOString() };
        addCustomAuditLog(quoteId, `${q.salesRep} (Sales Rep)`, `Updated Promised Delivery Date to ${date}`);
        broadcastSync('QUOTE_UPDATED', { quote: updated });
        return updated;
      })
    );
  };

  // Advance Fulfillment Operational Stage
  const advanceFulfillmentStage = (quoteId: string, nextStage: FulfillmentStage) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;
        const updated: Quote = {
          ...q,
          fulfillmentStage: nextStage,
          status: nextStage === 'Shipped' || nextStage === 'Delivered' ? 'Fulfillment' : q.status,
          updatedAt: new Date().toISOString(),
        };
        addCustomAuditLog(quoteId, 'Fulfillment Operations', `Advanced Fulfillment Stage to ${nextStage}`);
        broadcastSync('QUOTE_UPDATED', { quote: updated });
        return updated;
      })
    );
  };

  // Customer Accepts Quote
  const customerAcceptQuote = (quoteId: string) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;

        const hasOverLimitLines = q.lines.some((l) => l.isOverLimit);
        // Low Risk or Under Limit discounts -> Automatically Approve Finance
        const isCompliant = q.riskLevel === 'LOW' || !hasOverLimitLines;

        let nextStatus: Quote['status'] = 'Pending Finance';
        let stage: Quote['approvalStage'] = 'Finance';
        let assignedTo = 'R. Iyer (Finance)';

        if (isCompliant) {
          // Under limit / Low Risk -> Auto-approve Finance
          nextStatus = 'Finance Approved';
          stage = 'Fully Approved';
          assignedTo = 'Auto-Approved by Finance Rules Engine';
          addCustomAuditLog(
            quoteId,
            `Customer (${q.companyName})`,
            'Accepted Commercial Terms (Low Risk & Compliant Discounts). Automatically Approved by Finance Rules Engine.'
          );
        } else {
          // Over limit / High Risk -> Route to Finance Manager for manual review
          nextStatus = 'Pending Finance';
          stage = 'Finance';
          assignedTo = 'R. Iyer (Finance)';
          addCustomAuditLog(
            quoteId,
            `Customer (${q.companyName})`,
            'Accepted Commercial Terms (Discount Over Limit). Routed to Finance Manager (R. Iyer) for manual approval.'
          );
        }

        const updated: Quote = {
          ...q,
          status: nextStatus,
          approvalStage: stage,
          approvalAssignedTo: assignedTo,
          fulfillmentStage: isCompliant ? 'Ready for Fulfillment' : q.fulfillmentStage,
          fulfillmentBlockReason: isCompliant ? undefined : 'Pending Finance Manager Approval',
        };

        // NOTE: Invoice is NOT generated here. It is ONLY generated through
        // acceptFulfillment() after warehouse allocation is complete.
        // This enforces: Fulfillment → Invoiced → Paid lifecycle.

        broadcastSync('QUOTE_UPDATED', { quote: updated });
        addNotification({
          title: 'Quotation Accepted by Customer',
          message: `${q.companyName} accepted quotation ${quoteId}. Order released for ${isCompliant ? 'fulfillment allocation' : 'Finance Manager review'}.`,
          type: 'quote',
          relatedId: quoteId,
          targetRole: isCompliant ? 'all' : 'finance',
        });
        return updated;
      })
    );
  };

  // Accept Fulfillment Split & Auto-generate Hybrid Invoice (ONE TIME ONLY PER ORDER)
  const acceptFulfillment = (quoteId: string) => {
    const existingInvoice = invoices.find((inv) => inv.quoteId === quoteId);

    if (existingInvoice) {
      addCustomAuditLog(quoteId, 'System Operations', `Invoice ${existingInvoice.id} already exists for quote ${quoteId}.`);
      setActiveView('invoices');
      return { invoiceId: existingInvoice.id, isNew: false };
    }

    const targetQuote = quotes.find((q) => q.id === quoteId);
    if (!targetQuote) return null;

    const fulfillmentPlan = generateOptimalFulfillment(quoteId, targetQuote.lines, warehouses, inventory);
    const { invoice, subscriptions: newSubs } = generateHybridBilling(targetQuote);

    setInvoices((invs) => {
      if (invs.some((i) => i.quoteId === quoteId || i.id === invoice.id)) {
        return invs;
      }
      return [invoice, ...invs];
    });

    setSubscriptions((subs) => [...newSubs, ...subs]);

    addCustomAuditLog(quoteId, 'Operations Fulfillment Engine', 'Fulfillment Allocation Accepted & Invoice Generated', {
      shipments: fulfillmentPlan.totalShipments,
      freightCost: `₹${fulfillmentPlan.totalFreightCost.toLocaleString('en-IN')}`,
      invoiceGenerated: invoice.id,
    });

    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;
        const updated: Quote = {
          ...q,
          status: 'Invoiced',
          fulfillmentStage: 'Warehouse Allocated',
          fulfillmentLocked: true,
          allocationConfirmedAt: new Date().toISOString(),
          allocationConfirmedBy: currentUser?.name || 'Operations Lead',
        };
        broadcastSync('QUOTE_UPDATED', { quote: updated });
        return updated;
      })
    );

    addNotification({
      title: 'Fulfillment & Invoicing Triggered',
      message: `Quotation ${quoteId} (${targetQuote.companyName}) warehouse allocation confirmed. Invoice ${invoice.id} generated.`,
      type: 'fulfillment',
      relatedId: quoteId,
      targetRole: 'all',
    });

    setActiveView('invoices');
    return { invoiceId: invoice.id, isNew: true };
  };

  // Record Invoice Payment (Finance & Admin authorization required)
  const recordPayment = (invoiceId: string) => {
    if (userRole === 'customer') {
      alert('Action Unauthorized: Customer users are not authorized to alter invoice payment status. Settlement must be recorded by Finance or System Admin.');
      return;
    }

    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const updatedInv: Invoice = {
          ...inv,
          status: 'Paid',
          paidAt: new Date().toISOString(),
        };

        setQuotes((qList) =>
          qList.map((q) => (q.id === inv.quoteId ? { ...q, status: 'Paid' } : q))
        );

        addCustomAuditLog(inv.quoteId, `${currentUser?.name || 'Finance (R. Iyer)'}`, `Payment Verified & Settled (₹${inv.totalAmount.toLocaleString('en-IN')})`);
        
        addNotification({
          title: 'Payment Received',
          message: `Payment of ₹${inv.totalAmount.toLocaleString('en-IN')} received for Invoice ${inv.id} (${inv.companyName}).`,
          type: 'billing',
          relatedId: inv.id,
          targetRole: 'all',
        });

        return updatedInv;
      })
    );
  };

  // Anomaly Actions
  const resolveAnomaly = (anomalyId: string, actionTaken: string) => {
    setAnomalies((prev) =>
      prev.map((anom) => {
        if (anom.id !== anomalyId) return anom;
        addCustomAuditLog(
          anom.quoteId,
          currentUser?.name || 'Sales Operations Manager',
          `Anomaly Action: ${actionTaken}`,
          { anomaly: anom.anomalyType }
        );
        return { ...anom, isResolved: true, actionTaken, recommendedAction: `Resolved (${actionTaken})` };
      })
    );
  };

  const updatePolicy = (updates: Partial<ConfigPolicy>) => {
    setConfigPolicy((prev) => {
      const nextPolicy = { ...prev, ...updates };
      setQuotes((qList) => qList.map((q) => recomputeQuote(q, nextPolicy)));
      return nextPolicy;
    });
  };

  // Admin Quote Deletion (ADMIN ONLY)
  const deleteQuote = (quoteId: string): boolean => {
    if (userRole !== 'admin') {
      alert('Action Unauthorized: Only Administrators have permission to delete quotations.');
      return false;
    }
    const target = quotes.find((q) => q.id === quoteId);
    if (!target) return false;
    setQuotes((prev) => prev.filter((q) => q.id !== quoteId));
    addCustomAuditLog(
      quoteId,
      currentUser?.name || 'Administrator',
      `Permanently Deleted Quotation ${quoteId} (${target.companyName})`
    );
    addNotification({
      title: 'Quotation Deleted',
      message: `Quotation ${quoteId} (${target.companyName}) was permanently removed by Administrator.`,
      type: 'quote',
      relatedId: quoteId,
      targetRole: 'admin',
    });
    if (selectedQuoteId === quoteId) {
      setSelectedQuoteId(null);
    }
    return true;
  };

  // Customer & Sales Rep Assignments
  const assignCustomerToRep = (companyId: string, repEmail: string) => {
    setCustomerAssignments((prev) => ({ ...prev, [companyId]: repEmail }));
    const company = companies.find((c) => c.id === companyId);
    const rep = users.find((u) => u.email === repEmail);
    addCustomAuditLog(
      companyId,
      currentUser?.name || 'Admin',
      `Assigned Customer ${company?.name || companyId} to Sales Rep ${rep?.name || repEmail}`
    );
    addNotification({
      title: 'Customer Assignment Updated',
      message: `${company?.name || companyId} assigned to ${rep?.name || repEmail}`,
      type: 'quote',
      relatedId: companyId,
      targetRole: 'sales_rep',
    });
  };

  const assignRepToManager = (repEmail: string, managerEmail: string) => {
    setRepManagerAssignments((prev) => ({ ...prev, [repEmail]: managerEmail }));
    const rep = users.find((u) => u.email === repEmail);
    const mgr = users.find((u) => u.email === managerEmail);
    addCustomAuditLog(
      'SYSTEM',
      currentUser?.name || 'Admin',
      `Assigned Sales Rep ${rep?.name || repEmail} to Manager ${mgr?.name || managerEmail}`
    );
    addNotification({
      title: 'Rep-Manager Hierarchy Updated',
      message: `${rep?.name || repEmail} is now reporting to ${mgr?.name || managerEmail}`,
      type: 'approval',
      targetRole: 'sales_manager',
    });
  };

  // Real-time Event Notification System
  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const resetToSeedData = () => {
    setUsers(DEMO_USERS);
    setCompanies(SEED_COMPANIES);
    setProducts(SEED_PRODUCTS);
    setWarehouses(SEED_WAREHOUSES);
    setInventory(SEED_INVENTORY);
    setQuotes(SEED_QUOTES);
    setInvoices(SEED_INVOICES);
    setSubscriptions(SEED_SUBSCRIPTIONS);
    setAuditLogs(SEED_AUDIT_LOGS);
    setAnomalies(scanDealAnomalies(SEED_QUOTES, SEED_COMPANIES));
    setConfigPolicy(DEFAULT_CONFIG_POLICY);
    setCustomerAssignments(DEFAULT_CUSTOMER_ASSIGNMENTS);
    setRepManagerAssignments(DEFAULT_REP_MANAGER_ASSIGNMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSelectedQuoteId('Q-1042');
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        userRole,
        setUserRole,
        login,
        loginAsRole,
        loginAsCustomer,
        logout,
        updateUserProfile,
        updateCustomerCompanyProfile,
        resetUserAvatar,
        getCustomAvatar,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isPostgresConnected,
        postgresHealth,
        syncWithPostgres,
        activeView,
        setActiveView,
        selectedQuoteId,
        setSelectedQuoteId,
        customerPortalToken,
        setCustomerPortalToken,
        users,
        companies,
        products,
        warehouses,
        inventory,
        quotes,
        invoices,
        subscriptions,
        anomalies,
        auditLogs,
        configPolicy,
        messages,
        activeQuote,
        addUser,
        addCompany,
        addProduct,
        updateProduct,
        addWarehouse,
        updateWarehouse,
        updateInventoryStock,
        sendMessage,
        createNewQuote,
        updateQuoteLine,
        addLineToQuote,
        removeLineFromQuote,
        submitForApproval,
        sendToCustomer,
        sendRevisedQuoteToCustomer,
        managerApprove,
        financeApprove,
        returnForRevision,
        rejectQuote,
        customerCounterOffer,
        acceptCustomerRevision,
        rejectCustomerRevision,
        updateDeliveryAddress,
        updatePromisedDeliveryDate,
        advanceFulfillmentStage,
        customerAcceptQuote,
        acceptFulfillment,
        recordPayment,
        resolveAnomaly,
        updatePolicy,
        addCustomAuditLog,
        resetToSeedData,
        customerAssignments,
        repManagerAssignments,
        assignCustomerToRep,
        assignRepToManager,
        deleteQuote,
        notifications,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};

