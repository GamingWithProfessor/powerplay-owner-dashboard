import {
  TrendingUp,
  CalendarCheck,
} from "lucide-react";
import type { Setup, PriceRule, Booking, Game, Expense } from "../types";
import { formatINR } from "../store";
import Bookings from "./Bookings";
import Expenses from "./Expenses";

export function ModeBadge({ mode }: { mode: "UPI" | "Cash" | "Split" }) {
  const styles: Record<string, string> = {
    UPI:   "badge badge-green",
    Cash:  "badge badge-amber",
    Split: "badge badge-purple",
  };
  return <span className={styles[mode] ?? "badge badge-slate"}>{mode}</span>;
}

export default function Dashboard({
  setups, pricing, games, bookings, setBookings, expenses, setExpenses,
}: {
  setups: Setup[];
  pricing: PriceRule[];
  games: Game[];
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}) {
  const today = new Date().toISOString().slice(0, 10);

  const todayBookings = bookings.filter((b) => b.date === today);
  const todayRevenue = todayBookings.reduce((s, b) => s + b.amount, 0);

  const statCards = [
    { label: "Today's Revenue", value: formatINR(todayRevenue), sub: `${todayBookings.length} bookings`, icon: TrendingUp, accent: "#10b981", glow: "rgba(16,185,129,0.12)", trend: "+12%" },
    { label: "Today's Bookings", value: String(todayBookings.length), sub: `${bookings.length} all-time`, icon: CalendarCheck, accent: "#6366f1", glow: "rgba(99,102,241,0.12)" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-slate-500 mt-1">Real-time overview of your gaming zone.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {statCards.map((c) => (
          <div
            key={c.label}
            className="relative overflow-hidden rounded-2xl p-4 transition-all duration-300 card card-hover group"
          >
            <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: c.glow }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center justify-center h-7 w-7 rounded-lg" style={{ background: `${c.accent}18`, border: `1px solid ${c.accent}28`, color: c.accent }}>
                  <c.icon className="h-3.5 w-3.5" />
                </span>
                {c.trend && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: "rgba(16,185,129,0.12)", color: "#34d399" }}>{c.trend}</span>}
              </div>
              <p className="text-base md:text-lg font-bold text-white tabular-nums leading-none">{c.value}</p>
              <p className="text-[10px] uppercase tracking-[0.07em] text-slate-500 mt-1.5 font-medium">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-white/5" />
          <h2 className="section-label">Operations Management</h2>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <Bookings setups={setups} pricing={pricing} games={games} bookings={bookings} setBookings={setBookings} />
        <Expenses expenses={expenses} setExpenses={setExpenses} />
      </div>
    </div>
  );
}
