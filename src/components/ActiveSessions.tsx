import { useEffect, useState } from "react";
import {
  Timer,
  Pause,
  Play,
  Plus,
  CheckCircle2,
} from "lucide-react";
import type { Booking } from "../types";

export default function ActiveSessions({
  bookings,
  setBookings,
}: {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
}) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = Date.now();

  // A session is "active" once status is Confirmed and hasn't been finished
  // Even past-zero sessions stay visible until Finish is clicked
  const active = bookings
    .filter((b) => b.status === "Confirmed")
    .map((b) => enrich(b, now))
    .sort((a, b) => a.remainingMs - b.remainingMs);

  const live = active.filter((b) => b.remainingMs > 0);
  const overtime = active.filter((b) => b.remainingMs <= 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Live Sessions
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            {active.length === 0
              ? "No players active right now."
              : `${active.length} ${active.length === 1 ? "session" : "sessions"} · ${live.length} running · ${overtime.length} overtime`}
          </p>
        </div>
        {active.length > 0 && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-semibold"
            style={{
              background: overtime.length > 0 ? "rgba(244,63,94,0.08)" : "rgba(16,185,129,0.08)",
              border: `1px solid ${overtime.length > 0 ? "rgba(244,63,94,0.2)" : "rgba(16,185,129,0.2)"}`,
              color: overtime.length > 0 ? "#fb7185" : "#34d399",
            }}
          >
            <span
              className="h-2 w-2 rounded-full animate-pulse"
              style={{ background: overtime.length > 0 ? "#f43f5e" : "#10b981" }}
            />
            {overtime.length > 0 ? "OVERTIME" : "LIVE"} · {active.length}
          </div>
        )}
      </div>

      {active.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-20 rounded-2xl"
          style={{
            background: "linear-gradient(145deg, rgba(13,17,32,0.6), rgba(8,12,23,0.7))",
            border: "1px dashed rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <Timer className="h-6 w-6 text-slate-600" />
          </div>
          <p className="text-[14px] font-semibold text-slate-400">No active sessions</p>
          <p className="text-[12px] text-slate-600 mt-1 text-center max-w-[260px]">
            Sessions appear here automatically when bookings are created.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {active.map((b) => (
            <SessionCard
              key={b.id}
              booking={b}
              onPause={() => pauseSession(b.id)}
              onResume={() => resumeSession(b.id)}
              onExtend={(min) => extendSession(b.id, min)}
              onFinish={() => finishSession(b.id)}
            />
          ))}
        </div>
      )}
    </div>
  );

  /* ── Timer mutations ── */

  function pauseSession(id: string) {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id && !b.pausedAt
          ? { ...b, pausedAt: new Date().toISOString() }
          : b
      )
    );
  }

  function resumeSession(id: string) {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== id || !b.pausedAt) return b;
        const pauseDuration = Date.now() - new Date(b.pausedAt).getTime();
        return {
          ...b,
          pausedAt: undefined,
          totalPausedMs: (b.totalPausedMs ?? 0) + pauseDuration,
        };
      })
    );
  }

  function extendSession(id: string, minutes: number) {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              extendedMinutes: (b.extendedMinutes ?? 0) + minutes,
              // If paused during extend, update pausedAt so remaining recalculates correctly
            }
          : b
      )
    );
  }

  function finishSession(id: string) {
    if (!confirm("Finish this session?")) return;
    setBookings((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: "Completed" as const, pausedAt: undefined } : b
      )
    );
  }
}

/* ── Compute timer values ── */
function enrich(b: Booking, now: number) {
  const startMs = new Date(b.createdAt).getTime();
  const totalDurationMs = (b.durationMinutes + (b.extendedMinutes ?? 0)) * 60 * 1000;
  const totalPaused = b.totalPausedMs ?? 0;
  const currentPause = b.pausedAt ? now - new Date(b.pausedAt).getTime() : 0;
  const effectiveElapsed = now - startMs - totalPaused - currentPause;
  const endMs = startMs + totalDurationMs + totalPaused + currentPause;
  const remainingMs = totalDurationMs - effectiveElapsed;
  return { ...b, startMs, endMs, remainingMs, effectiveElapsed };
}

