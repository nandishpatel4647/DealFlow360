import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

// PostgreSQL Connection Configuration (Supports Cloud Neon/Supabase via DATABASE_URL or Local PostgreSQL)
export const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: connectionString.includes('localhost') ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    })
  : new Pool({
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      database: process.env.PGDATABASE || 'dealflow360',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL Database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL client pool error:', err);
});
