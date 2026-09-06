import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft, KeyRound, AlertCircle, UserPlus, Building, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { DEMO_USERS, findDemoUser, DemoUser, ROLE_DEFAULT_AVATARS } from '../../auth/demoUsers';
import { UserRole, Company } from '../../types';
import { BrandLogo } from '../common/BrandLogo';

interface LoginViewProps {
  onBackToLanding?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onBackToLanding }) => {
  const { login, loginAsCustomer, users, addUser, addCompany, setActiveView, getCustomAvatar } = useAppStore();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState<'internal' | 'customer'>('internal');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [portalToken, setPortalToken] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Signup State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('sales_rep');
  const [signupCompany, setSignupCompany] = useState('');
  const [signupTitle, setSignupTitle] = useState('Sales Specialist');

  const handleSubmitInternal = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!email) return;

    // Check provisioned users first
    const customUser = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (customUser) {
      if (password && password !== customUser.password && password !== 'demo123' && password !== 'admin123') {
        setErrorMessage(`Invalid password for ${customUser.email}. Try "${customUser.password}"`);
        return;
      }
      login(customUser.email, password || customUser.password, customUser.role);
      return;
    }

    const matchedUser = findDemoUser(email);
    if (matchedUser) {
      if (password && password !== matchedUser.password && password !== 'demo123' && password !== 'admin123') {
        setErrorMessage(`Invalid password for ${matchedUser.email}. Try "${matchedUser.password}"`);
        return;
      }
      login(matchedUser.email, password || matchedUser.password, matchedUser.role);
    } else {
      // Default fallback if unlisted email is entered
      let role: UserRole = 'sales_rep';
      if (email.includes('manager')) role = 'sales_manager';
      else if (email.includes('finance')) role = 'finance';
      else if (email.includes('admin')) role = 'admin';
      login(email, password || 'demo123', role);
    }
  };

  const handleSubmitCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const tokenToUse = portalToken || 'token_acme';
    loginAsCustomer(tokenToUse);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!signupName || !signupEmail || !signupPassword) {
      setErrorMessage('Please fill in all required signup fields.');
      return;
    }

    // Password validation: minimum 8 characters, must contain letter and number
    if (signupPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    const hasLetter = /[a-zA-Z]/.test(signupPassword);
    const hasDigit = /[0-9]/.test(signupPassword);
    if (!hasLetter || !hasDigit) {
      setErrorMessage('Password must contain at least one letter and one number.');
      return;
    }

    if (signupRole === 'customer') {
      const generatedToken = `token_${(signupCompany || signupName).toLowerCase().replace(/[^a-z0-9]/g, '')}_${Date.now().toString().slice(-4)}`;
      const newComp: Company = {
        id: `comp-${Date.now()}`,
        name: signupCompany || `${signupName} Co`,
        tierId: 'Silver',
        industry: 'Technology',
        creditLimit: 1000000,
        contactEmail: signupEmail,
        portalToken: generatedToken,
        historicalCloseRate: 85,
        historicalAvgDiscount: 5,
      };
      addCompany(newComp);
      loginAsCustomer(generatedToken);
    } else {
      const newUser: DemoUser = {
        email: signupEmail,
        password: signupPassword,
        name: signupName,
        role: signupRole,
        title: signupTitle || 'Account Executive',
      };
      addUser(newUser);
      login(newUser.email, newUser.password, newUser.role);
    }
  };

  const handleQuickDemoClick = (demoUser: DemoUser) => {
    if (demoUser.role === 'customer') {
      loginAsCustomer(demoUser.portalToken || 'token_acme');
    } else {
      login(demoUser.email, demoUser.password, demoUser.role);
    }
  };

  // Seeded Personas for Instant 1-Click Launch Showcase
  const demoPersonas: {
    role: UserRole;
    name: string;
    title: string;
    email: string;
    password: string;
    portalToken?: string;
    badgeLabel: string;
    badgeColor: string;
    roleDesc: string;
  }[] = [
    {
      role: 'sales_rep',
      name: 'P. Mehta',
      title: 'Sales Representative',
      email: 'sales@dealflow360.com',
      password: 'demo123',
      badgeLabel: 'SALES REP',
      badgeColor: 'bg-blue-600',
      roleDesc: 'CPQ Quote Builder & Dynamic Cross-Sell',
    },
    {
      role: 'sales_manager',
      name: 'M. Shah',
      title: 'Sales Manager',
      email: 'manager@dealflow360.com',
      password: 'demo123',
      badgeLabel: 'SALES MANAGER',
      badgeColor: 'bg-purple-600',
      roleDesc: 'Pipeline Kanban, Margin & Discount Approvals',
    },
    {
      role: 'finance',
      name: 'R. Iyer',
      title: 'Finance & Operations Lead',
      email: 'finance@dealflow360.com',
      password: 'demo123',
      badgeLabel: 'FINANCE & OPS',
      badgeColor: 'bg-emerald-600',
      roleDesc: 'Multi-Warehouse Inventory & Invoicing Sync',
    },
    {
      role: 'customer',
      name: 'Acme Procurement',
      title: 'Client Buyer (Acme Corp)',
      email: 'customer@dealflow360.com',
      password: 'demo123',
      portalToken: 'token_acme',
      badgeLabel: 'CUSTOMER PORTAL',
      badgeColor: 'bg-indigo-600',
      roleDesc: 'Client Proposal Review, Live Chat & E-Sign',
    },
    {
      role: 'admin',
      name: 'System Admin',
      title: 'System Administrator',
      email: 'admin@dealflow360.com',
      password: 'admin123',
      badgeLabel: 'ADMINISTRATOR',
      badgeColor: 'bg-slate-800',
      roleDesc: 'Governance Rules, Audit Logs & Platform Config',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-blue-600 selection:text-white">
      {/* High-Tech Ambient Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation & Status Bar */}
      <div className="max-w-5xl w-full mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
        <button
          onClick={() => {
            if (onBackToLanding) {
              onBackToLanding();
            } else {
              setActiveView('landing');
            }
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/60 px-3.5 py-2 rounded-xl transition shadow-sm backdrop-blur-md cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Product Landing Page</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/50 text-[11px] font-semibold text-blue-200 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>Multi-Role Gateway • RBAC Active</span>
          </div>
        </div>
      </div>

      {/* Main Executive Card Container */}
      <div className="max-w-5xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden card-3d relative z-10">
        {/* Modern Enterprise Header Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-[#014A8E] to-blue-900 p-6 sm:p-7 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10">
          <div className="text-center sm:text-left flex flex-col items-center sm:items-start gap-1">
            <BrandLogo size="lg" theme="dark" subtitle="IDENTITY & ACCESS MANAGEMENT" />
            <p className="text-xs text-blue-100/90 font-medium max-w-lg mt-1">
              Intelligent Sales Operations Platform with Instant Role Switching & Self-Governing Risk Governance
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md text-xs font-bold text-blue-100 shrink-0">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Hackathon Showcase Mode</span>
          </div>
        </div>

        {/* Two-Column Executive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* LEFT COLUMN: 1-Click Instant Demo Personas (Modern Cards with Photo Avatars & Badges) */}
          <div className="lg:col-span-7 p-6 sm:p-7 bg-slate-50/70 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0176D3] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#0176D3]" /> Instant Role Launcher (Demo Showcase)
                </span>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-200/70 px-2 py-0.5 rounded-full">
                  5 Roles Available
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mb-3.5">
                Skip credential typing! Click any enterprise persona card to immediately launch their tailored workspace:
              </p>

              {/* Persona Cards List */}
              <div className="space-y-2.5">
                {demoPersonas.map((persona) => {
                  const matchingUser = users.find((u) => u.role === persona.role || u.email === persona.email);
                  const activeAvatar =
                    getCustomAvatar(persona.role, persona.email) ||
                    matchingUser?.avatarUrl ||
                    ROLE_DEFAULT_AVATARS[persona.role];
                  const displayName = matchingUser?.name || persona.name;
                  const displayTitle = matchingUser?.title || persona.title;

                  const fullDemoUser: DemoUser = {
                    email: persona.email,
                    password: persona.password,
                    name: displayName,
                    role: persona.role,
                    title: displayTitle,
                    portalToken: persona.portalToken,
                    avatarUrl: activeAvatar,
                  };

                  return (
                    <button
                      key={persona.role}
                      type="button"
                      onClick={() => handleQuickDemoClick(fullDemoUser)}
                      className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-[#0176D3] bg-white hover:bg-blue-50/40 text-slate-800 flex items-center justify-between transition-all duration-200 cursor-pointer card-hover-3d shadow-2xs group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Avatar photo with ring */}
                        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-xs ring-2 ring-slate-200 group-hover:ring-blue-500/40 shrink-0 bg-slate-100 flex items-center justify-center">
                          <img
                            key={activeAvatar}
                            src={activeAvatar}
                            alt={displayName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = ROLE_DEFAULT_AVATARS[persona.role] || '';
                            }}
                          />
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#0176D3] transition">
                              {displayName}
                            </span>
                            <span
                              className={`text-[9px] font-extrabold uppercase text-white px-1.5 py-0.2 rounded shadow-2xs ${persona.badgeColor}`}
                            >
                              {persona.badgeLabel}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                            {displayTitle}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                            <span>{persona.email}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500 truncate">{persona.roleDesc}</span>
                          </div>
                        </div>
                      </div>

                      {/* Launch Button Pill */}
                      <div className="shrink-0 pl-2">
                        <span className="text-[11px] font-bold text-[#0176D3] bg-blue-50 group-hover:bg-[#0176D3] group-hover:text-white px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-2xs">
                          Launch <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photo Sync Guarantee Tip */}
            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 text-[11px] text-blue-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0176D3] shrink-0" />
              <span>
                <strong>Instant DP Synchronization:</strong> Custom profile photos uploaded anywhere in the platform automatically update these persona cards in real time.
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Direct Credentials Login & Self-Service Account Provisioning */}
          <div className="lg:col-span-5 p-6 sm:p-7 bg-white flex flex-col justify-between space-y-5">
            <div>
              {/* Primary Mode Toggle: Sign In vs Create Account */}
              <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-center transition cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white text-[#0176D3] shadow-xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 rounded-lg text-center transition cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-white text-[#0176D3] shadow-xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Create Account (Signup)
                </button>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {mode === 'login' ? (
                <>
                  {/* Internal Staff vs Customer Portal Segmented Switch */}
                  <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold border border-slate-200 mb-4">
                    <button
                      type="button"
                      onClick={() => setActiveTab('internal')}
                      className={`flex-1 py-1.5 rounded-md transition cursor-pointer ${
                        activeTab === 'internal'
                          ? 'bg-white text-[#0176D3] shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Internal Staff
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('customer')}
                      className={`flex-1 py-1.5 rounded-md transition cursor-pointer ${
                        activeTab === 'customer'
                          ? 'bg-white text-[#0176D3] shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Customer Portal
                    </button>
                  </div>

                  {activeTab === 'internal' ? (
                    <form onSubmit={handleSubmitInternal} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Work Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                          <input
                            type="email"
                            required
                            placeholder="sales@dealflow360.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#0176D3] focus:bg-white font-medium transition"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-slate-700">Password</label>
                          <a
                            href="#forgot"
                            onClick={(e) => {
                              e.preventDefault();
                              alert('Seeded Passwords:\n- Staff / Customer: demo123\n- Administrator: admin123');
                            }}
                            className="text-xs text-[#0176D3] hover:underline font-semibold"
                          >
                            Forgot password?
                          </a>
                        </div>
                        <div className="relative">
                          <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                          <input
                            type="password"
                            required
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#0176D3] focus:bg-white font-medium transition"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="rounded text-[#0176D3] focus:ring-[#0176D3]"
                          />
                          <span className="text-xs text-slate-600 font-medium">Remember me on this device</span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0176D3] to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer btn-3d"
                      >
                        Sign In to Enterprise CPQ <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleSubmitCustomer} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Customer Email or Access Token
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                          <input
                            type="text"
                            placeholder="customer@acme.com or token_acme"
                            value={portalToken}
                            onChange={(e) => setPortalToken(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#0176D3] focus:bg-white font-medium font-mono transition"
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                          <p className="text-[11px] text-slate-500">
                            Client demo: <code className="font-mono text-slate-800 bg-slate-100 px-1 py-0.5 rounded">token_acme</code>
                          </p>
                          <button
                            type="button"
                            onClick={() => setPortalToken('token_acme')}
                            className="text-[11px] text-[#0176D3] font-bold hover:underline cursor-pointer"
                          >
                            Autofill Acme Token
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer btn-3d"
                      >
                        Access Customer Quotation Portal <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </>
              ) : (
                /* Signup Form Flow */
                <form onSubmit={handleSignupSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Verma"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-[#0176D3]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Work Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="rverma@company.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 outline-none focus:border-[#0176D3]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Account Role</label>
                      <select
                        value={signupRole}
                        onChange={(e) => setSignupRole(e.target.value as UserRole)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none font-semibold"
                      >
                        <option value="sales_rep">Sales Representative</option>
                        <option value="sales_manager">Sales Manager</option>
                        <option value="finance">Finance & Operations</option>
                        <option value="customer">Customer Client</option>
                        <option value="admin">System Administrator</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Job Title</label>
                      <input
                        type="text"
                        placeholder="Senior AE"
                        value={signupTitle}
                        onChange={(e) => setSignupTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 outline-none"
                      />
                    </div>
                  </div>

                  {signupRole === 'customer' && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Company Name</label>
                      <div className="relative">
                        <Building className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="e.g. Apex Global Solutions"
                          value={signupCompany}
                          onChange={(e) => setSignupCompany(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-slate-700">Password</label>
                      <span className="text-[10px] text-slate-400 font-medium">Min. 8 characters (letters & digits)</span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="password"
                        required
                        minLength={8}
                        placeholder="Create password (e.g. Pass1234)"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className={`w-full pl-9 pr-3 py-2 rounded-lg border text-xs outline-none transition ${
                          signupPassword
                            ? signupPassword.length >= 8 && /[a-zA-Z]/.test(signupPassword) && /[0-9]/.test(signupPassword)
                              ? 'border-emerald-400 focus:border-emerald-500 ring-emerald-100'
                              : 'border-amber-400 focus:border-amber-500 ring-amber-100'
                            : 'border-slate-300 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    {signupPassword && (
                      <div className="mt-1.5 flex items-center gap-3 text-[10px]">
                        <span className={`flex items-center gap-1 font-semibold ${signupPassword.length >= 8 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {signupPassword.length >= 8 ? '✓ 8+ chars' : '• 8+ chars'}
                        </span>
                        <span className={`flex items-center gap-1 font-semibold ${/[a-zA-Z]/.test(signupPassword) ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {/[a-zA-Z]/.test(signupPassword) ? '✓ Letters' : '• Letters'}
                        </span>
                        <span className={`flex items-center gap-1 font-semibold ${/[0-9]/.test(signupPassword) ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {/[0-9]/.test(signupPassword) ? '✓ Numbers' : '• Numbers'}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-[#0176D3] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <UserPlus className="w-4 h-4" /> Create & Provision Account
                  </button>
                </form>
              )}
            </div>

            {/* Enterprise Security Notice */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Protected by 256-bit TLS encryption, role isolation & audit trails.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Footer */}
        <div className="bg-slate-50 px-6 py-3.5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200 text-[11px] text-slate-500 font-mono">
          <span>DealFlow360 Enterprise CPQ • Powered by Self-Governing Risk Governance</span>
          <span className="text-slate-400">SOC-2 Type II Certified • Multi-Role RBAC Active</span>
        </div>
      </div>
    </div>
  );
};
