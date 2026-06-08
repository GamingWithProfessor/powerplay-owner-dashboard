import { useState } from "react";
import { Gamepad2, Sliders, BookOpen, AlertTriangle, Plus, X } from "lucide-react";
import type { Booking, Game, PaymentMode, PriceRule, Setup } from "../types";
import { formatINR, uid } from "../store";
import { useToast } from "./Toast";
import Setups from "./Setups";
import Pricing from "./Pricing";
import Games from "./Games";

export default function SettingsPage({
  setups, setSetups, pricing, setPricing, games, setGames, bookings, setBookings,
}: {
  setups: Setup[];
  setSetups: React.Dispatch<React.SetStateAction<Setup[]>>;
  pricing: PriceRule[];
  setPricing: React.Dispatch<React.SetStateAction<PriceRule[]>>;
  games: Game[];
  setGames: React.Dispatch<React.SetStateAction<Game[]>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
}) {
  const [section, setSection] = useState<"setups" | "pricing" | "games" | "emergency">("setups");

  const emergencyCount = bookings.filter((b) => b.isEmergency).length;

  const tabs = [
    { id: "setups"    as const, label: "Setups",          icon: Gamepad2,       count: setups.length  },
    { id: "pricing"   as const, label: "Pricing",         icon: Sliders,        count: pricing.length },
    { id: "games"     as const, label: "Game Library",    icon: BookOpen,       count: games.length   },
    { id: "emergency" as const, label: "Emergency Entry", icon: AlertTriangle,  count: emergencyCount },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-[13px] text-slate-500 mt-1">Manage setups, pricing, games, and emergency bookings.</p>
      </div>

      {/* Tab selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = section === t.id;
          const isEmergencyTab = t.id === "emergency";
          return (
            <button
              key={t.id}
              onClick={() => setSection(t.id)}
              className="flex items-center gap-3 rounded-2xl p-4 text-left transition-all duration-200"
              style={
                active
                  ? {
                      background: isEmergencyTab
                        ? "linear-gradient(135deg, rgba(245,158,11,0.18), rgba(251,146,60,0.10))"
                        : "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(168,85,247,0.10))",
                      border: `1px solid ${isEmergencyTab ? "rgba(245,158,11,0.28)" : "rgba(99,102,241,0.28)"}`,
                      boxShadow: `0 0 24px ${isEmergencyTab ? "rgba(245,158,11,0.08)" : "rgba(99,102,241,0.08)"}, 0 4px 16px rgba(0,0,0,0.2)`,
                    }
                  : {
                      background: "linear-gradient(145deg, rgba(13,17,32,0.8), rgba(8,12,23,0.85))",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }
              }
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.10)";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.05)";
              }}
            >
              <span
                className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                style={
                  active
                    ? isEmergencyTab
                      ? { background: "linear-gradient(135deg, rgba(245,158,11,0.3), rgba(251,146,60,0.2))", border: "1px solid rgba(245,158,11,0.3)", color: "#fbbf24" }
                      : { background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.2))", border: "1px solid rgba(99,102,241,0.3)", color: "#a5b4fc" }
                    : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#64748b" }
                }
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold" style={{ color: active ? "white" : "#94a3b8" }}>{t.label}</p>
                <p className="text-[11px] text-slate-600">{t.count} items</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div
        className="rounded-2xl p-4 md:p-6"
        style={{
          background: "linear-gradient(145deg, rgba(13,17,32,0.85), rgba(8,12,23,0.90))",
          border: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
        }}
      >
        {section === "setups"    && <Setups  setups={setups} setSetups={setSetups} />}
        {section === "pricing"   && <Pricing pricing={pricing} setPricing={setPricing} />}
        {section === "games"     && <Games   games={games}   setGames={setGames} />}
        {section === "emergency" && (
          <EmergencyEntry
            setups={setups}
            pricing={pricing}
            games={games}
            bookings={bookings}
            setBookings={setBookings}
          />
        )}
      </div>
    </div>
  );
}

/* ── Emergency Entry Section ── */

function EmergencyEntry({
  setups, pricing, games, bookings, setBookings,
}: {
  setups: Setup[];
  pricing: PriceRule[];
  games: Game[];
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
}) {
  const [showForm, setShowForm] = useState(false);
  const { showToast } = useToast();

  const emergencyBookings = bookings
    .filter((b) => b.isEmergency)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const remove = (id: string) => {
    if (!confirm("Delete this emergency entry?")) return;
    setBookings((prev) => prev.filter((b) => b.id !== id));
    showToast("Emergency entry deleted", "info");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <p className="text-[15px] font-bold text-white">Emergency Entry</p>
          </div>
          <p className="text-[12px] text-slate-500 mt-1">Add missed or past bookings retroactively. These are tagged as emergency entries across dashboard and PDF reports.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl text-[13px] font-semibold transition-all active:scale-95"
          style={{
            background: "linear-gradient(135deg, #f59e0b, #fb923c)",
            color: "white",
            boxShadow: "0 4px 16px rgba(245,158,11,0.3)",
          }}
        >
          <Plus className="h-3.5 w-3.5" /> Add Emergency Entry
        </button>
      </div>

      {/* Existing emergency entries */}
      {emergencyBookings.length === 0 ? (
        <div className="py-10 text-center rounded-2xl" style={{ border: "1px dashed rgba(245,158,11,0.15)" }}>
          <AlertTriangle className="h-8 w-8 text-slate-600 mx-auto mb-3" />
          <p className="text-[13px] text-slate-500">No emergency entries yet.</p>
          <p className="text-[11px] text-slate-600 mt-1">Use this when you forgot to book a slot during a session.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {emergencyBookings.map((b) => (
            <div
              key={b.id}
              className="rounded-xl p-4 flex items-start justify-between gap-3 transition-all duration-200"
              style={{
                background: "rgba(245,158,11,0.04)",
                border: "1px solid rgba(245,158,11,0.15)",
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[13px] font-semibold text-white">{b.customerName || "Walk-in"}</p>
                  <span className="badge badge-amber">Emergency</span>
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap text-[11px] text-slate-500">
                  <span>{new Date(b.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  <span>·</span>
                  <span>{b.setupName}</span>
                  {b.game && <><span>·</span><span>{b.game}</span></>}
                  <span>·</span>
                  <span>{b.durationMinutes}m</span>
                  <span>·</span>
                  <span>{b.paymentMode}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[14px] font-bold text-amber-400">{formatINR(b.amount)}</p>
                <button onClick={() => remove(b.id)} className="btn-danger mt-1.5 text-[11px] px-2 py-1">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <EmergencyForm
          setups={setups}
          pricing={pricing}
          games={games}
          onClose={() => setShowForm(false)}
          onSave={(b) => {
            setBookings((prev) => [b, ...prev]);
            setShowForm(false);
            showToast(`Emergency entry for ${b.customerName} added`, "success");
          }}
        />
      )}
    </div>
  );
}

/* ── Emergency Form ── */

function EmergencyForm({
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
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("10:00");

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
    if (!setup || !customerName.trim() || !bookingDate) return;
    const finalUpi = mode === "UPI" ? amount : mode === "Split" ? upiAmount : 0;
    const finalCash = mode === "Cash" ? amount : mode === "Split" ? cashAmount : 0;
    const dur = rule?.durationMinutes ?? 60;
    const startDate = new Date(`${bookingDate}T${startTime}`);
    const endDate = new Date(startDate.getTime() + dur * 60000);
    const pad2 = (n: number) => String(n).padStart(2, "0");

    onSave({
      id: uid(),
      setupId: setup.id,
      setupName: setup.name,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      game: game === "Other" ? (customGame.trim() || "Other") : game || undefined,
      priceRuleId: priceRuleId || "custom",
      durationMinutes: dur,
      amount,
      paymentMode: mode,
      upiAmount: finalUpi,
      cashAmount: finalCash,
      status: "Completed",
      bookingDate,
      startTime,
      endTime: `${pad2(endDate.getHours())}:${pad2(endDate.getMinutes())}`,
      createdAt: startDate.toISOString(),
      date: bookingDate,
      isEmergency: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 p-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <form onSubmit={submit} className="modal-sheet w-full space-y-4 overflow-y-auto max-h-[92dvh] animate-[slideUp_0.3s_ease-out]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <h3 className="text-[16px] font-bold text-white tracking-tight">Emergency Entry</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 text-slate-500 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Amber warning banner */}
        <div
          className="rounded-xl p-3 flex items-start gap-2.5"
          style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}
        >
          <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
          <p className="text-[12px] text-amber-300/80 leading-relaxed">
            This booking will be tagged as an <b>Emergency Entry</b> and highlighted with a different color across the dashboard and PDF exports.
          </p>
        </div>

        {/* Date & Time (past date selection) */}
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="section-label block mb-1.5">Booking Date *</span>
            <input
              type="date"
              value={bookingDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setBookingDate(e.target.value)}
              className="input"
              required
            />
          </label>
          <label className="block">
            <span className="section-label block mb-1.5">Start Time *</span>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input"
              required
            />
          </label>
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
            <span className="section-label block mb-1.5">Customer Name *</span>
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
          <span className="section-label block mb-1.5">Total Amount (Rs.) *</span>
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
                    ? { background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.35)", color: "#fbbf24" }
                    : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "#94a3b8" }
                }
              >
                {m}
              </button>
            ))}
          </div>
        </label>

        {mode === "Split" && (
          <div className="grid grid-cols-2 gap-3 rounded-xl p-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <label className="block">
              <span className="section-label block mb-1.5">UPI Amount</span>
              <input type="number" inputMode="numeric" min={0} max={amount} value={upiAmount}
                onChange={(e) => { const v = Math.min(Number(e.target.value) || 0, amount); setUpiAmount(v); setCashAmount(amount - v); }}
                className="input" />
            </label>
            <label className="block">
              <span className="section-label block mb-1.5">Cash (auto)</span>
              <input type="number" value={cashAmount} readOnly className="input opacity-60" />
            </label>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-[13px] font-semibold transition-all active:scale-95"
            style={{ background: "linear-gradient(135deg, #f59e0b, #fb923c)", color: "white", boxShadow: "0 4px 16px rgba(245,158,11,0.3)" }}
          >
            <AlertTriangle className="h-3.5 w-3.5" /> Save Emergency Entry
          </button>
        </div>
      </form>
    </div>
  );
}
