import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 1. Health Check with PostgreSQL Engine & Table Telemetry
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version()');
    
    // Fetch counts from key tables
    const tableCounts = {};
    const tables = ['users', 'companies', 'products', 'warehouses', 'quotes', 'invoices', 'audit_logs'];
    for (const t of tables) {
      try {
        const c = await pool.query(`SELECT count(*) FROM ${t}`);
        tableCounts[t] = parseInt(c.rows[0].count, 10);
      } catch {
        tableCounts[t] = 0;
      }
    }

    res.json({
      status: 'healthy',
      database: 'PostgreSQL 18 Local',
      engine: 'PostgreSQL 18.6 (x86_64-windows)',
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT || 5432,
      dbName: process.env.PGDATABASE || 'dealflow360',
      timestamp: result.rows[0].current_time,
      version: result.rows[0].version,
      tableCounts,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'PostgreSQL Disconnected', message: err.message });
  }
});

// 2. Products Catalog
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, pc.name as category_name
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      ORDER BY p.name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { id, name, category_id, list_price, cost_price, is_recurring, billing_period, sku, description } = req.body;
    const result = await pool.query(`
      INSERT INTO products (id, name, category_id, list_price, cost_price, is_recurring, billing_period, sku, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        list_price = EXCLUDED.list_price,
        cost_price = EXCLUDED.cost_price,
        description = EXCLUDED.description
      RETURNING *
    `, [
      id || `prod-${Date.now()}`,
      name,
      category_id || 'hardware',
      list_price || 0,
      cost_price || 0,
      is_recurring || false,
      billing_period || 'one-time',
      sku || `SKU-${Date.now().toString().slice(-4)}`,
      description || ''
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Quotes API
app.get('/api/quotes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT q.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', ql.id,
              'productId', ql.product_id,
              'product_id', ql.product_id,
              'quantity', ql.quantity,
              'unitPrice', ql.unit_price,
              'unit_price', ql.unit_price,
              'unitCost', ql.unit_cost,
              'unit_cost', ql.unit_cost,
              'discountPercent', ql.discount_percent,
              'discount_percent', ql.discount_percent,
              'netPrice', ql.net_price,
              'net_price', ql.net_price,
              'isRecurring', ql.is_recurring,
              'billingFrequency', ql.billing_frequency
            )
          ) FILTER (WHERE ql.id IS NOT NULL), '[]'
        ) as lines
      FROM quotes q
      LEFT JOIN quote_lines ql ON q.id = ql.quote_id
      GROUP BY q.id
      ORDER BY q.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Quote
