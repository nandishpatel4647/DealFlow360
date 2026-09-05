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
    updatePolicy({ tierCeilings, categoryCeilings, approvalThresholds });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
            Admin Configuration
            <span
              className="text-[11px] font-medium px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--accent-primary-soft)', color: 'var(--accent-primary)' }}
            >
              Live Engine Control
            </span>
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Policy matrix driving discount validation, approval routing, and freight calculations.
          </p>
        </div>

        <button onClick={handleSave} className="btn-primary">
          <Save className="w-4 h-4" /> Save & Recompute
        </button>
      </div>

      {savedSuccess && (
        <div
          className="p-3.5 rounded-lg text-xs flex items-center gap-2 animate-slide-down"
          style={{
            backgroundColor: 'var(--success-soft)',
            border: '1px solid var(--success-border)',
            color: 'var(--success)',
          }}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Policies updated! All quotations recalculated against new rules.</span>
        </div>
      )}

      {/* 3 Config Matrices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier Ceilings */}
        <div className="surface-card p-5 space-y-4">
          <div
            className="flex items-center gap-2 pb-2"
            style={{ borderBottom: '1px solid var(--border-default)' }}
          >
            <Building className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="section-heading">Tier Discount Limits</span>
          </div>

          <div className="space-y-3 text-[13px]">
            {(['Bronze', 'Silver', 'Gold'] as CustomerTierType[]).map((tier) => (
              <div key={tier} className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)] font-medium">{tier} Max:</span>
                <div className="flex items-center gap-1 font-mono">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={tierCeilings[tier]}
                    onChange={(e) =>
                      setTierCeilings({ ...tierCeilings, [tier]: parseFloat(e.target.value) || 0 })
                    }
                    className="input-field !w-16 !py-1 !text-xs !text-right font-mono"
                  />
                  <span className="text-[var(--text-muted)]">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Ceilings */}
        <div className="surface-card p-5 space-y-4">
          <div
            className="flex items-center gap-2 pb-2"
            style={{ borderBottom: '1px solid var(--border-default)' }}
          >
            <Layers className="w-4 h-4 text-[var(--warning)]" />
            <span className="section-heading">Category Ceilings</span>
          </div>

          <div className="space-y-3 text-[13px]">
            {(['hardware', 'services', 'subscription'] as ProductCategoryType[]).map((cat) => (
              <div key={cat} className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)] font-medium capitalize">{cat}:</span>
                <div className="flex items-center gap-1 font-mono">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={categoryCeilings[cat]}
                    onChange={(e) =>
                      setCategoryCeilings({ ...categoryCeilings, [cat]: parseFloat(e.target.value) || 0 })
                    }
                    className="input-field !w-16 !py-1 !text-xs !text-right font-mono"
                  />
                  <span className="text-[var(--text-muted)]">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Approval Thresholds */}
        <div className="surface-card p-5 space-y-4">
          <div
            className="flex items-center gap-2 pb-2"
            style={{ borderBottom: '1px solid var(--border-default)' }}
          >
            <ShieldAlert className="w-4 h-4 text-[var(--info)]" />
            <span className="section-heading">Approval Routing</span>
          </div>

          <div className="space-y-3 text-[13px]">
            {[
              { label: 'Low Risk Max (Auto):', key: 'lowRiskMax' as const, unit: 'pts' },
              { label: 'Manager Ceiling:', key: 'mediumRiskMax' as const, unit: 'pts' },
              { label: 'Line Overage Max:', key: 'singleLineOverageMax' as const, unit: 'pts' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)] font-medium">{item.label}</span>
                <div className="flex items-center gap-1 font-mono">
                  <input
                    type="number"
                    step="0.5"
                    value={approvalThresholds[item.key]}
                    onChange={(e) =>
                      setApprovalThresholds({
                        ...approvalThresholds,
                        [item.key]: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="input-field !w-16 !py-1 !text-xs !text-right font-mono"
                  />
                  <span className="text-[var(--text-muted)]">{item.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Catalog */}
      <div className="surface-card overflow-hidden">
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">
              Product Catalog ({products.length})
            </span>
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product</th>
              <th>Category</th>
              <th>List Price</th>
              <th>Cost Price</th>
              <th>Billing</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="font-mono font-bold text-[var(--accent-primary)]">{p.sku}</td>
                <td className="text-[var(--text-primary)] font-medium">{p.name}</td>
                <td className="capitalize text-[var(--text-secondary)]">{p.categoryId}</td>
                <td className="font-mono text-[var(--text-secondary)]">₹{p.listPrice.toLocaleString('en-IN')}</td>
                <td className="font-mono text-[var(--text-muted)]">₹{p.costPrice.toLocaleString('en-IN')}</td>
                <td className="text-[var(--text-secondary)]">
                  {p.isRecurring ? `Recurring (${p.billingPeriod})` : 'One-Time'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