/* ── Format helpers ── */
function formatTimer(ms: number) {
  const abs = Math.abs(ms);
  const s = Math.floor(abs / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const sign = ms < 0 ? "-" : "";
  if (h > 0) return `${sign}${h}:${pad(m)}:${pad(sec)}`;
  return `${sign}${pad(m)}:${pad(sec)}`;
}

/* ── Session Card ── */
function SessionCard({
  booking,
  onPause,
  onResume,
  onExtend,
  onFinish,
}: {
  booking: Booking & {
    startMs: number;
    endMs: number;
    remainingMs: number;
    effectiveElapsed: number;
  };
  onPause: () => void;
  onResume: () => void;
  onExtend: (min: number) => void;
  onFinish: () => void;
}) {
  const rem = booking.remainingMs;
  const isPaused = Boolean(booking.pausedAt);
  const isOvertime = rem <= 0;
  const totalDurationMs =
    (booking.durationMinutes + (booking.extendedMinutes ?? 0)) * 60 * 1000;
  const elapsed = totalDurationMs - rem;
  const pct = totalDurationMs > 0 ? Math.min(110, Math.max(0, (elapsed / totalDurationMs) * 100)) : 100;
  const overTimeMs = isOvertime ? Math.abs(rem) : 0;

  // Color scheme
  let accent: string;
  let accentFaded: string;
  let borderCol: string;
  let glowCol: string;

  if (isPaused) {
    accent      = "#f59e0b";
    accentFaded = "rgba(245,158,11,0.10)";
    borderCol   = "rgba(245,158,11,0.25)";
    glowCol     = "rgba(245,158,11,0.06)";
  } else if (isOvertime) {
    accent      = "#f43f5e";
    accentFaded = "rgba(244,63,94,0.10)";
    borderCol   = "rgba(244,63,94,0.3)";
    glowCol     = "rgba(244,63,94,0.1)";
  } else if (rem < 5 * 60 * 1000) {
    accent      = "#fb923c";
    accentFaded = "rgba(251,146,60,0.10)";
    borderCol   = "rgba(251,146,60,0.25)";
    glowCol     = "rgba(251,146,60,0.06)";
  } else {
    accent      = "#10b981";
    accentFaded = "rgba(16,185,129,0.08)";
    borderCol   = "rgba(255,255,255,0.06)";
    glowCol     = "rgba(16,185,129,0.06)";
  }

  const statusLabel = isPaused ? "PAUSED" : isOvertime ? "OVERTIME" : "LIVE";
  const timerColor = isPaused ? "#f59e0b" : isOvertime ? "#f43f5e" : rem < 5 * 60 * 1000 ? "#fb923c" : "white";

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-200"
      style={{
        background: "linear-gradient(145deg, rgba(13,17,32,0.9), rgba(8,12,23,0.95))",
        border: `1px solid ${borderCol}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.35), 0 0 24px ${glowCol}`,
        backdropFilter: "blur(24px)",
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}60, transparent)`,
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold text-white truncate">
            {booking.customerName || "Walk-in"}
          </p>
          <p className="text-[12px] text-slate-500 mt-0.5 truncate">
            {booking.setupName}
            {booking.game ? ` · ${booking.game}` : ""}
          </p>
        </div>
        <span
          className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ml-2"
          style={{ background: accentFaded, border: `1px solid ${accent}30`, color: accent }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: accent,
              ...(isPaused ? {} : { animation: "pulseRing 2s ease-out infinite" }),
            }}
          />
          {statusLabel}
        </span>
      </div>

      {/* Big timer */}
      <div className="text-center my-4">
        <p className="text-[11px] uppercase tracking-[0.1em] text-slate-600 mb-1.5">
          {isPaused ? "Paused" : isOvertime ? "Overtime" : "Time Remaining"}
        </p>
        <p
          className="font-bold tabular-nums leading-none transition-colors duration-300"
          style={{
            fontSize: "clamp(36px, 8vw, 50px)",
            color: timerColor,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.03em",
            ...(isOvertime && !isPaused ? { animation: "pulseRing 1.4s ease-out infinite" } : {}),
          }}
        >
          {formatTimer(rem)}
        </p>

        {/* Overtime amount */}
        {isOvertime && (
          <p
            className="text-[11px] mt-2 font-medium"
            style={{ color: "#fb7185" }}
          >
            {formatTimer(overTimeMs)} over time
          </p>
        )}

        {/* Elapsed / total */}
        <p className="text-[11px] text-slate-600 mt-1">
          {formatTimer(elapsed)} elapsed · {formatTimer(totalDurationMs)} total
          {(booking.extendedMinutes ?? 0) > 0 && (
            <span className="ml-1" style={{ color: "#a5b4fc" }}>
              (+{booking.extendedMinutes}m ext)
            </span>
          )}
        </p>
      </div>

      {/* Progress bar */}
      <div
        className="h-1.5 rounded-full overflow-hidden mb-4"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${Math.min(pct, 100)}%`,
            background: isOvertime
              ? "linear-gradient(90deg, #f43f5e, #fb923c)"
              : isPaused
              ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
              : rem < 5 * 60 * 1000
              ? "linear-gradient(90deg, #fb923c, #f59e0b)"
              : "linear-gradient(90deg, #10b981, #06b6d4)",
            boxShadow: `0 0 10px ${accent}60`,
          }}
        />
        {/* Full-time marker */}
        <div
          className="absolute top-0 h-full w-[2px] rounded-full"
          style={{ left: "100%", background: "rgba(255,255,255,0.15)" }}
        />
      </div>

      {/* Start info */}
      <p className="text-center text-[11px] text-slate-600 mb-4">
        Started{" "}
        {new Date(booking.createdAt).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })}
        {" "}· {booking.durationMinutes}m session
        {isPaused && (
          <span className="ml-1" style={{ color: "#fbbf24" }}>
            · Paused since{" "}
            {new Date(booking.pausedAt!).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </p>

      {/* Controls */}
      <div className="flex flex-col gap-2">
        {/* Pause / Resume */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={isPaused ? onResume : onPause}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
            style={{
              background: isPaused
                ? "rgba(16,185,129,0.12)"
                : "rgba(245,158,11,0.12)",
              border: `1px solid ${isPaused ? "rgba(16,185,129,0.25)" : "rgba(245,158,11,0.25)"}`,
              color: isPaused ? "#34d399" : "#fbbf24",
            }}
          >
            {isPaused ? (
              <>
                <Play className="h-4 w-4" /> Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4" /> Pause
              </>
            )}
          </button>

          <button
            onClick={onFinish}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all"
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "#a5b4fc",
            }}
          >
            <CheckCircle2 className="h-4 w-4" /> Finish
          </button>
        </div>

        {/* Extend timer */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-600 shrink-0">Extend:</span>
          {[5, 10, 15].map((m) => (
            <button
              key={m}
              onClick={() => onExtend(m)}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[12px] font-semibold transition-all"
              style={{
                background: "rgba(6,182,212,0.08)",
                border: "1px solid rgba(6,182,212,0.18)",
                color: "#22d3ee",
              }}
            >
              <Plus className="h-3 w-3" /> {m}m
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
