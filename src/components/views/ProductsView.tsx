import React, { useState } from 'react';
import {
  Package,
  Plus,
  ArrowLeft,
  Save,
  Trash2,
  Sliders,
  CheckCircle2,
  Info,
  CreditCard,
  Layers,
  Search,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Product, ProductCategoryType, ProductVariant, ProductPricelist } from '../../types';

export const ProductsView: React.FC = () => {
  const { products, addProduct, updateProduct, setActiveView } = useAppStore();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Form State for Product Detail (Blueprint Page 17)
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    categoryId: 'hardware',
    listPrice: 0,
    costPrice: 0,
    unit: 'Each',
    taxPercent: 15,
    isRecurring: false,
    billingPeriod: 'monthly',
    quantityOnHand: 100,
    description: '',
    sku: '',
    variants: [],
    pricelists: [],
  });

  const handleOpenDetail = (prod: Product) => {
    setSelectedProduct(prod);
    setIsCreatingNew(false);
    setFormData({
      ...prod,
      variants: prod.variants ? [...prod.variants] : [],
      pricelists: prod.pricelists ? [...prod.pricelists] : [],
    });
  };

  const handleOpenNewProduct = () => {
    setSelectedProduct(null);
    setIsCreatingNew(true);
    const newSku = `HW-NEW-${Math.floor(100 + Math.random() * 900)}`;
    setFormData({
      name: '',
      categoryId: 'hardware',
      listPrice: 0,
      costPrice: 0,
      unit: 'Each',
      taxPercent: 15,
      isRecurring: false,
      billingPeriod: 'monthly',
      quantityOnHand: 50,
      description: '',
      sku: newSku,
      status: 'Active',
      variants: [
        { id: `v-${Date.now()}-1`, attribute: 'Color', values: 'Blue, Black', extraPrice: '0' },
      ],
      pricelists: [
        { id: `p-${Date.now()}-1`, tier: 'Bronze', currency: 'INR', priceRule: 'Price, no adjustment' },
      ],
    });
  };

  const handleBackToList = () => {
    setSelectedProduct(null);
    setIsCreatingNew(false);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;

    if (isCreatingNew) {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: formData.name || 'New Product',
        categoryId: formData.categoryId || 'hardware',
        listPrice: Number(formData.listPrice) || 0,
        costPrice: Number(formData.costPrice) || 0,
        isRecurring: !!formData.isRecurring,
        billingPeriod: formData.isRecurring ? formData.billingPeriod || 'monthly' : undefined,
        sku: formData.sku || `SKU-${Date.now()}`,
        unit: formData.unit || 'Each',
        taxPercent: Number(formData.taxPercent) || 0,
        status: formData.status || 'Active',
        quantityOnHand: Number(formData.quantityOnHand) || 0,
        description: formData.description || '',
        variants: formData.variants || [],
        pricelists: formData.pricelists || [],
      };
      addProduct(newProd);
      setSavedMessage(`Product "${newProd.name}" created successfully!`);
    } else if (selectedProduct) {
      const updatedProd: Product = {
        ...selectedProduct,
        name: formData.name || selectedProduct.name,
        categoryId: formData.categoryId || selectedProduct.categoryId,
        listPrice: Number(formData.listPrice) ?? selectedProduct.listPrice,
        costPrice: Number(formData.costPrice) ?? selectedProduct.costPrice,
        isRecurring: !!formData.isRecurring,
        billingPeriod: formData.isRecurring ? formData.billingPeriod || 'monthly' : undefined,
        sku: formData.sku || selectedProduct.sku,
        unit: formData.unit || selectedProduct.unit || 'Each',
        taxPercent: Number(formData.taxPercent) ?? selectedProduct.taxPercent ?? 15,
        status: formData.status || selectedProduct.status || 'Active',
        quantityOnHand: Number(formData.quantityOnHand) ?? selectedProduct.quantityOnHand ?? 0,
        description: formData.description || selectedProduct.description,
        variants: formData.variants || [],
        pricelists: formData.pricelists || [],
      };
      updateProduct(updatedProd);
      setSavedMessage(`Product "${updatedProd.name}" updated successfully!`);
    }

    setTimeout(() => setSavedMessage(null), 3500);
    handleBackToList();
  };

  // Variant Helpers
  const handleAddVariantRow = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        { id: `v-${Date.now()}`, attribute: '', values: '', extraPrice: '0' },
      ],
    }));
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: string) => {
    setFormData((prev) => {
      const nextVariants = [...(prev.variants || [])];
      nextVariants[index] = { ...nextVariants[index], [field]: value };
      return { ...prev, variants: nextVariants };
    });
  };

  const handleRemoveVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== index),
    }));
  };

  // Pricelist Helpers
  const handleAddPricelistRow = () => {
    setFormData((prev) => ({
      ...prev,
      pricelists: [
        ...(prev.pricelists || []),
        { id: `p-${Date.now()}`, tier: 'Gold', currency: 'INR', priceRule: 'Price minus 10 percent base' },
      ],
    }));
  };

  const handleUpdatePricelist = (index: number, field: keyof ProductPricelist, value: string) => {
    setFormData((prev) => {
      const nextLists = [...(prev.pricelists || [])];
      nextLists[index] = { ...nextLists[index], [field]: value };
      return { ...prev, pricelists: nextLists };
    });
  };

  const handleRemovePricelist = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      pricelists: (prev.pricelists || []).filter((_, i) => i !== index),
    }));
  };

  // Calculation for Catalog Summary Metrics
  const activeCount = products.filter((p) => p.status !== 'Archived').length;
  const archivedCount = products.filter((p) => p.status === 'Archived').length;
  const totalVariantsCount = products.reduce((acc, p) => acc + (p.variants?.length || 1), 0);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // -------------------------------------------------------------
  // BLUEPRINT PAGE 17: PRODUCT DETAILS PAGE VIEW
  // -------------------------------------------------------------
  if (selectedProduct || isCreatingNew) {
    return (
      <div className="space-y-6">
        {/* Page Top Header */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToList}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
              title="Back to Product Catalog"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Product and pricelist
              </h1>
              <p className="text-xs text-slate-500">
                {isCreatingNew
                  ? 'Define general information, variant attributes, and tier pricelist rules for new catalog product.'
                  : `Editing ${selectedProduct?.name} (${selectedProduct?.sku})`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToList}
              className="px-4 py-2 rounded-lg text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProduct}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0176D3] hover:bg-blue-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" /> Save Product
            </button>
          </div>
        </div>

        {/* Section 1: General Info (Card matching Blueprint Page 17) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-sm font-bold text-slate-900">General Info</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-xs">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="w-32 font-bold text-slate-700">Product name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laptop Pro 14"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none text-slate-900 font-semibold"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="w-32 font-bold text-slate-700">Category</label>
                <select
                  value={formData.categoryId || 'hardware'}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value as ProductCategoryType })
                  }
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none text-slate-900 font-semibold capitalize"
                >
                  <option value="hardware">Hardware</option>
                  <option value="services">Services</option>
                  <option value="subscription">Subscription</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="w-32 font-bold text-slate-700">Price (₹)</label>
                <div className="flex-1 relative flex items-center">
                  <span className="absolute left-3 text-slate-500 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="120000"
                    value={formData.listPrice || 0}
                    onChange={(e) => setFormData({ ...formData, listPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-7 pr-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="w-32 font-bold text-slate-700">Unit</label>
                <input
                  type="text"
                  placeholder="Each / Recurring / Hour"
                  value={formData.unit || ''}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none text-slate-900 font-semibold"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                <label className="w-32 font-bold text-slate-700 pt-2">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of product features and specs..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none text-slate-900 text-xs"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="w-36 font-bold text-slate-700">Tax %</label>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="15"
                    value={formData.taxPercent || 0}
                    onChange={(e) => setFormData({ ...formData, taxPercent: parseFloat(e.target.value) || 0 })}
                    className="w-28 px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-semibold">% tax rate</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="w-36 font-bold text-slate-700">Subscription</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isRecurring: true })}
                    className={`px-4 py-1.5 rounded-lg font-bold text-xs border transition cursor-pointer ${
                      formData.isRecurring
                        ? 'bg-[#0176D3] text-white border-[#0176D3]'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isRecurring: false })}
                    className={`px-4 py-1.5 rounded-lg font-bold text-xs border transition cursor-pointer ${
                      !formData.isRecurring
                        ? 'bg-slate-800 text-white border-slate-800'
                        : 'bg-slate-100 text-slate-600 border-slate-300'
                    }`}
                  >
                    NO
                  </button>
                  <span className="text-[11px] text-slate-500 italic">
                    If subscription yes then recurring will be visible
                  </span>
                </div>
              </div>

              {formData.isRecurring && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-blue-50/70 p-3 rounded-lg border border-blue-200">
                  <label className="w-36 font-bold text-[#0176D3]">Recurring Schedule</label>
                  <select
                    value={formData.billingPeriod || 'monthly'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billingPeriod: e.target.value as 'monthly' | 'quarterly' | 'yearly',
                      })
                    }
                    className="flex-1 px-3 py-2 rounded-lg border border-blue-300 focus:border-[#0176D3] outline-none text-slate-900 font-bold bg-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <label className="w-36 font-bold text-slate-700">Quantity on hand</label>
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    placeholder="100"
                    value={formData.quantityOnHand || 0}
                    onChange={(e) =>
                      setFormData({ ...formData, quantityOnHand: parseInt(e.target.value) || 0 })
                    }
                    className="w-32 px-3 py-2 rounded-lg border border-slate-300 focus:border-[#0176D3] focus:ring-1 focus:ring-[#0176D3] outline-none font-bold text-slate-900"
                  />
                  <span className="text-slate-500 text-[11px] italic">(Integer field)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Product Variants (Table matching Blueprint Page 17) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Product Variants</h2>
              <p className="text-xs text-slate-500">Configure size, color, RAM, manufacturer and pricing additions.</p>
            </div>
            <button
              type="button"
              onClick={handleAddVariantRow}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Attribute
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-1/4">Attribute</th>
                  <th className="py-3 px-4 w-1/2">Values</th>
                  <th className="py-3 px-4 w-1/4">Extra price (₹)</th>
                  <th className="py-3 px-4 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(formData.variants || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400 italic">
                      No variant attributes defined for this product. Click "Add Attribute" above.
                    </td>
                  </tr>
                ) : (
                  (formData.variants || []).map((v, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          placeholder="e.g. Color / RAM"
                          value={v.attribute}
                          onChange={(e) => handleUpdateVariant(idx, 'attribute', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-[#0176D3] outline-none font-semibold text-slate-900"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          placeholder="e.g. Blue, Black or 4GB, 8GB"
                          value={v.values}
                          onChange={(e) => handleUpdateVariant(idx, 'values', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-[#0176D3] outline-none font-medium text-slate-800"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          placeholder="0 or +₹2,500"
                          value={v.extraPrice}
                          onChange={(e) => handleUpdateVariant(idx, 'extraPrice', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-[#0176D3] outline-none font-bold text-slate-900"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Pricelists (Table matching Blueprint Page 17) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Pricelists</h2>
              <p className="text-xs text-slate-500">Tier discount overrides and multi-currency pricing rules.</p>
            </div>
            <button
              type="button"
              onClick={handleAddPricelistRow}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Price Rule
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-1/4">Tier</th>
                  <th className="py-3 px-4 w-1/4">Currency</th>
                  <th className="py-3 px-4 w-1/2">Price Rule</th>
                  <th className="py-3 px-4 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {(formData.pricelists || []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400 italic">
                      No customer tier price rules configured.
                    </td>
                  </tr>
                ) : (
                  (formData.pricelists || []).map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-4">
                        <select
                          value={p.tier}
                          onChange={(e) => handleUpdatePricelist(idx, 'tier', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-[#0176D3] outline-none font-bold text-slate-900"
                        >
                          <option value="Bronze">Bronze</option>
                          <option value="Silver">Silver</option>
                          <option value="Gold">Gold</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          placeholder="INR / USD / EUR"
                          value={p.currency}
                          onChange={(e) => handleUpdatePricelist(idx, 'currency', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-[#0176D3] outline-none font-semibold text-slate-800 uppercase"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          placeholder="e.g. Price minus 10 percent base"
                          value={p.priceRule}
                          onChange={(e) => handleUpdatePricelist(idx, 'priceRule', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:border-[#0176D3] outline-none font-medium text-slate-800"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemovePricelist(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gold/Yellow Governance Info Banner (1-to-1 Blueprint Page 17) */}
        <div className="p-4 rounded-xl bg-[#FFFBEB] border border-amber-300 text-amber-900 text-xs font-semibold space-y-1 shadow-2xs flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-950">Product details should be filled.</p>
            <p className="text-amber-850">Recurring order with this product will be invoiced at the beginning of the period.</p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // BLUEPRINT PAGE 16: PRODUCT CATALOG LIST VIEW
  // -------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header Bar matching Blueprint Page 16 */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Product catalog</h1>
          <p className="text-xs text-slate-500">Every product, variant and price list in one place.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenNewProduct}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0176D3] hover:bg-blue-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" /> + New Product
          </button>
          <button
            onClick={() => setActiveView('admin_config')}
            className="px-4 py-2 rounded-lg text-xs font-bold border border-slate-300 text-slate-800 hover:bg-slate-100 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-slate-600" /> Manage Price fields
          </button>
        </div>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* KPI Cards matching Blueprint Page 16 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-600 block">Total Products</span>
          <div className="text-2xl font-extrabold text-slate-900">{products.length} Products</div>
          <p className="text-xs text-slate-500">{activeCount} active, {archivedCount} archived</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-600 block">Pricelists</span>
          <div className="text-2xl font-extrabold text-slate-900">3 Tiers</div>
          <p className="text-xs text-slate-500">Bronze, Silver & Gold • INR base</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-600 block">Variants</span>
          <div className="text-2xl font-extrabold text-slate-900">{totalVariantsCount} SKUs</div>
          <p className="text-xs text-slate-500">Configurable attributes across catalog</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Section Pill / Header Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg text-xs font-extrabold bg-[#0176D3] text-white shadow-2xs">
              Products
            </span>
            <span className="text-xs font-bold text-slate-600">
              ({filteredProducts.length} Items Listed)
            </span>
          </div>

          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search products or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:border-[#0176D3] outline-none"
            />
          </div>
        </div>

        {/* Catalog Table matching Blueprint Page 16 */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Product</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Variants</th>
                <th className="py-3.5 px-5">Price (₹)</th>
                <th className="py-3.5 px-5">Unit</th>
                <th className="py-3.5 px-5">Tax</th>
                <th className="py-3.5 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProducts.map((prod) => {
                const variantText =
                  prod.variants && prod.variants.length > 0
                    ? `${prod.variants.length}(${prod.variants[0].attribute.toLowerCase()})`
                    : '-';

                const formattedPrice = prod.isRecurring
                  ? `₹${prod.listPrice.toLocaleString('en-IN')}/month`
                  : `₹${prod.listPrice.toLocaleString('en-IN')}`;

                return (
                  <tr
                    key={prod.id}
                    onClick={() => handleOpenDetail(prod)}
                    className="hover:bg-blue-50/50 cursor-pointer transition group"
                  >
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 group-hover:text-[#0176D3] transition">
                        {prod.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">{prod.sku}</div>
                    </td>
                    <td className="py-4 px-5 font-semibold text-slate-700 capitalize">
                      {prod.categoryId}
                    </td>
                    <td className="py-4 px-5 font-medium text-slate-600">{variantText}</td>
                    <td className="py-4 px-5 font-extrabold text-slate-900">{formattedPrice}</td>
                    <td className="py-4 px-5 font-medium text-slate-700">
                      {prod.unit || (prod.isRecurring ? 'Recurring' : 'Each')}
                    </td>
                    <td className="py-4 px-5 font-bold text-slate-800">
                      {prod.taxPercent ?? 15}%
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {prod.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gold/Yellow Governance Info Banner (1-to-1 Blueprint Page 16) */}
      <div className="p-4 rounded-xl bg-[#FFFBEB] border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-3 shadow-2xs">
        <Info className="w-5 h-5 text-amber-700 shrink-0" />
        <span>Click a product row to open general info, variants and tier/currency price lists.</span>
      </div>
    </div>
  );
};
