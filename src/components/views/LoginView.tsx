import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, KeyRound, AlertCircle, UserPlus, Building, User } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { DEMO_USERS, findDemoUser, DemoUser } from '../../auth/demoUsers';
import { UserRole, Company } from '../../types';

export const LoginView: React.FC = () => {
  const { login, loginAsCustomer, users, addUser, addCompany } = useAppStore();

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

  const handleQuickDemoClick = (demoUser: (typeof DEMO_USERS)[0]) => {
    if (demoUser.role === 'customer') {
      loginAsCustomer(demoUser.portalToken || 'token_acme');
    } else {
      login(demoUser.email, demoUser.password, demoUser.role);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Branding */}
        <div className="bg-[#0176D3] p-6 text-center text-white space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs shadow-xs border border-white/30">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">
            DealFlow<span className="text-blue-100">360</span>
          </h1>
          <p className="text-xs text-blue-100 font-medium">
            Login / Signup — Entry Point for Internal Users and Customers
          </p>
        </div>

        {/* Primary Mode Selector: Login vs Signup */}
        <div className="flex border-b border-slate-200 bg-slate-100 text-xs font-bold">
          <button
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-center transition cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#0176D3] border-b-2 border-[#0176D3] shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 text-center transition cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-[#0176D3] border-b-2 border-[#0176D3] shadow-2xs font-extrabold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account (Signup)
          </button>
        </div>

        {errorMessage && (
          <div className="m-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Area */}
        <div className="p-6 space-y-5">
          {mode === 'login' ? (
            <>
              {/* Internal vs Customer Login Sub-tabs */}
              <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-bold border border-slate-200">
                <button
                  onClick={() => setActiveTab('internal')}
                  className={`flex-1 py-1.5 rounded-md transition cursor-pointer ${
                    activeTab === 'internal'
                      ? 'bg-white text-[#0176D3] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Internal Staff Sign In
                </button>
                <button
                  onClick={() => setActiveTab('customer')}
                  className={`flex-1 py-1.5 rounded-md transition cursor-pointer ${
                    activeTab === 'customer'
                      ? 'bg-white text-[#0176D3] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Customer Portal Sign In
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
                        className="w-full pl-10 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#0176D3] focus:bg-white font-medium"
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
                          alert('Demo Account Passwords: demo123 (or admin123 for Admin)');
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
                        className="w-full pl-10 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#0176D3] focus:bg-white font-medium"
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
                    className="w-full py-2.5 rounded-lg bg-[#0176D3] hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
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
                        className="w-full pl-10 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#0176D3] focus:bg-white font-medium font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Enter client email (<code className="font-mono text-slate-800">customer@acme.com</code>) or token (<code className="font-mono text-slate-800">token_acme</code>).
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Access Customer Quotation Portal <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Official Quick Demo Accounts */}
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Click to Sign In with Seeded Demo Account:
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {DEMO_USERS.map((user) => (
                    <button
                      key={user.email}
                      onClick={() => handleQuickDemoClick(user)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-xs font-semibold text-slate-800 flex items-center justify-between transition cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{user.name}</span>
                        <span className="text-[10px] text-slate-500">({user.title})</span>
                      </div>
                      <div className="text-[10px] font-mono text-[#0176D3] font-bold">
                        {user.email}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
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
                <label className="block font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Create password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 outline-none"
                  />
                </div>
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

        {/* Footer */}
        <div className="bg-slate-50 py-3 text-center text-[11px] text-slate-500 border-t border-slate-200 font-mono">
          DealFlow360 Enterprise • Powered by Self-Governing Risk Governance
        </div>
      </div>
    </div>
  );
};
