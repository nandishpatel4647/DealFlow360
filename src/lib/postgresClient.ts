/**
 * DealFlow360 - Enterprise PostgreSQL Client
 * Connects frontend directly to local PostgreSQL 18.6 via Express API (Zero external cloud)
 */

export interface PostgresHealth {
  connected: boolean;
  status: 'healthy' | 'error' | 'disconnected';
  database?: string;
  engine?: string;
  host?: string;
  port?: number;
  dbName?: string;
  version?: string;
  tableCounts?: Record<string, number>;
  timestamp?: string;
}

const API_BASE = '/api';

/**
 * Check PostgreSQL 18 Connection & Health Status
 */
export async function checkPostgresHealth(): Promise<PostgresHealth> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${API_BASE}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { connected: false, status: 'error' };
    }

    const data = await res.json();
    return {
      connected: data.status === 'healthy',
      status: data.status,
      database: data.database,
      engine: data.engine,
      host: data.host,
      port: data.port,
      dbName: data.dbName,
      version: data.version,
      tableCounts: data.tableCounts,
      timestamp: data.timestamp,
    };
  } catch {
    return { connected: false, status: 'disconnected' };
  }
}

/**
 * Fetch all Quotes from PostgreSQL
 */
export async function fetchPostgresQuotes(): Promise<any[] | null> {
  try {
    const res = await fetch(`${API_BASE}/quotes`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[PostgreSQL] Failed to fetch quotes:', err);
    return null;
  }
}

/**
 * Fetch all Products Catalog from PostgreSQL
 */
export async function fetchPostgresProducts(): Promise<any[] | null> {
  try {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[PostgreSQL] Failed to fetch products:', err);
    return null;
  }
}

/**
 * Fetch Warehouses & Inventory from PostgreSQL
 */
export async function fetchPostgresWarehouses(): Promise<any[] | null> {
  try {
    const res = await fetch(`${API_BASE}/warehouses`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[PostgreSQL] Failed to fetch warehouses:', err);
    return null;
  }
}

/**
 * Fetch Companies from PostgreSQL
 */
export async function fetchPostgresCompanies(): Promise<any[] | null> {
  try {
    const res = await fetch(`${API_BASE}/companies`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[PostgreSQL] Failed to fetch companies:', err);
    return null;
  }
}

/**
 * Save or Upsert Quote into PostgreSQL
 */
export async function savePostgresQuote(quote: any): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote),
    });
    return res.ok;
  } catch (err) {
    console.warn('[PostgreSQL] Failed to save quote to DB:', err);
    return false;
  }
}

/**
 * Update Quote Status in PostgreSQL (Approvals / Workflow)
 */
export async function updatePostgresQuoteStatus(id: string, status: string, notes?: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/quotes/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    });
    return res.ok;
  } catch (err) {
    console.warn('[PostgreSQL] Failed to update quote status in DB:', err);
    return false;
  }
}

/**
 * Save or Upsert Company into PostgreSQL
 */
export async function savePostgresCompany(company: any): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(company),
    });
    return res.ok;
  } catch (err) {
    console.warn('[PostgreSQL] Failed to save company to DB:', err);
    return false;
  }
}

/**
 * Save or Upsert User into PostgreSQL
 */
export async function savePostgresUser(user: any): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    return res.ok;
  } catch (err) {
    console.warn('[PostgreSQL] Failed to save user to DB:', err);
    return false;
  }
}

/**
 * Save or Upsert Product into PostgreSQL
 */
export async function savePostgresProduct(product: any): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    return res.ok;
  } catch (err) {
    console.warn('[PostgreSQL] Failed to save product to DB:', err);
    return false;
  }
}

/**
 * Save or Upsert Batch Products into PostgreSQL
 */
export async function savePostgresProductsBatch(products: any[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/products/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(products),
    });
    return res.ok;
  } catch (err) {
    console.warn('[PostgreSQL] Failed to save batch products to DB:', err);
    return false;
  }
}

