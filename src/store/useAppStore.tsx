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

export interface AuthUser {
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  title?: string;
  avatarUrl?: string;
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

  updateUserProfile: (updates: { name?: string; title?: string; avatarUrl?: string }) => void;
  resetUserAvatar: () => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;

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
  sendMessage: (quoteId: string, text: string, sender: 'customer' | 'rep' | 'manager' | 'system', senderName: string) => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'dealflow360_app_state_v2';
const AUTH_STORAGE_KEY = 'dealflow360_auth_v2';

const INITIAL_SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    quoteId: 'Q-1042',
    sender: 'rep',
    senderName: 'P. Mehta (Sales Rep)',
    text: 'Hello Acme Procurement! We have generated quotation Q-1042 with standard commercial terms. Please review the deliverables.',
    timestamp: '10:15 AM',
  },
  {
    id: 'msg-2',
    quoteId: 'Q-1042',
    sender: 'customer',
    senderName: 'Acme Procurement',
    text: 'Thanks P. Mehta. We are reviewing the Installation & Setup line item discounts and requested delivery date.',
    timestamp: '11:30 AM',
  },
  {
    id: 'msg-3',
    quoteId: 'Q-1040',
    sender: 'customer',
    senderName: 'Vertex Labs Procurement',
    text: 'Can we reduce the consulting fee by 15% for long term engagement?',
    timestamp: '02:15 PM',
  },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Helper to retrieve custom uploaded avatar per role from localStorage
  const getCustomAvatar = (role: UserRole): string => {
    try {
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
        const customAvatar = getCustomAvatar(role);
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
    const matched = DEMO_USERS.find((u) => u.role === role);
    const customAvatar = getCustomAvatar(role);
    const updatedUser: AuthUser = {
      email: matched?.email || `${role}@dealflow360.com`,
      name: matched?.name || role.replace('_', ' '),
      role,
      title: matched?.title || 'Staff Specialist',
      companyId: matched?.companyId,
      avatarUrl: customAvatar,
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
    if (role === 'customer') {
      loginAsCustomer('token_acme');
    } else {
      login(email, password, role);
    }
  };

  const login = (email: string, _password: string, role?: UserRole) => {
    const assignedRole = role || 'sales_rep';
    const matched = findDemoUser(email) || DEMO_USERS.find((u) => u.role === assignedRole);
    const customAvatar = getCustomAvatar(assignedRole);

    const user: AuthUser = {
      email,
      name: matched?.name || email.split('@')[0],
      role: assignedRole,
      title: matched?.title || 'Staff Specialist',
      companyId: matched?.companyId,
      avatarUrl: customAvatar,
    };

    setIsAuthenticated(true);
    setCurrentUser(user);
    setUserRoleState(assignedRole);
    setActiveView(assignedRole === 'customer' ? 'portal' : 'dashboard');

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ isAuthenticated: true, currentUser: user, userRole: assignedRole })
    );
  };

  const loginAsCustomer = (token: string) => {
    const company = SEED_COMPANIES.find((c) => c.portalToken === token) || SEED_COMPANIES[0];
    const customAvatar = getCustomAvatar('customer');
    const user: AuthUser = {
      email: company.contactEmail,
      name: `${company.name} Procurement`,
      role: 'customer',
      title: `Client Account (${company.name})`,
      companyId: company.id,
      avatarUrl: customAvatar,
    };

    setIsAuthenticated(true);
    setCurrentUser(user);
    setUserRoleState('customer');
    setCustomerPortalToken(token);
    setActiveView('portal');

    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ isAuthenticated: true, currentUser: user, userRole: 'customer' })
    );
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateUserProfile = (updates: { name?: string; title?: string; avatarUrl?: string }) => {
    if (!currentUser) return;
    const updated: AuthUser = {
      ...currentUser,
      ...(updates.name ? { name: updates.name } : {}),
      ...(updates.title ? { title: updates.title } : {}),
      ...(updates.avatarUrl ? { avatarUrl: updates.avatarUrl } : {}),
    };
    setCurrentUser(updated);
    if (updates.avatarUrl) {
      try {
        localStorage.setItem(`dealflow360_avatar_${currentUser.role}`, updates.avatarUrl);
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
    } catch {
      // ignore
    }
    const defaultAv = ROLE_DEFAULT_AVATARS[currentUser.role] || '';
    const updated: AuthUser = { ...currentUser, avatarUrl: defaultAv };
    setCurrentUser(updated);
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ isAuthenticated, currentUser: updated, userRole: currentUser.role })
    );
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
    if (typeof window !== 'undefined' && window.location.hash) {
      const parsed = parseRouteFromHash(window.location.hash);
      if (parsed.view) return parsed.view;
    }
    const savedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    const isAuth = savedAuth ? JSON.parse(savedAuth).isAuthenticated : false;
    const role = savedAuth ? JSON.parse(savedAuth).userRole : 'sales_rep';
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
        scrollToTopGlobal();
      }
    };

    window.addEventListener('hashchange', handleNavigation);
    window.addEventListener('popstate', handleNavigation);

    // Synchronize initial URL hash on mount
    if (typeof window !== 'undefined') {
      if (!window.location.hash) {
        const defaultView = isAuthenticated
          ? (userRole === 'customer' ? 'portal' : 'dashboard')
          : 'landing';
        window.history.replaceState(null, '', `#/${defaultView}`);
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

  const [users, setUsers] = useState<DemoUser[]>(initialSaved?.users || DEMO_USERS);
  const [companies, setCompanies] = useState<Company[]>(initialSaved?.companies || SEED_COMPANIES);
  const [products, setProducts] = useState<Product[]>(() => {
    if (!initialSaved?.products) return SEED_PRODUCTS;
    return initialSaved.products.map((p: Product) => {
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
  });
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialSaved?.warehouses || SEED_WAREHOUSES);
  const [inventory, setInventory] = useState<WarehouseInventory[]>(initialSaved?.inventory || SEED_INVENTORY);
  const [quotes, setQuotes] = useState<Quote[]>(() => {
    if (!initialSaved?.quotes) return SEED_QUOTES;
    const existingIds = new Set(initialSaved.quotes.map((q: Quote) => q.id));
    const missingSeedQuotes = SEED_QUOTES.filter((q) => !existingIds.has(q.id));
    return [...initialSaved.quotes, ...missingSeedQuotes];
  });
  const [invoices, setInvoices] = useState<Invoice[]>(initialSaved?.invoices || SEED_INVOICES);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(
    initialSaved?.subscriptions || SEED_SUBSCRIPTIONS
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialSaved?.auditLogs || SEED_AUDIT_LOGS);
  const [configPolicy, setConfigPolicy] = useState<ConfigPolicy>(
    initialSaved?.configPolicy || DEFAULT_CONFIG_POLICY
  );
  const [anomalies, setAnomalies] = useState<DealAnomaly[]>(
    () => initialSaved?.anomalies || scanDealAnomalies(SEED_QUOTES)
  );
  const [messages, setMessages] = useState<ChatMessage[]>(
    initialSaved?.messages || INITIAL_SEED_MESSAGES
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
  ]);

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

  const broadcastSync = (type: string, data: any) => {
    localStorage.setItem(
      'dealflow_sync_event',
      JSON.stringify({ type, timestamp: Date.now(), ...data })
    );
  };

  const sendMessage = (
    quoteId: string,
    text: string,
    sender: 'customer' | 'rep' | 'manager' | 'system',
    senderName: string
  ) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      quoteId,
      sender,
      senderName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    broadcastSync('NEW_MESSAGE', { message: newMsg });
    addCustomAuditLog(quoteId, senderName, `Sent Chat Message: "${text.slice(0, 40)}..."`);
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
  };

  const addCompany = (newCompany: Company) => {
    setCompanies((prev) => [newCompany, ...prev]);
  };

  const addProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
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

        if (isCompliant) {
          const existingInvoice = invoices.find((inv) => inv.quoteId === quoteId);
          if (!existingInvoice) {
            const { invoice, subscriptions: newSubs } = generateHybridBilling(updated);
            setInvoices((invs) => [invoice, ...invs]);
            setSubscriptions((subs) => [...newSubs, ...subs]);
          }
        }

        broadcastSync('QUOTE_UPDATED', { quote: updated });
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
        };
        broadcastSync('QUOTE_UPDATED', { quote: updated });
        return updated;
      })
    );

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
          'Sales Operations Manager',
          `Anomaly Action: ${actionTaken}`,
          { anomaly: anom.anomalyType }
        );
        return { ...anom, isResolved: true };
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
    setAnomalies(scanDealAnomalies(SEED_QUOTES));
    setConfigPolicy(DEFAULT_CONFIG_POLICY);
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
        resetUserAvatar,
        isProfileModalOpen,
        setIsProfileModalOpen,
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

