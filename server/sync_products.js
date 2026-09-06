import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432', 10),
  database: process.env.PG_DATABASE || 'dealflow360',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
});

const ALL_PRODUCTS = [
  {
    id: 'prod-laptop',
    name: 'Laptop Pro 14',
    category_id: 'hardware',
    list_price: 120000,
    cost_price: 84000,
    is_recurring: false,
    billing_period: 'one-time',
    sku: 'HW-LP-14',
    description: 'High-performance workstation with M3 Pro chip, 32GB Unified Memory, and 1TB SSD.',
  },
  {
    id: 'prod-service',
    name: 'Onsite Setup Service',
    category_id: 'services',
    list_price: 45000,
    cost_price: 25000,
    is_recurring: false,
    billing_period: 'one-time',
    sku: 'SRV-INST-01',
    description: 'Professional enterprise deployment, network integration, security policy setup, and end-user onboarding.',
  },
  {
    id: 'prod-dock',
    name: 'Docking Station',
    category_id: 'hardware',
    list_price: 18000,
    cost_price: 11000,
    is_recurring: false,
    billing_period: 'one-time',
    sku: 'HW-DK-01',
    description: 'Dual 4K display output, 100W Power Delivery, and Gigabit Ethernet.',
  },
  {
    id: 'prod-care-plan',
    name: 'Care Plan 3 years',
    category_id: 'subscription',
    list_price: 40000,
    cost_price: 10000,
    is_recurring: true,
    billing_period: 'monthly',
    sku: 'SUB-CARE-3Y',
    description: '24/7 Enterprise support, replacement coverage, and automated health checks.',
  },
  {
    id: 'prod-display',
    name: 'Smart UltraWide Curved Display 34"',
    category_id: 'hardware',
    list_price: 65000,
    cost_price: 44000,
    is_recurring: false,
    billing_period: 'one-time',
    sku: 'HW-DP-34',
    description: 'WQHD 144Hz IPS display with built-in KVM switch and USB-C hub.',
  },
  {
    id: 'prod-consulting',
    name: 'Enterprise Architecture Consulting',
    category_id: 'services',
    list_price: 85000,
    cost_price: 60000,
    is_recurring: false,
    billing_period: 'one-time',
    sku: 'SRV-CNS-02',
    description: 'Strategic IT roadmap advisory by senior enterprise solution architects.',
  },
  {
    id: 'prod-keyboard-mouse',
    name: 'Wireless Ergonomic Keyboard & Mouse Combo',
    category_id: 'hardware',
    list_price: 6500,
    cost_price: 3800,
    is_recurring: false,
    billing_period: 'one-time',
    sku: 'HW-KBM-01',
    description: 'Quiet scissor-switch ergonomic split keyboard with precision multi-device wireless optical mouse.',
  },
  {
    id: 'prod-video-bar',
    name: 'Enterprise 4K Ultra-HD Video Conference Bar',
    category_id: 'hardware',
    list_price: 42000,
    cost_price: 26000,
    is_recurring: false,
    billing_period: 'one-time',
    sku: 'HW-VC-4K',
    description: 'AI auto-framing 4K camera with 6-beamforming microphone array and high-fidelity stereo speaker for executive boardrooms.',
  },
  {
    id: 'prod-dock-cable',
    name: 'High-Speed Thunderbolt 4 Pro Docking Cable',
    category_id: 'hardware',
    list_price: 3200,
    cost_price: 1600,
    is_recurring: false,
    billing_period: 'one-time',
    sku: 'HW-TB4-01',
    description: 'Braided 40Gbps 100W Power Delivery certified Thunderbolt 4 active optical cable.',
  },
  {
    id: 'prod-saas-copilot',
    name: 'DealFlow AI Copilot SaaS Suite',
    category_id: 'subscription',
    list_price: 24999,
    cost_price: 5000,
    is_recurring: true,
    billing_period: 'monthly',
    sku: 'SUB-AI-COPILOT',
    description: 'Autonomous Deal Operations AI suite with predictive cross-sell, discount governance alerts, and rep workflow co-pilot.',
  },
  {
    id: 'prod-cloud-backup',
    name: 'Enterprise Cloud Vault & Backup',
    category_id: 'subscription',
    list_price: 15000,
    cost_price: 4000,
    is_recurring: true,
    billing_period: 'monthly',
    sku: 'SUB-CLD-BCK',
    description: 'Immutable zero-trust cloud backup with 99.999% SLA, real-time ransomware protection, and instant rollback.',
  },
  {
    id: 'prod-security-audit',
    name: 'Zero-Trust Cybersecurity Audit & Hardening',
    category_id: 'services',
    list_price: 95000,
    cost_price: 55000,
    is_recurring: false,
    billing_period: 'one-time',
    sku: 'SRV-SEC-AUDIT',
    description: 'Comprehensive SOC2, ISO27001 vulnerability assessment, penetration testing, and access perimeter hardening.',
  },
  {
    id: 'prod-ergonomic-peripherals',
    name: 'Ergonomic Workspace Master Bundle',
    category_id: 'hardware',
    list_price: 22000,
    cost_price: 13500,
    is_recurring: false,
    billing_period: 'one-time',
    sku: 'HW-ERGO-BDL',
    description: 'Split mechanical wireless keyboard, precision optical thumb trackball, and memory foam wrist rest.',
  },
  {
    id: 'prod-analytics-pro',
    name: 'DealFlow Predictive Revenue Intelligence Pro',
    category_id: 'subscription',
    list_price: 180000,
    cost_price: 35000,
    is_recurring: true,
    billing_period: 'yearly',
    sku: 'SUB-REV-ANALYTICS',
    description: 'Executive revenue forecasting, win-probability simulation, and live ERP quota tracking for leadership teams.',
  },
  {
    id: 'prod-tv-user',
    name: 'TV',
    category_id: 'hardware',
    list_price: 35000,
    cost_price: 22000,
    is_recurring: false,
    billing_period: 'one-time',
    sku: 'HW-NEW-383',
    description: 'Commercial 4K Ultra-HD Wall-Mounted Display TV for conferencing and presentations.',
  },
  {
    id: 'prod-mobile-user',
    name: 'Mobile',
    category_id: 'hardware',
    list_price: 15000,
    cost_price: 9000,
    is_recurring: false,
    billing_period: 'one-time',
    sku: 'HW-NEW-526',
    description: 'Enterprise 5G Handheld Device with barcode scanner and field sales app preloaded.',
  },
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('Purging any grocery/test items from PostgreSQL...');
    await client.query(`
      DELETE FROM products 
      WHERE id IN ('prod-bread', 'prod-milk', 'prod-butter') 
         OR name ILIKE '%bread%' 
         OR name ILIKE '%milk%' 
         OR name ILIKE '%butter%' 
         OR name ILIKE '%sourdough%'
    `);

    for (const p of ALL_PRODUCTS) {
      await client.query(`
        INSERT INTO products (id, name, category_id, list_price, cost_price, is_recurring, billing_period, sku, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category_id = EXCLUDED.category_id,
          list_price = EXCLUDED.list_price,
          cost_price = EXCLUDED.cost_price,
          is_recurring = EXCLUDED.is_recurring,
          billing_period = EXCLUDED.billing_period,
          sku = EXCLUDED.sku,
          description = EXCLUDED.description
      `, [p.id, p.name, p.category_id, p.list_price, p.cost_price, p.is_recurring, p.billing_period, p.sku, p.description]);
    }

    const countRes = await client.query('SELECT COUNT(*) FROM products');
    console.log(`✓ Products synchronization complete. PostgreSQL product count: ${countRes.rows[0].count}`);
  } catch (err) {
    console.error('Sync error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
