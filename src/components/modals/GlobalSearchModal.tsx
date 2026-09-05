import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Building2, Package, X, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { quotes, companies, products, setSelectedQuoteId, setActiveView } = useAppStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const lowerQuery = query.toLowerCase().trim();

  const matchedQuotes = quotes.filter(
    (q) =>
      q.id.toLowerCase().includes(lowerQuery) ||
      q.companyName.toLowerCase().includes(lowerQuery) ||
      q.status.toLowerCase().includes(lowerQuery)
  );

  const matchedCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.industry.toLowerCase().includes(lowerQuery) ||
      c.tierId.toLowerCase().includes(lowerQuery)
  );

  const matchedProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.sku.toLowerCase().includes(lowerQuery) ||
      p.categoryId.toLowerCase().includes(lowerQuery)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl shadow-2xl border overflow-hidden animate-scale-in"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-default)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          className="flex items-center gap-3 px-4 py-3.5 border-b"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <Search className="w-5 h-5 text-[var(--accent-primary)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search quotations, customer accounts, products..."
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] font-mono text-[var(--text-tertiary)] px-1.5 py-0.5 rounded bg-[var(--bg-muted)] border border-[var(--border-default)]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Quotes Section */}
          {matchedQuotes.length > 0 && (
            <div>
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
                Quotations ({matchedQuotes.length})
              </span>
              <div className="mt-1 space-y-0.5">
                {matchedQuotes.slice(0, 4).map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      setSelectedQuoteId(q.id);
                      setActiveView('builder');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--bg-muted)] transition-colors cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-[var(--accent-primary)]" />
                      <div>
                        <span className="text-xs font-semibold text-[var(--text-primary)]">
                          {q.id} • {q.companyName}
                        </span>
                        <p className="text-[11px] text-[var(--text-tertiary)]">
                          ₹{q.totalNetAmount.toLocaleString('en-IN')} • {q.status} • {q.overallMarginPercent}% margin
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Companies Section */}
          {matchedCompanies.length > 0 && (
            <div>
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
                Customer Accounts ({matchedCompanies.length})
              </span>
              <div className="mt-1 space-y-0.5">
                {matchedCompanies.slice(0, 3).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveView('pipeline');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--bg-muted)] transition-colors cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="text-xs font-semibold text-[var(--text-primary)]">
                          {c.name}
                        </span>
                        <p className="text-[11px] text-[var(--text-tertiary)]">
                          {c.tierId} Tier • {c.industry}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {c.tierId}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Section */}
          {matchedProducts.length > 0 && (
            <div>
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)] block">
                Products & Services ({matchedProducts.length})
              </span>
              <div className="mt-1 space-y-0.5">
                {matchedProducts.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-indigo-600" />
                      <div>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {p.name}
                        </span>
                        <p className="text-[11px] text-[var(--text-tertiary)] font-mono">
                          SKU: {p.sku} • List: ₹{p.listPrice.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {p.categoryId}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedQuotes.length === 0 &&
            matchedCompanies.length === 0 &&
            matchedProducts.length === 0 && (
              <div className="py-8 text-center text-xs text-[var(--text-tertiary)]">
                No matching results found for "{query}".
              </div>
            )}
        </div>
      </div>
    </div>
  );
};
