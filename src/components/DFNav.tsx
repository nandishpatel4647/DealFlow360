import React from 'react';
import { Zap, Sun, Moon, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function DFNav() {
  const { theme, toggleTheme } = useApp();
  const navigate = useNavigate();

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-6xl"
      data-testid="landing-nav"
    >
      <div className="macos-glass rounded-full px-4 py-2.5 flex items-center gap-3 justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 pl-1 pr-3 cursor-pointer"
          data-testid="brand-logo"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="font-display font-bold text-[15px] text-heading tracking-tight">
              DealFlow360
            </span>
            <span className="text-[10px] text-muted-df font-medium -mt-0.5">
              Deal Cockpit
            </span>
          </div>
        </button>

        <div className="hidden lg:flex items-center gap-1 mx-auto text-[13px] font-medium text-muted-df">
          <a
            href="#simulator"
            className="px-3 py-1.5 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition"
            data-testid="nav-simulator"
          >
            Live Simulator
          </a>
          <a
            href="#personas"
            className="px-3 py-1.5 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition"
            data-testid="nav-personas"
          >
            Stakeholders
          </a>
          <a
            href="#roi"
            className="px-3 py-1.5 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition"
            data-testid="nav-roi"
          >
            ROI Calculator
          </a>
          <a
            href="#lifecycle"
            className="px-3 py-1.5 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition"
            data-testid="nav-lifecycle"
          >
            How it works
          </a>
          <a
            href="#trust"
            className="px-3 py-1.5 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition"
            data-testid="nav-trust"
          >
            Enterprise Trust
          </a>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition text-muted-df cursor-pointer"
            data-testid="theme-toggle-button"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn-tactile-primary text-[13px] px-4 py-2 cursor-pointer"
            data-testid="launch-cockpit-button"
          >
            Launch Command Center <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
