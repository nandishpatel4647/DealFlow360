import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  Lock,
  Mail,
  User,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Building2,
  AlertCircle,
  Briefcase,
  TrendingUp,
  CreditCard,
  Building,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { users, loginAsRole, userRole, signUpUser } = useAppStore();

  const [activeTab, setActiveTab] = useState<'demo' | 'signin' | 'signup'>('demo');

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState<string | null>(null);

  // Sign Up State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState<Exclude<UserRole, 'admin'>>('sales_rep');
  const [signUpCompanyName, setSignUpCompanyName] = useState('');
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);

    const emailTrimmed = signInEmail.trim().toLowerCase();
    const matchedUser = users.find((u) => u.email.toLowerCase() === emailTrimmed);

    if (!matchedUser) {
      setSignInError('No account found with this email address.');
      return;
    }

    if (matchedUser.status === 'pending') {
      setSignInError('Access Pending: Your account registration is awaiting Administrator approval.');
      return;
    }

    if (matchedUser.status === 'rejected') {
      setSignInError('Access Denied: Your registration request was rejected by an administrator.');
      return;
    }

    if (matchedUser.status === 'suspended') {
      setSignInError('Account Suspended: Please contact platform operations.');
      return;
    }

    loginAsRole(matchedUser.role);
    onClose();
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError(null);

    if (signUpPassword !== signUpConfirmPassword) {
      setSignUpError('Passwords do not match. Please re-enter.');
      return;
    }

    if (signUpPassword.length < 6) {
      setSignUpError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const result = await signUpUser({
      name: signUpName.trim(),
      email: signUpEmail.trim(),
      password: signUpPassword,
      role: signUpRole,
      companyName: signUpRole === 'customer' ? signUpCompanyName || 'Acme Industries' : undefined,
    });
    setIsSubmitting(false);

    if (!result.success) {
      setSignUpError(result.message);
    } else {
      setSignUpSuccess(result.message);
    }
  };

  const handleSelectDemoUser = (role: UserRole) => {
    loginAsRole(role);
    onClose();
  };

  const roleOptions: { id: Exclude<UserRole, 'admin'>; title: string; desc: string; icon: any }[] = [
    {
      id: 'sales_rep',
      title: 'Sales Representative',
      desc: 'Create quotations, configure line items, manage pipeline',
      icon: Briefcase,
    },
    {
      id: 'sales_manager',
      title: 'Sales Manager',
      desc: 'Risk governance, medium risk approvals, commercial routing',
      icon: TrendingUp,
    },
    {
      id: 'finance',
      title: 'Finance',
      desc: 'Margin protection, high-risk approval release, billing',
      icon: CreditCard,
    },
    {
      id: 'customer',
      title: 'Customer Procurement',
      desc: 'Review quotations, counter-offer terms, accept proposals',
      icon: Building,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl shadow-2xl border overflow-hidden modal-content flex flex-col md:flex-row max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Branding & Value Proposition */}
        <div className="md:w-5/12 bg-slate-900 text-white p-7 flex flex-col justify-between relative overflow-hidden shrink-0">
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
              <h3 className="text-lg font-bold tracking-tight text-white leading-snug">
                Govern every deal from quotation to cash.
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Institutional B2B sales operations platform that actively intercepts discount leakage, auto-routes multi-tier approvals, and synchronizes warehouse inventory.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-2.5 pt-3 border-t border-slate-800 text-xs text-slate-300">
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
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Role-Governed Enterprise Portals</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 text-[11px] text-slate-400 border-t border-slate-800">
            Odoo Ahmedabad National Hackathon 2026 • Real Supabase Auth
          </div>
        </div>

        {/* Right: Auth Forms & Persona Selector */}
        <div className="md:w-7/12 p-6 sm:p-7 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header & Close Button */}
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div>
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  {activeTab === 'demo'
                    ? '1-Click Demo Environments'
                    : activeTab === 'signin'
                    ? 'Sign In to Workspace'
                    : 'Create New Account'}
                </h2>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  {activeTab === 'demo'
                    ? 'Launch instantly as any stakeholder persona'
                    : activeTab === 'signin'
                    ? 'Enter your registered credentials'
                    : 'Sign up with unique email & request access'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1.5 my-3.5 p-1 rounded-lg bg-[var(--bg-muted)]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('demo');
                  setSignUpSuccess(null);
                  setSignInError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'demo'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Demo Personas
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signin');
                  setSignUpSuccess(null);
                  setSignInError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'signin'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setSignUpSuccess(null);
                  setSignUpError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'signup'
                    ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* TAB 1: 1-Click Demo Personas */}
            {activeTab === 'demo' && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
                  Select Role to Launch Environment:
                </span>
                <div className="space-y-1.5">
                  {users
                    .filter((u) => u.status === 'active')
                    .map((u) => {
                      const isSelected = u.role === userRole;
                      return (
                        <button
                          key={u.id}
                          onClick={() => handleSelectDemoUser(u.role)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer group hover-card-lift ${
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
                                {u.title} • {u.department}
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

            {/* TAB 2: Standard Sign In */}
            {activeTab === 'signin' && (
              <form onSubmit={handleCredentialsLogin} className="space-y-3.5 py-1">
                {signInError && (
                  <div className="p-3 rounded-lg text-xs flex items-center gap-2 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 animate-slide-down">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{signInError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">
                    Work Email
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] focus-within:border-[var(--border-focus)]">
                    <Mail className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
                    <input
                      type="email"
                      required
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
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
                    <Lock className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
                    <input
                      type="password"
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
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

            {/* TAB 3: Sign Up Flow with Admin Approval */}
            {activeTab === 'signup' && (
              <>
                {signUpSuccess ? (
                  <div className="p-5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 text-center space-y-3 animate-scale-in my-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                        Access Request Submitted!
                      </h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 leading-relaxed max-w-sm mx-auto">
                        Your account for <strong>{signUpEmail}</strong> has been registered with status: <strong>Pending Approval</strong>.
                        An administrator must approve your account before you can log in.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('signin');
                        setSignInEmail(signUpEmail);
                        setSignUpSuccess(null);
                      }}
                      className="btn-primary !py-1.5 !px-4 !text-xs !bg-emerald-600 hover:!bg-emerald-700"
                    >
                      Return to Sign In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSignUpSubmit} className="space-y-3 py-1">
                    {signUpError && (
                      <div className="p-3 rounded-lg text-xs flex items-center gap-2 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 animate-slide-down">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{signUpError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                          Full Name
                        </label>
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] focus-within:border-[var(--border-focus)]">
                          <User className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
                          <input
                            type="text"
                            required
                            value={signUpName}
                            onChange={(e) => setSignUpName(e.target.value)}
                            placeholder="Aarav Patel"
                            className="w-full text-xs text-[var(--text-primary)] outline-none bg-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                          Work Email (One Account)
                        </label>
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] focus-within:border-[var(--border-focus)]">
                          <Mail className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
                          <input
                            type="email"
                            required
                            value={signUpEmail}
                            onChange={(e) => setSignUpEmail(e.target.value)}
                            placeholder="aarav@company.com"
                            className="w-full text-xs text-[var(--text-primary)] outline-none bg-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                          Password
                        </label>
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] focus-within:border-[var(--border-focus)]">
                          <Lock className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
                          <input
                            type="password"
                            required
                            value={signUpPassword}
                            onChange={(e) => setSignUpPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full text-xs text-[var(--text-primary)] outline-none bg-transparent"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                          Confirm Password
                        </label>
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] focus-within:border-[var(--border-focus)]">
                          <Lock className="w-3.5 h-3.5 text-[var(--text-tertiary)] shrink-0" />
                          <input
                            type="password"
                            required
                            value={signUpConfirmPassword}
                            onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                            placeholder="••••••••••••"
                            className="w-full text-xs text-[var(--text-primary)] outline-none bg-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-semibold text-[var(--text-secondary)]">
                          Requested Role (Admin provisioned separately)
                        </label>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                          Requires Admin Approval
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {roleOptions.map((opt) => {
                          const Icon = opt.icon;
                          const isSelected = signUpRole === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setSignUpRole(opt.id)}
                              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                                isSelected
                                  ? 'border-[var(--accent-primary)] bg-[var(--accent-primary-soft)] ring-1 ring-[var(--accent-primary)]'
                                  : 'border-[var(--border-default)] hover:bg-[var(--bg-muted)]'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]'}`} />
                                <span className="text-xs font-bold text-[var(--text-primary)]">
                                  {opt.title}
                                </span>
                              </div>
                              <p className="text-[10px] text-[var(--text-tertiary)] leading-tight">
                                {opt.desc}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {signUpRole === 'customer' && (
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--text-secondary)] mb-1">
                          Company / Organization Name
                        </label>
                        <input
                          type="text"
                          required
                          value={signUpCompanyName}
                          onChange={(e) => setSignUpCompanyName(e.target.value)}
                          placeholder="Acme Industries"
                          className="input-field !py-1.5 !text-xs"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full justify-center !py-2 text-xs cursor-pointer"
                    >
                      {isSubmitting ? 'Registering Account...' : 'Submit Access Request'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          <div className="pt-3 border-t text-center text-[10px] text-[var(--text-muted)] mt-2" style={{ borderColor: 'var(--border-subtle)' }}>
            Institutional Demo Instance • Continuous Governance Active
          </div>
        </div>
      </div>
    </div>
  );
};
