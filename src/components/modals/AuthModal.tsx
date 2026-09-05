import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { users, loginAsRole, userRole } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'demo' | 'credentials'>('demo');

  if (!isOpen) return null;

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default to sales_rep if custom credentials submitted
    loginAsRole('sales_rep');
    onClose();
  };

  const handleSelectDemoUser = (role: UserRole) => {
    loginAsRole(role);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl shadow-2xl border overflow-hidden animate-scale-in flex flex-col md:flex-row max-h-[90vh]"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-default)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Branding & Overview Column */}
        <div className="md:w-5/12 bg-slate-900 text-white p-7 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] flex items-center justify-center text-white shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-base font-bold tracking-tight">
                DealFlow<span className="text-blue-400 font-mono">360</span>
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold tracking-tight text-white">
                Govern every deal from quotation to cash.
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Self-governing sales operations platform that actively intercepts margin leakage, auto-routes multi-tier approvals, and synchronizes warehouse inventory.
              </p>
            </div>

            {/* Micro Highlights */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Explainable 11.3 High Risk Engine</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sales Manager $\rightarrow$ Finance Approvals</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Multi-Warehouse Freight Optimizer</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 text-[11px] text-slate-400">
            Odoo Ahmedabad National Hackathon 2026
          </div>
        </div>

        {/* Right: Login & Persona Selector */}
        <div className="md:w-7/12 p-6 sm:p-7 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header & Close */}
            <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Sign In to DealFlow360
                </h2>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  Select a live demo persona or enter credentials.
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 my-4 p-1 rounded-lg bg-[var(--bg-muted)]">
              <button
                onClick={() => setActiveTab('demo')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'demo'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                1-Click Demo Personas
              </button>
              <button
                onClick={() => setActiveTab('credentials')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'credentials'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Email & Password
              </button>
            </div>

            {/* Tab 1: 1-Click Demo Personas */}
            {activeTab === 'demo' && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
                  Select Role to Launch Environment:
                </span>
                <div className="space-y-1.5">
                  {users.map((u) => {
                    const isSelected = u.role === userRole;
                    return (
                      <button
                        key={u.id}
                        onClick={() => handleSelectDemoUser(u.role)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer group ${
                          isSelected
                            ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)]'
                            : 'border-[var(--border-default)] hover:border-slate-300 dark:hover:border-slate-600 hover:bg-[var(--bg-muted)]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[var(--text-primary)]">
                                {u.name}
                              </span>
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                                {u.role.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-[11px] text-[var(--text-tertiary)] truncate">
                              {u.title}
                            </p>
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Standard Credentials Form */}
            {activeTab === 'credentials' && (
              <form onSubmit={handleCredentialsLogin} className="space-y-3.5 py-2">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Work Email
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] focus-within:border-[var(--border-focus)]">
                    <Mail className="w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full text-xs text-[var(--text-primary)] outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Password
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] focus-within:border-[var(--border-focus)]">
                    <Lock className="w-4 h-4 text-[var(--text-tertiary)]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full text-xs text-[var(--text-primary)] outline-none bg-transparent"
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full justify-center !py-2 text-xs">
                  Sign In with Credentials
                </button>
              </form>
            )}
          </div>

          <div className="pt-4 border-t text-center text-[11px] text-[var(--text-muted)] mt-3" style={{ borderColor: 'var(--border-subtle)' }}>
            Institutional Demo Instance • Continuous Governance Active
          </div>
        </div>
      </div>
    </div>
  );
};
