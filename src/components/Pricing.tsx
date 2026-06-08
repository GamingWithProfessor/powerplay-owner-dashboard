import { useState } from "react";
import { Plus, Edit3, Trash2, X } from "lucide-react";
import type { PriceRule, Setup } from "../types";
import { uid, formatINR } from "../store";

const types: (Setup["type"] | "All")[] = ["All","PS5","Xbox","PC","VR","Racing Sim","Other"];

export default function Pricing({ pricing, setPricing }: {
  pricing: PriceRule[];
  setPricing: React.Dispatch<React.SetStateAction<PriceRule[]>>;
}) {
  const [editing, setEditing] = useState<PriceRule | null>(null);
  const [showForm, setShowForm] = useState(false);

  const save = (p: PriceRule) => {
    setPricing((prev) => {
      const i = prev.findIndex((x) => x.id === p.id);
      if (i >= 0) { const c = [...prev]; c[i] = p; return c; }
      return [...prev, p];
    });
    setEditing(null); setShowForm(false);
  };

  const remove = (id: string) => {
    if (!confirm("Remove this pricing rule?")) return;
    setPricing((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[15px] font-bold text-white">Pricing Rules</p>
          <p className="text-[12px] text-slate-500 mt-0.5">Configure rates per session. Update anytime.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary">
          <Plus className="h-3.5 w-3.5" /> Add Price
        </button>
      </div>

      {pricing.length === 0 ? (
        <div className="py-10 text-center rounded-2xl" style={{ border: "1px dashed rgba(255,255,255,0.06)" }}>
          <p className="text-[13px] text-slate-500">No pricing rules yet.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-2xl overflow-hidden" style={{ background: "rgba(8,12,23,0.7)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Applies To</th>
                  <th>Duration</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pricing.map((p) => (
                  <tr key={p.id}>
                    <td className="text-[13px] font-medium text-slate-200">{p.label}</td>
                    <td><span className="badge badge-cyan">{p.appliesTo ?? "All"}</span></td>
                    <td className="text-[12px] text-slate-400">{p.durationMinutes} min</td>
                    <td className="text-right text-[14px] font-bold text-white">{formatINR(p.amount)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(p); setShowForm(true); }} className="btn-ghost px-2.5 py-1.5 text-[12px]">
                          <Edit3 className="h-3 w-3" /> Edit
                        </button>
                        <button onClick={() => remove(p.id)} className="btn-danger px-2.5 py-1.5 text-[12px]">
                          <Trash2 className="h-3 w-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="md:hidden space-y-2">
            {pricing.map((p) => (
              <li key={p.id} className="rounded-2xl p-4" style={{ background: "rgba(8,12,23,0.7)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-slate-200 truncate">{p.label}</p>
                    <div className="flex gap-2 mt-1.5">
                      <span className="badge badge-cyan">{p.appliesTo ?? "All"}</span>
                      <span className="text-[11px] text-slate-500">{p.durationMinutes} min</span>
                    </div>
                  </div>
                  <p className="text-[16px] font-bold text-white shrink-0">{formatINR(p.amount)}</p>
                </div>
                <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <button onClick={() => { setEditing(p); setShowForm(true); }} className="btn-ghost flex-1 text-[12px]"><Edit3 className="h-3.5 w-3.5" /> Edit</button>
                  <button onClick={() => remove(p.id)} className="btn-danger text-[12px]"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {showForm && (
        <PriceForm initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={save} />
      )}
    </div>
  );
}

function PriceForm({ initial, onClose, onSave }: {
  initial: PriceRule | null; onClose: () => void; onSave: (p: PriceRule) => void;
}) {
  const [label,     setLabel]    = useState(initial?.label ?? "");
  const [duration,  setDuration] = useState(initial?.durationMinutes ?? 60);
  const [amount,    setAmount]   = useState(initial?.amount ?? 0);
  const [appliesTo, setApplies]  = useState<Setup["type"] | "All">(initial?.appliesTo ?? "All");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || amount <= 0) return;
    onSave({ id: initial?.id ?? uid(), label: label.trim(), durationMinutes: Number(duration), amount: Number(amount), appliesTo: appliesTo === "All" ? undefined : appliesTo });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 p-0"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}>
      <form onSubmit={submit} className="modal-sheet w-full space-y-4 overflow-y-auto max-h-[92dvh]">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-white">{initial ? "Edit Pricing" : "New Pricing Rule"}</h3>
          <button type="button" onClick={onClose} className="btn-ghost h-8 w-8 p-0"><X className="h-4 w-4" /></button>
        </div>

        <label className="block">
          <span className="section-label block mb-1.5">Label</span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. PS5 — 1 Hour" className="input" required />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="section-label block mb-1.5">Duration (min)</span>
            <input type="number" inputMode="numeric" min={1} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="input" required />
          </label>
          <label className="block">
            <span className="section-label block mb-1.5">Amount (₹)</span>
            <input type="number" inputMode="numeric" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="input" required />
          </label>
        </div>

        <label className="block">
          <span className="section-label block mb-1.5">Applies To</span>
          <select value={appliesTo} onChange={(e) => setApplies(e.target.value as Setup["type"] | "All")} className="input">
            {types.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" className="btn-primary">{initial ? "Save" : "Add Price"}</button>
        </div>
      </form>
    </div>
  );
}
