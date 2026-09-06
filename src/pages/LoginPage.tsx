import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight, Sun, Moon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const { login, theme, toggleTheme } = useApp();
  const nav = useNavigate();
  const [email, setEmail] = useState('demo@dealflow360.com');
  const [pw, setPw] = useState('demo1234');

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return toast.error('Enter a valid work email');
    if (pw.length < 4) return toast.error('Password too short');
    login(email);
    toast.success('Welcome back', { description: `Signed in as ${email}` });
    nav('/app/dashboard');
  };

  return (
    <div className="min-h-screen bg-[var(--df-bg)] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 w-10 h-10 rounded-full macos-glass flex items-center justify-center text-muted-df cursor-pointer"
        data-testid="login-theme-toggle"
      >
        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </button>
      <div
        className="embossed-card p-8 sm:p-10 w-full max-w-md relative"
        data-testid="login-card"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <div>
            <div className="font-display font-bold text-lg text-heading">DealFlow360</div>
            <div className="text-[11px] text-muted-df">Deal Cockpit · Enterprise Login</div>
          </div>
        </div>
        <h1 className="text-2xl font-display font-bold text-heading mb-1">
          Sign in to your command center
        </h1>
        <p className="text-sm text-muted-df mb-6">Pre-loaded demo credentials fill in below.</p>
        <form onSubmit={handle} className="space-y-4">
          <div>
            <label className="text-[12px] font-semibold text-body block mb-1.5">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-heading text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                data-testid="login-email"
              />
            </div>
          </div>
          <div>
            <label className="text-[12px] font-semibold text-body block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-subtle" />
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-heading text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                data-testid="login-password"
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn-tactile-primary w-full justify-center mt-2 cursor-pointer"
            data-testid="login-submit"
          >
            Enter Command Center <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-6 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[12px] text-indigo-800 dark:text-indigo-200 font-mono-df">
          demo@dealflow360.com · demo1234
        </div>
        <button
          onClick={() => nav('/')}
          className="text-[12px] text-muted-df hover:text-indigo-600 mt-4 block mx-auto cursor-pointer"
          data-testid="login-back"
        >
          ← Back to landing
        </button>
      </div>
    </div>
  );
}
