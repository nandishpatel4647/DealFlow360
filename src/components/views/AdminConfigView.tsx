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
  UserCheck,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { CustomerTierType, ProductCategoryType, UserRole, Company, Product, Warehouse } from '../../types';
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
    addWarehouse,
    updateWarehouse,
    updateInventoryStock,
    loginAsCustomer,
    setActiveView,
    customerAssignments,
    repManagerAssignments,
    assignCustomerToRep,
    assignRepToManager,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'users' | 'customers' | 'products' | 'warehouses' | 'governance' | 'assignments'>('users');

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
  const [isAddWarehouseOpen, setIsAddWarehouseOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [editingStock, setEditingStock] = useState<{
    warehouseId: string;
    warehouseName: string;
    productId: string;
    productName: string;
    currentStock: number;
  } | null>(null);
  const [newStockVal, setNewStockVal] = useState<number>(0);

  // Warehouse Form State
  const [whName, setWhName] = useState('');
  const [whLocation, setWhLocation] = useState('');
  const [whFreightBase, setWhFreightBase] = useState(1500);
  const [whWeightMult, setWhWeightMult] = useState(250);

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
          {activeTab === 'warehouses' && (
            <button
              onClick={() => setIsAddWarehouseOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0176D3] hover:bg-blue-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <WarehouseIcon className="w-4 h-4" /> + Add New Warehouse
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
      <div className="border-b border-slate-200 flex items-center gap-2 bg-white px-4 pt-3 rounded-t-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-[#0176D3] text-[#0176D3]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" /> Users & Roles ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'customers'
              ? 'border-[#0176D3] text-[#0176D3]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" /> Customer Accounts ({companies.length})
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-[#0176D3] text-[#0176D3]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" /> Master Products ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('warehouses')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'warehouses'
              ? 'border-[#0176D3] text-[#0176D3]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <WarehouseIcon className="w-4 h-4" /> Warehouses & Live Stock ({warehouses.length})
        </button>

        <button
          onClick={() => setActiveTab('governance')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'governance'
              ? 'border-[#0176D3] text-[#0176D3]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> CPQ Governance Engine
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'assignments'
              ? 'border-[#0176D3] text-[#0176D3]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" /> Team & Account Assignments
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

      {/* TAB 4: WAREHOUSES & LIVE STOCK MANAGEMENT */}
      {activeTab === 'warehouses' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <WarehouseIcon className="w-5 h-5 text-[#0176D3]" />
                Logistics Hubs & Real-World Inventory Balances
              </h2>
              <p className="text-xs text-slate-500">
                Manage fulfillment warehouse locations, shipping rates, and restock live hardware inventory as new stock arrives.
              </p>
            </div>

            <button
              onClick={() => setIsAddWarehouseOpen(true)}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0176D3] hover:bg-blue-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" /> + Add New Warehouse
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {warehouses.map((w) => (
              <div key={w.id} className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#0176D3]" />
                      {w.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Location: <strong className="text-slate-800">{w.location}</strong> • Freight Base: <strong className="text-slate-800">₹{w.shippingCostBase.toLocaleString('en-IN')}</strong> • Per Unit: <strong className="text-slate-800">₹{w.weightMultiplier}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingWarehouse(w)}
                    className="text-xs font-bold px-3 py-1.5 rounded-md bg-white hover:bg-blue-50 text-[#0176D3] border border-blue-200 transition cursor-pointer shadow-2xs"
                  >
                    [Edit Warehouse Details]
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    LIVE INVENTORY STOCK LEVELS:
                  </span>
                  <div className="space-y-2">
                    {products.map((prod) => {
                      const inv = inventory.find((i) => i.warehouseId === w.id && (i.productId === prod.id || i.productId === prod.sku));
                      const isNonPhysical = prod.categoryId === 'services' || prod.categoryId === 'subscription' || prod.isRecurring || prod.name.toLowerCase().includes('service') || prod.name.toLowerCase().includes('plan');
                      const currentStock = inv ? inv.quantityOnHand : 0;

                      return (
                        <div key={prod.id} className="flex items-center justify-between text-xs font-mono bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                          <div>
                            <span className="text-slate-900 font-bold block">{prod.name}</span>
                            <span className="text-[10px] text-slate-500 font-sans capitalize">{prod.categoryId} • SKU: {prod.sku}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            {isNonPhysical ? (
                              <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-indigo-50 text-indigo-800 border border-indigo-200 font-sans">
                                ✓ Digital / Service — Auto-Activated
                              </span>
                            ) : (
                              <>
                                <span className={`font-extrabold text-sm font-mono ${currentStock > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                  {currentStock} units
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingStock({
                                      warehouseId: w.id,
                                      warehouseName: w.name,
                                      productId: prod.id,
                                      productName: prod.name,
                                      currentStock,
                                    });
                                    setNewStockVal(currentStock);
                                  }}
                                  className="px-2.5 py-1 rounded text-xs font-bold font-sans bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer shadow-2xs"
                                >
                                  [+ Restock Stock]
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: GOVERNANCE & APPROVAL CHAINS (Blueprint Page 18) */}
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
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <WarehouseIcon className="w-4 h-4 text-[#0176D3]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Fulfillment Warehouses & Live Stock Management
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {warehouses.length} Active Logistics Hubs
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {warehouses.map((w) => (
                <div key={w.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{w.name}</h3>
                      <p className="text-[11px] text-slate-500">{w.location} • Base Shipping: ₹{w.shippingCostBase.toLocaleString('en-IN')}</p>
                    </div>
                    <button
                      onClick={() => {
                        const newName = prompt('Edit Warehouse Name:', w.name);
                        const newLocation = prompt('Edit Location:', w.location);
                        const newBase = prompt('Base Shipping Cost (₹):', String(w.shippingCostBase));
                        if (newName && newLocation && newBase) {
                          updateWarehouse({
                            ...w,
                            name: newName,
                            location: newLocation,
                            shippingCostBase: Number(newBase),
                          });
                        }
                      }}
                      className="text-[10px] font-bold px-2 py-1 rounded bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 transition cursor-pointer"
                    >
                      [Edit Warehouse]
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-600 block uppercase tracking-wider">Live Inventory Balances:</span>
                    <div className="space-y-2">
                      {products.map((prod) => {
                        const inv = inventory.find((i) => i.warehouseId === w.id && (i.productId === prod.id || i.productId === prod.sku));
                        const currentStock = inv ? inv.quantityOnHand : 100;
                        return (
                          <div key={prod.id} className="flex items-center justify-between text-xs font-mono bg-white p-2 rounded border border-slate-200">
                            <div>
                              <span className="text-slate-900 font-bold block">{prod.name}</span>
                              <span className="text-[10px] text-slate-500 font-sans capitalize">{prod.categoryId}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-blue-700 text-xs">{currentStock} units</span>
                              <button
                                onClick={() => {
                                  const val = prompt(`Restock ${prod.name} at ${w.name}.\nEnter new available stock count:`, String(currentStock));
                                  if (val !== null && !isNaN(Number(val))) {
                                    updateInventoryStock(w.id, prod.id, Number(val));
                                  }
                                }}
                                className="px-2 py-0.5 rounded text-[10px] font-bold font-sans bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 transition cursor-pointer"
                              >
                                [+ Restock]
                              </button>
                            </div>
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

      {/* TAB 6: TEAM & ACCOUNT ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 space-y-8 shadow-2xs">
          {/* Section 1: Customer -> Sales Rep Assignment */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#0176D3]" />
                  Customer Account → Sales Representative Matrix
                </h2>
                <p className="text-xs text-slate-500">
                  Assign enterprise accounts to sales reps. New quotations, commercial negotiations, and portal revisions will route to the assigned representative.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {companies.length} Customer Accounts
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-3">Customer Account</th>
                    <th className="p-3">Tier & Industry</th>
                    <th className="p-3">Credit Limit</th>
                    <th className="p-3">Assigned Sales Rep</th>
                    <th className="p-3 text-right">Routing Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {companies.map((comp) => {
                    const currentRepEmail = customerAssignments[comp.id] || 'rep@dealflow360.com';
                    const repUser = users.find((u) => u.email === currentRepEmail);
                    const salesReps = users.filter((u) => u.role === 'sales_rep' || u.role === 'admin');

                    return (
                      <tr key={comp.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{comp.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{comp.contactEmail}</div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            comp.tierId === 'Gold' ? 'bg-amber-100 text-amber-800' : comp.tierId === 'Silver' ? 'bg-slate-200 text-slate-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {comp.tierId}
                          </span>
                          <span className="text-slate-500 ml-1.5 text-[11px]">{comp.industry}</span>
                        </td>
                        <td className="p-3 font-mono font-semibold text-slate-700">
                          ₹{comp.creditLimit.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3">
                          <select
                            value={currentRepEmail}
                            onChange={(e) => assignCustomerToRep(comp.id, e.target.value)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white text-slate-900 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none cursor-pointer"
                          >
                            {salesReps.map((rep) => (
                              <option key={rep.email} value={rep.email}>
                                {rep.name} ({rep.email})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3 h-3" /> Assigned to {repUser?.name?.split(' ')[0] || 'Rep'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Sales Rep -> Manager Hierarchy */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0176D3]" />
                  Sales Team Reporting Hierarchy Matrix
                </h2>
                <p className="text-xs text-slate-500">
                  Configure reporting managers for each sales representative. Deal margin approvals and discount exception escalations route directly to the designated manager.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                Hierarchy Mapping
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-3">Sales Representative</th>
                    <th className="p-3">Title / Designation</th>
                    <th className="p-3">Reporting Sales Manager</th>
                    <th className="p-3 text-right">Escalation Path</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users
                    .filter((u) => u.role === 'sales_rep')
                    .map((rep) => {
                      const currentManagerEmail = repManagerAssignments[rep.email] || 'manager@dealflow360.com';
                      const mgrUser = users.find((u) => u.email === currentManagerEmail);
                      const managers = users.filter((u) => u.role === 'sales_manager' || u.role === 'admin');

                      return (
                        <tr key={rep.email} className="hover:bg-slate-50/70 transition">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{rep.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{rep.email}</div>
                          </td>
                          <td className="p-3 text-slate-600 font-medium">
                            {rep.title || 'Sales Specialist'}
                          </td>
                          <td className="p-3">
                            <select
                              value={currentManagerEmail}
                              onChange={(e) => assignRepToManager(rep.email, e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold bg-white text-slate-900 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none cursor-pointer"
                            >
                              {managers.map((mgr) => (
                                <option key={mgr.email} value={mgr.email}>
                                  {mgr.name} ({mgr.title || 'Sales Manager'})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3 text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                              Direct Report → {mgrUser?.name || 'M. Shah'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
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

      {/* MODAL: ADD WAREHOUSE */}
      {isAddWarehouseOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <WarehouseIcon className="w-5 h-5 text-[#0176D3]" /> Provision New Fulfillment Warehouse
              </h3>
              <button onClick={() => setIsAddWarehouseOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!whName.trim() || !whLocation.trim()) return;
                addWarehouse({
                  id: `wh-${Date.now()}`,
                  name: whName.trim(),
                  location: whLocation.trim(),
                  shippingCostBase: whFreightBase,
                  weightMultiplier: whWeightMult,
                });
                setIsAddWarehouseOpen(false);
                setWhName('');
                setWhLocation('');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Warehouse Hub Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pune Regional Depot"
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">City / Location *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chakan Industrial Area, Pune, Maharashtra"
                  value={whLocation}
                  onChange={(e) => setWhLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Freight (₹)</label>
                  <input
                    type="number"
                    value={whFreightBase}
                    onChange={(e) => setWhFreightBase(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Per-Unit Freight (₹)</label>
                  <input
                    type="number"
                    value={whWeightMult}
                    onChange={(e) => setWhWeightMult(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddWarehouseOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0176D3] text-white font-bold hover:bg-blue-700 shadow-xs cursor-pointer"
                >
                  Save Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT WAREHOUSE */}
      {editingWarehouse && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <WarehouseIcon className="w-5 h-5 text-[#0176D3]" /> Edit Warehouse Details
              </h3>
              <button onClick={() => setEditingWarehouse(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateWarehouse(editingWarehouse);
                setEditingWarehouse(null);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Warehouse Hub Name</label>
                <input
                  type="text"
                  required
                  value={editingWarehouse.name}
                  onChange={(e) => setEditingWarehouse({ ...editingWarehouse, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">City / Location</label>
                <input
                  type="text"
                  required
                  value={editingWarehouse.location}
                  onChange={(e) => setEditingWarehouse({ ...editingWarehouse, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Freight (₹)</label>
                  <input
                    type="number"
                    value={editingWarehouse.shippingCostBase}
                    onChange={(e) => setEditingWarehouse({ ...editingWarehouse, shippingCostBase: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] outline-none font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Per-Unit Rate (₹)</label>
                  <input
                    type="number"
                    value={editingWarehouse.weightMultiplier}
                    onChange={(e) => setEditingWarehouse({ ...editingWarehouse, weightMultiplier: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] outline-none font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingWarehouse(null)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#0176D3] text-white font-bold hover:bg-blue-700 shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESTOCK / UPDATE INVENTORY STOCK */}
      {editingStock && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-600" /> Restock Warehouse Stock
              </h3>
              <button onClick={() => setEditingStock(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 font-sans">
                <span className="text-slate-500 font-medium block">Product: <strong className="text-slate-900 font-bold">{editingStock.productName}</strong></span>
                <span className="text-slate-500 font-medium block">Logistics Hub: <strong className="text-slate-900 font-bold">{editingStock.warehouseName}</strong></span>
                <span className="text-slate-500 font-medium block">Current Available Units: <strong className="text-blue-700 font-bold font-mono">{editingStock.currentStock} units</strong></span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">New Total Available Stock Count</label>
                <input
                  type="number"
                  min="0"
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] outline-none text-base font-mono font-bold text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Quick Restock Shortcuts:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNewStockVal((prev) => prev + 10)}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 border border-slate-300 transition cursor-pointer"
                  >
                    +10 Units
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStockVal((prev) => prev + 25)}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 border border-slate-300 transition cursor-pointer"
                  >
                    +25 Units
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStockVal((prev) => prev + 50)}
                    className="px-2.5 py-1 rounded bg-[#0176D3]/10 hover:bg-[#0176D3]/20 font-bold text-[#0176D3] border border-[#0176D3]/30 transition cursor-pointer"
                  >
                    +50 Units
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStockVal((prev) => prev + 100)}
                    className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 font-bold text-emerald-800 border border-emerald-300 transition cursor-pointer"
                  >
                    +100 Units
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingStock(null)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateInventoryStock(editingStock.warehouseId, editingStock.productId, newStockVal);
                    setEditingStock(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Update Inventory Stock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
