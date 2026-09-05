import { UserProfile, UserRole, Quote } from '../types';

export const Permissions = {
  canCreateQuote: (user: UserProfile): boolean => {
    return user.status === 'active' && (user.role === 'sales_rep' || user.role === 'sales_manager');
  },

  canApproveManager: (user: UserProfile): boolean => {
    return user.status === 'active' && (user.role === 'sales_manager' || user.role === 'admin');
  },

  canApproveFinance: (user: UserProfile): boolean => {
    return user.status === 'active' && (user.role === 'finance' || user.role === 'admin');
  },

  // Option B: Admin is the designated operational executor for the hackathon demonstration
  canAcceptFulfillment: (user: UserProfile): boolean => {
    return user.status === 'active' && user.role === 'admin';
  },

  canAccessBilling: (user: UserProfile): boolean => {
    return user.status === 'active' && (user.role === 'finance' || user.role === 'admin');
  },

  canManageUsers: (user: UserProfile): boolean => {
    return user.status === 'active' && user.role === 'admin';
  },

  canModifyPolicies: (user: UserProfile): boolean => {
    return user.status === 'active' && user.role === 'admin';
  },

  canAccessCustomerPortal: (user: UserProfile): boolean => {
    return user.status === 'active' && (user.role === 'customer' || user.role === 'admin');
  },

  canCounterOffer: (user: UserProfile, isPreview = false): boolean => {
    if (isPreview) return false;
    return user.status === 'active' && user.role === 'customer';
  },

  canAcceptTerms: (user: UserProfile, isPreview = false): boolean => {
    if (isPreview) return false;
    return user.status === 'active' && user.role === 'customer';
  },
};

/**
 * Strict 6-point pre-flight validation for customer quotation acceptance
 */
export function validateCustomerAcceptance(
  quote: Quote,
  user: UserProfile,
  isPreview = false
): { allowed: boolean; error?: string } {
  // 1. Check preview mode
  if (isPreview) {
    return {
      allowed: false,
      error: 'Preview Mode Active: Customer portal actions are disabled during administrative inspection.',
    };
  }

  // 2. Authenticated active user check
  if (user.status !== 'active') {
    return {
      allowed: false,
      error: 'Account Inactive: Your account is pending review or suspended.',
    };
  }

  if (user.role !== 'customer') {
    return {
      allowed: false,
      error: 'Unauthorized: Only authorized customer procurement users can accept terms.',
    };
  }

  // 3. Customer Company Matching Check
  if (user.companyId && quote.companyId && user.companyId !== quote.companyId) {
    return {
      allowed: false,
      error: 'Access Denied: You are not authorized to accept quotations for this company.',
    };
  }

  // 4. Latest Revision Check
  const latestRev = quote.revisions?.find(
    (r) => r.revisionNumber === quote.latestRevisionNumber
  );
  if (!latestRev) {
    return {
      allowed: false,
      error: 'Quotation Revision Error: Unable to resolve latest revision for this deal.',
    };
  }

  // 5. Revision not superseded & Fully Approved check
  if (latestRev.revisionStatus === 'Superseded') {
    return {
      allowed: false,
      error: 'Outdated Revision: This quotation has been superseded by a subsequent revision.',
    };
  }

  if (latestRev.approvalStatus !== 'Fully Approved') {
    return {
      allowed: false,
      error: `Commercial Governance Incomplete: This quotation revision requires ${latestRev.approvalStatus} before acceptance.`,
    };
  }

  // 6. Not already accepted
  if (
    quote.status === 'Customer Accepted' ||
    quote.status === 'Fulfillment' ||
    quote.status === 'Allocated' ||
    quote.status === 'Invoiced' ||
    quote.status === 'Paid'
  ) {
    return {
      allowed: false,
      error: 'Already Confirmed: Quotation terms have already been accepted and queued for fulfillment.',
    };
  }

  return { allowed: true };
}

/**
 * Validates whether a specific view is allowed for a user role
 */
export function isViewAllowedForRole(view: string, role: UserRole): boolean {
  switch (role) {
    case 'sales_rep':
      return ['dashboard', 'pipeline', 'builder', 'deal_health'].includes(view);
    case 'sales_manager':
      return ['dashboard', 'pipeline', 'approvals', 'deal_health'].includes(view);
    case 'finance':
      return ['dashboard', 'approvals', 'billing', 'deal_health'].includes(view);
    case 'customer':
      return view === 'portal';
    case 'admin':
      return ['dashboard', 'admin_config', 'pipeline', 'deal_health', 'fulfillment', 'approvals', 'billing'].includes(view);
    default:
      return false;
  }
}
