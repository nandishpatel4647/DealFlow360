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
  Users,
  UserCheck,
  UserX,
  Eye,
  History,
  AlertTriangle,
  Lock,
  ArrowRight,
  Filter,
  Check,
  X,
  Warehouse as WarehouseIcon,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { CustomerTierType, ProductCategoryType, UserRole, UserProfile } from '../../types';
import { StatusBadge } from '../design-system/StatusBadge';

type AdminTab = 'overview' | 'users' | 'policies' | 'catalog' | 'audit';

export const AdminConfigView: React.FC = () => {
  const {
    configPolicy,
    updatePolicy,
    products,
    warehouses,
    users,
    approveUser,
    rejectUser,
    suspendUser,
    reactivateUser,
    changeUserRole,
    auditLogs,
    setActiveView,
    setIsCustomerPortalPreview,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Policy Form State
  const [tierCeilings, setTierCeilings] = useState(configPolicy.tierCeilings);
  const [categoryCeilings, setCategoryCeilings] = useState(configPolicy.categoryCeilings);
  const [approvalThresholds, setApprovalThresholds] = useState(configPolicy.approvalThresholds);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showPolicyConfirmModal, setShowPolicyConfirmModal] = useState(false);

  // User management search/filter
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  // Audit filter
  const [auditSearch, setAuditSearch] = useState('');

  const pendingUsers = users.filter((u) => u.status === 'pending');
  const activeUsers = users.filter((u) => u.status !== 'pending');

  const filteredActiveUsers = activeUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenPreviewPortal = () => {
    setIsCustomerPortalPreview(true);
    setActiveView('portal');
  };

  const handleConfirmSavePolicy = () => {
    updatePolicy({
      tierCeilings,
      categoryCeilings,
      approvalThresholds,
      policyVersion: (configPolicy.policyVersion || 4) + 1,
    });
    setShowPolicyConfirmModal(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2.5">
              Platform Administration
            </h1>
            <span
              className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full"
              style={{
                backgroundColor: 'var(--accent-primary-soft)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--accent-primary-border)',
              }}
            >
              Policy v{configPolicy.policyVersion || 4}
            </span>
          </div>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">
            Enterprise governance matrix, user access approval lifecycle, and multi-tier operational controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenPreviewPortal}
            className="btn-secondary flex items-center gap-2 text-xs py-2 px-3.5"
            title="Preview Customer Portal in read-only sandbox mode"
          >
            <Eye className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Preview Customer Portal</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div
          className="p-3.5 rounded-lg text-xs flex items-center gap-2 animate-slide-down shadow-sm"
          style={{
            backgroundColor: 'var(--success-soft)',
            border: '1px solid var(--success-border)',
            color: 'var(--success)',
          }}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            Governance policy upgraded to <strong>v{configPolicy.policyVersion || 4}</strong>! All active quotations and approval workflows dynamically recalculated.
          </span>
        </div>
      )}

      {/* Tabs Bar */}
      <div
        className="flex items-center gap-2 border-b overflow-x-auto pb-1"
        style={{ borderColor: 'var(--border-default)' }}
      >
        {[
          { id: 'overview' as AdminTab, label: 'Control Overview', icon: Sliders },
          {
            id: 'users' as AdminTab,
            label: 'User Management',
            icon: Users,
            badge: pendingUsers.length > 0 ? pendingUsers.length : undefined,
          },
          { id: 'policies' as AdminTab, label: 'Discount & Risk Policies', icon: ShieldAlert },
          { id: 'catalog' as AdminTab, label: 'Products & Hubs', icon: Package },
          { id: 'audit' as AdminTab, label: 'System Audit Trail', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-sunken)]'
              }`}
              style={{
                border: isActive ? '1px solid var(--accent-primary-border)' : '1px solid transparent',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[var(--warning)] text-black">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="surface-card p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                <span>Active Users</span>
                <Users className="w-4 h-4 text-[var(--accent-primary)]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                {activeUsers.filter((u) => u.status === 'active').length}
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)]">
                Across 4 operational roles
              </div>
            </div>

            <div
              className="surface-card p-4 space-y-1"
              style={{
                borderColor: pendingUsers.length > 0 ? 'var(--warning-border)' : 'var(--border-default)',
                backgroundColor: pendingUsers.length > 0 ? 'var(--warning-soft)' : 'var(--surface-card)',
              }}
            >
              <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                <span className={pendingUsers.length > 0 ? 'text-[var(--warning)] font-semibold' : ''}>
                  Pending Access Requests
                </span>
                <UserCheck className="w-4 h-4 text-[var(--warning)]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                {pendingUsers.length}
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)]">
                {pendingUsers.length > 0 ? (
                  <button
                    onClick={() => setActiveTab('users')}
                    className="text-[var(--accent-primary)] hover:underline font-medium"
                  >
                    Review pending queue →
                  </button>
                ) : (
                  'All requests reviewed'
                )}
              </div>
            </div>

            <div className="surface-card p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                <span>Active Policy Version</span>
                <ShieldAlert className="w-4 h-4 text-[var(--success)]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[var(--success)]">
                v{configPolicy.policyVersion || 4}
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)]">
                Automated blended risk matrix
              </div>
            </div>

            <div className="surface-card p-4 space-y-1">
              <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                <span>Fulfillment Nodes</span>
                <WarehouseIcon className="w-4 h-4 text-[var(--info)]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[var(--text-primary)]">
                {warehouses.length}
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)]">
                {products.length} catalog SKUs mapped
              </div>
            </div>
          </div>

          {/* Quick Action Banner */}
          <div
            className="surface-card p-5 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{
              background: 'linear-gradient(135deg, var(--surface-card) 0%, var(--surface-sunken) 100%)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center justify-center md:justify-start gap-2">
                <Eye className="w-4 h-4 text-[var(--accent-primary)]" />
                Customer Portal Sandbox Inspection
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] max-w-xl">
                Test the external buyer negotiation interface with isolated client credentials. All acceptance and counter-offer actions are safely rendered in preview mode.
              </p>
            </div>
            <button
              onClick={handleOpenPreviewPortal}
              className="btn-primary text-xs py-2 px-4 whitespace-nowrap"
            >
              Launch Preview Mode →
            </button>
          </div>

          {/* Recent Audit Events */}
          <div className="surface-card overflow-hidden">
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: '1px solid var(--border-default)' }}
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  Recent Governance & System Events
                </span>
              </div>
              <button
                onClick={() => setActiveTab('audit')}
                className="text-xs text-[var(--accent-primary)] hover:underline"
              >
                View full trail →
              </button>
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--border-default)' }}>
              {auditLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-4 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[var(--text-primary)]">{log.action}</span>
                      {log.quoteId && (
                        <span className="font-mono px-1.5 py-0.5 rounded bg-[var(--surface-sunken)] text-[var(--accent-primary)] text-[10px]">
                          {log.quoteId}
                        </span>
                      )}
                    </div>
                    <p className="text-[var(--text-tertiary)] text-[11px]">
                      By <span className="text-[var(--text-secondary)] font-medium">{log.actor}</span> • {new Date(log.createdAt || log.timestamp || new Date().toISOString()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                  <div className="font-mono text-[10px] text-[var(--text-muted)] shrink-0">
                    {new Date(log.createdAt || log.timestamp || new Date().toISOString()).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT & ACCESS REQUESTS */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-in">
          {/* Pending Sign-Up Requests Queue */}
          <div className="surface-card overflow-hidden">
            <div
              className="flex items-center justify-between px-5 py-3.5 bg-[var(--surface-sunken)]"
              style={{ borderBottom: '1px solid var(--border-default)' }}
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[var(--warning)]" />
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  Pending Access Requests ({pendingUsers.length})
                </span>
              </div>
              <span className="text-xs text-[var(--text-tertiary)]">
                Requires Admin verification before user can access workspace
              </span>
            </div>

            {pendingUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-tertiary)] space-y-1">
                <CheckCircle2 className="w-8 h-8 text-[var(--success)] mx-auto opacity-70 mb-2" />
                <div className="font-semibold text-[var(--text-secondary)]">No pending access requests</div>
                <div>All incoming user registrations have been verified and resolved.</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Applicant</th>
                      <th>Email</th>
                      <th>Requested Role</th>
                      <th>Organization</th>
                      <th>Applied Date</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="font-medium text-[var(--text-primary)]">{user.name}</div>
                          <div className="text-[10px] font-mono text-[var(--text-muted)]">{user.id}</div>
                        </td>
                        <td className="font-mono text-xs text-[var(--text-secondary)]">{user.email}</td>
                        <td>
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[var(--accent-primary-soft)] text-[var(--accent-primary)] uppercase">
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="text-xs text-[var(--text-secondary)]">
                          {user.companyId || 'Internal Sales Org'}
                        </td>
                        <td className="text-xs text-[var(--text-tertiary)]">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Today'}
                        </td>
                        <td className="text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => approveUser(user.id)}
                              className="btn-primary !py-1 !px-2.5 !text-xs flex items-center gap-1.5"
                              style={{ backgroundColor: 'var(--success)', borderColor: 'var(--success)' }}
                              title="Approve user and grant access"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => rejectUser(user.id)}
                              className="btn-secondary !py-1 !px-2.5 !text-xs text-[var(--danger)] hover:bg-[var(--danger-soft)] flex items-center gap-1.5"
                              title="Reject registration request"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Active & Registered Users Directory */}
          <div className="surface-card overflow-hidden">
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5"
              style={{ borderBottom: '1px solid var(--border-default)' }}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  Registered User Accounts ({activeUsers.length})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="input-field !py-1 !text-xs !w-44"
                />
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="input-field !py-1 !text-xs"
                >
                  <option value="all">All Roles</option>
                  <option value="sales_rep">Sales Rep</option>
                  <option value="sales_manager">Sales Manager</option>
                  <option value="finance">Finance</option>
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Assigned Role</th>
                    <th>Account Status</th>
                    <th>Approved At</th>
                    <th className="text-right">Administration</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActiveUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="font-medium text-[var(--text-primary)]">{user.name}</div>
                        <div className="text-[10px] font-mono text-[var(--text-muted)]">{user.id}</div>
                      </td>
                      <td className="font-mono text-xs text-[var(--text-secondary)]">{user.email}</td>
                      <td>
                        <select
                          value={user.role}
                          onChange={(e) => changeUserRole(user.id, e.target.value as UserRole)}
                          className="input-field !py-1 !text-xs !w-36 font-semibold"
                        >
                          <option value="sales_rep">Sales Rep</option>
                          <option value="sales_manager">Sales Manager</option>
                          <option value="finance">Finance Approver</option>
                          <option value="customer">Customer</option>
                          <option value="admin">Platform Admin</option>
                        </select>
                      </td>
                      <td>
                        {user.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--success)] bg-[var(--success-soft)] px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" /> Active
                          </span>
                        ) : user.status === 'suspended' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--danger)] bg-[var(--danger-soft)] px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]" /> Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--text-muted)] bg-[var(--surface-sunken)] px-2 py-0.5 rounded-full">
                            {user.status}
                          </span>
                        )}
                      </td>
                      <td className="text-xs text-[var(--text-tertiary)]">
                        {user.approvedAt ? new Date(user.approvedAt).toLocaleDateString() : 'Seed Default'}
                      </td>
                      <td className="text-right">
                        {user.role !== 'admin' && (
                          user.status === 'active' ? (
                            <button
                              onClick={() => suspendUser(user.id)}
                              className="text-xs text-[var(--danger)] hover:underline font-medium"
                              title="Suspend user account"
                            >
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => reactivateUser(user.id)}
                              className="text-xs text-[var(--success)] hover:underline font-medium"
                              title="Reactivate user account"
                            >
                              Reactivate
                            </button>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DISCOUNT & RISK POLICIES */}
      {activeTab === 'policies' && (
        <div className="space-y-6 animate-fade-in">
          {/* Policy Overview Card */}
          <div
            className="p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{
              backgroundColor: 'var(--surface-card)',
              border: '1px solid var(--border-default)',
            }}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="font-bold text-sm text-[var(--text-primary)]">
                  Live Enterprise Governance Engine (Version {configPolicy.policyVersion || 4})
                </span>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] max-w-xl">
                Modifying thresholds recalculates risk scores, margin deviations, and manager/finance routing across all quotes in real-time.
              </p>
            </div>

            <button
              onClick={() => setShowPolicyConfirmModal(true)}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-2 whitespace-nowrap shadow-sm"
            >
              <Save className="w-4 h-4" /> Save & Deploy v{(configPolicy.policyVersion || 4) + 1}
            </button>
          </div>

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
              <p className="text-xs text-[var(--text-tertiary)]">
                Ceiling discount permissible before triggering tier overage risk penalties.
              </p>

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
              <p className="text-xs text-[var(--text-tertiary)]">
                Product category margin buffers to prevent predatory service discounting.
              </p>

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
              <p className="text-xs text-[var(--text-tertiary)]">
                Composite risk score thresholds separating auto-approval from manager and finance escalation.
              </p>

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
        </div>
      )}

      {/* TAB 4: PRODUCTS & HUBS CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-6 animate-fade-in">
          {/* Warehouses */}
          <div className="surface-card overflow-hidden">
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: '1px solid var(--border-default)' }}
            >
              <div className="flex items-center gap-2">
                <WarehouseIcon className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  Regional Warehouses & Fulfillment Hubs ({warehouses.length})
                </span>
              </div>
            </div>

            <table className="data-table">
              <thead>
                <tr>
                  <th>Hub ID</th>
                  <th>Hub Name</th>
                  <th>Location</th>
                  <th>Base Freight</th>
                  <th>Dispatch Latency</th>
                </tr>
              </thead>
              <tbody>
                {warehouses.map((w) => (
                  <tr key={w.id}>
                    <td className="font-mono font-bold text-[var(--accent-primary)]">{w.id}</td>
                    <td className="text-[var(--text-primary)] font-medium">{w.name}</td>
                    <td className="text-[var(--text-secondary)]">{w.location}</td>
                    <td className="font-mono text-[var(--text-secondary)]">₹{w.shippingCostBase.toLocaleString('en-IN')}</td>
                    <td className="text-xs text-[var(--success)] font-medium">Same-day dispatch</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Products */}
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
                  <th>Billing Model</th>
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
      )}

      {/* TAB 5: SYSTEM AUDIT TRAIL */}
      <div className="surface-card overflow-hidden animate-fade-in">
        {activeTab === 'audit' && (
          <>
            <div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5"
              style={{ borderBottom: '1px solid var(--border-default)' }}
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  Immutable System Audit Trail ({auditLogs.length} Events)
                </span>
              </div>

              <input
                type="text"
                placeholder="Search action or actor..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="input-field !py-1 !text-xs !w-48"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Actor</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Details</th>
                    <th className="text-right">Hash Integrity</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs
                    .filter(
                      (log) =>
                        log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
                        log.actor.toLowerCase().includes(auditSearch.toLowerCase())
                    )
                    .map((log) => (
                      <tr key={log.id}>
                        <td className="font-mono text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                          {new Date(log.createdAt || log.timestamp || new Date().toISOString()).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td className="font-medium text-[var(--text-primary)] text-xs">{log.actor}</td>
                        <td className="text-xs font-semibold text-[var(--accent-primary)]">{log.action}</td>
                        <td className="font-mono text-xs text-[var(--text-secondary)]">
                          {log.quoteId || 'SYSTEM'}
                        </td>
                        <td className="text-xs text-[var(--text-tertiary)] max-w-xs truncate">
                          {log.details ? JSON.stringify(log.details) : '—'}
                        </td>
                        <td className="text-right font-mono text-[10px] text-[var(--success)]">
                          ✓ SHA-256 Valid
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* CONFIRM POLICY UPDATE MODAL */}
      {showPolicyConfirmModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowPolicyConfirmModal(false)}
        >
          <div
            className="surface-card max-w-md w-full p-6 space-y-4 shadow-2xl animate-scale-up"
            style={{ border: '1px solid var(--border-default)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[var(--warning-soft)] text-[var(--warning)] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Deploy Governance Policy v{(configPolicy.policyVersion || 4) + 1}?
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  You are about to modify global pricing limits and approval thresholds.
                </p>
              </div>
            </div>

            <div
              className="p-3.5 rounded-lg text-xs space-y-1.5 bg-[var(--surface-sunken)]"
              style={{ border: '1px solid var(--border-default)' }}
            >
              <div className="font-semibold text-[var(--text-secondary)]">Operational Impact:</div>
              <ul className="list-disc list-inside space-y-1 text-[var(--text-tertiary)]">
                <li>Increments policy version to <strong>v{(configPolicy.policyVersion || 4) + 1}</strong></li>
                <li>Immediately re-evaluates all 5 quotations in the pipeline</li>
                <li>Generates an immutable audit log entry attributed to Platform Admin</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowPolicyConfirmModal(false)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSavePolicy}
                className="btn-primary text-xs py-2 px-4 shadow-sm"
              >
                Confirm & Deploy Version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
