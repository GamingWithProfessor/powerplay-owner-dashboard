import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown, Settings, LogOut, User } from "lucide-react";
import type { Booking, Expense } from "../types";

type SearchResult = {
  type: "booking" | "expense";
  id: string;
  title: string;
  subtitle: string;
  amount: number;
};

export default function TopHeader({
  bookings,
  expenses,
  collapsed,
  onToggleCollapse,
}: {
  bookings: Booking[];
  expenses: Expense[];
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(t)) setSearchFocused(false);
      if (profileRef.current && !profileRef.current.contains(t)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Search results
  const searchResults: SearchResult[] = (() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const bookingHits = bookings
      .filter((b) =>
        b.customerName?.toLowerCase().includes(q) ||
        b.customerPhone?.toLowerCase().includes(q) ||
        b.game?.toLowerCase().includes(q) ||
        b.setupName?.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map((b): SearchResult => ({
        type: "booking",
        id: b.id,
        title: b.customerName || "Walk-in",
        subtitle: `${b.setupName}${b.game ? ` · ${b.game}` : ""} · ${new Date(b.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`,
        amount: b.amount,
      }));
    const expenseHits = expenses
      .filter((e) => e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q))
      .slice(0, 2)
      .map((e): SearchResult => ({
        type: "expense",
        id: e.id,
        title: e.title,
        subtitle: `${e.category} · ${new Date(e.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`,
        amount: e.amount,
      }));
    return [...bookingHits, ...expenseHits];
  })();

  // Notification count (overtime sessions)
  const now = Date.now();
  const overtimeSessions = bookings.filter((b) => {
    if (b.status !== "Confirmed") return false;
    const end = new Date(b.createdAt).getTime() + (b.durationMinutes + (b.extendedMinutes ?? 0)) * 60 * 1000 + (b.totalPausedMs ?? 0);
    return now > end;
  }).length;
  const newBookingsToday = bookings.filter((b) => b.date === new Date().toISOString().slice(0, 10)).length;

  // Today's greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <header
      className="hidden md:flex sticky top-0 z-30 items-center gap-4 px-6 h-[64px] shrink-0"
      style={{
        background: "rgba(5,8,16,0.85)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px) saturate(1.6)",
      }}
    >
      {/* Collapse toggle (always visible on desktop) */}
      <button
        onClick={onToggleCollapse}
        className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 transition shrink-0"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)" }}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <span className="flex flex-col gap-1">
          <span className="h-[1.5px] w-4 rounded-full bg-current" />
          <span className="h-[1.5px] w-3 rounded-full bg-current" />
          <span className="h-[1.5px] w-4 rounded-full bg-current" />
        </span>
      </button>

      {/* Greeting */}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-slate-500 tracking-wide">
          {greeting}, Owner
        </p>
        <p className="text-[13px] text-slate-300 truncate">
          Here's what's happening at Powerplay today
        </p>
      </div>

      {/* Search */}
      <div ref={searchRef} className="relative w-[340px] shrink-0">
        <div
          className="flex items-center gap-2 h-9 px-3 rounded-xl transition-all duration-200"
          style={{
            background: searchFocused ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${searchFocused ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.06)"}`,
            boxShadow: searchFocused ? "0 0 0 3px rgba(99,102,241,0.08)" : "none",
          }}
        >
          <Search className="h-4 w-4 text-slate-500 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            placeholder="Search bookings, customers, games..."
            className="bg-transparent border-none outline-none text-[13px] text-slate-200 placeholder:text-slate-600 flex-1 w-full"
          />
          <kbd
            className="hidden sm:inline-flex items-center justify-center h-5 px-1.5 rounded text-[10px] font-mono"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(148,163,184,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            ⌘K
          </kbd>
        </div>

        {/* Search results dropdown */}
        {searchFocused && searchQuery && (
          <div
            className="absolute top-full mt-2 left-0 right-0 rounded-xl overflow-hidden"
            style={{
              background: "rgba(8,12,23,0.98)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
              animation: "fadeInUp 0.15s ease-out",
            }}
          >
            {searchResults.length === 0 ? (
              <div className="px-4 py-6 text-center text-[12px] text-slate-500">
                No results for "{searchQuery}"
              </div>
            ) : (
              <div className="py-2">
                {searchResults.map((r) => (
                  <button
                    key={r.id}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/[0.03] transition"
                  >
                    <span
                      className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: r.type === "booking" ? "rgba(99,102,241,0.15)" : "rgba(244,63,94,0.15)",
                        border: `1px solid ${r.type === "booking" ? "rgba(99,102,241,0.25)" : "rgba(244,63,94,0.25)"}`,
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: r.type === "booking" ? "#a5b4fc" : "#fb7185" }}
                      />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-slate-200 truncate">{r.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{r.subtitle}</p>
                    </div>
                    <span
                      className="text-[12px] font-semibold shrink-0"
                      style={{ color: r.type === "booking" ? "#34d399" : "#fb7185" }}
                    >
                      Rs.{r.amount}/-
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div ref={notifRef} className="relative shrink-0">
        <button
          onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }}
          className="h-9 w-9 rounded-xl flex items-center justify-center relative transition"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Bell className="h-4 w-4 text-slate-400" />
          {(overtimeSessions > 0 || newBookingsToday > 0) && (
            <span
              className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center text-[9px] font-bold"
              style={{ background: "#f43f5e", color: "white", border: "2px solid #050810" }}
            >
              {overtimeSessions > 0 ? overtimeSessions : newBookingsToday}
            </span>
          )}
        </button>

        {notifOpen && (
          <div
            className="absolute top-full mt-2 right-0 w-[320px] rounded-xl overflow-hidden"
            style={{
              background: "rgba(8,12,23,0.98)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
              animation: "fadeInUp 0.15s ease-out",
            }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <p className="text-[13px] font-semibold text-white">Notifications</p>
            </div>
            <div className="py-2 max-h-[320px] overflow-y-auto">
              {overtimeSessions > 0 && (
                <NotifItem
                  color="#f43f5e"
                  title="Overtime Alert"
                  subtitle={`${overtimeSessions} ${overtimeSessions === 1 ? "session has" : "sessions have"} exceeded time`}
                  time="Now"
                />
              )}
              {newBookingsToday > 0 && (
                <NotifItem
                  color="#10b981"
                  title="Today's Bookings"
                  subtitle={`${newBookingsToday} ${newBookingsToday === 1 ? "booking" : "bookings"} confirmed today`}
                  time="Today"
                />
              )}
              {overtimeSessions === 0 && newBookingsToday === 0 && (
                <div className="px-4 py-8 text-center text-[12px] text-slate-500">
                  All clear. No alerts.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div ref={profileRef} className="relative shrink-0">
        <button
          onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }}
          className="flex items-center gap-2 h-9 pl-1 pr-2.5 rounded-xl transition"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="h-7 w-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              boxShadow: "0 2px 6px rgba(99,102,241,0.35)",
            }}
          >
            OW
          </div>
          <div className="hidden lg:block text-left min-w-0">
            <p className="text-[12px] font-semibold text-slate-200 leading-tight">Owner</p>
            <p className="text-[10px] text-slate-500 leading-tight">Admin</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
        </button>

        {profileOpen && (
          <div
            className="absolute top-full mt-2 right-0 w-[220px] rounded-xl overflow-hidden py-1"
            style={{
              background: "rgba(8,12,23,0.98)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
              animation: "fadeInUp 0.15s ease-out",
            }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <p className="text-[13px] font-semibold text-white">Owner Account</p>
              <p className="text-[11px] text-slate-500">admin@powerplay.in</p>
            </div>
            <ProfileMenuItem icon={User} label="View Profile" />
            <ProfileMenuItem icon={Settings} label="Settings" />
            <div className="h-px mx-3 my-1" style={{ background: "rgba(255,255,255,0.05)" }} />
            <ProfileMenuItem icon={LogOut} label="Sign out" danger />
          </div>
        )}
      </div>
    </header>
  );
}

function NotifItem({ color, title, subtitle, time }: { color: string; title: string; subtitle: string; time: string }) {
  return (
    <button className="w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-white/[0.03] transition">
      <span
        className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ background: `${color}15`, border: `1px solid ${color}30` }}
      >
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-slate-200">{title}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      <span className="text-[10px] text-slate-600 shrink-0 mt-0.5">{time}</span>
    </button>
  );
}

function ProfileMenuItem({ icon: Icon, label, danger }: { icon: React.ComponentType<{ className?: string }>; label: string; danger?: boolean }) {
  return (
    <button
      className="w-full flex items-center gap-2.5 px-4 py-2 text-left transition"
      style={{ color: danger ? "#fb7185" : "#cbd5e1" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
    >
      <Icon className="h-4 w-4" />
      <span className="text-[13px]">{label}</span>
    </button>
  );
}
