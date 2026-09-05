-- ====================================================================
-- DealFlow360 — Enterprise PostgreSQL Database Schema
-- Architecture: Local PostgreSQL 18+ (No Cloud / Zero External DB)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DROP TABLES IF EXISTING (Idempotent clean deploy)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS approval_requests CASCADE;
DROP TABLE IF EXISTS quote_lines CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS warehouse_inventory CASCADE;
DROP TABLE IF EXISTS warehouses CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS customer_tiers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 3. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('sales_rep', 'sales_manager', 'finance', 'customer', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE deal_status AS ENUM (
        'Draft', 'Submitted', 'Pending Manager', 'Pending Finance', 
        'Fully Approved', 'Under Negotiation', 'Customer Accepted', 
        'Fulfillment', 'Allocated', 'Invoiced', 'Paid', 'Rejected', 'Superseded'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE risk_level AS ENUM ('LOW', 'MEDIUM', 'HIGH');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4. TABLES DEFINITIONS

-- USERS TABLE
CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'sales_rep',
    requested_role user_role,
    status VARCHAR(32) NOT NULL DEFAULT 'active',
    avatar VARCHAR(512),
    company_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CUSTOMER TIERS
CREATE TABLE customer_tiers (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    default_discount_limit NUMERIC(5, 2) NOT NULL DEFAULT 10.00,
    payment_terms VARCHAR(64) NOT NULL DEFAULT 'Net 30'
);

-- COMPANIES / ACCOUNTS
CREATE TABLE companies (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tier_id VARCHAR(32) REFERENCES customer_tiers(id),
    industry VARCHAR(128) NOT NULL,
    credit_limit NUMERIC(15, 2) NOT NULL DEFAULT 1000000.00,
    contact_email VARCHAR(255) NOT NULL,
    portal_token VARCHAR(128) UNIQUE NOT NULL,
    historical_close_rate NUMERIC(5, 2) DEFAULT 75.00,
    historical_avg_discount NUMERIC(5, 2) DEFAULT 8.50,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCT CATEGORIES
CREATE TABLE product_categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    default_discount_ceiling NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
    target_margin NUMERIC(5, 2) NOT NULL DEFAULT 35.00
);

-- PRODUCTS CATALOG
CREATE TABLE products (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id VARCHAR(64) REFERENCES product_categories(id),
    list_price NUMERIC(15, 2) NOT NULL,
    cost_price NUMERIC(15, 2) NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    billing_period VARCHAR(32) DEFAULT 'one-time',
    sku VARCHAR(64) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- WAREHOUSES
CREATE TABLE warehouses (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    location VARCHAR(128) NOT NULL,
    shipping_cost_base NUMERIC(10, 2) NOT NULL DEFAULT 2500.00,
    weight_multiplier NUMERIC(5, 2) NOT NULL DEFAULT 1.20
);

-- WAREHOUSE INVENTORY
CREATE TABLE warehouse_inventory (
    id VARCHAR(64) PRIMARY KEY,
    warehouse_id VARCHAR(64) REFERENCES warehouses(id) ON DELETE CASCADE,
    product_id VARCHAR(64) REFERENCES products(id) ON DELETE CASCADE,
    quantity_on_hand INT NOT NULL DEFAULT 0,
    quantity_reserved INT NOT NULL DEFAULT 0,
    CONSTRAINT chk_stock_positive CHECK (quantity_on_hand >= 0),
    UNIQUE(warehouse_id, product_id)
);

-- QUOTES
CREATE TABLE quotes (
    id VARCHAR(64) PRIMARY KEY,
    quote_number VARCHAR(64) UNIQUE NOT NULL,
    company_id VARCHAR(64) REFERENCES companies(id),
    company_name VARCHAR(255) NOT NULL,
    created_by_user_id VARCHAR(64) REFERENCES users(id),
    status deal_status NOT NULL DEFAULT 'Draft',
    total_list_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_discount_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_net_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_cost NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    margin_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    blended_risk_score NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    risk_level risk_level NOT NULL DEFAULT 'LOW',
    deal_confidence NUMERIC(5, 2) DEFAULT 80.00,
    payment_terms VARCHAR(64) DEFAULT 'Net 30',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- QUOTE LINES
CREATE TABLE quote_lines (
    id VARCHAR(64) PRIMARY KEY,
    quote_id VARCHAR(64) REFERENCES quotes(id) ON DELETE CASCADE,
    product_id VARCHAR(64) REFERENCES products(id),
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(15, 2) NOT NULL,
    unit_cost NUMERIC(15, 2) NOT NULL,
    discount_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    net_price NUMERIC(15, 2) NOT NULL,
    line_margin_percent NUMERIC(5, 2) NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    billing_frequency VARCHAR(32) DEFAULT 'one-time'
);

-- APPROVAL REQUESTS
CREATE TABLE approval_requests (
    id VARCHAR(64) PRIMARY KEY,
    quote_id VARCHAR(64) REFERENCES quotes(id) ON DELETE CASCADE,
    required_role user_role NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    reason VARCHAR(512) NOT NULL,
    reviewed_by VARCHAR(64) REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INVOICES
CREATE TABLE invoices (
    id VARCHAR(64) PRIMARY KEY,
    quote_id VARCHAR(64) REFERENCES quotes(id),
    invoice_number VARCHAR(64) UNIQUE NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'Hardware Delivery',
    amount NUMERIC(15, 2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Unpaid',
    due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AUDIT LOGS
CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    actor_user_id VARCHAR(64) REFERENCES users(id),
    actor_name VARCHAR(255) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. INDEXES FOR PERFORMANCE
CREATE INDEX idx_quotes_company ON quotes(company_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quote_lines_quote ON quote_lines(quote_id);
CREATE INDEX idx_inventory_product ON warehouse_inventory(product_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);

-- ====================================================================
-- 6. SEED DATA (Indian B2B Enterprise Context)
-- ====================================================================

-- Users
INSERT INTO users (id, name, email, role, status, avatar) VALUES
('user-1', 'Rajesh Sharma', 'sales@dealflow360.com', 'sales_rep', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
('user-2', 'Priya Patel', 'manager@dealflow360.com', 'sales_manager', 'active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
('user-3', 'Vikram Malhotra', 'finance@dealflow360.com', 'finance', 'active', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'),
('user-4', 'Ananya Deshmukh', 'buyer@acme-corp.in', 'customer', 'active', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150'),
('user-5', 'Admin System', 'admin@dealflow360.com', 'admin', 'active', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150');

-- Customer Tiers
INSERT INTO customer_tiers (id, name, default_discount_limit, payment_terms) VALUES
('tier-1', 'Gold', 15.00, 'Net 60'),
('tier-2', 'Silver', 10.00, 'Net 45'),
('tier-3', 'Bronze', 5.00, 'Net 30');

-- Companies
INSERT INTO companies (id, name, tier_id, industry, credit_limit, contact_email, portal_token, historical_close_rate, historical_avg_discount) VALUES
('comp-1', 'Tata Precision Engineering', 'tier-1', 'Heavy Manufacturing', 5000000.00, 'procurement@tataprecision.in', 'tok-tata-2026', 88.50, 11.20),
('comp-2', 'Reliance Smart Logistics', 'tier-1', 'Supply Chain', 4500000.00, 'deals@reliancelogistics.in', 'tok-rel-2026', 82.00, 9.50),
('comp-3', 'Infosys Digital Solutions', 'tier-2', 'Enterprise IT', 2500000.00, 'infra@infosys-digi.com', 'tok-infy-2026', 74.00, 7.80),
('comp-4', 'Acme Systems India', 'tier-3', 'Automotive', 1200000.00, 'buyer@acme-corp.in', 'tok-acme-2026', 61.00, 4.20);

-- Categories
INSERT INTO product_categories (id, name, default_discount_ceiling, target_margin) VALUES
('hardware', 'Edge AI Hardware', 15.00, 35.00),
('services', 'Implementation & Integration', 10.00, 45.00),
('subscription', 'Autonomous Ops SaaS', 20.00, 80.00);

-- Products
INSERT INTO products (id, name, category_id, list_price, cost_price, is_recurring, billing_period, sku, description) VALUES
('prod-1', 'NeuroRack Edge AI Gateway V2', 'hardware', 285000.00, 185000.00, FALSE, 'one-time', 'HW-NR-V2', 'High-throughput real-time inference server with redundant power supply'),
('prod-2', 'SensoryNode IoT Industrial Pod', 'hardware', 42000.00, 24000.00, FALSE, 'one-time', 'HW-SN-01', 'Ruggedized IP67 vibration and thermal telemetry node for conveyor lines'),
('prod-3', 'Enterprise Turnkey Implementation', 'services', 175000.00, 95000.00, FALSE, 'one-time', 'SRV-TI-01', 'Onsite deployment, SCADA integration, and factory floor calibration'),
('prod-4', 'DealFlow360 Autonomous Core SaaS', 'subscription', 65000.00, 12000.00, TRUE, 'monthly', 'SW-DF-CORE', 'Self-governing sales operations, autonomous quote approvals, and anomaly engine'),
('prod-5', 'Predictive Maintenance Analytics', 'subscription', 48000.00, 8000.00, TRUE, 'monthly', 'SW-PM-MOD', 'Machine learning telemetry model for zero-downtime bearing failure prediction');

-- Warehouses
INSERT INTO warehouses (id, name, location, shipping_cost_base, weight_multiplier) VALUES
('wh-1', 'Ahmedabad Mega Distribution Hub', 'Sanand Industrial Estate, Gujarat', 2500.00, 1.10),
('wh-2', 'Surat Regional Depot', 'Hazira Logistics Park, Gujarat', 3200.00, 1.25),
('wh-3', 'Mumbai Central Terminal', 'Bhiwandi Logistics Hub, Maharashtra', 4100.00, 1.40);

-- Warehouse Inventory
INSERT INTO warehouse_inventory (id, warehouse_id, product_id, quantity_on_hand, quantity_reserved) VALUES
('inv-1', 'wh-1', 'prod-1', 45, 12),
('inv-2', 'wh-1', 'prod-2', 180, 40),
('inv-3', 'wh-2', 'prod-1', 18, 5),
('inv-4', 'wh-2', 'prod-2', 60, 15),
('inv-5', 'wh-3', 'prod-1', 8, 2),
('inv-6', 'wh-3', 'prod-2', 110, 25);

-- Quotes
INSERT INTO quotes (id, quote_number, company_id, company_name, created_by_user_id, status, total_list_price, total_discount_amount, total_net_price, total_cost, margin_percentage, blended_risk_score, risk_level, deal_confidence, payment_terms) VALUES
('q-101', 'Q-2026-0891', 'comp-1', 'Tata Precision Engineering', 'user-1', 'Customer Accepted', 845000.00, 67600.00, 777400.00, 489000.00, 37.10, 2.40, 'LOW', 94.00, 'Net 60'),
('q-102', 'Q-2026-0892', 'comp-2', 'Reliance Smart Logistics', 'user-1', 'Pending Finance', 1250000.00, 187500.00, 1062500.00, 715000.00, 32.70, 7.80, 'HIGH', 78.00, 'Net 45'),
('q-103', 'Q-2026-0893', 'comp-3', 'Infosys Digital Solutions', 'user-1', 'Fulfillment', 620000.00, 31000.00, 589000.00, 362000.00, 38.50, 3.10, 'LOW', 91.00, 'Net 45'),
('q-104', 'Q-2026-0894', 'comp-4', 'Acme Systems India', 'user-1', 'Under Negotiation', 460000.00, 46000.00, 414000.00, 275000.00, 33.50, 5.60, 'MEDIUM', 84.00, 'Net 30');

-- Quote Lines
INSERT INTO quote_lines (id, quote_id, product_id, quantity, unit_price, unit_cost, discount_percent, net_price, line_margin_percent, is_recurring, billing_frequency) VALUES
('ql-1', 'q-101', 'prod-1', 2, 285000.00, 185000.00, 8.00, 524400.00, 29.40, FALSE, 'one-time'),
('ql-2', 'q-101', 'prod-4', 4, 65000.00, 12000.00, 10.00, 234000.00, 79.40, TRUE, 'monthly'),
('ql-3', 'q-102', 'prod-1', 3, 285000.00, 185000.00, 15.00, 726750.00, 23.60, FALSE, 'one-time'),
('ql-4', 'q-102', 'prod-3', 1, 175000.00, 95000.00, 12.00, 154000.00, 38.30, FALSE, 'one-time'),
('ql-5', 'q-102', 'prod-5', 4, 48000.00, 8000.00, 10.00, 172800.00, 81.40, TRUE, 'monthly');
