import { useMemo, useState } from "react";
import { Sidebar, type Tab } from "./components/Sidebar";
import TopHeader from "./components/TopHeader";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import Reports from "./components/Reports";
import ActiveSessions from "./components/ActiveSessions";
import { ToastProvider } from "./components/Toast";
import {
  BOOKINGS_KEY,
  EXPENSES_KEY,
  GAMES_KEY,
  PRICING_KEY,
  SETUP_KEY,
  defaultBookings,
  defaultExpenses,
  defaultGames,
  defaultPricing,
  defaultSetups,
  useLocalStorage,
} from "./store";

export default function App() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [setups, setSetups] = useLocalStorage(SETUP_KEY, defaultSetups);
  const [pricing, setPricing] = useLocalStorage(PRICING_KEY, defaultPricing);
  const [games, setGames] = useLocalStorage(GAMES_KEY, defaultGames);
  const [bookings, setBookings] = useLocalStorage(BOOKINGS_KEY, defaultBookings);
  const [expenses, setExpenses] = useLocalStorage(EXPENSES_KEY, defaultExpenses);

  const activeSessions = useMemo(() => {
    const now = Date.now();
    return bookings.filter((b) => {
      if (b.status !== "Confirmed") return false;
      const end =
        new Date(b.createdAt).getTime() +
        (b.durationMinutes + (b.extendedMinutes ?? 0)) * 60 * 1000 +
        (b.totalPausedMs ?? 0);
      return end > now;
    }).length;
  }, [bookings]);

  return (
    <ToastProvider>
      <div className="min-h-screen" style={{ background: "#050810", color: "#e2e8f0" }}>
        {/* Ambient background */}
        <div className="bg-ambient" aria-hidden="true" />

        <div className="relative z-10 flex flex-col md:flex-row min-h-screen">
          <Sidebar
            active={tab}
            onChange={setTab}
            activeSessions={activeSessions}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          />

          <div className="flex-1 min-w-0 flex flex-col">
            <TopHeader
              bookings={bookings}
              expenses={expenses}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
            />

            <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 py-5 md:px-7 md:py-6 pb-24 md:pb-8 transition-all duration-300">
              <div key={tab} className="animate-[fadeInUp_0.4s_cubic-bezier(0.16,1,0.3,1)]">
                {tab === "dashboard" && (
                  <Dashboard
                    setups={setups}
                    pricing={pricing}
                    games={games}
                    bookings={bookings}
                    setBookings={setBookings}
                    expenses={expenses}
                    setExpenses={setExpenses}
                  />
                )}
                {tab === "active" && (
                  <ActiveSessions bookings={bookings} setBookings={setBookings} />
                )}
                {tab === "reports" && (
                  <Reports bookings={bookings} expenses={expenses} />
                )}
                {tab === "settings" && (
                  <Settings
                    setups={setups}
                    setSetups={setSetups}
                    pricing={pricing}
                    setPricing={setPricing}
                    games={games}
                    setGames={setGames}
                    bookings={bookings}
                    setBookings={setBookings}
                  />
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
