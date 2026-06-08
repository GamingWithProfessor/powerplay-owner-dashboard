import { useMemo, useState } from "react";
import { Plus, X, Trash2, Filter } from "lucide-react";
import type { Booking, Game, PaymentMode, PriceRule, Setup } from "../types";
import { formatINR, uid } from "../store";
import { ModeBadge } from "./Dashboard";
import { useToast } from "./Toast";

export default function Bookings({
  setups, pricing, games, bookings, setBookings,
}: {
  setups: Setup[];
  pricing: PriceRule[];
  games: Game[];
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "UPI" | "Cash" | "Split">("all");
  const { showToast } = useToast();

  const sorted = useMemo(() => {
    const list = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return filter === "all" ? list : list.filter((b) => b.paymentMode === filter);
  }, [bookings, filter]);

  const remove = (id: string) => {
    if (!confirm("Delete this booking?")) return;
    setBookings((prev) => prev.filter((b) => b.id !== id));
    showToast("Booking deleted successfully", "info");
  };

  const filters = ["all", "UPI", "Cash", "Split"] as const;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-slate-600 shrink-0" />
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150"
              style={
                filter === f
                  ? { background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }
                  : { background: "transparent", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(148,163,184,0.65)" }
              }
            >
              {f === "all" ? "All" : f}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="h-3.5 w-3.5" />
          New Booking
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="py-12 text-center rounded-2xl bg-white/[0.02] border border-dashed border-white/[0.05]">
          <p className="text-[13px] text-slate-500">No bookings yet.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block rounded-2xl overflow-hidden bg-navy-900/40 border border-white/[0.05]">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date / Time</th>
                  <th>Customer</th>
                  <th>Setup</th>
                  <th>Game</th>
                  <th>Dur</th>
                  <th style={{ textAlign: "right" }}>Total</th>
                  <th style={{ textAlign: "right" }}>UPI</th>
                  <th style={{ textAlign: "right" }}>Cash</th>
                  <th>Mode</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {sorted.map((b) => (
                  <tr key={b.id} style={b.isEmergency ? { background: "rgba(245,158,11,0.03)" } : {}}>
                    <td className="text-slate-400 whitespace-nowrap text-[12px]">
                      <div className="flex items-center gap-1.5">
                        {b.isEmergency && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />}
                        {new Date(b.createdAt).toLocaleString("en-IN", {
                          day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <p className="text-[13px] font-medium text-slate-200">{b.customerName || "—"}</p>
                        {b.isEmergency && <span className="badge badge-amber">Emergency</span>}
                      </div>
                      {b.customerPhone && <p className="text-[11px] text-slate-600">{b.customerPhone}</p>}
                    </td>
                    <td className="text-[12px] text-slate-400">{b.setupName}</td>
                    <td className="text-[12px] text-slate-400">{b.game || "—"}</td>
                    <td className="text-[12px] text-slate-500">{b.durationMinutes}m</td>
                    <td className="text-right text-[13px] font-semibold text-slate-200">{formatINR(b.amount)}</td>
                    <td className="text-right text-[12px] text-emerald-400">{formatINR(b.upiAmount)}</td>
                    <td className="text-right text-[12px] text-amber-400">{formatINR(b.cashAmount)}</td>
                    <td><ModeBadge mode={b.paymentMode} /></td>
                    <td>
                      <button onClick={() => remove(b.id)} className="btn-danger px-2 py-1.5">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="md:hidden space-y-2">
            {sorted.map((b) => (
              <li
                key={b.id}
                className="rounded-2xl p-4 border"
                style={{
                  background: b.isEmergency ? "rgba(245,158,11,0.04)" : "rgba(8,12,23,0.4)",
                  borderColor: b.isEmergency ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[14px] font-semibold text-slate-200 truncate">{b.customerName || "Walk-in"}</p>
                      {b.isEmergency && <span className="badge badge-amber">Emergency</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-slate-500">
                      <span>{b.setupName}</span>
                      {b.game && <span className="badge badge-purple">{b.game}</span>}
                      <span>{b.durationMinutes}m</span>
                      <ModeBadge mode={b.paymentMode} />
                    </div>
                  </div>
                  <p className={`text-[14px] font-bold shrink-0 ${b.isEmergency ? "text-amber-400" : "text-slate-100"}`}>{formatINR(b.amount)}</p>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {showForm && (
        <BookingForm
          setups={setups}
          pricing={pricing}
          games={games}
          onClose={() => setShowForm(false)}
          onSave={(b) => { 
            setBookings((prev) => [b, ...prev]); 
            setShowForm(false);
            showToast(`Booking for ${b.customerName} created`);
          }}
        />
      )}
    </div>
  );
}

function BookingForm({
  setups, pricing, games, onClose, onSave,
}: {
  setups: Setup[];
  pricing: PriceRule[];
  games: Game[];
  onClose: () => void;
  onSave: (b: Booking) => void;
}) {
  const [setupId, setSetupId] = useState(setups[0]?.id ?? "");
  const [priceRuleId, setPriceRuleId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [game, setGame] = useState("");
  const [customGame, setCustomGame] = useState("");
  const [amount, setAmount] = useState(0);
  const [mode, setMode] = useState<PaymentMode>("UPI");
  const [upiAmount, setUpiAmount] = useState(0);
  const [cashAmount, setCashAmount] = useState(0);

  const setup = setups.find((s) => s.id === setupId);
  const rule = pricing.find((p) => p.id === priceRuleId);

  const onRuleChange = (id: string) => {
    setPriceRuleId(id);
    const r = pricing.find((p) => p.id === id);
    if (r) {
      setAmount(r.amount);
      if (mode === "UPI") setUpiAmount(r.amount);
      if (mode === "Cash") setCashAmount(r.amount);
    }
  };

  const onModeChange = (m: PaymentMode) => {
    setMode(m);
    if (m === "UPI") { setUpiAmount(amount); setCashAmount(0); }
    else if (m === "Cash") { setUpiAmount(0); setCashAmount(amount); }
    else { setUpiAmount(Math.floor(amount / 2)); setCashAmount(amount - Math.floor(amount / 2)); }
  };

  const onAmountChange = (v: number) => {
    setAmount(v);
    if (mode === "UPI") setUpiAmount(v);
    else if (mode === "Cash") setCashAmount(v);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setup || !customerName.trim()) return;
    const finalUpi = mode === "UPI" ? amount : mode === "Split" ? upiAmount : 0;
    const finalCash = mode === "Cash" ? amount : mode === "Split" ? cashAmount : 0;
    const now = new Date();
    const dur = rule?.durationMinutes ?? 0;
    const end = new Date(now.getTime() + dur * 60000);
    const pad2 = (n: number) => String(n).padStart(2, "0");
    const dateStr = now.toISOString().slice(0, 10);
    onSave({
      id: uid(), setupId: setup.id, setupName: setup.name,
      customerName: customerName.trim(), customerPhone: customerPhone.trim(),
      game: game === "Other" ? (customGame.trim() || "Other") : game || undefined,
      priceRuleId: priceRuleId || "custom",
      durationMinutes: dur, amount, paymentMode: mode,
      upiAmount: finalUpi, cashAmount: finalCash, status: "Confirmed",
      bookingDate: dateStr,
      startTime: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`,
      endTime: `${pad2(end.getHours())}:${pad2(end.getMinutes())}`,
      createdAt: now.toISOString(), date: dateStr,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 p-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <form onSubmit={submit} className="modal-sheet w-full space-y-4 overflow-y-auto max-h-[92dvh] animate-[slideUp_0.3s_ease-out]">
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-white tracking-tight">New Booking</h3>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-slate-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="section-label block mb-1.5">Setup</span>
            <select value={setupId} onChange={(e) => { setSetupId(e.target.value); setPriceRuleId(""); }} className="input" required>
              {setups.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.type}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="section-label block mb-1.5">Pricing Plan</span>
            <select value={priceRuleId} onChange={(e) => onRuleChange(e.target.value)} className="input">
              <option value="">— Select a plan —</option>
              {pricing.filter((p) => !p.appliesTo || p.appliesTo === setup?.type).map((r) => (
                <option key={r.id} value={r.id}>{r.label} — {formatINR(r.amount)} ({r.durationMinutes}m)</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="block">
            <span className="section-label block mb-1.5">Customer Name</span>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="input" required />
          </label>
          <label className="block">
            <span className="section-label block mb-1.5">Phone</span>
            <input
              type="tel" inputMode="numeric" maxLength={10}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="10-digit number" className="input"
            />
          </label>
        </div>

        <label className="block">
          <span className="section-label block mb-1.5">Game (optional)</span>
          <select value={game} onChange={(e) => { setGame(e.target.value); if (e.target.value !== "Other") setCustomGame(""); }} className="input">
            <option value="">— No preference —</option>
            {games.map((g) => <option key={g.id} value={g.name}>{g.name}</option>)}
            <option value="Other">+ Other</option>
          </select>
          {game === "Other" && (
            <input value={customGame} onChange={(e) => setCustomGame(e.target.value)} placeholder="Game name" className="input mt-2" required />
          )}
        </label>

        <label className="block">
          <span className="section-label block mb-1.5">Total Amount (₹)</span>
          <input type="number" inputMode="numeric" min={0} value={amount}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            className="input text-[18px] font-bold" required />
        </label>

        <label className="block">
          <span className="section-label block mb-2">Payment Mode</span>
          <div className="grid grid-cols-3 gap-2">
            {(["UPI", "Cash", "Split"] as PaymentMode[]).map((m) => (
              <button
                key={m} type="button" onClick={() => onModeChange(m)}
                className="py-2.5 rounded-xl text-[13px] font-semibold transition-all"
                style={
                  mode === m
                    ? { background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", color: "#a5b4fc" }
                    : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#94a3b8" }
                }
              >
                {m}
              </button>
            ))}
          </div>
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button type="submit" className="btn-primary">Save Booking</button>
        </div>
      </form>
    </div>
  );
}
