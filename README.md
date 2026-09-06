# <p align="center"><img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shield-check.svg" width="48" height="48" alt="DealFlow360 Logo" /><br/>DealFlow360</p>

<h3 align="center">Intelligent, Self-Governing B2B Sales Operations Platform</h3>

<p align="center">
  <em>"DealFlow360 doesn't just manage sales. It governs them."</em>
</p>

<p align="center">
  <a href="https://deal-flow-360.vercel.app/"><img src="https://img.shields.io/badge/🚀_Live_Demo-deal--flow--360.vercel.app-0176D3?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" /></a>
  <a href="https://github.com/nandishpatel4647/DealFlow360"><img src="https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Repo" /></a>
  <img src="https://img.shields.io/badge/Status-Production_Ready-10B981?style=for-the-badge" alt="Production Ready" />
  <img src="https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript_6-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite_8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/PostgreSQL_18-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL 18" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Vercel_Serverless-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

## 🌐 Live Deployment & Instant Demo Access

Experience the fully functional application running live with multi-role RBAC, client-side data persistence, and cloud serverless architecture:

👉 **[https://deal-flow-360.vercel.app/](https://deal-flow-360.vercel.app/)**

### 🔑 Demo Credentials (1-Click Instant Testing)

The platform features an instant **Hackathon Role Switcher** and pre-configured enterprise credentials:

| Persona / Role | Email | Password | Key Privileges & Responsibilities |
| :--- | :--- | :--- | :--- |
| **VP of Sales / Admin** | `admin@dealflow360.com` | `admin123` | Full control, policy configurations, override approvals, quote deletion |
| **Sales Representative** | `rep@dealflow360.com` | `demo123` | CPQ Quote Builder, AI Upsell Copilot, 1-per-company chat hub, discount requests |
| **Sales Manager** | `manager@dealflow360.com` | `demo123` | Tier-1 risk approvals, commercial policy reviews, margin surveillance |
| **Finance Controller** | `finance@dealflow360.com` | `demo123` | Final financial clearance, credit limit checks, hybrid invoice proration |
| **Customer (Acme Industries)** | *Portal Token:* `token_acme` | *Auto-Login* | Line-item counter negotiations, fulfillment tracker, invoice settlement |
| **Customer (NovaTech Systems)** | *Portal Token:* `token_novatech` | *Auto-Login* | High-availability server proposals, 30-day net terms review |
| **Customer (Orbit Mfg)** | *Portal Token:* `token_orbit` | *Auto-Login* | Industrial IoT hardware contracts, multi-warehouse dispatch tracking |

> 💡 *Note: On the login page, you can either click the **"Quick Demo Login"** buttons to enter immediately with any persona or sign up for a custom account with built-in 8+ character password validation.*

---

## 🌟 Executive Overview & Problem Statement

Most enterprise CPQ (Configure, Price, Quote) tools are little more than **"passive digital paper"**: they record quotes and print PDFs, but they fail to prevent rogue discounting, ignore multi-warehouse inventory distribution realities, treat subscriptions and physical hardware as disjointed silos, and leave managers completely blind when deals lose momentum.

**DealFlow360** transforms B2B quote-to-cash operations into a **self-governing, margin-defending execution engine**.

```
                           DealFlow360 Unified Ecosystem
                                         │
        ┌────────────────────────────────┴────────────────────────────────┐
        ▼                                                                 ▼
 🏢 Internal Enterprise Suite                                 👥 Living Customer Portal
 ├── Executive Command Center                                 ├── Token-Secured Access
 ├── Intelligent CPQ Builder                                  ├── Line-Item Counter Proposals
 ├── Blended Risk Governance                                  ├── Real-Time Negotiation Chat
 ├── Multi-Warehouse Fulfillment                              ├── Live 5-Stage Order Tracking
 └── Deal Health Anomaly Radar                                └── Hybrid Invoice Settlement
        │                                                                 │
        └────────────────────────────────┬────────────────────────────────┘
                                         ▼
                      🧠 Self-Governing Intelligence Core
            ┌────────────────────────────┼────────────────────────────┐
            ▼                            ▼                            ▼
     🛡️ riskEngine               🏭 fulfillmentEngine          💳 billingEngine
  (Blended Risk Scoring)       (Cost & Stock Optimization)   (Hardware + SaaS Proration)
            │                            │                            │
            └────────────────────────────┼────────────────────────────┘
                                         ▼
                        ⚡ High-Availability Data Layer
                   PostgreSQL 18.6 + Dual-Layer Sync Engine
```

---

## 🚀 The 7 Core Architectural Pillars

### 1. 🛡️ Self-Governing Discount Governance & Blended Risk Engine
- **Formula-Driven Pricing Ceilings**: Enforces category-level discount ceilings (e.g., Enterprise Servers: 12%, Cloud Analytics: 20%, Consulting: 10%).
- **Explainable Blended Risk Score**: Evaluates 4 composite risk factors:
  $$\text{Risk Score} = \text{Discount Risk} + \text{Customer Tier Factor} + \text{Margin Degradation} + \text{Credit Exposure}$$
- **Automated Two-Stage Approval Chains**:
  - **Risk < 5.0**: Instant auto-approval for high-velocity deals.
  - **Risk 5.0 – 8.0**: Escalates to **Sales Manager** with real-time push notification.
  - **Risk > 8.0**: Escalates to **Finance Controller** for strict margin & credit audit.
- **Audit Trails**: Every discount delta, approval note, and rejection reason is immutably logged.

### 2. 🧠 Contextual AI Deal Copilot & Margin-Accretive Upsell Engine
- **Predictive Recommendations**: Analyzes quote composition against customer industry patterns (e.g., suggesting *Extended Enterprise Warranty* or *Implementation SLAs* for hardware deals).
- **Live Margin Delta Mathematics**: Displays exact profit impact before adding items (e.g., `+₹8,400 Gross Profit | +2.4% Net Margin`).
- **1-Click Cart Insertion**: Inserts recommended SKUs directly into active quote drafts with real-time tax and proration recalculation.

### 3. 🏭 Multi-Warehouse Fulfillment & Freight Optimizer
- **Distributed Inventory Telemetry**: Real-time stock visibility across **Ahmedabad Regional Hub**, **Surat Depot**, and **Mumbai Logistics Center**.
- **Automated Split-Shipment Allocation**: Automatically computes minimum-cost shipment splits when a single depot lacks stock.
- **Interactive 5-Stage Order Tracker**: Visual milestone progression from `Draft` $\rightarrow$ `Dispatched` $\rightarrow$ `In Transit` $\rightarrow$ `Out for Delivery` $\rightarrow$ `Delivered`.

### 4. 💳 Hybrid Split-Billing & Revenue Recognition Engine
- **Unified Quote-to-Invoice Pipeline**: Seamlessly combines physical hardware (milestone-based invoicing) with cloud SaaS subscriptions (recurring schedules) in a single quote.
- **Precision Daily Proration**: Accurately calculates partial-month recurring subscription charges down to the exact day.
- **Real-Time Payment Settlement**: Generates compliant GST tax invoices with 1-click payment recording and ledger reconciliation.

### 5. 🚨 Proactive Deal Health & Anomaly Surveillance Radar
- **Automated Heuristic Surveillance**: Monitors deals 24/7 for:
  - ⏳ *Stalled Pipeline Deals* (>14 days without forward velocity).
  - 📉 *Severe Margin Erosion* (deals dipping below 25% gross margin).
  - 🚩 *Rogue Rep Discounting* (discounts exceeding 2.5x customer historical average).
- **1-Click Remediation**: Instant `[Nudge Rep]` and `[Escalate to VP]` actions dispatching high-priority alerts to stakeholders.

### 6. 💬 Living Customer Negotiation Portal & 1-Chat-per-Company Hub
- **Zero-Login Tokenized Portal**: Customers review proposals via secure unique URLs (`/portal/quote/:token`).
- **Interactive Counter-Offers**: Customers propose alternative discounts and delivery dates with line-level annotations.
- **Unified Company Chat Hub**: Clean 1-thread-per-company communication interface, preventing duplicate chat clutter and enabling continuous rep-customer dialogue.

### 7. 🔐 Multi-Persona RBAC & Profile Customization
- **Strict Role Isolation**: Distinct views and permissions for Admin, Sales Rep, Sales Manager, Finance, and Customers.
- **Dynamic Profile Customization**: Update personal names, designations, phone numbers, delivery addresses, GSTIN numbers, and custom profile pictures.
- **Persistent Offline-First Engine**: All states, quotes, invoices, and messages persist immediately across page refreshes and browser sessions.

---

## 💻 Complete Technology Stack

| Layer | Technologies Used | Rationale & Capabilities |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** + **TypeScript 6** | Ultra-performant reactive rendering, strict type safety across all CPQ entities |
| **Build & Bundler** | **Vite 8** | Lightning-fast HMR and optimized sub-second production chunking |
| **Styling & Design** | **Tailwind CSS v4** + **Vanilla CSS tokens** | Sleek enterprise design system, glassmorphism, 3D card tilts, micro-animations |
| **Iconography & Visuals**| **Lucide React** + **Recharts** | Crisp modern SVG icons and interactive financial charts (risk gauges, revenue bars) |
| **Backend API** | **Express.js (Node.js)** | High-throughput REST API with full CORS support and connection pool monitoring |
| **Serverless Deployment**| **Vercel Serverless Functions** | Zero-cold-start cloud deployment via `api/index.js` and dynamic route rewrites |
| **Database Engine** | **PostgreSQL 18.6** | Relational integrity, foreign keys, JSONB support, and SSL cloud pooling |
| **State & Persistence** | **Dual-Layer Store (Zustand-style + LocalStorage)** | Instant offline-first reliability; state is 100% immune to network drops or page reloads |

---

## 🏗️ Interactive Quote Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> Draft: Rep creates quote
    Draft --> Pending_Manager: Discount > Ceiling (Risk > 5.0)
    Draft --> Pending_Finance: High Discount / Credit Risk (Risk > 8.0)
    Draft --> Approved: Risk < 5.0 (Auto-Approved)
    
    Pending_Manager --> Pending_Finance: Manager approves (forward to Finance)
    Pending_Manager --> Draft: Manager requests revision
    
    Pending_Finance --> Approved: Finance grants clearance
    Pending_Finance --> Draft: Finance requests revision
    
    Approved --> Sent_To_Customer: Rep sends to Customer Portal
    Sent_To_Customer --> Under_Negotiation: Customer submits counter-proposal
    Under_Negotiation --> Pending_Manager: Counter-offer re-triggers approval
    
    Sent_To_Customer --> Accepted: Customer accepts & signs quote
    Accepted --> In_Fulfillment: Order routed to Multi-Warehouse engine
    In_Fulfillment --> Invoiced: Shipments dispatched & settled
    Invoiced --> [*]: Payment recorded
```

---

## ⚡ Quick Start & Local Development

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher
- (Optional) PostgreSQL 16+ for local database experimentation

### Installation Steps

```bash
# 1. Clone the repository
git clone https://github.com/nandishpatel4647/DealFlow360.git
cd DealFlow360

# 2. Install dependencies
npm install

# 3. (Optional) Configure environment variables
# Copy .env.example to .env and configure your PostgreSQL database URL
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dealflow360

# 4. Start the frontend development server
npm run dev

# 5. In a second terminal, start the Express backend server (optional)
npm run server
```

Open **[http://localhost:5173/](http://localhost:5173/)** (or the port displayed in terminal) in your browser to explore DealFlow360.

---

## 🧪 Production Verification & Build Check

Run the production TypeScript compilation and bundle analysis:

```bash
npm run build
```

Expected output:
```text
✓ 2452 modules transformed.
dist/index.html                     0.86 kB
dist/assets/index.css             104.86 kB
dist/assets/index.js            1,117.52 kB
✓ built in 441ms
```

---

## 👥 Hackathon Team

Developed for the **Odoo Ahmedabad National Hackathon 2026**:

- **Nandish Patel** — System Architecture, Dual-Layer Database Sync, Blended Risk & Approval Engine, Deal Health Surveillance, AI Copilot, System Integration
- **Krina** — Central Enterprise Design System, Executive Command Center, CPQ Builder, Deal Workspace, UI/UX Micro-interactions
- **Arnav** — Multi-Warehouse Fulfillment Optimizer, Living Customer Portal, Hybrid Billing & Subscription Engine, Seed Data Telemetry

---

<p align="center">
  <sub>Built with ❤️ for high-velocity enterprise sales teams. DealFlow360 — Where deals execute with precision.</sub>
</p>
