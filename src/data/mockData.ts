export interface Product {
  id: string;
  name: string;
  sku: string;
  type: 'hardware' | 'saas';
  price: number;
  cost: number;
  hsn: string;
  unit: string;
}

export interface QuoteItem {
  productId: string;
  qty: number;
  discount: number;
}

export interface Quote {
  id: string;
  customer: string;
  owner: string;
  stage: string;
  discount: number;
  risk: 'low' | 'medium' | 'high';
  tenureMo: number;
  creditUtil: number;
  marginBase: number;
  value: number;
  items: QuoteItem[];
  hubs: { blr: number; mum: number };
  signed: boolean;
  closeDate: string;
}

export const formatINR = (n: number): string => {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${new Intl.NumberFormat('en-IN').format(Math.round(n))}`;
};

export const seedProducts: Product[] = [
  { id: 'P-EG240', name: 'Edge AI Gateway 240', sku: 'EG240-HW', type: 'hardware', price: 145000, cost: 92000, hsn: '8471', unit: 'unit' },
  { id: 'P-IIOT', name: 'Industrial IoT Hub Pro', sku: 'IIOT-HW', type: 'hardware', price: 98000, cost: 61000, hsn: '8471', unit: 'unit' },
  { id: 'P-SNS8', name: 'Multi-Sensor Array 8ch', sku: 'SNS8-HW', type: 'hardware', price: 24500, cost: 12800, hsn: '8517', unit: 'unit' },
  { id: 'P-CDI3Y', name: 'Cloud Deal Intelligence — 3yr', sku: 'CDI-SAAS-3Y', type: 'saas', price: 720000, cost: 84000, hsn: '9983', unit: 'license' },
  { id: 'P-SLA24', name: 'Premium 24/7 SLA Support', sku: 'SLA24-SAAS', type: 'saas', price: 480000, cost: 96000, hsn: '9983', unit: 'annual' },
  { id: 'P-CGRD', name: 'Cyber Guardian Firmware', sku: 'CGRD-SAAS', type: 'saas', price: 180000, cost: 22000, hsn: '9983', unit: 'annual' },
];

export const stages = ['Drafting', 'Internal Review', 'Buyer Counter-Offer', 'Signed', 'Invoiced'];

export const seedQuotes: Quote[] = [
  {
    id: 'Q-1042',
    customer: 'Acme Global Tech Pvt Ltd',
    owner: 'Priya Menon',
    stage: 'Internal Review',
    discount: 14,
    risk: 'medium',
    tenureMo: 28,
    creditUtil: 42,
    marginBase: 38.5,
    value: 24600000,
    items: [
      { productId: 'P-EG240', qty: 240, discount: 12 },
      { productId: 'P-CDI3Y', qty: 1, discount: 8 },
    ],
    hubs: { blr: 180, mum: 60 },
    signed: false,
    closeDate: '2026-03-15',
  },
  {
    id: 'Q-1043',
    customer: 'CyberEdge Systems Ltd',
    owner: 'Rohan Iyer',
    stage: 'Drafting',
    discount: 8,
    risk: 'low',
    tenureMo: 61,
    creditUtil: 21,
    marginBase: 41.2,
    value: 8420000,
    items: [
      { productId: 'P-IIOT', qty: 60, discount: 6 },
      { productId: 'P-SLA24', qty: 1, discount: 10 },
    ],
    hubs: { blr: 60, mum: 0 },
    signed: false,
    closeDate: '2026-03-28',
  },
  {
    id: 'Q-1044',
    customer: 'CloudGrid Bharat Networks',
    owner: 'Ananya Sharma',
    stage: 'Buyer Counter-Offer',
    discount: 22,
    risk: 'high',
    tenureMo: 11,
    creditUtil: 78,
    marginBase: 34.6,
    value: 42100000,
    items: [
      { productId: 'P-EG240', qty: 320, discount: 20 },
      { productId: 'P-CDI3Y', qty: 2, discount: 18 },
      { productId: 'P-SLA24', qty: 1, discount: 22 },
    ],
    hubs: { blr: 220, mum: 100 },
    signed: false,
    closeDate: '2026-04-10',
  },
  {
    id: 'Q-1045',
    customer: 'IoTix Technologies',
    owner: 'Vikram Sethi',
    stage: 'Signed',
    discount: 11,
    risk: 'low',
    tenureMo: 44,
    creditUtil: 33,
    marginBase: 39.8,
    value: 15800000,
    items: [
      { productId: 'P-IIOT', qty: 140, discount: 10 },
      { productId: 'P-CGRD', qty: 1, discount: 12 },
    ],
    hubs: { blr: 90, mum: 50 },
    signed: true,
    closeDate: '2026-02-28',
  },
  {
    id: 'Q-1046',
    customer: 'DataHub Global Retail',
    owner: 'Siddharth Nair',
    stage: 'Invoiced',
    discount: 9,
    risk: 'low',
    tenureMo: 72,
    creditUtil: 18,
    marginBase: 42.1,
    value: 31200000,
    items: [
      { productId: 'P-EG240', qty: 200, discount: 8 },
      { productId: 'P-SLA24', qty: 2, discount: 10 },
    ],
    hubs: { blr: 140, mum: 60 },
    signed: true,
    closeDate: '2026-02-14',
  },
  {
    id: 'Q-1047',
    customer: 'Meridian Industrials',
    owner: 'Priya Menon',
    stage: 'Internal Review',
    discount: 16,
    risk: 'medium',
    tenureMo: 19,
    creditUtil: 55,
    marginBase: 36.8,
    value: 18450000,
    items: [
      { productId: 'P-EG240', qty: 120, discount: 15 },
      { productId: 'P-CDI3Y', qty: 1, discount: 17 },
    ],
    hubs: { blr: 80, mum: 40 },
    signed: false,
    closeDate: '2026-04-02',
  },
];

export const seedTestimonials = [
  {
    name: 'Rajesh Varma',
    role: 'CFO',
    company: 'CyberEdge Systems',
    quote:
      'DealFlow360 eliminated 3.8 crores of margin leakage in our first quarter. The explainable risk vectors gave our audit committee unshakeable confidence.',
    img: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=srgb&fm=jpg&q=85&w=200',
  },
  {
    name: 'Ananya Sharma',
    role: 'VP RevOps',
    company: 'CloudGrid India',
    quote:
      'Our reps close hybrid deals 4.2× faster now. The tactile CPQ workflow feels engineered, not templated — a rare thing in enterprise software.',
    img: 'https://images.unsplash.com/photo-1614786269829-d24616faf56d?crop=entropy&cs=srgb&fm=jpg&q=85&w=200',
  },
  {
    name: 'Vikram Sethi',
    role: 'CCO',
    company: 'IoTix Technologies',
    quote:
      'Split-hub warehouse routing plus milestone GST invoicing — this is what enterprise India actually needs. Zero manual reconciliation for six months.',
    img: 'https://images.unsplash.com/flagged/photo-1553642618-de0381320ff3?crop=entropy&cs=srgb&fm=jpg&q=85&w=200',
  },
];

export const riskThreshold = (discount: number) => {
  if (discount <= 10) return { tier: 'low' as const, label: 'Auto-Approved — Rep Delegation', icon: 'check' };
  if (discount <= 18) return { tier: 'medium' as const, label: 'Tier-2 Commercial Review', icon: 'loop' };
  return { tier: 'high' as const, label: 'Tier-3 CFO Escalation', icon: 'cross' };
};

export const computeRiskScore = (quote: Quote) => {
  const tenureScore = Math.min(100, (quote.tenureMo / 60) * 100);
  const marginScore = Math.max(0, quote.marginBase - quote.discount * 0.85) * 2.4;
  const creditScore = Math.max(0, 100 - quote.creditUtil);
  const discountPenalty = Math.max(0, 100 - quote.discount * 3.5);
  const composite = Math.round(
    tenureScore * 0.22 + marginScore * 0.32 + creditScore * 0.26 + discountPenalty * 0.2
  );
  return {
    tenureScore: Math.round(tenureScore),
    marginScore: Math.round(marginScore),
    creditScore: Math.round(creditScore),
    discountPenalty: Math.round(discountPenalty),
    composite,
  };
};