app.post('/api/quotes', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      id,
      quote_number,
      quoteNumber,
      company_id,
      companyId,
      company_name,
      companyName,
      created_by_user_id,
      createdByUserId,
      status,
      total_list_price,
      totalListPrice,
      total_discount_amount,
      totalDiscountAmount,
      total_net_price,
      totalNetPrice,
      total_cost,
      totalCost,
      margin_percentage,
      marginPercentage,
      blended_risk_score,
      blendedRiskScore,
      risk_level,
      riskLevel,
      deal_confidence,
      dealConfidence,
      payment_terms,
      paymentTerms,
      notes,
      lines = []
    } = req.body;

    const finalId = id || `q-${Date.now()}`;
    const finalNumber = quote_number || quoteNumber || `Q-${Date.now().toString().slice(-4)}`;

    const quoteResult = await client.query(`
      INSERT INTO quotes (
        id, quote_number, company_id, company_name, created_by_user_id,
        status, total_list_price, total_discount_amount, total_net_price,
        total_cost, margin_percentage, blended_risk_score, risk_level,
        deal_confidence, payment_terms, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        total_net_price = EXCLUDED.total_net_price,
        total_discount_amount = EXCLUDED.total_discount_amount,
        margin_percentage = EXCLUDED.margin_percentage,
        risk_level = EXCLUDED.risk_level,
        notes = EXCLUDED.notes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [
      finalId,
      finalNumber,
      company_id || companyId || 'comp-1',
      company_name || companyName || 'Acme Corp',
      created_by_user_id || createdByUserId || 'user-1',
      status || 'Draft',
      total_list_price || totalListPrice || 0,
      total_discount_amount || totalDiscountAmount || 0,
      total_net_price || totalNetPrice || 0,
      total_cost || totalCost || 0,
      margin_percentage || marginPercentage || 0,
      blended_risk_score || blendedRiskScore || 0,
      risk_level || riskLevel || 'LOW',
      deal_confidence || dealConfidence || 80,
      payment_terms || paymentTerms || 'Net 30',
      notes || ''
    ]);

    // Clean old lines if replacing
    await client.query('DELETE FROM quote_lines WHERE quote_id = $1', [finalId]);

    for (const line of lines) {
      const pId = line.productId || line.product_id || 'prod-1';
      await client.query(`
        INSERT INTO quote_lines (
          id, quote_id, product_id, quantity, unit_price, unit_cost,
          discount_percent, net_price, line_margin_percent, is_recurring, billing_frequency
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        line.id || `ql-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        finalId,
        pId,
        line.quantity || 1,
        line.unitPrice || line.unit_price || 0,
        line.unitCost || line.unit_cost || 0,
        line.discountPercent || line.discount_percent || 0,
        line.netPrice || line.net_price || 0,
        line.lineMarginPercent || line.line_margin_percent || 0,
        line.isRecurring || line.is_recurring || false,
        line.billingFrequency || line.billing_frequency || 'one-time'
      ]);
    }

    await client.query('COMMIT');
    res.status(201).json(quoteResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Update Quote Status (Approvals / Stages)
app.patch('/api/quotes/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, risk_level, notes } = req.body;
  try {
    const result = await pool.query(`
      UPDATE quotes 
      SET status = COALESCE($1, status),
          risk_level = COALESCE($2, risk_level),
          notes = COALESCE($3, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [status, risk_level, notes, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quote not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Warehouses & Stock
app.get('/api/warehouses', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT w.*, 
        COALESCE(
          json_agg(
            json_build_object(
              'id', wi.id,
              'warehouseId', wi.warehouse_id,
              'productId', wi.product_id,
              'quantityOnHand', wi.quantity_on_hand,
              'quantityReserved', wi.quantity_reserved
            )
          ) FILTER (WHERE wi.id IS NOT NULL), '[]'
        ) as inventory
      FROM warehouses w
      LEFT JOIN warehouse_inventory wi ON w.id = wi.warehouse_id
      GROUP BY w.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Companies / Accounts
app.get('/api/companies', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, ct.name as tier_name
      FROM companies c
      LEFT JOIN customer_tiers ct ON c.tier_id = ct.id
      ORDER BY c.name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/companies', async (req, res) => {
  try {
    const {
      id,
      name,
      tierId,
      tier_id,
      industry,
      creditLimit,
      credit_limit,
      contactEmail,
      contact_email,
      portalToken,
      portal_token,
      historicalCloseRate,
      historicalAvgDiscount
    } = req.body;

    const result = await pool.query(`
      INSERT INTO companies (
        id, name, tier_id, industry, credit_limit, contact_email,
        portal_token, historical_close_rate, historical_avg_discount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        credit_limit = EXCLUDED.credit_limit,
        contact_email = EXCLUDED.contact_email
      RETURNING *
    `, [
      id || `comp-${Date.now()}`,
      name,
      tierId || tier_id || 'tier-2',
      industry || 'Technology',
      creditLimit || credit_limit || 1000000,
      contactEmail || contact_email || 'contact@company.com',
      portalToken || portal_token || `token_${Date.now()}`,
      historicalCloseRate || 80,
      historicalAvgDiscount || 8
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Users API
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM users ORDER BY created_at ASC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { id, name, email, role, status, avatar, company_name } = req.body;
    const result = await pool.query(`
      INSERT INTO users (id, name, email, role, status, avatar, company_name)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE SET
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        avatar = EXCLUDED.avatar
      RETURNING *
    `, [
      id || `user-${Date.now()}`,
      name,
      email,
      role || 'sales_rep',
      status || 'active',
      avatar || '',
      company_name || ''
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Invoices API
app.get('/api/invoices', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM invoices ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const { id, quote_id, invoice_number, type, amount, status, due_date } = req.body;
    const result = await pool.query(`
      INSERT INTO invoices (id, quote_id, invoice_number, type, amount, status, due_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      id || `inv-${Date.now()}`,
      quote_id,
      invoice_number || `INV-${Date.now().toString().slice(-4)}`,
      type || 'Hardware Delivery',
      amount || 0,
      status || 'Unpaid',
      due_date || new Date().toISOString().split('T')[0]
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Audit Logs API
app.get('/api/audit-logs', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/audit-logs', async (req, res) => {
  try {
    const { id, entity_type, entity_id, action, actor_user_id, actor_name, details } = req.body;
    const result = await pool.query(`
      INSERT INTO audit_logs (id, entity_type, entity_id, action, actor_user_id, actor_name, details)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      id || `log-${Date.now()}`,
      entity_type || 'quote',
      entity_id || 'unknown',
      action || 'CREATE',
      actor_user_id || null,
      actor_name || 'System',
      JSON.stringify(details || {})
    ]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✓ DealFlow360 PostgreSQL API Server running on http://localhost:${PORT}`);
  console.log(`✓ Database: PostgreSQL 18 Local (localhost:5432 / dealflow360)`);
});
