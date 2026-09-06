import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { seedQuotes, seedProducts, Quote, Product } from '@/data/mockData';

export interface User {
  email: string;
  name: string;
  role: string;
}

interface AppContextType {
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
  toggleTheme: () => void;
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  persona: string;
  setPersona: React.Dispatch<React.SetStateAction<string>>;
  quotes: Quote[];
  updateQuote: (id: string, patch: Partial<Quote>) => void;
  moveQuoteStage: (id: string, stage: string) => void;
  products: Product[];
  activeQuoteId: string;
  setActiveQuoteId: React.Dispatch<React.SetStateAction<string>>;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('df_theme') || 'light');
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem('df_user');
    return raw ? JSON.parse(raw) : { email: 'demo@dealflow360.com', name: 'demo', role: 'Deal Desk Manager' };
  });
  const [persona, setPersona] = useState<string>('sales');
  const [quotes, setQuotes] = useState<Quote[]>(seedQuotes);
  const [products] = useState<Product[]>(seedProducts);
  const [activeQuoteId, setActiveQuoteId] = useState<string>(seedQuotes[0].id);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('df_theme', theme);
  }, [theme]);

  const login = (email: string) => {
    const u: User = { email, name: email.split('@')[0], role: 'Deal Desk Manager' };
    setUser(u);
    localStorage.setItem('df_user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('df_user');
  };

  const updateQuote = (id: string, patch: Partial<Quote>) => {
    setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const moveQuoteStage = (id: string, stage: string) => updateQuote(id, { stage });

  const value: AppContextType = {
    theme,
    setTheme,
    toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    user,
    login,
    logout,
    persona,
    setPersona,
    quotes,
    updateQuote,
    moveQuoteStage,
    products,
    activeQuoteId,
    setActiveQuoteId,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
