import { UserRole, DeliveryAddress } from '../types';

export interface DemoUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  companyId?: string;
  portalToken?: string;
  title: string;
  avatarUrl?: string;
  phoneNumber?: string;
  address?: DeliveryAddress;
  gstin?: string;
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
  { id: 'av-4', name: 'Rajesh Verma (Acme)', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80', role: 'customer' },
  { id: 'av-5', name: 'Priya Sharma (NovaTech)', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', role: 'customer' },
  { id: 'av-6', name: 'Anand Kulkarni (Zenith)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', role: 'customer' },
  { id: 'av-7', name: 'Dr. Anita Desai (Vertex)', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', role: 'customer' },
  { id: 'av-8', name: 'Vikramaditya Patel (Orbit)', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', role: 'customer' },
  { id: 'av-9', name: 'Alex Vance (Tech Admin)', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', role: 'admin' },
];

export const DEMO_USERS: DemoUser[] = [
  {
    email: 'sales@dealflow360.com',
    password: 'demo123',
    name: 'P. Mehta',
    role: 'sales_rep',
    title: 'Sales Representative',
    avatarUrl: ROLE_DEFAULT_AVATARS.sales_rep,
    phoneNumber: '+91 98251 00001',
  },
  {
    email: 'manager@dealflow360.com',
    password: 'demo123',
    name: 'M. Shah',
    role: 'sales_manager',
    title: 'Sales Manager',
    avatarUrl: ROLE_DEFAULT_AVATARS.sales_manager,
    phoneNumber: '+91 98251 00002',
  },
  {
    email: 'finance@dealflow360.com',
    password: 'demo123',
    name: 'R. Iyer',
    role: 'finance',
    title: 'Finance & Operations Lead',
    avatarUrl: ROLE_DEFAULT_AVATARS.finance,
    phoneNumber: '+91 98251 00003',
  },
  {
    email: 'customer@dealflow360.com',
    password: 'demo123',
    name: 'Rajesh Verma',
    role: 'customer',
    companyId: 'comp-acme',
    portalToken: 'token_acme',
    title: 'Client Procurement Lead (Acme Industries)',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    phoneNumber: '+91 98250 12345',
    address: {
      contactName: 'Rajesh Verma',
      contactPhone: '+91 98250 12345',
      contactEmail: 'procurement@acmeindustries.in',
      addressLine1: 'Plot 42, GIDC Industrial Estate, Sanand',
      addressLine2: 'Heavy Engineering Zone',
      city: 'Ahmedabad',
      state: 'Gujarat',
      postalCode: '382170',
      country: 'India',
    },
    gstin: '24AAACA1234F1Z9',
  },
  {
    email: 'novatech@dealflow360.com',
    password: 'demo123',
    name: 'Priya Sharma',
    role: 'customer',
    companyId: 'comp-novatech',
    portalToken: 'token_novatech',
    title: 'VP Engineering & Procurement (NovaTech)',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    phoneNumber: '+91 98450 67890',
    address: {
      contactName: 'Priya Sharma',
      contactPhone: '+91 98450 67890',
      contactEmail: 'deals@novatech.io',
      addressLine1: 'Tech Park One, 5th Floor',
      addressLine2: 'EPIP Zone, Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560066',
      country: 'India',
    },
    gstin: '29AABCN5678G1ZP',
  },
  {
    email: 'zenith@dealflow360.com',
    password: 'demo123',
    name: 'Anand Kulkarni',
    role: 'customer',
    companyId: 'comp-zenith',
    portalToken: 'token_zenith',
    title: 'Operations Director (Zenith Retail)',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phoneNumber: '+91 99200 45678',
    address: {
      contactName: 'Anand Kulkarni',
      contactPhone: '+91 99200 45678',
      contactEmail: 'accounts@zenithretail.in',
      addressLine1: 'Retail Hub Central, Andheri East',
      addressLine2: 'Near Western Express Highway',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400069',
      country: 'India',
    },
    gstin: '27AABCZ9012H1ZQ',
  },
  {
    email: 'vertex@dealflow360.com',
    password: 'demo123',
    name: 'Dr. Anita Desai',
    role: 'customer',
    companyId: 'comp-vertex',
    portalToken: 'token_vertex',
    title: 'Chief Scientist (Vertex Labs)',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    phoneNumber: '+91 97120 78901',
    address: {
      contactName: 'Dr. Anita Desai',
      contactPhone: '+91 97120 78901',
      contactEmail: 'purchasing@vertexlabs.ai',
      addressLine1: 'Bio-Innovation Center, Tower 3',
      addressLine2: 'Genome Valley Life Sciences Park',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500078',
      country: 'India',
    },
    gstin: '36AABCV7890L1ZS',
  },
  {
    email: 'orbit@dealflow360.com',
    password: 'demo123',
    name: 'Vikramaditya Patel',
    role: 'customer',
    companyId: 'comp-orbit',
    portalToken: 'token_orbit',
    title: 'Supply Chain Lead (Orbit Mfg)',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    phoneNumber: '+91 98790 34567',
    address: {
      contactName: 'Vikramaditya Patel',
      contactPhone: '+91 98790 34567',
      contactEmail: 'orders@orbitmfg.com',
      addressLine1: 'Auto Corridor Sector 12',
      addressLine2: 'MIDC Bhosari Industrial Area',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411018',
      country: 'India',
    },
    gstin: '27AABCO3456K1ZR',
  },
  {
    email: 'admin@dealflow360.com',
    password: 'admin123',
    name: 'System Admin',
    role: 'admin',
    title: 'System Administrator',
    avatarUrl: ROLE_DEFAULT_AVATARS.admin,
    phoneNumber: '+91 98251 00000',
  },
];

export function findDemoUser(email: string): DemoUser | undefined {
  const normalized = email.trim().toLowerCase();
  
  // Exact match first
  const exact = DEMO_USERS.find((u) => u.email.toLowerCase() === normalized);
  if (exact) return exact;

  // Specific Customer Matches
  if (normalized.includes('novatech')) {
    return DEMO_USERS.find((u) => u.email === 'novatech@dealflow360.com');
  }
  if (normalized.includes('zenith')) {
    return DEMO_USERS.find((u) => u.email === 'zenith@dealflow360.com');
  }
  if (normalized.includes('vertex')) {
    return DEMO_USERS.find((u) => u.email === 'vertex@dealflow360.com');
  }
  if (normalized.includes('orbit')) {
    return DEMO_USERS.find((u) => u.email === 'orbit@dealflow360.com');
  }
  if (normalized.includes('customer') || normalized.includes('acme') || normalized.includes('client')) {
    return DEMO_USERS.find((u) => u.email === 'customer@dealflow360.com');
  }

  // Internal Roles
  if (normalized.includes('rep') || normalized.includes('mehta') || normalized.includes('sales')) {
    return DEMO_USERS.find((u) => u.role === 'sales_rep');
  }
  if (normalized.includes('manager') || normalized.includes('shah')) {
    return DEMO_USERS.find((u) => u.role === 'sales_manager');
  }
  if (normalized.includes('finance') || normalized.includes('iyer') || normalized.includes('ops')) {
    return DEMO_USERS.find((u) => u.role === 'finance');
  }
  if (normalized.includes('admin')) {
    return DEMO_USERS.find((u) => u.role === 'admin');
  }

  return undefined;
}
