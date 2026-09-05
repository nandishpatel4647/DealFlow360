import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserRole,
  Company,
  Product,
  Warehouse,
  WarehouseInventory,
  Quote,
  QuoteLine,
  QuoteRevision,
  Invoice,
  Subscription,
  DealAnomaly,
  AuditLog,
  ConfigPolicy,
  WarehouseAllocation,
  UserProfile,
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
  SEED_USERS,
  SEED_NOTIFICATIONS,
} from '../data/seedData';
import { DEFAULT_CONFIG_POLICY, evaluateBlendedRisk } from '../logic/riskEngine';
import { calculateQuoteTotals, calculateLineMetrics } from '../logic/pricingEngine';
import { scanDealAnomalies } from '../logic/dealHealthEngine';
import { generateOptimalFulfillment } from '../logic/fulfillmentEngine';
import { generateHybridBilling } from '../logic/billingEngine';
import { calculateDealCloseConfidence } from '../logic/aiEngine';
import { Permissions, validateCustomerAcceptance } from '../logic/permissions';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AppContextType {
  currentRoute: 'landing' | 'app';
  setCurrentRoute: (route: 'landing' | 'app') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  activeUser: UserProfile;
  users: UserProfile[];
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedQuoteId: string | null;
  setSelectedQuoteId: (id: string | null) => void;
  customerPortalToken: string | null;
  setCustomerPortalToken: (token: string | null) => void;
  isCustomerPortalPreview: boolean;
  setIsCustomerPortalPreview: (preview: boolean) => void;

  // Authentication & User Lifecycle
  signUpUser: (data: {
    name: string;
    email: string;
    password?: string;
    role: Exclude<UserRole, 'admin'>;
    companyName?: string;
  }) => Promise<{ success: boolean; message: string }>;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  suspendUser: (userId: string) => void;
  reactivateUser: (userId: string) => void;
  changeUserRole: (userId: string, newRole: UserRole) => void;

  // Notifications & Global Search
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;

  // Data
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
  activeQuote: Quote | null;

  // Operations
  createNewQuote: (companyId: string) => string;
  updateQuoteLine: (quoteId: string, lineId: string, quantity: number, discountPercent: number) => void;
  addLineToQuote: (quoteId: string, productId: string, quantity?: number, discountPercent?: number) => void;
  removeLineFromQuote: (quoteId: string, lineId: string) => void;
  submitForApproval: (quoteId: string) => void;
  managerApprove: (quoteId: string, comments?: string) => void;
  financeApprove: (quoteId: string, comments?: string) => void;
  returnForRevision: (quoteId: string, comments: string) => void;
  customerCounterOffer: (
    quoteId: string,
    notes: string,
    lineDiscounts: Record<string, number>,
    requestedDelivery?: string
  ) => { success: boolean; message?: string };
  customerAcceptQuote: (quoteId: string) => { success: boolean; error?: string };
  acceptFulfillment: (quoteId: string) => { success: boolean; message?: string };
  recordPayment: (invoiceId: string) => void;
  resolveAnomaly: (anomalyId: string, actionTaken: string) => void;
  updatePolicy: (updates: Partial<ConfigPolicy>) => void;
  addCustomAuditLog: (
    quoteId: string | undefined,
    actor: string,
    action: string,
    details?: any,
    extra?: { eventType?: string; entityType?: 'quote' | 'user' | 'policy' | 'invoice' | 'fulfillment'; entityId?: string; previousState?: string; newState?: string }
  ) => void;
  resetToSeedData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<'landing' | 'app'>('app');
  const [users, setUsers] = useState<UserProfile[]>(SEED_USERS);
  const [userRole, setUserRole] = useState<UserRole>('sales_rep');
  const [activeUser, setActiveUser] = useState<UserProfile>(SEED_USERS[0]);
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED_NOTIFICATIONS);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>('Q-1042');
  const [customerPortalToken, setCustomerPortalToken] = useState<string | null>('token_acme');
  const [isCustomerPortalPreview, setIsCustomerPortalPreview] = useState<boolean>(false);

  const [companies, setCompanies] = useState<Company[]>(SEED_COMPANIES);
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(SEED_WAREHOUSES);
  const [inventory, setInventory] = useState<WarehouseInventory[]>(SEED_INVENTORY);
  const [quotes, setQuotes] = useState<Quote[]>(SEED_QUOTES);
  const [invoices, setInvoices] = useState<Invoice[]>(SEED_INVOICES);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(SEED_SUBSCRIPTIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(SEED_AUDIT_LOGS);
  const [configPolicy, setConfigPolicy] = useState<ConfigPolicy>(DEFAULT_CONFIG_POLICY);
  const [anomalies, setAnomalies] = useState<DealAnomaly[]>(() => scanDealAnomalies(SEED_QUOTES));

  const activeQuote = quotes.find((q) => q.id === selectedQuoteId) || quotes[0] || null;

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
    try {
      localStorage.setItem('dealflow_sync_event', JSON.stringify({ type, ...data, timestamp: Date.now() }));
    } catch (e) {
      console.warn('Sync broadcast failed:', e);
    }
  };

  // Enriched Audit Log Helper (Append-Only)
  const addCustomAuditLog = (
    quoteId: string | undefined,
    actor: string,
    action: string,
    details?: any,
    extra?: {
      eventType?: string;
      entityType?: 'quote' | 'user' | 'policy' | 'invoice' | 'fulfillment';
      entityId?: string;
      previousState?: string;
      newState?: string;
    }
  ) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      quoteId,
      actor,
      actorId: activeUser.id,
      actorRole: activeUser.role,
      action,
      details,
      eventType: extra?.eventType,
      entityType: extra?.entityType || (quoteId ? 'quote' : undefined),
      entityId: extra?.entityId || quoteId,
      previousState: extra?.previousState,
      newState: extra?.newState,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Recompute Quote Metrics Helper
  const recomputeQuote = (quote: Quote): Quote => {
    const { totalListAmount, totalDiscountAmount, totalNetAmount, overallMarginPercent } = calculateQuoteTotals(quote.lines);
    const evalResult = evaluateBlendedRisk(quote.lines, quote.tier, configPolicy);
    const company = companies.find((c) => c.id === quote.companyId);
    const updatedQuoteBase: Quote = {
      ...quote,
      totalListAmount,
      totalDiscountAmount,
      totalNetAmount,
      overallMarginPercent,
      blendedRiskScore: evalResult.blendedScore,
      riskLevel: evalResult.riskLevel,
      riskBreakdown: evalResult.riskBreakdown,
      updatedAt: new Date().toISOString(),
    };
    const confidence = calculateDealCloseConfidence(updatedQuoteBase, company);

    return {
      ...updatedQuoteBase,
      dealConfidence: confidence.score,
    };
  };

  // Authentication & User Sign Up (Supabase Auth with Unique Email Check)
  const signUpUser = async (data: {
    name: string;
    email: string;
    password?: string;
    role: Exclude<UserRole, 'admin'>;
    companyName?: string;
  }): Promise<{ success: boolean; message: string }> => {
    // 1. One Email = One Account Validation
    const emailLower = data.email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === emailLower);
    if (existing) {
      return { success: false, message: 'An account already exists for this email.' };
    }

    // 2. Reject Admin self-assignment
    if ((data.role as any) === 'admin') {
      return { success: false, message: 'Administrative accounts must be provisioned by an existing system administrator.' };
    }

    // 3. Supabase Auth Registration
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.signUp({
          email: emailLower,
          password: data.password || 'SecureDealFlow2026!',
          options: {
            data: {
              name: data.name,
              requestedRole: data.role,
            },
          },
        });
        if (error) {
          if (error.message.toLowerCase().includes('already registered')) {
            return { success: false, message: 'An account already exists for this email.' };
          }
        }
      } catch (err) {
        console.warn('Supabase Auth error, continuing with local persistence:', err);
      }
    }

    // 4. Create User Profile with Pending Status
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: emailLower,
      role: data.role,
      requestedRole: data.role,
      avatar: `https://images.unsplash.com/photo-${1535713875000 + Math.floor(Math.random() * 500)}?w=150&auto=format&fit=crop&q=80`,
      title:
        data.role === 'sales_rep'
          ? 'Enterprise Sales Representative'
          : data.role === 'sales_manager'
          ? 'Regional Sales Manager'
          : data.role === 'finance'
          ? 'Commercial Finance Officer'
          : 'Strategic Procurement Officer',
      department: data.companyName || (data.role === 'customer' ? 'Acme Industries' : 'Revenue Operations'),
      companyId: data.role === 'customer' ? 'comp-acme' : undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);

    // 5. Notify Admin of Pending Request
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'New Access Request',
      message: `${data.name} (${data.email}) requested ${data.role.replace('_', ' ')} access. Review required.`,
      timestamp: 'Just now',
      type: 'access_request',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    addCustomAuditLog(
      undefined,
      'System Auth',
      `User Sign Up: ${data.name} (${data.role.replace('_', ' ')}) - Status: Pending Approval`,
      { email: emailLower, requestedRole: data.role },
      { eventType: 'USER_SIGNED_UP', entityType: 'user', entityId: newUser.id }
    );

    return {
      success: true,
      message: 'Your access request has been submitted. An administrator must approve your account before you can enter DealFlow360.',
    };
  };

  // Admin User Lifecycle Actions
  const approveUser = (userId: string) => {
    if (!Permissions.canManageUsers(activeUser)) {
      alert('Unauthorized: Only administrators can approve user registrations.');
      return;
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const updated: UserProfile = {
          ...u,
          status: 'active',
          approvedBy: activeUser.id,
          approvedAt: new Date().toISOString(),
        };
        addCustomAuditLog(
          undefined,
          `Admin (${activeUser.name})`,
          `Approved Access Request for ${u.name}`,
          { role: u.role, email: u.email },
          { eventType: 'USER_APPROVED', entityType: 'user', entityId: u.id, previousState: 'pending', newState: 'active' }
        );
        return updated;
      })
    );
  };

  const rejectUser = (userId: string) => {
    if (!Permissions.canManageUsers(activeUser)) {
      alert('Unauthorized: Only administrators can reject access requests.');
      return;
    }

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const updated: UserProfile = { ...u, status: 'rejected' };
        addCustomAuditLog(
          undefined,
          `Admin (${activeUser.name})`,
          `Rejected Access Request for ${u.name}`,
          { email: u.email },
          { eventType: 'USER_REJECTED', entityType: 'user', entityId: u.id, previousState: u.status, newState: 'rejected' }
        );
        return updated;
      })
    );
  };

  const suspendUser = (userId: string) => {
    if (!Permissions.canManageUsers(activeUser)) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const updated: UserProfile = { ...u, status: 'suspended' };
        addCustomAuditLog(
          undefined,
          `Admin (${activeUser.name})`,
          `Suspended User Account: ${u.name}`,
          {},
          { eventType: 'USER_SUSPENDED', entityType: 'user', entityId: u.id, previousState: u.status, newState: 'suspended' }
        );
        return updated;
      })
    );
  };

  const reactivateUser = (userId: string) => {
    if (!Permissions.canManageUsers(activeUser)) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const updated: UserProfile = { ...u, status: 'active' };
        addCustomAuditLog(
          undefined,
          `Admin (${activeUser.name})`,
          `Reactivated User Account: ${u.name}`,
          {},
          { eventType: 'USER_REACTIVATED', entityType: 'user', entityId: u.id, previousState: u.status, newState: 'active' }
        );
        return updated;
      })
    );
  };

  const changeUserRole = (userId: string, newRole: UserRole) => {
    if (!Permissions.canManageUsers(activeUser)) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const updated: UserProfile = { ...u, role: newRole };
        addCustomAuditLog(
          undefined,
          `Admin (${activeUser.name})`,
          `Changed Role for ${u.name} from ${u.role} to ${newRole}`,
          {},
          { eventType: 'USER_ROLE_CHANGED', entityType: 'user', entityId: u.id, previousState: u.role, newState: newRole }
        );
        return updated;
      })
    );
  };

  // Role Switching & Demo Personas
  const loginAsRole = (role: UserRole) => {
    const matched = users.find((u) => u.role === role && u.status === 'active') || users.find((u) => u.role === role) || users[0];
    setUserRole(role);
    setActiveUser(matched);
    setCurrentRoute('app');
    setIsCustomerPortalPreview(false);

    // Contextual landing screen for role
    if (role === 'customer') {
      setActiveView('portal');
    } else if (role === 'admin') {
      setActiveView('admin_config');
    } else if (role === 'finance') {
      setActiveView('dashboard');
    } else {
      setActiveView('dashboard');
    }
  };

  const logout = () => {
    setCurrentRoute('landing');
    setIsCustomerPortalPreview(false);
  };

  // Operations: Create Quote (Guarded)
  const createNewQuote = (companyId: string): string => {
    if (!Permissions.canCreateQuote(activeUser)) {
      alert('Unauthorized: You do not have permission to initialize new quotations.');
      return '';
    }

    const company = companies.find((c) => c.id === companyId) || companies[0];
    const newId = `Q-${Math.floor(1043 + quotes.length)}`;
    const newQuote: Quote = {
      id: newId,
      companyId: company.id,
      companyName: company.name,
      tier: company.tierId,
      salesRep: activeUser.name,
      status: 'Draft',
      latestRevisionNumber: 1,
      revisions: [
        {
          revisionNumber: 1,
          createdAt: new Date().toISOString(),
          createdBy: activeUser.name,
          totalListAmount: 0,
          totalDiscountAmount: 0,
          totalNetAmount: 0,
          marginPercent: 0,
          riskScore: 0.5,
          riskLevel: 'LOW',
          lineDiscounts: {},
          revisionStatus: 'Draft',
          approvalStatus: 'Pending Manager',
          notes: 'Initial Draft Created',
        },
      ],
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
    };

    setQuotes((prev) => [newQuote, ...prev]);
    setSelectedQuoteId(newId);
    setActiveView('builder');
    addCustomAuditLog(newId, `Sales Rep (${activeUser.name})`, 'Draft Quote Created', { company: company.name }, { eventType: 'QUOTE_CREATED' });
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
        addCustomAuditLog(quoteId, `Sales Rep (${activeUser.name})`, `Added ${product.name}`, {
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
          addCustomAuditLog(quoteId, `Sales Rep (${activeUser.name})`, `Removed ${targetLine.productName}`);
        }
        broadcastSync('QUOTE_UPDATED', { quote: updatedQuote });
        return updatedQuote;
      })
    );
  };

  // Submit For Approval
  const submitForApproval = (quoteId: string) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;
        const evalResult = evaluateBlendedRisk(q.lines, q.tier, configPolicy);

        let nextStatus: Quote['status'] = 'Draft';
        let stage: Quote['approvalStage'] = 'None';
        let govStatus: QuoteRevision['approvalStatus'] = 'Pending Manager';

        if (evalResult.riskLevel === 'HIGH') {
          nextStatus = 'Pending Manager';
          stage = 'Sales Manager';
          govStatus = 'Pending Manager';
          addCustomAuditLog(
            quoteId,
            'System Governance',
            `HIGH Risk Flagged (Score ${evalResult.blendedScore}) - Two-Tier Approval Required: Manager (M. Shah) -> Finance (R. Iyer)`,
            { reasons: evalResult.riskBreakdown.reasons },
            { eventType: 'RISK_EVALUATED', previousState: 'Draft', newState: 'Pending Manager' }
          );
        } else if (evalResult.riskLevel === 'MEDIUM') {
          nextStatus = 'Pending Manager';
          stage = 'Sales Manager';
          govStatus = 'Pending Manager';
          addCustomAuditLog(
            quoteId,
            'System Governance',
            `MEDIUM Risk Flagged (Score ${evalResult.blendedScore}) - Routed to Sales Manager (M. Shah)`,
            {},
            { eventType: 'RISK_EVALUATED', previousState: 'Draft', newState: 'Pending Manager' }
          );
        } else {
          nextStatus = 'Fully Approved';
          stage = 'Fully Approved';
          govStatus = 'Fully Approved';
          addCustomAuditLog(quoteId, 'System Governance', 'Auto-Approved (Low Risk Deal Compliant with Ceilings)', {}, { eventType: 'AUTO_APPROVED', previousState: 'Draft', newState: 'Fully Approved' });
        }

        const updatedRevs = q.revisions.map((r) =>
          r.revisionNumber === q.latestRevisionNumber
            ? { ...r, approvalStatus: govStatus, revisionStatus: 'Active' as const }
            : r
        );

        const updatedQuote: Quote = {
          ...q,
          status: nextStatus,
          approvalStage: stage,
          blendedRiskScore: evalResult.blendedScore,
          riskLevel: evalResult.riskLevel,
          riskBreakdown: evalResult.riskBreakdown,
          revisions: updatedRevs,
        };
        broadcastSync('QUOTE_UPDATED', { quote: updatedQuote });
        return updatedQuote;
      })
    );
  };

  // Sales Manager Approval
  const managerApprove = (quoteId: string, comments = 'Commercial terms approved by Sales Manager.') => {
    if (!Permissions.canApproveManager(activeUser)) {
      alert('Unauthorized: You do not have permission to grant Sales Manager approval.');
      return;
    }

    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;

        // If HIGH risk, must forward to Finance
        if (q.riskLevel === 'HIGH') {
          addCustomAuditLog(quoteId, `Sales Manager (${activeUser.name})`, 'Approved & Forwarded to Finance', {
            comments,
            nextStage: 'Finance (R. Iyer)',
          }, { eventType: 'MANAGER_APPROVED', previousState: 'Pending Manager', newState: 'Pending Finance' });

          const updatedRevs = q.revisions.map((r) =>
            r.revisionNumber === q.latestRevisionNumber
              ? { ...r, approvalStatus: 'Pending Finance' as const }
              : r
          );

          const updated: Quote = {
            ...q,
            status: 'Pending Finance',
            approvalStage: 'Finance',
            approvalAssignedTo: 'R. Iyer (Finance)',
            revisions: updatedRevs,
          };
          broadcastSync('QUOTE_UPDATED', { quote: updated });
          return updated;
        }

        // If MEDIUM risk, Manager approval completes governance
        addCustomAuditLog(quoteId, `Sales Manager (${activeUser.name})`, 'Approved Quotation (Single-Tier Complete)', { comments }, { eventType: 'MANAGER_APPROVED', previousState: 'Pending Manager', newState: 'Fully Approved' });
        const updatedRevs = q.revisions.map((r) =>
          r.revisionNumber === q.latestRevisionNumber
            ? { ...r, approvalStatus: 'Fully Approved' as const, approvedBy: activeUser.name, approvedAt: new Date().toISOString() }
            : r
        );

        const updated: Quote = {
          ...q,
          status: 'Fully Approved',
          approvalStage: 'Fully Approved',
          approvalAssignedTo: 'Completed',
          revisions: updatedRevs,
        };
        broadcastSync('QUOTE_UPDATED', { quote: updated });
        return updated;
      })
    );
  };

  // Finance Approval
  const financeApprove = (quoteId: string, comments = 'Financial margins and credit exposure approved.') => {
    if (!Permissions.canApproveFinance(activeUser)) {
      alert('Unauthorized: You do not have permission to grant Finance approval.');
      return;
    }

    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;
        addCustomAuditLog(quoteId, `Finance (${activeUser.name})`, 'Approved High-Risk Deal (Final Commercial Release)', {
          comments,
        }, { eventType: 'FINANCE_APPROVED', previousState: 'Pending Finance', newState: 'Fully Approved' });

        const updatedRevs = q.revisions.map((r) =>
          r.revisionNumber === q.latestRevisionNumber
            ? { ...r, approvalStatus: 'Fully Approved' as const, approvedBy: activeUser.name, approvedAt: new Date().toISOString() }
            : r
        );

        const updated: Quote = {
          ...q,
          status: 'Fully Approved',
          approvalStage: 'Fully Approved',
          approvalAssignedTo: 'Completed',
          revisions: updatedRevs,
        };
        broadcastSync('QUOTE_UPDATED', { quote: updated });
        return updated;
      })
    );
  };

  const returnForRevision = (quoteId: string, comments: string) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;
        addCustomAuditLog(quoteId, activeUser.role === 'finance' ? `Finance (${activeUser.name})` : `Sales Manager (${activeUser.name})`, 'Returned for Revision', {
          reason: comments,
        }, { eventType: 'RETURNED_FOR_REVISION', previousState: q.status, newState: 'Draft' });
        const updated: Quote = {
          ...q,
          status: 'Draft',
          approvalStage: 'None',
        };
        broadcastSync('QUOTE_UPDATED', { quote: updated });
        return updated;
      })
    );
  };

  // Customer Portal Counter Offer (Spawns New Commercial Revision)
  const customerCounterOffer = (
    quoteId: string,
    notes: string,
    lineDiscounts: Record<string, number>,
    requestedDelivery?: string
  ): { success: boolean; message?: string } => {
    if (isCustomerPortalPreview) {
      return { success: false, message: 'Preview Mode: Counter-offer submission is disabled during administrative inspection.' };
    }

    const q = quotes.find((quote) => quote.id === quoteId);
    if (!q) return { success: false, message: 'Quotation not found.' };

    const newRevNumber = q.latestRevisionNumber + 1;

    // Apply requested discounts to quote lines
    const updatedLines = q.lines.map((l) => {
      const newDiscount = lineDiscounts[l.id] !== undefined ? lineDiscounts[l.id] : l.discountPercent;
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
        counterDiscountPercent: newDiscount,
        netAmount: metrics.netAmount,
        marginPercent: metrics.marginPercent,
        isOverLimit: metrics.isOverLimit,
        overLimitPoints: metrics.overLimitPoints,
      };
    });

    const recomputed = recomputeQuote({
      ...q,
      lines: updatedLines,
      customerCounterNotes: notes,
      customerRequestedDelivery: requestedDelivery,
    });

    // Determine approval routing for new revision
    let nextStage: Quote['approvalStage'] = 'None';
    let govStatus: QuoteRevision['approvalStatus'] = 'Pending Manager';

    if (recomputed.riskLevel === 'HIGH') {
      nextStage = 'Sales Manager';
      govStatus = 'Pending Manager';
    } else if (recomputed.riskLevel === 'MEDIUM') {
      nextStage = 'Sales Manager';
      govStatus = 'Pending Manager';
    } else {
      nextStage = 'Fully Approved';
      govStatus = 'Fully Approved';
    }

    // Mark previous revision as Superseded and append new revision
    const supersededRevisions = q.revisions.map((r) =>
      r.revisionNumber === q.latestRevisionNumber
        ? { ...r, revisionStatus: 'Superseded' as const }
        : r
    );

    const newRevision: QuoteRevision = {
      revisionNumber: newRevNumber,
      createdAt: new Date().toISOString(),
      createdBy: `Customer (${q.companyName})`,
      totalListAmount: recomputed.totalListAmount,
      totalDiscountAmount: recomputed.totalDiscountAmount,
      totalNetAmount: recomputed.totalNetAmount,
      marginPercent: recomputed.overallMarginPercent,
      riskScore: recomputed.blendedRiskScore,
      riskLevel: recomputed.riskLevel,
      lineDiscounts,
      revisionStatus: 'Under Negotiation',
      approvalStatus: govStatus,
      notes,
    };

    const updatedQuote: Quote = {
      ...recomputed,
      status: 'Under Negotiation',
      approvalStage: nextStage,
      latestRevisionNumber: newRevNumber,
      revisions: [...supersededRevisions, newRevision],
    };

    setQuotes((prev) => prev.map((item) => (item.id === quoteId ? updatedQuote : item)));

    addCustomAuditLog(
      quoteId,
      `Customer (${q.companyName})`,
      `Counter-Offer Submitted (Created Revision ${newRevNumber})`,
      {
        notes,
        requestedDelivery,
        newBlendedRisk: recomputed.blendedRiskScore,
        revisionsCount: updatedQuote.revisions.length,
      },
      { eventType: 'COUNTER_OFFER_SUBMITTED', previousState: q.status, newState: 'Under Negotiation' }
    );

    // Notify sales manager
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Customer Counter-Offer Received',
      message: `${q.companyName} submitted Revision ${newRevNumber} on ${q.id}. Risk recalculated to ${recomputed.blendedRiskScore}.`,
      timestamp: 'Just now',
      type: 'negotiation',
      read: false,
      quoteId,
    };
    setNotifications((prev) => [notif, ...prev]);

    broadcastSync('QUOTE_UPDATED', { quote: updatedQuote });
    return { success: true };
  };

  // Customer Accepts Quote (Strict 6-Point Guard)
  const customerAcceptQuote = (quoteId: string): { success: boolean; error?: string } => {
    const q = quotes.find((quote) => quote.id === quoteId);
    if (!q) return { success: false, error: 'Quotation not found.' };

    const validation = validateCustomerAcceptance(q, activeUser, isCustomerPortalPreview);
    if (!validation.allowed) {
      return { success: false, error: validation.error };
    }

    const updatedRevs = q.revisions.map((r) =>
      r.revisionNumber === q.latestRevisionNumber
        ? { ...r, revisionStatus: 'Active' as const, approvalStatus: 'Fully Approved' as const }
        : r
    );

    const updated: Quote = {
      ...q,
      status: 'Customer Accepted',
      revisions: updatedRevs,
    };

    setQuotes((prev) => prev.map((item) => (item.id === quoteId ? updated : item)));

    addCustomAuditLog(
      quoteId,
      `Customer (${q.companyName})`,
      `Accepted Terms on Revision ${q.latestRevisionNumber} & Confirmed Quotation`,
      { totalNet: `₹${q.totalNetAmount.toLocaleString('en-IN')}` },
      { eventType: 'TERMS_ACCEPTED', previousState: q.status, newState: 'Customer Accepted' }
    );

    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Deal Confirmed by Customer',
      message: `${q.companyName} accepted terms on ${q.id}. Queued for multi-warehouse fulfillment.`,
      timestamp: 'Just now',
      type: 'fulfillment',
      read: false,
      quoteId,
    };
    setNotifications((prev) => [notif, ...prev]);

    broadcastSync('QUOTE_UPDATED', { quote: updated });
    return { success: true };
  };

  // Option B: Fulfillment State Lock (Admin Only Executable)
  const acceptFulfillment = (quoteId: string): { success: boolean; message?: string } => {
    const q = quotes.find((quote) => quote.id === quoteId);
    if (!q) return { success: false, message: 'Deal not found.' };

    if (!Permissions.canAcceptFulfillment(activeUser)) {
      return {
        success: false,
        message: 'Unauthorized: Warehouse allocation release is restricted to Platform Administrators.',
      };
    }

    if (q.status === 'Allocated' || q.status === 'Invoiced' || q.status === 'Paid') {
      return {
        success: false,
        message: 'Allocation has already been confirmed for this deal.',
      };
    }

    const fulfillmentPlan = generateOptimalFulfillment(quoteId, q.lines, warehouses, inventory);
    const { invoice, subscriptions: newSubs } = generateHybridBilling(q);

    // Deduct allocated inventory
    setInventory((prevInv) =>
      prevInv.map((invItem) => {
        const alloc = fulfillmentPlan.allocations.find(
          (a) => a.productId === invItem.productId && a.warehouseId === invItem.warehouseId
        );
        if (alloc) {
          return {
            ...invItem,
            quantityOnHand: Math.max(0, invItem.quantityOnHand - alloc.allocatedQty),
          };
        }
        return invItem;
      })
    );

    setInvoices((invs) => [invoice, ...invs]);
    setSubscriptions((subs) => [...newSubs, ...subs]);

    const updatedQuote: Quote = {
      ...q,
      status: 'Invoiced',
      allocatedAt: new Date().toISOString(),
      invoicedAt: new Date().toISOString(),
    };

    setQuotes((prev) => prev.map((item) => (item.id === quoteId ? updatedQuote : item)));

    addCustomAuditLog(
      quoteId,
      `Admin (${activeUser.name})`,
      'Confirmed Warehouse Allocation Split & Generated Invoice',
      {
        shipments: fulfillmentPlan.totalShipments,
        freightCost: `₹${fulfillmentPlan.totalFreightCost.toLocaleString('en-IN')}`,
        invoiceId: invoice.id,
      },
      { eventType: 'ALLOCATION_CONFIRMED', previousState: q.status, newState: 'Invoiced' }
    );

    broadcastSync('QUOTE_UPDATED', { quote: updatedQuote });
    return { success: true, message: `Allocation confirmed! Invoice ${invoice.id} generated.` };
  };

  // Record Payment
  const recordPayment = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const updated = {
          ...inv,
          status: 'Paid' as const,
          paidAt: new Date().toISOString(),
        };

        // Update corresponding quote status to Paid
        setQuotes((prevQuotes) =>
          prevQuotes.map((q) => (q.id === inv.quoteId ? { ...q, status: 'Paid', paidAt: new Date().toISOString() } : q))
        );

        addCustomAuditLog(inv.quoteId, `Finance (${activeUser.name})`, `Settled Payment for ${inv.id}`, {
          amount: `₹${inv.totalAmount.toLocaleString('en-IN')}`,
        }, { eventType: 'PAYMENT_RECORDED', entityType: 'invoice', entityId: inv.id, previousState: 'Sent', newState: 'Paid' });

        return updated;
      })
    );
  };

  // Resolve Anomaly
  const resolveAnomaly = (anomalyId: string, actionTaken: string) => {
    setAnomalies((prev) =>
      prev.map((a) => {
        if (a.id !== anomalyId) return a;
        addCustomAuditLog(a.quoteId, `Sales Operations (${activeUser.name})`, `Resolved Anomaly: ${a.anomalyType}`, {
          actionTaken,
        }, { eventType: 'ANOMALY_RESOLVED' });
        return { ...a, isResolved: true };
      })
    );
  };

  // Policy Versioning & Update
  const updatePolicy = (updates: Partial<ConfigPolicy>) => {
    if (!Permissions.canModifyPolicies(activeUser)) {
      alert('Unauthorized: Only administrators can modify governance policies.');
      return;
    }

    const nextVersion = configPolicy.policyVersion + 1;
    const newPolicy: ConfigPolicy = {
      ...configPolicy,
      ...updates,
      policyVersion: nextVersion,
      lastModifiedBy: activeUser.name,
      lastModifiedAt: new Date().toISOString(),
    };

    setConfigPolicy(newPolicy);

    // Re-evaluate all draft quotations against new policy
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.status === 'Draft') {
          return recomputeQuote(q);
        }
        return q;
      })
    );

    addCustomAuditLog(
      undefined,
      `Admin (${activeUser.name})`,
      `Updated Governance Policy to Version ${nextVersion}`,
      { changes: updates },
      { eventType: 'POLICY_UPDATED', entityType: 'policy', previousState: `v${configPolicy.policyVersion}`, newState: `v${nextVersion}` }
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const resetToSeedData = () => {
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
    setNotifications(SEED_NOTIFICATIONS);
    setSelectedQuoteId('Q-1042');
    setUsers(SEED_USERS);
    setIsCustomerPortalPreview(false);
  };

  return (
    <AppContext.Provider
      value={{
        currentRoute,
        setCurrentRoute,
        userRole,
        setUserRole,
        activeUser,
        users,
        loginAsRole,
        logout,
        activeView,
        setActiveView,
        selectedQuoteId,
        setSelectedQuoteId,
        customerPortalToken,
        setCustomerPortalToken,
        isCustomerPortalPreview,
        setIsCustomerPortalPreview,
        signUpUser,
        approveUser,
        rejectUser,
        suspendUser,
        reactivateUser,
        changeUserRole,
        notifications,
        unreadNotificationCount,
        markNotificationRead,
        clearNotifications,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
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
        activeQuote,
        createNewQuote,
        updateQuoteLine,
        addLineToQuote,
        removeLineFromQuote,
        submitForApproval,
        managerApprove,
        financeApprove,
        returnForRevision,
        customerCounterOffer,
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
