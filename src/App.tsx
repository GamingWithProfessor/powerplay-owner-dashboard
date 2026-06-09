import { useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signOut,
  type User,
} from "firebase/auth";
import { AlertTriangle, LogOut } from "lucide-react";

import { auth } from "./firebase";
import { useFirestoreDocument } from "./firestoreStore";

import Login from "./components/Login";
import { Sidebar, type Tab } from "./components/Sidebar";
import TopHeader from "./components/TopHeader";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import Reports from "./components/Reports";
import ActiveSessions from "./components/ActiveSessions";
import { ToastProvider } from "./components/Toast";

import {
  defaultBookings,
  defaultExpenses,
  defaultGames,
  defaultPricing,
  defaultSetups,
} from "./store";

type OwnerDashboardProps = {
  user: User;
};

function OwnerDashboard({ user }: OwnerDashboardProps) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [
    setups,
    setSetups,
    setupsLoading,
    setupsError,
  ] = useFirestoreDocument(
    user.uid,
    "setups",
    defaultSetups
  );

  const [
    pricing,
    setPricing,
    pricingLoading,
    pricingError,
  ] = useFirestoreDocument(
    user.uid,
    "pricing",
    defaultPricing
  );

  const [
    games,
    setGames,
    gamesLoading,
    gamesError,
  ] = useFirestoreDocument(
    user.uid,
    "games",
    defaultGames
  );

  const [
    bookings,
    setBookings,
    bookingsLoading,
    bookingsError,
  ] = useFirestoreDocument(
    user.uid,
    "bookings",
    defaultBookings
  );

  const [
    expenses,
    setExpenses,
    expensesLoading,
    expensesError,
  ] = useFirestoreDocument(
    user.uid,
    "expenses",
    defaultExpenses
  );

  const firestoreLoading =
    setupsLoading ||
    pricingLoading ||
    gamesLoading ||
    bookingsLoading ||
    expensesLoading;

  const firestoreError =
    setupsError ||
    pricingError ||
    gamesError ||
    bookingsError ||
    expensesError;

  const activeSessions = useMemo(() => {
    const now = Date.now();

    return bookings.filter((booking) => {
      if (booking.status !== "Confirmed") {
        return false;
      }

      const createdAt = new Date(booking.createdAt).getTime();

      if (Number.isNaN(createdAt)) {
        return false;
      }

      const endTime =
        createdAt +
        (
          booking.durationMinutes +
          (booking.extendedMinutes ?? 0)
        ) *
          60 *
          1000 +
        (booking.totalPausedMs ?? 0);

      return endTime > now;
    }).length;
  }, [bookings]);

  async function handleLogout() {
    setLogoutLoading(true);

    try {
      await signOut(auth);
      setTab("dashboard");
    } catch (error) {
      console.error("Firebase logout failed:", error);
      window.alert("Unable to sign out. Please try again.");
    } finally {
      setLogoutLoading(false);
    }
  }

  if (firestoreLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{
          background: "#050810",
          color: "#e2e8f0",
        }}
      >
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

          <p className="mt-4 text-sm text-slate-400">
            Loading business data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div
        className="min-h-screen"
        style={{
          background: "#050810",
          color: "#e2e8f0",
        }}
      >
        <div className="bg-ambient" aria-hidden="true" />

        <div className="relative z-10 flex min-h-screen flex-col md:flex-row">
          <Sidebar
            active={tab}
            onChange={setTab}
            activeSessions={activeSessions}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() =>
              setSidebarCollapsed((value) => !value)
            }
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="relative">
              <TopHeader
                bookings={bookings}
                expenses={expenses}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() =>
                  setSidebarCollapsed((value) => !value)
                }
              />

              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutLoading}
                title="Sign out"
                className="fixed right-4 top-4 z-50 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-xs font-semibold text-slate-300 shadow-lg backdrop-blur-md transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50 md:right-6 md:top-5"
              >
                <LogOut className="h-4 w-4" />

                <span className="hidden sm:inline">
                  {logoutLoading
                    ? "Signing out..."
                    : "Sign out"}
                </span>
              </button>
            </div>

            <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-5 pb-24 transition-all duration-300 md:px-7 md:py-6 md:pb-8">
              {firestoreError && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />

                  <div>
                    <p className="font-semibold">
                      Firestore synchronization problem
                    </p>

                    <p className="mt-1 text-amber-200/80">
                      {firestoreError} Check your internet connection and
                      Firebase security rules.
                    </p>
                  </div>
                </div>
              )}

              <div
                key={tab}
                className="animate-[fadeInUp_0.4s_cubic-bezier(0.16,1,0.3,1)]"
              >
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
                  <ActiveSessions
                    bookings={bookings}
                    setBookings={setBookings}
                  />
                )}

                {tab === "reports" && (
                  <Reports
                    bookings={bookings}
                    expenses={expenses}
                  />
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

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setAuthLoading(false);
      },
      (error) => {
        console.error(
          "Firebase authentication state error:",
          error
        );

        setUser(null);
        setAuthLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  if (authLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{
          background: "#050810",
          color: "#e2e8f0",
        }}
      >
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

          <p className="mt-4 text-sm text-slate-400">
            Checking owner login...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <OwnerDashboard user={user} />;
}