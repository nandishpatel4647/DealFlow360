import React, { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR, riskThreshold } from '@/data/mockData';
import { Cpu, Sparkles, Trash2, Plus, ShieldAlert, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function CPQBuilder() {
  const { products, quotes, activeQuoteId, updateQuote } = useApp();
  const q = quotes.find((x) => x.id === activeQuoteId) || quotes[0];
  const [items, setItems] = useState(q.items.map((i) => ({ ...i })));
  const [discount, setDiscount] = useState(q.discount);
  const nav = useNavigate();

  const addProduct = (pid: string) => {
    if (items.find((i) => i.productId === pid)) {
      toast.info('Already added');
      return;
    }
    setItems([...items, { productId: pid, qty: 1, discount: 0 }]);
  };

  const remove = (pid: string) => setItems(items.filter((i) => i.productId !== pid));

  const updateItem = (pid: string, patch: Partial<{ qty: number; discount: number }>) =>
    setItems(items.map((i) => (i.productId === pid ? { ...i, ...patch } : i)));

  const computed = useMemo(() => {
    let gross = 0,
      cost = 0;
    const rows = items.map((i) => {
      const p = products.find((pp) => pp.id === i.productId)!;
      const line = p.price * i.qty;
      const net = line * (1 - i.discount / 100);
      const c = p.cost * i.qty;
      gross += net;
      cost += c;
      return { ...i, product: p, line, net, cost: c };
    });
    const globalNet = gross * (1 - discount / 100);
    const gst = globalNet * 0.18;
    const total = globalNet + gst;
    const margin = globalNet > 0 ? ((globalNet - cost) / globalNet) * 100 : 0;
    return { rows, gross, globalNet, gst, total, margin, cost };
  }, [items, products, discount]);

  const status = riskThreshold(discount);
  const badgeCls = {
    low: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300',
    medium: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
    high: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300',
  }[status.tier];

  const submit = () => {
    updateQuote(q.id, {
      items,
      discount,
      stage: discount > 18 ? 'Internal Review' : discount > 10 ? 'Internal Review' : 'Buyer Counter-Offer',
    });
    toast.success('Quote saved & routed', { description: `${q.id} → next stage` });
    nav('/app/approvals');
  };

  return (
    <div className="space-y-6" data-testid="cpq-builder">
      <div>
        <h1 className="text-3xl font-display font-bold text-heading">CPQ Quote Builder</h1>
        <p className="text-body">
          Assemble hybrid hardware + SaaS deals with live margin & policy enforcement —{' '}
          <span className="font-mono-df text-indigo-600">
            {q.id} · {q.customer}
          </span>
        </p>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <div className="space-y-4">
          <div className="embossed-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-heading">Product Catalog</h2>
              <div className="text-[11px] text-muted-df font-mono-df">Click + to add to quote</div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-transparent hover:border-indigo-200 transition"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      p.type === 'hardware'
                        ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600'
                        : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600'
                    }`}
                  >
                    {p.type === 'hardware' ? <Cpu className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-heading truncate">{p.name}</div>
                    <div className="text-[11px] text-muted-df font-mono-df">
                      {p.sku} · HSN {p.hsn} · {formatINR(p.price)}
                    </div>
                  </div>
                  <button
                    onClick={() => addProduct(p.id)}
                    className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition cursor-pointer"
                    data-testid={`add-product-${p.id}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="embossed-card p-5">
            <h2 className="font-display font-semibold text-heading mb-4">Line Items</h2>
            <div className="space-y-2">
              {computed.rows.map((r) => (
                <div
                  key={r.productId}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 grid grid-cols-[1fr_80px_100px_100px_36px] items-center gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-heading truncate">
                      {r.product.name}
                    </div>
                    <div className="text-[11px] text-muted-df font-mono-df">
                      {r.product.sku} · HSN {r.product.hsn}
                    </div>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={r.qty}
                    onChange={(e) =>
                      updateItem(r.productId, { qty: Math.max(1, +e.target.value) })
                    }
                    className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-heading font-mono-df text-center"
                    data-testid={`qty-${r.productId}`}
                  />
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={r.discount}
                    onChange={(e) =>
                      updateItem(r.productId, {
                        discount: Math.min(30, Math.max(0, +e.target.value)),
                      })
                    }
                    className="w-full px-2 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-heading font-mono-df text-center"
                    data-testid={`disc-${r.productId}`}
                  />
                  <div className="font-mono-df text-sm font-semibold text-heading text-right">
                    {formatINR(r.net)}
                  </div>
                  <button
                    onClick={() => remove(r.productId)}
                    className="text-rose-500 hover:text-rose-700 cursor-pointer p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-df">
                  Add products from catalog above.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 self-start">
          <div className="embossed-card p-5">
            <h3 className="font-display font-semibold text-heading mb-4">Global Concession</h3>
            <div className="flex items-center justify-between text-[12px] mb-2">
              <span className="text-body font-medium">Deal-wide discount</span>
              <span
                className="font-mono-df font-bold text-indigo-600 text-lg"
                data-testid="cpq-global-disc-val"
              >
                {discount}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={discount}
              onChange={(e) => setDiscount(+e.target.value)}
              className="slider-tactile w-full cursor-pointer"
              data-testid="cpq-global-disc"
            />
            <div
              className={`mt-4 rounded-xl px-3 py-2.5 flex items-center gap-2 text-[12px] font-semibold ${badgeCls}`}
              data-testid="cpq-policy-badge"
            >
              <ShieldAlert className="w-3.5 h-3.5" /> {status.label}
            </div>
          </div>
          <div className="embossed-card p-5 space-y-2.5">
            <h3 className="font-display font-semibold text-heading mb-2">Live Summary</h3>
            <SumRow label="Gross Value" val={formatINR(computed.gross)} />
            <SumRow
              label={`Global Concession (${discount}%)`}
              val={`− ${formatINR(computed.gross - computed.globalNet)}`}
              muted
            />
            <SumRow label="Net (pre-tax)" val={formatINR(computed.globalNet)} bold />
            <SumRow label="GST @ 18%" val={formatINR(computed.gst)} muted />
            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800">
              <SumRow label="Grand Total" val={formatINR(computed.total)} big />
            </div>
            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-body">Blended Margin</span>
              <span
                className={`font-mono-df text-lg font-bold ${
                  computed.margin < 25 ? 'text-rose-600' : 'text-indigo-600'
                }`}
                data-testid="cpq-margin"
              >
                {computed.margin.toFixed(1)}%
              </span>
            </div>
          </div>
          <button
            onClick={submit}
            className="btn-tactile-primary w-full justify-center cursor-pointer"
            data-testid="cpq-submit"
          >
            <Send className="w-4 h-4" /> Submit for Approval
          </button>
        </div>
      </div>
    </div>
  );
}

const SumRow: React.FC<{
  label: string;
  val: string;
  muted?: boolean;
  bold?: boolean;
  big?: boolean;
}> = ({ label, val, muted, bold, big }) => (
  <div className="flex items-center justify-between">
    <span
      className={`text-[13px] ${muted ? 'text-muted-df' : 'text-body'} ${
        bold ? 'font-semibold text-heading' : ''
      }`}
    >
      {label}
    </span>
    <span
      className={`font-mono-df ${
        big
          ? 'text-xl font-extrabold text-heading'
          : bold
          ? 'font-bold text-heading text-sm'
          : 'text-sm text-subheading'
      }`}
    >
      {val}
    </span>
  </div>
);
