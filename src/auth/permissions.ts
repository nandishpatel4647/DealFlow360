import { UserRole } from '../types';

export type Permission =
  | 'dashboard.view'
  | 'pipeline.view'
  | 'quotations.view'
  | 'quotation.create'
  | 'quotation.edit'
  | 'quotation.submit'
  | 'messages.view'
  | 'approvals.view'
  | 'approvals.manager'
  | 'approvals.finance'
  | 'fulfillment.view'
  | 'fulfillment.manage'
  | 'billing.view'
  | 'billing.manage'
  | 'customer_portal.access'
  | 'deal_health.view'
  | 'reports.view'
  | 'admin.configure'
  | 'products.view'
  | 'products.manage'
  | 'users.manage';

// Role to permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  sales_rep: [
    'dashboard.view',
    'pipeline.view',
    'quotations.view',
    'quotation.create',
    'quotation.edit',
    'quotation.submit',
    'messages.view',
    'products.view',
    'deal_health.view',
    'reports.view',
  ],
  sales_manager: [
    'dashboard.view',
    'pipeline.view',
    'quotations.view',
    'messages.view',
    'approvals.view',
    'approvals.manager',
    'deal_health.view',
    'reports.view',
  ],
  finance: [
    'dashboard.view',
    'quotations.view',
    'approvals.view',
    'approvals.finance',
    'billing.view',
    'billing.manage',
    'reports.view',
  ],
  customer: [
    'customer_portal.access',
  ],
  admin: [
    'dashboard.view',
    'pipeline.view',
    'quotations.view',
    'quotation.create',
    'quotation.edit',
    'quotation.submit',
    'messages.view',
    'approvals.view',
    'approvals.manager',
    'approvals.finance',
    'fulfillment.view',
    'fulfillment.manage',
    'billing.view',
    'billing.manage',
    'customer_portal.access',
    'deal_health.view',
    'reports.view',
    'admin.configure',
    'products.view',
    'products.manage',
    'users.manage',
  ],
};

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}

export function getDefaultViewForRole(role: UserRole): string {
  switch (role) {
    case 'customer':
      return 'portal';
    case 'sales_rep':
    case 'sales_manager':
    case 'finance':
    case 'admin':
    default:
      return 'dashboard';
  }
}
