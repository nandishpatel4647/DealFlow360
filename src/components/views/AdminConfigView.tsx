import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Building,
  Package,
  Layers,
  Save,
  Warehouse as WarehouseIcon,
  UserPlus,
  Users,
  Plus,
  X,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { CustomerTierType, ProductCategoryType, UserRole, Company, Product } from '../../types';
import { DemoUser } from '../../auth/demoUsers';

export const AdminConfigView: React.FC = () => {
  const {
    configPolicy,
    updatePolicy,
    users,
    addUser,
    companies,
    addCompany,
    products,
    addProduct,
    warehouses,
    inventory,
    loginAsCustomer,
    setActiveView,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'users' | 'customers' | 'products' | 'governance'>('users');

  // Governance Matrix State
  const [tierCeilings, setTierCeilings] = useState(configPolicy.tierCeilings);
  const [categoryCeilings, setCategoryCeilings] = useState(configPolicy.categoryCeilings);
  const [approvalThresholds, setApprovalThresholds] = useState(configPolicy.approvalThresholds);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Modals state
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // User Form State
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('demo123');
  const [userRoleSelect, setUserRoleSelect] = useState<UserRole>('sales_rep');
  const [userTitle, setUserTitle] = useState('Sales Specialist');

  // Customer Form State
  const [custName, setCustName] = useState('');
  const [custTier, setCustTier] = useState<CustomerTierType>('Silver');
  const [custIndustry, setCustIndustry] = useState('Technology');
  const [custEmail, setCustEmail] = useState('');
  const [custCreditLimit, setCustCreditLimit] = useState(500000);

  // Product Form State
  const [prodSku, setProdSku] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState<ProductCategoryType>('hardware');
  const [prodListPrice, setProdListPrice] = useState(100000);
  const [prodCostPrice, setProdCostPrice] = useState(60000);
  const [prodIsRecurring, setProdIsRecurring] = useState(false);
  const [prodBillingPeriod, setProdBillingPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  const handleSaveGovernance = () => {
    updatePolicy({
      tierCeilings,
      categoryCeilings,
      approvalThresholds,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userEmail) return;

    const newUser: DemoUser = {
      email: userEmail,
      password: userPassword,
      name: userName,
      role: userRoleSelect,
      title: userTitle,
    };

    addUser(newUser);
    setIsAddUserOpen(false);
    setUserName('');
    setUserEmail('');
    setUserTitle('Sales Specialist');
  };

  const handleAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custEmail) return;

    const generatedToken = `token_${custName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now().toString().slice(-4)}`;
    const newComp: Company = {
      id: `comp-${Date.now()}`,
      name: custName,
      tierId: custTier,
      industry: custIndustry,
      creditLimit: custCreditLimit,
      contactEmail: custEmail,
      portalToken: generatedToken,
      historicalCloseRate: 80,
      historicalAvgDiscount: 8,
    };

    addCompany(newComp);
    setIsAddCustomerOpen(false);
    setCustName('');
    setCustEmail('');
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodSku) return;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      sku: prodSku,
      name: prodName,
      categoryId: prodCategory,
      listPrice: prodListPrice,
      costPrice: prodCostPrice,
      isRecurring: prodIsRecurring,
      billingPeriod: prodIsRecurring ? prodBillingPeriod : undefined,
      description: `${prodName} - Added via Master Admin Catalog.`,
    };

    addProduct(newProd);
    setIsAddProductOpen(false);
    setProdSku('');
    setProdName('');
  };

  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0176D3] flex items-center justify-center text-white font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                System Administration & Governance Center
              </h1>
              <p className="text-xs text-slate-500">
                Full-lifecycle role management, customer account provisioning, product master catalog, and live CPQ governance.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'governance' && (
            <button
              onClick={handleSaveGovernance}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0176D3] hover:bg-blue-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" /> Save Governance Engine
            </button>
          )}
          {activeTab === 'users' && (
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0176D3] hover:bg-blue-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <UserPlus className="w-4 h-4" /> + Add User
            </button>
          )}
          {activeTab === 'customers' && (
            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0176D3] hover:bg-blue-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Building className="w-4 h-4" /> + Add Customer Account
            </button>
          )}
          {activeTab === 'products' && (
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0176D3] hover:bg-blue-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Package className="w-4 h-4" /> + Add Catalog Product
            </button>
          )}
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>
            Governance rules successfully saved! Discount thresholds and risk evaluation matrices updated live across all active deals.
          </span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex items-center gap-2 bg-white px-4 pt-3 rounded-t-xl">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'users'
              ? 'border-[#0176D3] text-[#0176D3]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" /> Users & Roles ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'customers'
              ? 'border-[#0176D3] text-[#0176D3]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" /> Customer Accounts ({companies.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'products'
              ? 'border-[#0176D3] text-[#0176D3]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" /> Master Products ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('governance')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer ${
            activeTab === 'governance'
              ? 'border-[#0176D3] text-[#0176D3]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> CPQ Governance & Warehouses
        </button>
      </div>

      {/* TAB 1: USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Provisioned System Users & Role Assignments</h2>
              <p className="text-xs text-slate-500">
                Manage access control levels (Sales Rep, Sales Manager, Finance, Customer, Admin).
              </p>
            </div>
            <button
              onClick={() => setIsAddUserOpen(true)}
              className="px-3 py-1.5 rounded-md text-xs font-bold bg-[#0176D3] text-white hover:bg-blue-700 transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Assigned Role</th>
                  <th className="py-3 px-4">Title / Division</th>
                  <th className="py-3 px-4">Access Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((u, idx) => {
                  const roleColors: Record<UserRole, string> = {
                    sales_rep: 'bg-blue-100 text-blue-800 border-blue-200',
                    sales_manager: 'bg-purple-100 text-purple-800 border-purple-200',
                    finance: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                    customer: 'bg-amber-100 text-amber-800 border-amber-200',
                    admin: 'bg-slate-100 text-slate-800 border-slate-300',
                  };

                  return (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 text-slate-900 font-bold flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <span>{u.name}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border uppercase tracking-wide ${roleColors[u.role]}`}
                        >
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">{u.title}</td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOMER ACCOUNTS */}
      {activeTab === 'customers' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Registered Customer Accounts & Client Portal Access</h2>
              <p className="text-xs text-slate-500">
                Customer accounts with specific Tier status, credit limits, and secure negotiation portal links.
              </p>
            </div>
            <button
              onClick={() => setIsAddCustomerOpen(true)}
              className="px-3 py-1.5 rounded-md text-xs font-bold bg-[#0176D3] text-white hover:bg-blue-700 transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Customer
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Company Name</th>
                  <th className="py-3 px-4">Tier Status</th>
                  <th className="py-3 px-4">Industry</th>
                  <th className="py-3 px-4">Credit Limit</th>
                  <th className="py-3 px-4">Contact Email</th>
                  <th className="py-3 px-4">Portal Token</th>
                  <th className="py-3 px-4">Portal Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {companies.map((c) => {
                  const tierBadges: Record<CustomerTierType, string> = {
                    Gold: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold',
                    Silver: 'bg-slate-100 text-slate-800 border-slate-300 font-bold',
                    Bronze: 'bg-orange-100 text-orange-900 border-orange-300 font-bold',
                  };

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{c.name}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded text-[11px] border ${tierBadges[c.tierId]}`}>
                          {c.tierId} Tier
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{c.industry}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ₹{c.creditLimit.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{c.contactEmail}</td>
                      <td className="py-3.5 px-4 font-mono text-[#0176D3]">
                        <div className="flex items-center gap-1.5">
                          <span>{c.portalToken}</span>
                          <button
                            onClick={() => copyToClipboard(c.portalToken)}
                            className="p-1 rounded hover:bg-slate-200 text-slate-500 cursor-pointer"
                            title="Copy Portal Token"
                          >
                            {copiedToken === c.portalToken ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => loginAsCustomer(c.portalToken)}
                          className="px-2.5 py-1 rounded text-[11px] font-bold bg-blue-50 text-[#0176D3] border border-blue-200 hover:bg-blue-100 transition flex items-center gap-1 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" /> Login as Client
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PRODUCT CATALOG */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Enterprise Product & Price List Master Catalog</h2>
              <p className="text-xs text-slate-500">
                Products available for Sales Rep quotation creation across Hardware, Professional Services, and SaaS Subscriptions.
              </p>
            </div>
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="px-3 py-1.5 rounded-md text-xs font-bold bg-[#0176D3] text-white hover:bg-blue-700 transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">List Price (₹)</th>
                  <th className="py-3 px-4">Cost Price (₹)</th>
                  <th className="py-3 px-4">Base Margin</th>
                  <th className="py-3 px-4">Billing Model</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {products.map((p) => {
                  const marginPct = Math.round(((p.listPrice - p.costPrice) / p.listPrice) * 100);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0176D3]">{p.sku}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="py-3.5 px-4 capitalize font-medium text-slate-600">{p.categoryId}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ₹{p.listPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        ₹{p.costPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                        {marginPct}%
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {p.isRecurring ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <CreditCard className="w-3 h-3" /> Recurring ({p.billingPeriod})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                            One-Time Goods
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: GOVERNANCE & APPROVAL CHAINS (Blueprint Page 18) */}
      {activeTab === 'governance' && (
        <div className="space-y-6">
          {/* Header Title Bar matching Blueprint Page 18 */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Discount tiers and approval chains
              </h2>
              <p className="text-xs text-slate-500">
                Set max authorized discount ceilings by customer tier & product category, and configure automatic multi-tier approval routing.
              </p>
            </div>
            <button
              onClick={handleSaveGovernance}
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#0176D3] hover:bg-blue-700 text-white transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" /> Save configuration
            </button>
          </div>

          {/* Top Section: Tier Ceilings & Category Ceilings side-by-side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Tier Discount Ceilings */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-sm font-bold text-slate-900">Tier Discount Ceilings</h3>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Tier</th>
                      <th className="py-3 px-4 text-right">Max Discount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(['Bronze', 'Silver', 'Gold'] as CustomerTierType[]).map((tier) => (
                      <tr key={tier} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{tier}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1 justify-end">
                            <input
                              type="number"
                              min="0"
                              max="50"
                              value={tierCeilings[tier]}
                              onChange={(e) =>
                                setTierCeilings({
                                  ...tierCeilings,
                                  [tier]: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-16 px-2 py-1 rounded bg-white border border-slate-300 text-slate-900 text-xs font-extrabold outline-none focus:border-[#0176D3] text-right"
                            />
                            <span className="text-slate-600 font-semibold">percent</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Box 2: Category Discount Ceilings */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="text-sm font-bold text-slate-900">Category Discount ceilings</h3>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-right">Max Discount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(['hardware', 'services', 'subscription'] as ProductCategoryType[]).map((cat) => {
                      const displayCat = cat === 'hardware' ? 'Hardware' : cat === 'services' ? 'Services' : 'Subscription';
                      return (
                        <tr key={cat} className="hover:bg-slate-50/60">
                          <td className="py-3.5 px-4 font-bold text-slate-900">{displayCat}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1 justify-end">
                              <input
                                type="number"
                                min="0"
                                max="50"
                                value={categoryCeilings[cat]}
                                onChange={(e) =>
                                  setCategoryCeilings({
                                    ...categoryCeilings,
                                    [cat]: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-16 px-2 py-1 rounded bg-white border border-slate-300 text-slate-900 text-xs font-extrabold outline-none focus:border-[#0176D3] text-right"
                              />
                              <span className="text-slate-600 font-semibold">percent</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 2: Approval Routing Chains Table (Matching Blueprint Page 18) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
            <div className="border-b border-slate-200 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Tier Discount Ceilings & Approval Chains</h3>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5 w-1/2">Discount range</th>
                    <th className="py-3.5 px-5 w-1/2">Max Discount / Approval Chain</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-4 px-5 font-bold text-slate-900">Within tier/Category limit</td>
                    <td className="py-4 px-5 font-semibold text-emerald-700 bg-emerald-50/40">No approval needed</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-4 px-5 font-bold text-slate-900">Over Limit, blended risk medium</td>
                    <td className="py-4 px-5 font-semibold text-amber-800 bg-amber-50/40">Sales manager</td>
                  </tr>
                  <tr className="hover:bg-slate-50/60">
                    <td className="py-4 px-5 font-bold text-slate-900">Over limit, blended high risk</td>
                    <td className="py-4 px-5 font-semibold text-rose-800 bg-rose-50/40">Sales manager then finance</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Action Bar matching Blueprint Page 18 */}
          <div className="flex items-center justify-start">
            <button
              onClick={handleSaveGovernance}
              className="px-6 py-2.5 rounded-lg text-xs font-bold bg-[#0176D3] hover:bg-blue-700 text-white transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" /> Save configuration
            </button>
          </div>

          {/* Gold/Yellow Governance Info Banner (1-to-1 Blueprint Page 18) */}
          <div className="p-4 rounded-xl bg-[#FFFBEB] border border-amber-300 text-amber-900 text-xs font-semibold space-y-1 shadow-2xs flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p>When a quote mixes categories with different ceilings, the system must compute a blended risk score and route to the highest required level.</p>
              <p>All approvals, rejections, and edits must be logged with user, timestamp, and reason.</p>
            </div>
          </div>

          {/* Warehouse Stock Matrix */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <WarehouseIcon className="w-4 h-4 text-[#0176D3]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Fulfillment Warehouses & Regional Inventory Pools
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {warehouses.length} Active Logistics Hubs
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {warehouses.map((w) => (
                <div key={w.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{w.name}</h3>
                      <p className="text-[11px] text-slate-500">{w.location} • Base Shipping: ₹{w.shippingCostBase.toLocaleString('en-IN')}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Online
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-600 block uppercase tracking-wider">Live Inventory Balances:</span>
                    <div className="space-y-1">
                      {inventory
                        .filter((inv) => inv.warehouseId === w.id)
                        .map((inv) => {
                          const prod = products.find((p) => p.id === inv.productId);
                          return (
                            <div key={inv.id} className="flex items-center justify-between text-xs font-mono">
                              <span className="text-slate-600">{prod?.name || inv.productId}:</span>
                              <span className="font-bold text-slate-900">{inv.quantityOnHand} units available</span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD USER */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Provision New System User</h3>
              <button onClick={() => setIsAddUserOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Sharma"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="asharma@company.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={userRoleSelect}
                  onChange={(e) => setUserRoleSelect(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none font-semibold"
                >
                  <option value="sales_rep">Sales Representative</option>
                  <option value="sales_manager">Sales Manager</option>
                  <option value="finance">Finance Approver</option>
                  <option value="customer">Customer Account</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Job Title / Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Enterprise AE"
                  value={userTitle}
                  onChange={(e) => setUserTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0176D3] text-white font-bold hover:bg-blue-700 shadow-xs"
                >
                  Save & Provision User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOMER */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Create Customer Account</h3>
              <button onClick={() => setIsAddCustomerOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Infosys Global Ltd"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Customer Tier</label>
                  <select
                    value={custTier}
                    onChange={(e) => setCustTier(e.target.value as CustomerTierType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none font-semibold"
                  >
                    <option value="Bronze">Bronze Tier</option>
                    <option value="Silver">Silver Tier</option>
                    <option value="Gold">Gold Tier</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={custCreditLimit}
                    onChange={(e) => setCustCreditLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  placeholder="procurement@company.com"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Industry Vertical</label>
                <input
                  type="text"
                  placeholder="Technology / Healthcare / Logistics"
                  value={custIndustry}
                  onChange={(e) => setCustIndustry(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0176D3] text-white font-bold hover:bg-blue-700 shadow-xs"
                >
                  Create & Generate Portal Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRODUCT */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Add Product to Master Catalog</h3>
              <button onClick={() => setIsAddProductOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    placeholder="HW-SERVER-99"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value as ProductCategoryType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none font-semibold capitalize"
                  >
                    <option value="hardware">Hardware</option>
                    <option value="services">Services</option>
                    <option value="subscription">Subscription</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enterprise AI Server Cluster"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">List Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={prodListPrice}
                    onChange={(e) => setProdListPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={prodCostPrice}
                    onChange={(e) => setProdCostPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRecurringCheck"
                    checked={prodIsRecurring}
                    onChange={(e) => setProdIsRecurring(e.target.checked)}
                    className="rounded border-slate-300 text-[#0176D3] focus:ring-[#0176D3]"
                  />
                  <label htmlFor="isRecurringCheck" className="font-bold text-slate-800 cursor-pointer">
                    Recurring SaaS Subscription Item
                  </label>
                </div>

                {prodIsRecurring && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Billing Frequency</label>
                    <select
                      value={prodBillingPeriod}
                      onChange={(e) => setProdBillingPeriod(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs font-semibold"
                    >
                      <option value="monthly">Monthly Billing</option>
                      <option value="quarterly">Quarterly Billing</option>
                      <option value="yearly">Yearly Billing</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0176D3] text-white font-bold hover:bg-blue-700 shadow-xs"
                >
                  Add Product to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
