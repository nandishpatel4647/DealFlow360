import { UserRole } from '../types';

export interface DemoUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  companyId?: string;
  portalToken?: string;
  title: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    email: 'sales@dealflow360.com',
    password: 'demo123',
    name: 'P. Mehta',
    role: 'sales_rep',
    title: 'Sales Representative',
  },
  {
    email: 'manager@dealflow360.com',
    password: 'demo123',
    name: 'M. Shah',
    role: 'sales_manager',
    title: 'Sales Manager',
  },
  {
    email: 'finance@dealflow360.com',
    password: 'demo123',
    name: 'R. Iyer',
    role: 'finance',
    title: 'Finance & Operations Lead',
  },
  {
    email: 'customer@dealflow360.com',
    password: 'demo123',
    name: 'Acme Procurement',
    role: 'customer',
    companyId: 'comp-acme',
    portalToken: 'token_acme',
    title: 'Customer Client Account (Acme Corp)',
  },
  {
    email: 'admin@dealflow360.com',
    password: 'admin123',
    name: 'System Admin',
    role: 'admin',
    title: 'System Administrator',
  },
];

export function findDemoUser(email: string): DemoUser | undefined {
  const normalized = email.trim().toLowerCase();
  
  // Exact match first
  const exact = DEMO_USERS.find((u) => u.email.toLowerCase() === normalized);
  if (exact) return exact;

  // Pattern matching fallbacks for legacy/alternative emails
  if (normalized.includes('rep') || normalized.includes('mehta') || normalized.includes('sales')) {
    return DEMO_USERS[0];
  }
  if (normalized.includes('manager') || normalized.includes('shah')) {
    return DEMO_USERS[1];
  }
  if (normalized.includes('finance') || normalized.includes('iyer') || normalized.includes('fulfillment') || normalized.includes('ops') || normalized.includes('stock') || normalized.includes('kumar')) {
    return DEMO_USERS[2];
  }
  if (normalized.includes('customer') || normalized.includes('acme') || normalized.includes('client')) {
    return DEMO_USERS[3];
  }
  if (normalized.includes('admin')) {
    return DEMO_USERS[4];
  }

  return undefined;
}
