export type UserRole = 'sales_rep' | 'sales_manager' | 'finance' | 'customer' | 'admin';

export type CustomerTierType = 'Bronze' | 'Silver' | 'Gold';

export interface CustomerTier {
  id: string;
  name: CustomerTierType;
  defaultDiscountLimit: number; // e.g. 5, 10, 15
  paymentTerms: string;
}

export interface Company {
  id: string;
  name: string;
  tierId: CustomerTierType;
  industry: string;
  creditLimit: number;
  contactEmail: string;
  portalToken: string;
  historicalCloseRate?: number;
  historicalAvgDiscount?: number;
}

export type ProductCategoryType = 'hardware' | 'services' | 'subscription';

export interface ProductCategory {
  id: ProductCategoryType;
  name: string;
  defaultDiscountCeiling: number; // e.g. 15, 10, 12
  targetMargin: number; // e.g. 40, 25, 65
}

export interface Product {
  id: string;
  name: string;
  categoryId: ProductCategoryType;
  listPrice: number; // In INR (₹)
  costPrice: number;
  isRecurring: boolean;
  billingPeriod?: 'monthly' | 'quarterly' | 'yearly';
  sku: string;
  description: string;
  suggestedUpsells?: {
    productId: string;
    reason: string;
    expectedMarginImpact: number;
    discountPromo?: number;
  }[];
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  shippingCostBase: number;
  weightMultiplier: number;
}

export interface WarehouseInventory {
  id: string;
  warehouseId: string;
  productId: string;
  quantityOnHand: number;
  quantityReserved: number;
}

export type UserAccountStatus = 'pending' | 'active' | 'rejected' | 'suspended';

export type RevisionLifecycleStatus =
  | 'Draft'
  | 'Under Negotiation'
  | 'Active'
  | 'Superseded';

export type GovernanceApprovalStatus =
  | 'Pending Manager'
  | 'Pending Finance'
  | 'Fully Approved'
  | 'Rejected';

export type DealWorkflowStatus =
  | 'Draft'
  | 'Submitted'
  | 'Pending Manager'
  | 'Pending Finance'
  | 'Fully Approved'
  | 'Under Negotiation'
  | 'Customer Accepted'
  | 'Fulfillment'
  | 'Allocated'
  | 'Invoiced'
  | 'Paid'
  | 'Rejected'
  | 'Superseded';

export type QuoteStatus = DealWorkflowStatus;

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface QuoteLine {
  id: string;
  quoteId: string;
  productId: string;
  productName: string;
  category: ProductCategoryType;
  quantity: number;
  unitListPrice: number;
  unitCostPrice: number;
  discountPercent: number;
  discountCeiling: number;
  isOverLimit: boolean;
  overLimitPoints: number;
  netAmount: number;
  marginPercent: number;
  isRecurring: boolean;
  billingPeriod?: 'monthly' | 'quarterly' | 'yearly';
  customerComment?: string;
  counterDiscountPercent?: number;
}

export interface RiskBreakdown {
  serviceDeviationPts: number;
  marginErosionPts: number;
  tierRiskPts: number;
  totalScore: number;
  reasons: string[];
}

export interface QuoteRevision {
  revisionNumber: number;
  createdAt: string;
  createdBy: string;
  totalListAmount: number;
  totalDiscountAmount: number;
  totalNetAmount: number;
  marginPercent: number;
  riskScore: number;
  riskLevel: RiskLevel;
  lineDiscounts: Record<string, number>;
  revisionStatus: RevisionLifecycleStatus;
  approvalStatus: GovernanceApprovalStatus;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Quote {
  id: string; // Q-1042, etc.
  companyId: string;
  companyName: string;
  tier: CustomerTierType;
  salesRep: string;
  status: QuoteStatus;
  latestRevisionNumber: number;
  revisions: QuoteRevision[];
  blendedRiskScore: number;
  riskLevel: RiskLevel;
  riskBreakdown: RiskBreakdown;
  totalListAmount: number;
  totalDiscountAmount: number;
  totalNetAmount: number;
  overallMarginPercent: number;
  approvalStage: 'None' | 'Sales Manager' | 'Finance' | 'Fully Approved';
  approvalAssignedTo: string;
  dealConfidence: number; // Deal Close Confidence %
  portalToken: string;
  lines: QuoteLine[];
  createdAt: string;
  updatedAt: string;
  customerCounterNotes?: string;
  customerRequestedDelivery?: string;
  allocatedAt?: string;
  invoicedAt?: string;
  paidAt?: string;
}

export interface ApprovalRecord {
  id: string;
  quoteId: string;
  stage: 'Sales Manager' | 'Finance';
  assignedTo: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Returned';
  comments?: string;
  riskSnapshot: {
    riskScore: number;
    riskLevel: RiskLevel;
    marginPercent: number;
    totalDiscount: number;
  };
  decidedAt?: string;
  actor?: string;
}

export interface WarehouseAllocation {
  id: string;
  quoteId: string;
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  allocatedQty: number;
  isBackorder: boolean;
  estimatedFreight: number;
}

export interface Subscription {
  id: string;
  quoteId: string;
  companyId: string;
  companyName: string;
  productId: string;
  productName: string;
  billingFrequency: 'monthly' | 'quarterly' | 'yearly';
  amountPerPeriod: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  status: 'Active' | 'Paused' | 'Cancelled';
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  type: 'One-Time Goods' | 'Recurring Subscription' | 'Prorated Fee';
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string; // INV-5011
  quoteId: string;
  companyId: string;
  companyName: string;
  invoiceType: 'One-Time Goods' | 'Recurring Subscription' | 'Hybrid';
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  dueDate: string;
  paidAt?: string;
  lines: InvoiceLineItem[];
}

export type AnomalyType = 'Stalled Deal' | 'Discount Spike' | 'Delivery Slippage';
export type AnomalySeverity = 'Critical' | 'At Risk' | 'Warning';

export interface DealAnomaly {
  id: string;
  quoteId: string;
  companyName: string;
  anomalyType: AnomalyType;
  severity: AnomalySeverity;
  description: string;
  recommendedAction: string;
  isResolved: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  quoteId?: string;
  actor: string; // e.g., 'Sales Rep (P. Mehta)', 'Customer (Acme)', 'Manager (M. Shah)', 'Finance (R. Iyer)'
  actorId?: string;
  actorRole?: UserRole;
  eventType?: string;
  entityType?: 'quote' | 'user' | 'policy' | 'invoice' | 'fulfillment';
  entityId?: string;
  action: string;
  details?: Record<string, any>;
  previousState?: string;
  newState?: string;
  createdAt: string;
  timestamp?: string;
}

export interface ConfigPolicy {
  policyVersion: number;
  tierCeilings: Record<CustomerTierType, number>;
  categoryCeilings: Record<ProductCategoryType, number>;
  approvalThresholds: {
    lowRiskMax: number;
    mediumRiskMax: number;
    singleLineOverageMax: number;
  };
  warehouseFreightWeights: Record<string, { base: number; perUnit: number }>;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
  department: string;
  status: UserAccountStatus;
  requestedRole?: UserRole;
  companyId?: string;
  createdAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  lastActive?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'approval' | 'negotiation' | 'fulfillment' | 'billing' | 'anomaly' | 'access_request';
  read: boolean;
  quoteId?: string;
}

