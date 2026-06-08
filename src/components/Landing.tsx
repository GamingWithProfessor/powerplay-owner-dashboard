import { useMemo, useState } from "react";
import { Gamepad2, Monitor, Trophy, Users2, Zap } from "lucide-react";
import type { Booking, Setup, TimeSlot } from "../types";
import { formatINR } from "../store";

export type BookingDraft = {
  setupId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  endTime: string;
  amount: number;
  paymentMode: "UPI" | "Cash" | "Split";
  upiAmount: number;
  cashAmount: number;
};

export default function Landing({
  setups,
  games,
  onSave,
  onGoOwner,
}: {
  setups: Setup[];
  games: any[];
  onSave: (b: Booking) => void;
  onGoOwner: () => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [setupId, setSetupId] = useState("");
  const [date, setDate] = useState(today);
  const [slot, setSlot] = useState<TimeSlot | null>(null);
  const [draft, setDraft] = useState<BookingDraft>({
    setupId: "",
    customerName: "",
    customerPhone: "",
    date: today,
    startTime: "",
    durationMinutes: 60,
    endTime: "",
    amount: 0,
    paymentMode: "UPI",
    upiAmount: 0,
    cashAmount: 0,
  });

  const selected = setups.find((s) => s.id === setupId);

  const slots: TimeSlot[] = useMemo(() => {
    if (!selected) return [];
    const out: TimeSlot[] = [];
    for (let h = 10; h <= 22; h++) {
      const hh = String(h).padStart(2, "0");
      out.push({
        id: `${setupId}-${date}-${hh}:00`,
        time: `${hh}:00`,
        available: Math.random() > 0.4,
        price: selected.pricePerHour ?? 149,
      });
      out.push({
        id: `${setupId}-${date}-${hh}:30`,
        time: `${hh}:30`,
        available: Math.random() > 0.5,
        price: Math.round(((selected.pricePerHour ?? 149) * 0.6) / 10) * 10,
      });
    }
    return out;
  }, [setupId, date, selected]);

  const pickSlot = (t: TimeSlot) => {
    setSlot(t);
    setDraft((d) => ({
      ...d,
      startTime: t.time,
      amount: t.price,
      upiAmount: t.price,
      cashAmount: 0,
    }));
    setStep(3 as 3);
  };

  const submit = () => {
    const endDate = new Date(`${draft.date}T${draft.startTime}`);
    endDate.setMinutes(endDate.getMinutes() + draft.durationMinutes);
    const endTime = `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}`;

    let upi = draft.upiAmount;
    let cash = draft.cashAmount;
    if (draft.paymentMode === "UPI") {
      upi = draft.amount;
      cash = 0;
    } else if (draft.paymentMode === "Cash") {
      upi = 0;
      cash = draft.amount;
    } else {
      upi = Math.floor(draft.amount / 2);
      cash = draft.amount - upi;
    }

    const now = new Date().toISOString();
    const b: Booking = {
      id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      setupId: draft.setupId,
      setupName: selected?.name || "",
      customerName: draft.customerName,
      customerPhone: draft.customerPhone,
      bookingDate: draft.date,
      startTime: draft.startTime,
      endTime,
      durationMinutes: draft.durationMinutes,
      amount: draft.amount,
      paymentMode: draft.paymentMode,
      upiAmount: upi,
      cashAmount: cash,
      status: "Confirmed",
      createdAt: now,
      date: draft.date,
      priceRuleId: "customer",
    };

    onSave(b);
    setStep(1);
    setSetupId("");
    setSlot(null);
    setDraft({
      setupId: "",
      customerName: "",
      customerPhone: "",
      date: today,
      startTime: "",
      durationMinutes: 60,
      endTime: "",
      amount: 0,
      paymentMode: "UPI",
      upiAmount: 0,
      cashAmount: 0,
    });
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-neon-purple/20 blur-[120px] animate-[float_10s_ease-in-out_infinite]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-neon-cyan/15 blur-[100px] animate-[float_12s_ease-in-out_infinite_2s]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-neon-pink/15 blur-[90px] animate-[float_14s_ease-in-out_infinite_4s]" />
      </div>

      <header className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 pt-5">
          <nav className="flex items-center justify-between rounded-2xl border border-white/5 bg-navy-900/60 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan grid place-items-center shadow-lg shadow-neon-purple/20">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-display font-bold tracking-tight text-white text-sm">Powerplay</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-neon-cyan/80">Gaming Zone</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onGoOwner}
                className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10 sm:flex"
              >
                Owner Portal
              </button>
              <a
                href="#book"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-neon-purple to-neon-cyan px-4 py-2 text-xs font-bold text-white shadow-lg shadow-neon-purple/20 transition hover:opacity-90"
              >
                Book Now
              </a>
            </div>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-7xl px-4 pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/20 bg-neon-cyan/5 px-3 py-1 text-xs font-semibold text-neon-cyan">
                <span className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse" /> Live Availability
              </div>

              <h1 className="font-display text-4xl leading-tight font-bold md:text-6xl">
                <span className="bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">Book Your</span>
                <br />
                <span className="bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan bg-clip-text text-transparent">Gaming Experience</span>
                <br />
                <span className="text-white">Instantly</span>
              </h1>

              <p className="max-w-md text-sm leading-relaxed text-slate-400">Premium PS5, PC, Racing Simulators, and VR setups — available now. Pick a setup, choose a slot, and you’re in.</p>

              <div className="flex flex-wrap gap-3">
                <a href="#book" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-neon-purple/25 transition hover:opacity-90 active:scale-95">Book Now</a>
                <a href="#zones" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10 active:scale-95">View Zones</a>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20 blur-2xl" />
              <div className="relative rounded-3xl border border-white/10 bg-navy-900/60 p-2 shadow-2xl backdrop-blur-xl">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Gamepad2, title: "PS5 Lounge", live: 2, total: 6 },
                    { icon: Monitor, title: "PC Arena", live: 3, total: 12 },
                    { icon: Trophy, title: "Racing Sim", live: 1, total: 4 },
                    { icon: Users2, title: "VR Bay", live: 0, total: 2 },
                  ].map((zone) => (
                    <div key={zone.title} className="rounded-2xl border border-white/5 bg-navy-900/60 p-4 transition hover:border-neon-purple/50">
                      <zone.icon className="h-5 w-5 text-neon-cyan" />
                      <p className="mt-2 text-sm font-semibold text-white">{zone.title}</p>
                      <p className="text-[11px] text-slate-400">{zone.live}/{zone.total} busy</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="zones" className="mx-auto max-w-7xl px-4 pb-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-neon-cyan">Choose Your Arena</p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">Game Zones</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {setups.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSetupId(s.id);
                  setDraft((d) => ({ ...d, setupId: s.id }));
                  setStep(2);
                }}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-navy-900/60 p-5 text-left transition hover:border-neon-purple/50 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]"
              >
                <Gamepad2 className="h-6 w-6 text-neon-purple" />
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-lg font-bold text-white">{s.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{s.type}</p>
                  </div>
                  <span className="text-xs font-semibold text-neon-cyan">Book →</span>
                </div>
                <p className="mt-3 text-sm font-bold text-white">{formatINR(s.pricePerHour ?? 149)}/hr</p>
              </button>
            ))}
          </div>
        </section>

        <section id="book" className="mx-auto max-w-7xl px-4 pb-24">
          <div className="mb-6">
            <p className="text-[11px] uppercase tracking-[0.2em] text-neon-pink">Reserve Your Session</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">Book a Slot</h2>
          </div>

          <div className="rounded-3xl border border-white/5 bg-navy-900/60 p-5 backdrop-blur-xl md:p-8">
            <div className="flex flex-wrap gap-2">
              {([1, 2, 3] as const).map((n) => (
                <div
                  key={n}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${
                    step >= n ? "border-neon-purple/40 bg-neon-purple/10 text-white" : "border-white/5 bg-white/5 text-slate-500"
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${step >= n ? "bg-neon-purple text-white" : "bg-white/10 text-slate-400"}`}>{n}</span>
                  {n === 1 ? "Setup" : n === 2 ? "Slot" : "Confirm"}
                </div>
              ))}
            </div>

            <div className="mt-6">
              {step === 1 && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {setups.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSetupId(s.id);
                        setDraft((d) => ({ ...d, setupId: s.id }));
                        setStep(2);
                      }}
                      className={`rounded-2xl border p-4 text-left transition active:scale-[0.99] ${
                        setupId === s.id ? "border-neon-purple/60 bg-neon-purple/10" : "border-white/5 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <p className="font-bold text-white">{s.name}</p>
                      <p className="mt-1 text-xs text-slate-400">{s.type}</p>
                      <p className="mt-2 text-sm font-bold text-white">{formatINR(s.pricePerHour ?? 149)}/hr</p>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && selected && (
                <div className="space-y-5">
                  <label className="block">
                    <span className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">Date</span>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={today} className="input" required />
                  </label>

                  <p className="text-xs uppercase tracking-wider text-slate-400">Available Slots</p>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {slots.map((t) => (
                      <button
                        key={t.id}
                        disabled={!t.available}
                        onClick={() => pickSlot(t)}
                        className={`rounded-xl border px-3 py-3 text-sm transition active:scale-[0.97] ${
                          t.available
                            ? slot?.id === t.id
                              ? "border-neon-cyan/60 bg-neon-cyan/10 text-white shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                              : "border-neon-green/30 bg-neon-green/5 text-neon-green hover:bg-neon-green/10"
                            : "cursor-not-allowed border-white/5 bg-white/5 text-slate-600 line-through"
                        }`}
                      >
                        <span className="block text-[10px] text-slate-400">{t.time}</span>
                        <span className="block mt-0.5 font-bold text-white">{formatINR(t.price)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && selected && (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                  <div className="space-y-3 lg:col-span-2">
                    <h3 className="text-sm font-bold text-white">Customer Details</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">Full Name *</span>
                        <input value={draft.customerName} onChange={(e) => setDraft({ ...draft, customerName: e.target.value })} className="input" required />
                      </label>
                      <label className="block">
                        <span className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">Phone *</span>
                        <input
                          value={draft.customerPhone}
                          onChange={(e) => setDraft({ ...draft, customerPhone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          pattern="[0-9]{10}"
                          placeholder="10 digit mobile number"
                          className="input"
                          required
                        />
                      </label>
                    </div>

                    <h3 className="text-sm font-bold text-white pt-2">Game (optional)</h3>
                    <select
                      value={draft.customerName ? "custom" : ""}
                      onChange={(e) => {
                        const g = games.find((x: any) => x.id === e.target.value);
                        setDraft((prev) => ({ ...prev, gameName: g?.name || "" }));
                      }}
                      className="input"
                    >
                      <option value="">Skip — no preference</option>
                      {games.map((g: any) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>

                    <h3 className="text-sm font-bold text-white pt-2">Payment Mode</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {(["UPI", "Cash", "Split"] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() =>
                            setDraft({
                              ...draft,
                              paymentMode: m,
                              upiAmount: draft.amount,
                              cashAmount: 0,
                            })
                          }
                          className={`rounded-xl border px-3 py-3 text-sm font-semibold transition active:scale-[0.97] ${
                            draft.paymentMode === m ? "border-neon-purple/60 bg-neon-purple/15 text-white" : "border-white/10 bg-white/5 text-slate-300"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>

                    {draft.paymentMode === "Split" && (
                      <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                          <span className="block text-[11px] uppercase tracking-wider text-neon-cyan mb-1.5">UPI Amount</span>
                          <input type="number" value={draft.upiAmount} onChange={(e) => setDraft({ ...draft, upiAmount: Number(e.target.value) || 0 })} className="input" />
                        </label>
                        <label className="block">
                          <span className="block text-[11px] uppercase tracking-wider text-neon-pink mb-1.5">Cash Amount</span>
                          <input type="number" value={draft.cashAmount} readOnly className="input opacity-80" />
                        </label>
                      </div>
                    )}
                  </div>

                  <aside className="rounded-2xl border border-white/5 bg-navy-900/60 p-5">
                    <p className="text-[11px] uppercase tracking-wider text-slate-400">Booking Summary</p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Zone</span>
                        <span className="text-white font-semibold">{selected?.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Start</span>
                        <span className="text-white font-semibold">{slot?.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Duration</span>
                        <span className="text-white font-semibold">1 hour</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
                        <span className="text-slate-400">Total</span>
                        <span className="text-lg font-bold text-white">{formatINR(draft.amount)}</span>
                      </div>
                    </div>

                    <button onClick={submit} className="mt-5 w-full rounded-2xl bg-gradient-to-r from-neon-purple to-neon-cyan px-4 py-3 text-sm font-bold text-white shadow-lg shadow-neon-purple/20 transition hover:opacity-90 active:scale-95">
                      Confirm & Pay
                    </button>
                    <p className="mt-2 text-center text-[11px] text-slate-500">Pay at the counter on arrival</p>
                  </aside>
                </div>
              )}

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setStep((s) => {
                    if (s <= 1) return 1 as 1;
                    return ((s - 1) as 2 | 3);
                  })}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (step === 1 && !setupId) return;
                    if (step === 2 && !slot) return;
                    if (step === 3 && !draft.customerName) return;
                    setStep((s) => (s < 3 ? ((s + 1) as 2 | 3) : s));
                  }}
                  className="rounded-xl bg-gradient-to-r from-neon-purple to-neon-cyan px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-neon-purple/20 transition hover:opacity-90"
                >
                  Next Step
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 bg-navy-950/80">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan grid place-items-center shadow-lg shadow-neon-purple/20">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-display font-bold tracking-tight text-white text-sm">Powerplay</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-neon-cyan">Gaming Zone</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500">Premium gaming experience. Book instantly. Play harder.</p>
        </div>
      </footer>
    </div>
  );
}
