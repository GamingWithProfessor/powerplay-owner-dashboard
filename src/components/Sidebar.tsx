import {
  LayoutDashboard,
  FileDown,
  Zap,
  Menu,
  X,
  Timer,
  Settings,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { cn } from "../utils/cn";

export type Tab = "dashboard" | "active" | "reports" | "settings";

export const NAV_ITEMS: {
  id: Tab;
  label: string;
  short: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  { id: "dashboard", label: "Dashboard",     short: "Home",    icon: LayoutDashboard, description: "Overview & bookings"    },
  { id: "active",    label: "Live Sessions", short: "Live",    icon: Timer,           description: "Active countdowns"      },
  { id: "reports",   label: "Reports",       short: "Reports", icon: FileDown,        description: "PDF export"             },
  { id: "settings",  label: "Settings",      short: "More",    icon: Settings,        description: "Setups, pricing, games" },
];

export function Sidebar({
  active,
  onChange,
  activeSessions = 0,
  collapsed,
  onToggleCollapse,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
  activeSessions?: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const sidebarWidth = collapsed ? 72 : 240;

  return (
    <>
      {/* ── Desktop sidebar (collapsible) ── */}
      <aside
        className="hidden md:flex md:flex-col shrink-0 sticky top-0 h-screen overflow-visible"
        style={{
          width: `${sidebarWidth}px`,
          background: "linear-gradient(180deg, #070a14 0%, #060910 100%)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Logo row */}
        <div
          className={cn(
            "pt-5 pb-4 flex items-center shrink-0",
            collapsed ? "px-3 justify-center" : "px-5"
          )}
          style={{ transition: "padding 0.25s ease" }}
        >
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #06b6d4 100%)",
              boxShadow: "0 4px 16px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.08) inset",
            }}
          >
            <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="ml-3 min-w-0">
              <p className="text-[13px] font-bold text-white tracking-tight">Powerplay</p>
              <p className="text-[10px] text-slate-500 tracking-wide">Gaming Zone</p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          className={cn("h-px shrink-0", collapsed ? "mx-3" : "mx-4")}
          style={{ background: "rgba(255,255,255,0.04)", transition: "margin 0.25s ease" }}
        />

        {/* Nav */}
        <nav className="flex-1 px-2 pt-3 pb-3 flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden">
          {!collapsed && <p className="section-label px-3 py-2.5">Navigation</p>}

          {NAV_ITEMS.map(({ id, label, icon: Icon, description }) => {
            const isActive = id === active;
            const showBadge = id === "active" && activeSessions > 0;

            return (
              <div key={id} className="relative">
                <button
                  onClick={() => onChange(id)}
                  className={cn(
                    "relative w-full flex items-center rounded-xl text-left transition-all duration-150",
                    collapsed ? "justify-center px-2 py-2.5" : "gap-3 px-3 py-2.5",
                    isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
                  )}
                  style={
                    isActive
                      ? {
                          background: "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.08) 100%)",
                          border: "1px solid rgba(99,102,241,0.22)",
                          boxShadow: "0 0 0 1px rgba(99,102,241,0.06) inset, 0 2px 8px rgba(0,0,0,0.2)",
                        }
                      : { background: "transparent", border: "1px solid transparent" }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.035)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.06)";
                    }
                    setHoveredItem(id);
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
                    }
                    setHoveredItem(null);
                  }}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{ background: "linear-gradient(180deg, #6366f1, #a855f7)" }}
                    />
                  )}

                  <span
                    className={cn(
                      "flex items-center justify-center h-7 w-7 rounded-lg shrink-0 transition-all duration-150",
                      isActive ? "opacity-100" : "opacity-60 hover:opacity-90"
                    )}
                    style={
                      isActive
                        ? {
                            background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.2))",
                            border: "1px solid rgba(99,102,241,0.25)",
                          }
                        : { background: "rgba(255,255,255,0.04)" }
                    }
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>

                  {!collapsed && (
                    <>
                      <span className="flex-1 text-[13px] font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                        {label}
                      </span>
                      {showBadge && (
                        <span
                          className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-bold"
                          style={{ background: "rgba(16,185,129,0.15)", color: "#34d399", border: "1px solid rgba(16,185,129,0.25)" }}
                        >
                          {activeSessions}
                        </span>
                      )}
                      {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-40 shrink-0" />}
                    </>
                  )}

                  {/* Collapsed badge */}
                  {collapsed && showBadge && (
                    <span
                      className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{ background: "#10b981", color: "white" }}
                    >
                      {activeSessions}
                    </span>
                  )}
                </button>

                {/* Tooltip when collapsed */}
                {collapsed && hoveredItem === id && (
                  <div
                    className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 pointer-events-none"
                    style={{ animation: "fadeIn 0.15s ease-out" }}
                  >
                    <div
                      className="rounded-lg px-3 py-2 text-[12px] whitespace-nowrap"
                      style={{
                        background: "rgba(8,12,23,0.98)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                        color: "#e2e8f0",
                      }}
                    >
                      <p className="font-semibold">{label}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{description}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="px-2 pb-2 shrink-0">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] font-medium transition-all duration-150 text-slate-400 hover:text-slate-200"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.04)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.025)";
            }}
          >
            <span
              className="flex items-center justify-center h-6 w-6 rounded-lg shrink-0"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </span>
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="mx-3 mb-3 shrink-0">
            <div
              className="rounded-xl p-3.5"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <div
                  className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.2)" }}
                >
                  <Zap className="h-3.5 w-3.5 text-indigo-400" />
                </div>
                <p className="text-[12px] font-semibold text-slate-300">Owner Account</p>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">Data securely synced with Firebase.</p>
            </div>
          </div>
        )}
      </aside>

      {/* ── Mobile top bar ── */}
      <header
        className="md:hidden sticky top-0 z-40 safe-top"
        style={{
          background: "rgba(5,8,16,0.92)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px) saturate(1.6)",
        }}
      >
        <div className="flex items-center justify-between px-4 h-[56px]">
          <div className="flex items-center gap-2.5">
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                boxShadow: "0 2px 8px rgba(99,102,241,0.4)",
              }}
            >
              <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white tracking-tight">Powerplay</p>
              <p className="text-[10px] text-slate-500 tracking-wide">
                {NAV_ITEMS.find((n) => n.id === active)?.label}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-400 active:scale-95 transition"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
            aria-label="Menu"
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
            onClick={() => setDrawerOpen(false)}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-[82%] max-w-[300px] flex flex-col"
            style={{
              background: "linear-gradient(180deg, #070a14 0%, #060910 100%)",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              animation: "slideIn 0.22s ease-out",
            }}
          >
            <div className="flex items-center justify-between px-4 pt-5 pb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="h-8 w-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #6366f1, #a855f7)", boxShadow: "0 2px 8px rgba(99,102,241,0.4)" }}
                >
                  <Zap className="h-4 w-4 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-white">Powerplay</p>
                  <p className="text-[10px] text-slate-500">Gaming Zone</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mx-4 h-px" style={{ background: "rgba(255,255,255,0.04)" }} />

            <nav className="flex-1 px-3 pt-3 flex flex-col gap-0.5 overflow-y-auto">
              {NAV_ITEMS.map(({ id, label, icon: Icon, description }) => {
                const isActive = id === active;
                const showBadge = id === "active" && activeSessions > 0;
                return (
                  <button
                    key={id}
                    onClick={() => { onChange(id); setDrawerOpen(false); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left min-h-[52px] transition-all",
                      isActive ? "text-white" : "text-slate-400"
                    )}
                    style={
                      isActive
                        ? {
                            background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.08))",
                            border: "1px solid rgba(99,102,241,0.22)",
                          }
                        : { border: "1px solid transparent" }
                    }
                  >
                    <span
                      className="flex items-center justify-center h-8 w-8 rounded-lg shrink-0"
                      style={
                        isActive
                          ? { background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.2))", border: "1px solid rgba(99,102,241,0.25)" }
                          : { background: "rgba(255,255,255,0.04)" }
                      }
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold">{label}</p>
                      <p className="text-[11px] text-slate-500 truncate">{description}</p>
                    </div>
                    {showBadge && <span className="badge badge-green">{activeSessions}</span>}
                  </button>
                );
              })}
            </nav>

            <div className="mx-3 mb-5 mt-3">
              <div
                className="rounded-xl p-3"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <p className="text-[11px] text-slate-500">Data stored locally in your browser.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile bottom nav ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 safe-bottom"
        style={{
          background: "rgba(5,8,16,0.94)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="grid grid-cols-4">
          {NAV_ITEMS.map(({ id, short, icon: Icon }) => {
            const isActive = id === active;
            const showBadge = id === "active" && activeSessions > 0;
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                className="flex flex-col items-center justify-center gap-1 py-2.5 min-h-[58px] relative transition active:scale-95"
              >
                <span
                  className="flex items-center justify-center h-7 w-10 rounded-full transition-all duration-200"
                  style={
                    isActive
                      ? {
                          background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.12))",
                          border: "1px solid rgba(99,102,241,0.3)",
                        }
                      : {}
                  }
                >
                  <Icon
                    className={cn(
                      "h-[17px] w-[17px] transition-colors duration-200",
                      isActive ? "text-indigo-400" : "text-slate-500"
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors duration-200",
                    isActive ? "text-indigo-400" : "text-slate-500"
                  )}
                >
                  {short}
                </span>
                {showBadge && (
                  <span
                    className="absolute top-2 right-1/4 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ background: "#10b981", color: "white" }}
                  >
                    {activeSessions}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
