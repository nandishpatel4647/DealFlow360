import { pool } from '../server/db.js';

async function checkDatabase() {
  try {
    console.log('\n🔍 --- DealFlow360 Database Status [localhost:5432 / dealflow360] ---');
    
    // Check connection & version
    const ver = await pool.query('SELECT version()');
    console.log(`✓ PostgreSQL Connected: ${ver.rows[0].version.split(',')[0]}`);

    // Table Counts
    const tables = [
      'users', 'customer_tiers', 'companies', 'product_categories',
      'products', 'warehouses', 'warehouse_inventory', 'quotes',
      'quote_lines', 'approval_requests', 'invoices', 'audit_logs'
    ];

    console.log('\n📊 Table Record Counts:');
    for (const table of tables) {
      try {
        const res = await pool.query(`SELECT count(*) FROM ${table}`);
        console.log(`  • ${table.padEnd(22)}: ${res.rows[0].count} records`);
      } catch (e) {
        console.log(`  • ${table.padEnd(22)}: Error reading (${e.message})`);
      }
    }

    // Recent Quotes preview
    console.log('\n📑 Sample Quotes in Database:');
    const quotes = await pool.query(`
      SELECT quote_number, company_name, status, total_net_price, margin_percentage, risk_level 
      FROM quotes 
      ORDER BY created_at DESC 
      LIMIT 4
    `);
    console.table(quotes.rows);

  } catch (err) {
    console.error('❌ Database connection error:', err.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();
