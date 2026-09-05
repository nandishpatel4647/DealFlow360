# DealFlow360 — Intelligent, Self-Governing B2B Sales Operations Platform
> *"DealFlow360 doesn't just manage sales. It governs them."*

Built for the **Odoo Ahmedabad National Hackathon** (~800 Teams | ₹5 Lakh Prize Pool).

---

## 🌟 Executive Overview & Pitch

Most enterprise sales and CPQ tools are passive digital paper: they record quotes and confirm orders, but they fail to prevent rogue discounting, ignore inventory distribution realities across warehouses, treat subscriptions and one-time hardware as separate disconnected silos, and leave sales managers in the dark when deals lose momentum.

**DealFlow360** transforms the traditional quote-to-cash process into an **active, self-governing deal execution engine**. It continuously evaluates:
- **Pricing discipline** against customer tiers and category ceilings.
- **Explainable Blended Risk Scores** triggering multi-stage approval governance (**Sales Manager $\rightarrow$ Finance**).
- **AI Deal Copilot** recommending margin-accretive upsells and cross-sells with real-time margin impact math.
- **Multi-Warehouse Fulfillment Splitting** minimizing shipment overhead and freight costs.
- **Living Customer Negotiation Portal** with real-time counter-offers and automatic re-approval triggers.
- **Hybrid Billing** reconciling physical hardware delivery with prorated recurring subscription lines.
- **Deal Health & Anomaly Alerts** with 1-click **Nudge Rep** and **Escalate to VP** actions.

---

## 🏛️ System Architecture

```
                        DealFlow360 Platform
                                 |
              +------------------+------------------+
              |                                     |
    Internal App Workspace                    Customer Portal
    (Command Center, Builder,                 (/portal/quote/:token)
    Approvals, Fulfillment, Health)                 |
              |                                     |
              +------------------+------------------+
                                 |
                      Supabase / PostgreSQL
              +------------------+------------------+
              |                  |                  |
           Auth             PostgreSQL           Realtime
       (Role RBAC)          (20+ Tables)       (Sync & Audit)
                                 |
                     Business Logic Layer
              +------------------+------------------+
              |                  |                  |
         riskEngine     fulfillmentEngine     billingEngine
         (Blended Risk   (Multi-Warehouse      (Hybrid Proration
          & Approvals)    Cost Optimizer)       & Schedules)
              |                  |                  |
              +------------------+------------------+
                                 |
                   Deal Intelligence Subsystem
              +------------------+------------------+
              |                  |                  |
         upsellEngine      dealHealthEngine       aiEngine
        (Margin Delta)     (Anomaly Alerts)     (Context Copilot
                                                 & Ask DealFlow)
```

---

## 📱 The 9 Consolidated Core Experiences

1. **Executive Command Center**: Macro sales KPIs, live Deal Velocity metrics, Recent Activity audit stream, and Quick Actions.
2. **Deal Pipeline Kanban**: Multi-stage deal board with drag-and-drop support, risk badges, and table view toggle.
3. **Intelligent Quotation Builder**: Multi-line product configurator with live inline discount validation against category ceilings, dynamic margin gauge, and AI Copilot drawer.
4. **Approval & Risk Governance Center**: Multi-tier approval routing (**Sales Manager $\rightarrow$ Finance**) with Explainable Risk Breakdown and decision audit logs.
5. **Multi-Warehouse Fulfillment Intelligence**: Stock level visualizer across Ahmedabad Hub, Surat Depot, and Mumbai Central with freight-optimized splitting.
6. **Customer Negotiation Portal**: Dedicated token-restricted customer portal with line-level commenting, counter-discount proposals, and instant re-approval routing.
7. **Hybrid Billing & Subscriptions**: Unified invoice manager separating physical hardware deliveries from recurring SaaS subscriptions with daily proration.
8. **Deal Health & Anomaly Center**: Proactive anomaly detector flagging Stalled Deals, Discount Spikes, and Delivery Slippage with 1-click Nudge & Escalate actions.
9. **Admin Configuration & Rules**: Dynamic policy matrix for Customer Tiers, Category Ceilings, Approval Thresholds, and Master Product Catalog.

---

## 🎬 5-Minute Winning Pitch Story (Demo Script)

| Time | Phase | Live Interaction |
| :--- | :--- | :--- |
| **0:00 - 0:40** | **The Hook** | *"Most sales platforms are passive digital paper. DealFlow360 doesn't just manage sales. It governs them."* |
| **0:40 - 1:30** | **Quote Builder & AI Copilot** | Open **Q-1042 (Acme Industries, Gold Tier)**. Show live **Margin Gauge (34%)**. Open **AI Deal Copilot**: see *Extended Warranty* recommended (+₹8,400 margin). Click `[Add to Quote]` $\rightarrow$ Cart updates live. |
| **1:30 - 2:10** | **Discount Governance** | Set *Installation Service* discount to **18%** (Ceiling is **10%**). Live badge flags `OVER (+8.0 pt)`. **Blended Risk Score** spikes to **11.3 (HIGH)**. Auto-routes to **Sales Manager $\rightarrow$ Finance**. |
| **2:10 - 2:45** | **Sales Manager Approval** | Switch role to **Sales Manager**. Review risk breakdown and click `[Approve & Forward to Finance]`. Status updates to `Pending Finance`. |
| **2:45 - 3:10** | **Finance Approval** | Switch role to **Finance (R. Iyer)**. Review financial metrics and click `[Approve Deal]`. Status transitions to `Fully Approved`. |
| **3:10 - 3:40** | **Fulfillment Intelligence** | Open **Fulfillment**. For 20 units: Ahmedabad Hub has 12 units, Surat Depot has 8 units. Engine recommends optimal 2-shipment split. Click `[Accept Optimal Allocation]`. |
| **3:40 - 4:20** | **Customer Portal Negotiation** | Open **Customer Portal**. Customer inputs counter-discount. Submitting triggers real-time status update to `Under Negotiation` and auto-re-enters approval queue. |
| **4:20 - 4:40** | **Hybrid Billing & Proration** | Show generated One-Time Hardware Invoice alongside recurring Cloud Analytics monthly subscription with exact daily proration. Click `[Record Payment]`. |
| **4:40 - 5:00** | **Deal Health & Closing** | Open **Deal Health**. Flag Discount Spike. Click `[Nudge Rep]`. Close with: *"DealFlow360 doesn't just manage sales. It governs them."* |

---

## 🛠️ Quick Start & Local Run

```bash
# Clone repository
git clone https://github.com/nandishpatel4647/DealFlow360.git
cd DealFlow360

# Install dependencies
npm install

# Run local development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

---

## 👥 Hackathon Team

- **Nandish Patel** — Architecture, Database, Risk & Approval Engine, Deal Health, AI Copilot, System Integration
- **Krina** — Central Design System, Executive Command Center, Quote Builder, Deal Workspace, UI/UX Polish
- **Arnav** — Fulfillment Engine, Customer Portal (Realtime), Hybrid Billing, Admin Config, Seed Data
