import { UserRole } from '../types';

export interface DemoUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  companyId?: string;
  portalToken?: string;
  title: string;
  avatarUrl?: string;
}

export const ROLE_DEFAULT_AVATARS: Record<UserRole, string> = {
  sales_rep: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  sales_manager: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  finance: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  customer: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  admin: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
};

export const PRESET_AVATARS = [
  { id: 'av-1', name: 'P. Mehta (Executive)', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', role: 'sales_rep' },
  { id: 'av-2', name: 'M. Shah (Manager)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', role: 'sales_manager' },
  { id: 'av-3', name: 'R. Iyer (Finance Lead)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', role: 'finance' },
  { id: 'av-4', name: 'Acme Buyer (Client)', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80', role: 'customer' },
  { id: 'av-5', name: 'Alex Vance (Tech Admin)', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', role: 'admin' },
  { id: 'av-6', name: 'Sarah Chen (VP Commercial)', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', role: 'sales_rep' },
  { id: 'av-7', name: 'David Miller (Risk & Audit)', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', role: 'finance' },
  { id: 'av-8', name: 'Elena Rostova (Fulfillment)', url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80', role: 'sales_manager' },
];

export const DEMO_USERS: DemoUser[] = [
  {
    email: 'sales@dealflow360.com',
    password: 'demo123',
    name: 'P. Mehta',
    role: 'sales_rep',
    title: 'Sales Representative',
    avatarUrl: ROLE_DEFAULT_AVATARS.sales_rep,
  },
  {
    email: 'manager@dealflow360.com',
    password: 'demo123',
    name: 'M. Shah',
    role: 'sales_manager',
    title: 'Sales Manager',
    avatarUrl: ROLE_DEFAULT_AVATARS.sales_manager,
  },
  {
    email: 'finance@dealflow360.com',
    password: 'demo123',
    name: 'R. Iyer',
    role: 'finance',
    title: 'Finance & Operations Lead',
    avatarUrl: ROLE_DEFAULT_AVATARS.finance,
  },
  {
    email: 'customer@dealflow360.com',
    password: 'demo123',
    name: 'Acme Procurement',
    role: 'customer',
    companyId: 'comp-acme',
    portalToken: 'token_acme',
    title: 'Customer Client Account (Acme Corp)',
    avatarUrl: ROLE_DEFAULT_AVATARS.customer,
  },
  {
    email: 'admin@dealflow360.com',
    password: 'admin123',
    name: 'System Admin',
    role: 'admin',
    title: 'System Administrator',
    avatarUrl: ROLE_DEFAULT_AVATARS.admin,
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
