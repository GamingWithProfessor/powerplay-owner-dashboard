import { useMemo, useState } from "react";
import { Plus, Edit3, Trash2, X } from "lucide-react";
import type { Expense, ExpensePaymentMode } from "../types";
import { formatINR, uid } from "../store";

const categories: Expense["category"][] = ["Rent","Electricity","Internet","Salary","Maintenance","Snacks","Other"];
const paymentModes: ExpensePaymentMode[] = ["Cash","UPI","Card","Other"];

export default function Expenses({ expenses, setExpenses }: {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  const sorted = useMemo(() => [...expenses].sort((a, b) => b.date.localeCompare(a.date)), [expenses]);

  const today = new Date().toISOString().slice(0, 10);
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const todayTotal = expenses.filter((e) => e.date === today).reduce((s, e) => s + e.amount, 0);

  const save = (expense: Expense) => {
    setExpenses((prev) => {
      const idx = prev.findIndex((e) => e.id === expense.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = expense; return n; }
      return [expense, ...prev];
    });
    setEditing(null); setShowForm(false);
  };

  const remove = (id: string) => {
    if (!confirm("Delete this expense?")) return;
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* Mini stats + add button */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <MiniStat label="Total" value={formatINR(total)} />
          <MiniStat label="Today" value={formatINR(todayTotal)} accent />
          <MiniStat label="Entries" value={String(sorted.length)} />
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="btn-primary"
          style={{
            background: "linear-gradient(135deg, #f43f5e, #fb923c)",
            boxShadow: "0 4px 16px rgba(244,63,94,0.25)",
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Expense
        </button>
      </div>

      {sorted.length === 0 ? (
        <div
          className="py-10 text-center rounded-2xl"
          style={{ background: "rgba(13,17,32,0.6)", border: "1px dashed rgba(255,255,255,0.06)" }}
        >
          <p className="text-[13px] text-slate-500">No expenses recorded yet.</p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div
            className="hidden md:block rounded-2xl overflow-hidden"
            style={{ background: "linear-gradient(145deg, rgba(13,17,32,0.85), rgba(8,12,23,0.9))", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Paid By</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sorted.map((e) => (
                  <tr key={e.id}>
                    <td className="text-[12px] text-slate-500 whitespace-nowrap">{prettify(e.date)}</td>
                    <td>
                      <p className="text-[13px] font-medium text-slate-200">{e.title}</p>
                      {e.notes && <p className="text-[11px] text-slate-600">{e.notes}</p>}
                    </td>
                    <td><span className="badge badge-rose">{e.category}</span></td>
                    <td className="text-[12px] text-slate-400">{e.paidBy}</td>
                    <td className="text-right text-[13px] font-semibold" style={{ color: "#fb7185" }}>{formatINR(e.amount)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(e); setShowForm(true); }} className="btn-ghost px-2 py-1.5">
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button onClick={() => remove(e.id)} className="btn-danger px-2 py-1.5">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <ul className="md:hidden space-y-2">
            {sorted.map((e) => (
              <li key={e.id} className="rounded-2xl p-4"
                style={{ background: "linear-gradient(145deg, rgba(13,17,32,0.85), rgba(8,12,23,0.9))", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-slate-200 truncate">{e.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[11px] text-slate-500">{prettify(e.date)}</span>
                      <span className="badge badge-rose">{e.category}</span>
                      <span className="text-[11px] text-slate-600">{e.paidBy}</span>
                    </div>
                    {e.notes && <p className="text-[11px] text-slate-600 mt-1">{e.notes}</p>}
                  </div>
                  <p className="text-[14px] font-bold shrink-0" style={{ color: "#fb7185" }}>{formatINR(e.amount)}</p>
                </div>
                <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  <button onClick={() => { setEditing(e); setShowForm(true); }} className="btn-ghost flex-1 text-[12px]">
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button onClick={() => remove(e.id)} className="btn-danger text-[12px]">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {showForm && (
        <ExpenseForm initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={save} />
      )}
    </div>
  );
}

function ExpenseForm({ initial, onClose, onSave }: {
  initial: Expense | null;
  onClose: () => void;
  onSave: (e: Expense) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(initial?.date ?? today);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState<Expense["category"]>(initial?.category ?? "Other");
  const [amount, setAmount] = useState(initial?.amount ?? 0);
  const [paidBy, setPaidBy] = useState<ExpensePaymentMode>(initial?.paidBy ?? "Cash");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0) return;
    onSave({ id: initial?.id ?? uid(), date, title: title.trim(), category, amount: Number(amount), paidBy, notes: notes.trim(), createdAt: initial?.createdAt ?? new Date().toISOString() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 p-0"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}>
      <form onSubmit={submit} className="modal-sheet w-full space-y-4 overflow-y-auto max-h-[92dvh]">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-white">{initial ? "Edit Expense" : "New Expense"}</h3>
          <button type="button" onClick={onClose} className="btn-ghost h-8 w-8 p-0"><X className="h-4 w-4" /></button>
        </div>

        <label className="block">
          <span className="section-label block mb-1.5">Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" required />
        </label>

        <label className="block">
          <span className="section-label block mb-1.5">Expense Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Electricity bill" className="input" required />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="section-label block mb-1.5">Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value as Expense["category"])} className="input">
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="section-label block mb-1.5">Paid By</span>
            <select value={paidBy} onChange={(e) => setPaidBy(e.target.value as ExpensePaymentMode)} className="input">
              {paymentModes.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="section-label block mb-1.5">Amount (₹)</span>
          <input type="number" inputMode="numeric" min={0} value={amount}
            onChange={(e) => setAmount(Number(e.target.value))} className="input text-[18px] font-bold" required />
        </label>

        <label className="block">
          <span className="section-label block mb-1.5">Notes (optional)</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="input" style={{ resize: "none" }} />
        </label>

        <div className="flex justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" className="btn-primary"
            style={{ background: "linear-gradient(135deg, #f43f5e, #fb923c)", boxShadow: "0 4px 16px rgba(244,63,94,0.2)" }}>
            {initial ? "Save Changes" : "Add Expense"}
          </button>
        </div>
      </form>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="text-center">
      <p className="text-[13px] font-bold" style={{ color: accent ? "#fb7185" : "white" }}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-slate-600">{label}</p>
    </div>
  );
}

function prettify(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
