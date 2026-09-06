import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/data/mockData';
import { Building, Check, PenLine, Cpu, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function BuyerPortal() {
  const { quotes, products } = useApp();
  const q = quotes.find((x) => x.id === 'Q-1044') || quotes[2];
  const [counter, setCounter] = useState<number>(12);
  const [signed, setSigned] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef<boolean>(false);

  const lineItems = useMemo(
    () =>
      q.items.map((i) => ({
        ...i,
        product: products.find((p) => p.id === i.productId)!,
      })),
    [q, products]
  );
  const gross = lineItems.reduce((s, i) => s + i.product.price * i.qty, 0);
  const net = gross * (1 - counter / 100);
  const gst = net * 0.18;
  const total = net + gst;

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#4F46E5';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    const pos = (e: MouseEvent | TouchEvent) => {
      const r = c.getBoundingClientRect();
      const t = 'touches' in e && e.touches[0] ? e.touches[0] : (e as MouseEvent);
      return { x: t.clientX - r.left, y: t.clientY - r.top };
    };
    const start = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      drawing.current = true;
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    };
    const move = (e: MouseEvent | TouchEvent) => {
      if (!drawing.current) return;
      e.preventDefault();
      const p = pos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };
    const end = () => {
      drawing.current = false;
    };
    c.addEventListener('mousedown', start);
    c.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    c.addEventListener('touchstart', start, { passive: false });
    c.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', end);
    return () => {
      c.removeEventListener('mousedown', start);
      c.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', end);
      c.removeEventListener('touchstart', start);
      c.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', end);
    };
  }, []);

  const clear = () => {
    const c = canvasRef.current;
    if (c) {
      c.getContext('2d')?.clearRect(0, 0, c.width, c.height);
      setSigned(false);
    }
  };

  const sign = () => {
    setSigned(true);
    toast.success('Signature captured · Proposal binding', {
      description: `${q.id} · Digital sign-off recorded`,
    });
  };

  return (
    <div className="space-y-6" data-testid="buyer-portal">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-heading">
            Collaborative Buyer Portal
          </h1>
          <p className="text-body">
            Enterprise buyer view ·{' '}
            <span className="font-mono-df text-indigo-600">
              {q.id} · {q.customer}
            </span>
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full macos-glass text-[11px] font-semibold">
          <Building className="w-3.5 h-3.5 text-indigo-600" /> Viewing as VP Procurement
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="space-y-4">
          <div className="embossed-card p-6">
            <h2 className="font-display font-semibold text-heading mb-4">Proposed Line Items</h2>
            <div className="space-y-3">
              {lineItems.map((i) => (
                <div
                  key={i.productId}
                  className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      i.product.type === 'hardware'
                        ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600'
                        : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600'
                    }`}
                  >
                    {i.product.type === 'hardware' ? (
                      <Cpu className="w-5 h-5" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-heading">{i.product.name}</div>
                    <div className="text-[11px] text-muted-df font-mono-df">
                      Qty {i.qty} · HSN {i.product.hsn} · @{formatINR(i.product.price)}
                    </div>
                  </div>
                  <div className="font-mono-df text-sm font-semibold text-heading text-right">
                    {formatINR(i.product.price * i.qty)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="embossed-card p-6">
            <h3 className="font-display font-semibold text-heading mb-4">Digital Signature</h3>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-300 dark:border-slate-700 p-4">
              <canvas
                ref={canvasRef}
                width={720}
                height={160}
                className="w-full h-40 cursor-crosshair rounded-md bg-white dark:bg-slate-900 touch-none"
                data-testid="buyer-signature-canvas"
              />
              <div className="flex items-center justify-between mt-3">
                <button
                  onClick={clear}
                  className="text-[12px] text-muted-df hover:text-heading font-medium cursor-pointer"
                  data-testid="sig-clear"
                >
                  Clear
                </button>
                <div className="text-[11px] font-mono-df text-muted-df">
                  Draw signature above · legally binding under IT Act 2000
                </div>
              </div>
            </div>
            <button
              disabled={signed}
              onClick={sign}
              className="btn-tactile-primary w-full justify-center mt-4 cursor-pointer"
              data-testid="buyer-sign-btn"
            >
              {signed ? (
                <>
                  <Check className="w-4 h-4" /> Signed & Binding · Awaiting Fulfillment
                </>
              ) : (
                <>
                  <PenLine className="w-4 h-4" /> Sign & Accept Proposal
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4 lg:sticky lg:top-24 self-start">
          <div className="embossed-card p-5">
            <h3 className="font-display font-semibold text-heading mb-3">Counter-Offer</h3>
            <div className="flex items-center justify-between text-[12px] mb-2">
              <span className="text-body font-medium">Requested concession</span>
              <span
                className="font-mono-df font-bold text-indigo-600 text-xl"
                data-testid="buyer-counter-val"
              >
                {counter}%
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              value={counter}
              onChange={(e) => setCounter(+e.target.value)}
              className="slider-tactile w-full cursor-pointer"
              data-testid="buyer-counter-slider"
            />
            <div className="mt-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-[12px] text-indigo-800 dark:text-indigo-200 font-medium">
              Within seller&apos;s Tier-2 negotiation band. Instant counter accepted.
            </div>
          </div>
          <div className="embossed-card p-5 space-y-2.5">
            <h3 className="font-display font-semibold text-heading mb-1">Your Total</h3>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-body">Gross</span>
              <span className="font-mono-df font-semibold text-subheading">{formatINR(gross)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted-df">Concession ({counter}%)</span>
              <span className="font-mono-df text-muted-df">− {formatINR(gross - net)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-body font-semibold">Net</span>
              <span className="font-mono-df font-bold text-heading">{formatINR(net)}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-muted-df">GST @ 18%</span>
              <span className="font-mono-df text-muted-df">{formatINR(gst)}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-body">Total Payable</span>
              <span
                className="font-mono-df text-xl font-extrabold text-indigo-600"
                data-testid="buyer-total"
              >
                {formatINR(total)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
