import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatINR } from '@/data/mockData';
import { Warehouse, Package, Truck, FileText, Download, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function Fulfillment() {
  const { quotes, updateQuote } = useApp();
  const q = quotes.find((x) => x.stage === 'Signed' || x.stage === 'Invoiced') || quotes[3];
  const [blr, setBlr] = useState<number>(q.hubs.blr);
  const [mum, setMum] = useState<number>(q.hubs.mum);
  const [dispatched, setDispatched] = useState<boolean>(q.stage === 'Invoiced');

  const total = blr + mum;
  const milestones = [
    { label: 'Advance', pct: 30, val: q.value * 0.3, done: true, trigger: 'PO signed' },
    {
      label: 'Dispatch',
      pct: 50,
      val: q.value * 0.5,
      done: dispatched,
      trigger: 'Hub dispatch confirmed',
    },
    {
      label: 'SLA Go-Live',
      pct: 20,
      val: q.value * 0.2,
      done: false,
      trigger: 'Post 30-day SLA verification',
    },
  ];

  const dispatch = () => {
    setDispatched(true);
    updateQuote(q.id, { stage: 'Invoiced' });
    toast.success('Dispatch confirmed & invoice #INV-2426-' + q.id.split('-')[1] + ' generated', {
      description: `${formatINR(q.value * 0.5)} milestone billing triggered · ERP synced`,
    });
  };

  const exportInv = () =>
    toast.success('Tax invoice exported', {
      description: 'Odoo & SAP S/4HANA sync queued',
    });

  return (
    <div className="space-y-6" data-testid="fulfillment">
      <div>
        <h1 className="text-3xl font-display font-bold text-heading">
          Split Warehouse & Milestone Billing
        </h1>
        <p className="text-body">
          Multi-hub dispatch and GST-compliant invoicing ·{' '}
          <span className="font-mono-df text-indigo-600">
            {q.id} · {q.customer}
          </span>
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="embossed-card p-6">
          <h2 className="font-display font-semibold text-heading mb-4">Hub Allocation</h2>
          <div className="space-y-4">
            <HubRow
              name="Bangalore · Primary Hub"
              sla="48h SLA"
              val={blr}
              setVal={setBlr}
              max={total}
              tid="hub-blr"
              icon={Warehouse}
            />
            <HubRow
              name="Mumbai · Cross-Dock"
              sla="72h SLA · Cross-shipped"
              val={mum}
              setVal={setMum}
              max={total}
              tid="hub-mum"
              icon={Package}
            />
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-between text-[12px] font-semibold">
              <span className="text-indigo-800 dark:text-indigo-200">Total allocation</span>
              <span className="font-mono-df text-indigo-700 dark:text-indigo-300">
                {total} units · In-stock ✓
              </span>
            </div>
          </div>
          <button
            disabled={dispatched}
            onClick={dispatch}
            className="btn-tactile-primary w-full justify-center mt-5 cursor-pointer disabled:opacity-50"
            data-testid="warehouse-dispatch-btn"
          >
            {dispatched ? (
              <>
                <Check className="w-4 h-4" /> Dispatched · Invoice Generated
              </>
            ) : (
              <>
                <Truck className="w-4 h-4" /> Confirm Dispatch & Trigger Milestone Invoice
              </>
            )}
          </button>
        </div>

        <div className="embossed-card p-6">
          <h2 className="font-display font-semibold text-heading mb-4">Milestone Billing</h2>
          <div className="space-y-3">
            {milestones.map((m) => (
              <div
                key={m.label}
                className={`p-4 rounded-xl border ${
                  m.done
                    ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40'
                }`}
                data-testid={`milestone-${m.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        m.done
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      {m.done ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <span className="text-[10px] font-bold">{m.pct}%</span>
                      )}
                    </div>
                    <div className="text-[14px] font-semibold text-heading">
                      {m.label} · {m.pct}%
                    </div>
                  </div>
                  <div className="font-mono-df text-sm font-bold text-heading">
                    {formatINR(m.val)}
                  </div>
                </div>
                <div className="text-[11px] text-muted-df ml-8">{m.trigger}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="embossed-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-heading flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Tax Invoice Preview
          </h2>
          <button
            onClick={exportInv}
            className="btn-tactile-secondary text-[13px] cursor-pointer"
            data-testid="export-invoice-btn"
          >
            <Download className="w-4 h-4" /> Export to Odoo · SAP
          </button>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 p-5 font-mono-df text-[12px] text-body space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-df">Invoice No</span>
            <span className="text-heading font-semibold">INV-2426-{q.id.split('-')[1]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-df">GSTIN (Buyer)</span>
            <span className="text-heading">29AAACC0123R1Z5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-df">Place of Supply</span>
            <span className="text-heading">Karnataka (29)</span>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 my-2" />
          <div className="flex justify-between">
            <span className="text-muted-df">Taxable Value (Dispatch Milestone)</span>
            <span className="text-heading">{formatINR((q.value * 0.5) / 1.18)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-df">CGST @ 9%</span>
            <span className="text-heading">{formatINR(((q.value * 0.5) / 1.18) * 0.09)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-df">SGST @ 9%</span>
            <span className="text-heading">{formatINR(((q.value * 0.5) / 1.18) * 0.09)}</span>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 my-2" />
          <div className="flex justify-between text-sm">
            <span className="text-body font-semibold">Total Payable</span>
            <span className="text-indigo-600 font-extrabold">{formatINR(q.value * 0.5)}</span>
          </div>
          <div className="flex justify-between text-[11px] pt-1">
            <span className="text-muted-df">HSN Codes</span>
            <span className="text-heading">8471, 9983</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const HubRow: React.FC<{
  name: string;
  sla: string;
  val: number;
  setVal: (v: number) => void;
  max: number;
  tid: string;
  icon: any;
}> = ({ name, sla, val, setVal, tid, icon: Icon }) => (
  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40">
    <div className="flex items-center gap-3 mb-3">
      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center">
        <Icon className="w-5 h-5 text-indigo-600" />
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold text-heading">{name}</div>
        <div className="text-[11px] text-muted-df font-mono-df">{sla}</div>
      </div>
      <div
        className="font-mono-df text-2xl font-extrabold text-indigo-600"
        data-testid={`${tid}-val`}
      >
        {val}
        <span className="text-xs text-muted-df ml-1 font-normal">u</span>
      </div>
    </div>
    <input
      type="range"
      min="0"
      max="320"
      value={val}
      onChange={(e) => setVal(+e.target.value)}
      className="slider-tactile w-full cursor-pointer"
      data-testid={`${tid}-slider`}
    />
  </div>
);
