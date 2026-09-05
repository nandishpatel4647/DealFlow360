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

export interface ProductVariant {
  id?: string;
  attribute: string;
  values: string;
  extraPrice: string;
}

export interface ProductPricelist {
  id?: string;
  tier: string;
  currency: string;
  priceRule: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: ProductCategoryType;
  listPrice: number; // In INR (₹) or USD
  costPrice: number;
  isRecurring: boolean;
  billingPeriod?: 'monthly' | 'quarterly' | 'yearly';
  sku: string;
  description: string;
  unit?: string;
  taxPercent?: number;
  status?: 'Active' | 'Archived';
  quantityOnHand?: number;
  variants?: ProductVariant[];
  pricelists?: ProductPricelist[];
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

export type QuoteStatus =
  | 'Draft'
  | 'Pending Manager'
  | 'Manager Approved'
  | 'Pending Customer'
  | 'Customer Revision Requested'
  | 'Customer Approved'
  | 'Pending Finance'
  | 'Finance Approved'
  | 'Fully Approved'
  | 'Under Negotiation'
  | 'Returned for Revision'
  | 'Confirmed'
  | 'Fulfillment'
  | 'Invoiced'
  | 'Paid'
  | 'Rejected'
  | 'Rejected by Sales Manager'
  | 'Rejected by Finance';

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

export interface DeliveryAddress {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CustomerRevisionRequestLine {
  lineId: string;
  productId: string;
  productName: string;
  originalDiscountPercent: number;
  requestedDiscountPercent: number;
  unitListPrice: number;
  comment?: string;
}

export interface CustomerRevisionRequest {
  requestedAt: string;
  message: string;
  requestedDeliveryDate?: string;
  lineRequests: CustomerRevisionRequestLine[];
}

export interface QuoteRevisionVersion {
  version: number;
  updatedBy: string;
  timestamp: string;
  promisedDeliveryDate?: string;
  requestedDeliveryDate?: string;
  discountSummary: string;
  status: QuoteStatus;
  notes?: string;
}

export interface Shipment {
  id: string; // SHP-1001
  quoteId: string;
  warehouseId: string;
  warehouseName: string;
  carrier?: string;
  trackingNumber?: string;
  status: 'Created' | 'In Transit' | 'Delivered';
  items: { productId: string; productName: string; quantity: number }[];
  createdAt: string;
}

export type FulfillmentStage =
  | 'Not Ready'
  | 'Ready for Fulfillment'
  | 'Warehouse Allocated'
  | 'Stock Reserved'
  | 'Shipment Created'
  | 'Partially Shipped'
  | 'Shipped'
  | 'Delivered';

export interface Quote {
  id: string; // Q-1042, etc.
  companyId: string;
  companyName: string;
  tier: CustomerTierType;
  salesRep: string;
  status: QuoteStatus;
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
  
  // Delivery & Location Fields
  promisedDeliveryDate: string; // e.g. '2026-10-15'
  requestedDeliveryDate?: string; // e.g. '2026-10-20'
  deliveryAddress: DeliveryAddress;
  
  // Customer Revision & History
  customerRevisionRequest?: CustomerRevisionRequest;
  revisionHistory: QuoteRevisionVersion[];
  
  // Fulfillment Tracking
  fulfillmentStage?: FulfillmentStage;
  fulfillmentBlockReason?: string;
  shipments?: Shipment[];
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
  actionTaken?: string;
  isResolved: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  quoteId: string;
  actor: string; // e.g., 'Sales Rep (P. Mehta)', 'Customer (Acme)', 'Manager (M. Shah)', 'Finance (R. Iyer)'
  action: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface ConfigPolicy {
  tierCeilings: Record<CustomerTierType, number>;
  categoryCeilings: Record<ProductCategoryType, number>;
  approvalThresholds: {
    lowRiskMax: number;
    mediumRiskMax: number;
    singleLineOverageMax: number;
  };
  warehouseFreightWeights: Record<string, { base: number; perUnit: number }>;
}

export interface ChatMessage {
  id: string;
  quoteId: string;
  sender: 'customer' | 'rep' | 'manager' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
}
