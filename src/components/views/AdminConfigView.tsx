import React, { useState } from 'react';
import {
  Settings,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Building,
  Package,
  Layers,
  Save,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { CustomerTierType, ProductCategoryType } from '../../types';

export const AdminConfigView: React.FC = () => {
  const { configPolicy, updatePolicy, products, warehouses } = useAppStore();

  const [tierCeilings, setTierCeilings] = useState(configPolicy.tierCeilings);
  const [categoryCeilings, setCategoryCeilings] = useState(configPolicy.categoryCeilings);
  const [approvalThresholds, setApprovalThresholds] = useState(configPolicy.approvalThresholds);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    updatePolicy({
      tierCeilings,
      categoryCeilings,
      approvalThresholds,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Admin Governance & Business Rules Configuration
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              Live Engine Control
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic policy matrix driving real-time discount validation, multi-level approval routing, and freight split calculations.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-md text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/10"
        >
          <Save className="w-4 h-4" /> Save & Recompute Engine
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-500/60 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            Governance policies updated! All active quotations and risk scores have been recalculated live against the new rules.
          </span>
        </div>
      )}

      {/* 3 Configuration Matrices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Matrix 1: Customer Tier Ceilings */}
        <div className="surface-card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Building className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Customer Tier Discount Limits
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {(['Bronze', 'Silver', 'Gold'] as CustomerTierType[]).map((tier) => (
              <div key={tier} className="flex items-center justify-between">
                <span className="text-slate-300 font-medium">{tier} Tier Max:</span>
                <div className="flex items-center gap-1 font-mono">
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
                    className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-cyan-500 text-right"
                  />
                  <span className="text-slate-500">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Matrix 2: Category Limits */}
        <div className="surface-card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <Layers className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Product Category Ceilings
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {(['hardware', 'services', 'subscription'] as ProductCategoryType[]).map((cat) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-slate-300 font-medium capitalize">{cat} Ceiling:</span>
                <div className="flex items-center gap-1 font-mono">
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
                    className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-amber-500 text-right"
                  />
                  <span className="text-slate-500">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Matrix 3: Approval Routing Thresholds */}
        <div className="surface-card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Approval Risk Routing Triggers
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Low Risk Max (Auto):</span>
              <div className="flex items-center gap-1 font-mono">
                <input
                  type="number"
                  step="0.5"
                  value={approvalThresholds.lowRiskMax}
                  onChange={(e) =>
                    setApprovalThresholds({
                      ...approvalThresholds,
                      lowRiskMax: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-purple-500 text-right"
                />
                <span className="text-slate-500">pts</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Manager Ceiling (Med):</span>
              <div className="flex items-center gap-1 font-mono">
                <input
                  type="number"
                  step="0.5"
                  value={approvalThresholds.mediumRiskMax}
                  onChange={(e) =>
                    setApprovalThresholds({
                      ...approvalThresholds,
                      mediumRiskMax: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-purple-500 text-right"
                />
                <span className="text-slate-500">pts</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">Single Line Overage Max:</span>
              <div className="flex items-center gap-1 font-mono">
                <input
                  type="number"
                  step="0.5"
                  value={approvalThresholds.singleLineOverageMax}
                  onChange={(e) =>
                    setApprovalThresholds({
                      ...approvalThresholds,
                      singleLineOverageMax: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-purple-500 text-right"
                />
                <span className="text-slate-500">pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Master Catalog */}
      <div className="surface-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Configured Master Products & Deliverables Catalog ({products.length})
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-sans">
                <th className="pb-2">SKU</th>
                <th className="pb-2">Product Name</th>
                <th className="pb-2">Category</th>
                <th className="pb-2">List Price (₹)</th>
                <th className="pb-2">Cost Price (₹)</th>
                <th className="pb-2">Billing Model</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.map((p) => (
                <tr key={p.id} className="py-2.5">
                  <td className="py-2.5 text-cyan-400 font-bold">{p.sku}</td>
                  <td className="py-2.5 font-sans text-white font-medium">{p.name}</td>
                  <td className="py-2.5 capitalize text-slate-300">{p.categoryId}</td>
                  <td className="py-2.5 text-slate-200">₹{p.listPrice.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 text-slate-400">₹{p.costPrice.toLocaleString('en-IN')}</td>
                  <td className="py-2.5 font-sans text-slate-300">
                    {p.isRecurring ? `Recurring (${p.billingPeriod})` : 'One-Time Delivery'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
