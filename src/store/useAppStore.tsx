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
  WarehouseAllocation,
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

interface AppContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  selectedQuoteId: string | null;
  setSelectedQuoteId: (id: string | null) => void;
  customerPortalToken: string | null;
  setCustomerPortalToken: (token: string | null) => void;

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
  ) => void;
  customerAcceptQuote: (quoteId: string) => void;
  acceptFulfillment: (quoteId: string) => void;
  recordPayment: (invoiceId: string) => void;
  resolveAnomaly: (anomalyId: string, actionTaken: string) => void;
  updatePolicy: (updates: Partial<ConfigPolicy>) => void;
  addCustomAuditLog: (quoteId: string, actor: string, action: string, details?: any) => void;
  resetToSeedData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('sales_rep');
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>('Q-1042');
  const [customerPortalToken, setCustomerPortalToken] = useState<string | null>('token_acme');

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
    localStorage.setItem(
      'dealflow_sync_event',
      JSON.stringify({ type, timestamp: Date.now(), ...data })
    );
  };

  const addCustomAuditLog = (quoteId: string, actor: string, action: string, details?: any) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      quoteId,
      actor,
      action,
      details,
      createdAt: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
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
      salesRep: 'P. Mehta',
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
    };

    setQuotes((prev) => [newQuote, ...prev]);
    setSelectedQuoteId(newId);
    setActiveView('builder');
    addCustomAuditLog(newId, 'Sales Rep (P. Mehta)', 'Draft Quote Created', { company: company.name });
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
        addCustomAuditLog(quoteId, 'Sales Rep (P. Mehta)', `Added ${product.name}`, {
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
          addCustomAuditLog(quoteId, 'Sales Rep (P. Mehta)', `Removed ${targetLine.productName}`);
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

        if (evalResult.riskLevel === 'HIGH') {
          nextStatus = 'Pending Manager';
          stage = 'Sales Manager';
          addCustomAuditLog(
            quoteId,
            'System Governance',
            `HIGH Risk Triggered (Score ${evalResult.blendedScore}) - Routed to Sales Manager (M. Shah)`,
            { reasons: evalResult.riskBreakdown.reasons }
          );
        } else if (evalResult.riskLevel === 'MEDIUM') {
          nextStatus = 'Pending Manager';
          stage = 'Sales Manager';
          addCustomAuditLog(
            quoteId,
            'System Governance',
            `MEDIUM Risk Triggered (Score ${evalResult.blendedScore}) - Routed to Sales Manager (M. Shah)`
          );
        } else {
          nextStatus = 'Fully Approved';
          stage = 'Fully Approved';
          addCustomAuditLog(quoteId, 'System Governance', 'Auto-Approved (Low Risk Deal)');
        }

        const updatedQuote: Quote = {
          ...q,
          status: nextStatus,
          approvalStage: stage,
          blendedRiskScore: evalResult.blendedScore,
          riskLevel: evalResult.riskLevel,
          riskBreakdown: evalResult.riskBreakdown,
        };
        broadcastSync('QUOTE_UPDATED', { quote: updatedQuote });
        return updatedQuote;
      })
    );
  };

  // Sales Manager Approval
  const managerApprove = (quoteId: string, comments = 'Commercial terms approved by Sales Manager.') => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;

        // If HIGH risk, must forward to Finance
        if (q.riskLevel === 'HIGH') {
          addCustomAuditLog(quoteId, 'Sales Manager (M. Shah)', 'Approved & Forwarded to Finance', {
            comments,
            nextStage: 'Finance (R. Iyer)',
          });
          const updated: Quote = {
            ...q,
            status: 'Pending Finance',
            approvalStage: 'Finance',
            approvalAssignedTo: 'R. Iyer (Finance)',
          };
          broadcastSync('QUOTE_UPDATED', { quote: updated });
          return updated;
        }

        // If MEDIUM risk, Manager approval completes it
        addCustomAuditLog(quoteId, 'Sales Manager (M. Shah)', 'Approved Quotation', { comments });
        const updated: Quote = {
          ...q,
          status: 'Fully Approved',
          approvalStage: 'Fully Approved',
          approvalAssignedTo: 'Completed',
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
        addCustomAuditLog(quoteId, 'Finance (R. Iyer)', 'Approved High-Risk Deal (Final Approval)', {
          comments,
        });
        const updated: Quote = {
          ...q,
          status: 'Fully Approved',
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
        addCustomAuditLog(quoteId, userRole === 'finance' ? 'Finance (R. Iyer)' : 'Sales Manager (M. Shah)', 'Returned for Revision', {
          reason: comments,
        });
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

  // Customer Portal Counter Offer
  const customerCounterOffer = (
    quoteId: string,
    notes: string,
    lineDiscounts: Record<string, number>,
    requestedDelivery?: string
  ) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;

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

        // Trigger re-approval flow automatically
        let nextStatus: Quote['status'] = 'Under Negotiation';
        let nextStage: Quote['approvalStage'] = 'None';

        if (recomputed.riskLevel === 'HIGH') {
          nextStatus = 'Under Negotiation';
          nextStage = 'Sales Manager';
        } else if (recomputed.riskLevel === 'MEDIUM') {
          nextStatus = 'Under Negotiation';
          nextStage = 'Sales Manager';
        } else {
          nextStatus = 'Under Negotiation';
          nextStage = 'Fully Approved';
        }

        const updatedQuote: Quote = {
          ...recomputed,
          status: nextStatus,
          approvalStage: nextStage,
        };

        addCustomAuditLog(
          quoteId,
          `Customer (${q.companyName})`,
          'Counter-Offer Submitted via Portal',
          {
            notes,
            requestedDelivery,
            newBlendedRisk: recomputed.blendedRiskScore,
            statusChange: 'Re-routed for Approval Governance',
          }
        );

        broadcastSync('QUOTE_UPDATED', { quote: updatedQuote });
        return updatedQuote;
      })
    );
  };

  // Customer Accepts Quote
  const customerAcceptQuote = (quoteId: string) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;
        const updated: Quote = {
          ...q,
          status: 'Fulfillment',
        };
        addCustomAuditLog(quoteId, `Customer (${q.companyName})`, 'Accepted Terms & Confirmed Quotation via Portal');
        broadcastSync('QUOTE_UPDATED', { quote: updated });
        return updated;
      })
    );
  };

  // Accept Fulfillment Split & Auto-generate Hybrid Invoice
  const acceptFulfillment = (quoteId: string) => {
    setQuotes((prev) =>
      prev.map((q) => {
        if (q.id !== quoteId) return q;

        const fulfillmentPlan = generateOptimalFulfillment(quoteId, q.lines, warehouses, inventory);
        const { invoice, subscriptions: newSubs } = generateHybridBilling(q);

        setInvoices((invs) => [invoice, ...invs]);
        setSubscriptions((subs) => [...newSubs, ...subs]);

        addCustomAuditLog(quoteId, 'Operations Fulfillment Engine', 'Fulfillment Allocation Accepted', {
          shipments: fulfillmentPlan.totalShipments,
          freightCost: `₹${fulfillmentPlan.totalFreightCost.toLocaleString('en-IN')}`,
          invoiceGenerated: invoice.id,
        });

        const updated: Quote = {
          ...q,
          status: 'Invoiced',
        };
        broadcastSync('QUOTE_UPDATED', { quote: updated });
        return updated;
      })
    );
  };

  // Record Invoice Payment
  const recordPayment = (invoiceId: string) => {
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

        addCustomAuditLog(inv.quoteId, 'Finance (R. Iyer)', `Payment Verified & Settled (₹${inv.totalAmount.toLocaleString('en-IN')})`);
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
      // Recompute active quotes with new policy
      setQuotes((qList) => qList.map((q) => recomputeQuote(q, nextPolicy)));
      return nextPolicy;
    });
  };

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
    setSelectedQuoteId('Q-1042');
  };

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        activeView,
        setActiveView,
        selectedQuoteId,
        setSelectedQuoteId,
        customerPortalToken,
        setCustomerPortalToken,
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
