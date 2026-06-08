import { useEffect, useState } from "react";
import type { Setup, PriceRule, Booking, Game, Expense } from "./types";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);

  return [value, setValue] as const;
}

export const SETUP_KEY = "powerplay.setups";
export const PRICING_KEY = "powerplay.pricing";
export const BOOKINGS_KEY = "powerplay.bookings";
export const GAMES_KEY = "powerplay.games";
export const EXPENSES_KEY = "powerplay.expenses";

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const defaultSetups: Setup[] = [
  { id: uid(), name: "Setup 1 — PS5 Lounge", type: "PS5", status: "Active", location: "Zone A", pricePerHour: 150 },
  { id: uid(), name: "Setup 2 — PC Arena", type: "PC", status: "Active", location: "Zone B", pricePerHour: 100 },
  { id: uid(), name: "Setup 3 — Racing Sim", type: "Racing Sim", status: "Active", location: "Zone C", pricePerHour: 200 },
];

export const defaultPricing: PriceRule[] = [
  { id: uid(), label: "PS5 — 1 Hour", durationMinutes: 60, amount: 150, appliesTo: "PS5" },
  { id: uid(), label: "PS5 — 30 min", durationMinutes: 30, amount: 80, appliesTo: "PS5" },
  { id: uid(), label: "PC — 1 Hour", durationMinutes: 60, amount: 100, appliesTo: "PC" },
  { id: uid(), label: "PC — 30 min", durationMinutes: 30, amount: 60, appliesTo: "PC" },
  { id: uid(), label: "Racing Sim — 30 min", durationMinutes: 30, amount: 120, appliesTo: "Racing Sim" },
  { id: uid(), label: "Racing Sim — 1 Hour", durationMinutes: 60, amount: 200, appliesTo: "Racing Sim" },
];

export const defaultGames: Game[] = [
  { id: uid(), name: "BGMI", genre: "Battle Royale", platform: "All" },
  { id: uid(), name: "Free Fire", genre: "Battle Royale", platform: "All" },
  { id: uid(), name: "FIFA 24", genre: "Sports", platform: "PS5" },
  { id: uid(), name: "FC 25", genre: "Sports", platform: "PS5" },
  { id: uid(), name: "GTA V", genre: "Open World", platform: "PS5" },
  { id: uid(), name: "Spider-Man 2", genre: "Action", platform: "PS5" },
  { id: uid(), name: "God of War", genre: "Action", platform: "PS5" },
  { id: uid(), name: "Call of Duty", genre: "FPS", platform: "PC" },
  { id: uid(), name: "Valorant", genre: "FPS", platform: "PC" },
  { id: uid(), name: "Minecraft", genre: "Survival", platform: "All" },
  { id: uid(), name: "Asphalt 9", genre: "Racing", platform: "All" },
  { id: uid(), name: "Forza Horizon 5", genre: "Racing", platform: "Xbox" },
];

const today = new Date().toISOString().slice(0, 10);
const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
const twoDaysAgo = new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10);
const nowISO = new Date().toISOString();

function makeBooking(
  d: string,
  h: number,
  m: number,
  dur: number,
  setupName: string,
  customerName: string,
  customerPhone: string,
  game: string,
  amount: number,
  mode: "UPI" | "Cash" | "Split",
  upi: number,
  cash: number
): Booking {
  const start = new Date(`${d}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  const end = new Date(start.getTime() + dur * 60000);
  return {
    id: uid(),
    setupId: "demo",
    setupName,
    customerName,
    customerPhone,
    game,
    bookingDate: d,
    startTime: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
    endTime: `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
    durationMinutes: dur,
    amount,
    paymentMode: mode,
    upiAmount: upi,
    cashAmount: cash,
    // Historical bookings are already completed
    status: new Date(`${d}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`).getTime() + dur * 60000 < Date.now()
      ? "Completed"
      : "Confirmed",
    createdAt: start.toISOString(),
    date: d,
    priceRuleId: "demo",
    totalPausedMs: 0,
    extendedMinutes: 0,
  };
}

/** Build a booking starting N minutes ago (for live timer testing) */
function makeActiveBooking(
  minutesAgo: number,
  dur: number,
  setupName: string,
  customerName: string,
  customerPhone: string,
  game: string,
  amount: number,
  mode: "UPI" | "Cash" | "Split",
  upi: number,
  cash: number,
  pausedAgo?: number
): Booking {
  const startMs = Date.now() - minutesAgo * 60 * 1000;
  const start = new Date(startMs);
  const d = start.toISOString().slice(0, 10);
  const pad2 = (n: number) => String(n).padStart(2, "0");
  const h = start.getHours();
  const m = start.getMinutes();
  const endMs = startMs + dur * 60 * 1000;
  const end = new Date(endMs);
  return {
    id: uid(),
    setupId: "demo",
    setupName,
    customerName,
    customerPhone,
    game,
    bookingDate: d,
    startTime: `${pad2(h)}:${pad2(m)}`,
    endTime: `${pad2(end.getHours())}:${pad2(end.getMinutes())}`,
    durationMinutes: dur,
    amount,
    paymentMode: mode,
    upiAmount: upi,
    cashAmount: cash,
    status: "Confirmed",
    createdAt: start.toISOString(),
    date: d,
    priceRuleId: "demo",
    totalPausedMs: 0,
    extendedMinutes: 0,
    ...(pausedAgo ? { pausedAt: new Date(Date.now() - pausedAgo * 60 * 1000).toISOString() } : {}),
  };
}

function makeExpense(d: string, title: string, cat: Expense["category"], amount: number, paidBy: Expense["paidBy"], notes?: string): Expense {
  return { id: uid(), date: d, title, category: cat, amount, paidBy, notes, createdAt: nowISO };
}

export const defaultBookings: Booking[] = [
  // ── Live active sessions (started recently for testing timer features) ──
  makeActiveBooking(10, 60, "Setup 1 — PS5 Lounge", "Rohan Malhotra",  "9871122334", "FIFA 24",        150, "UPI",   150, 0),           // 10 min in, 50 min left
  makeActiveBooking(25, 60, "Setup 2 — PC Arena",   "Kavya Iyer",      "9122334455", "Valorant",       100, "Cash",  0,   100),        // 25 min in, 35 min left
  makeActiveBooking(55, 60, "Setup 3 — Racing Sim", "Aditya Bose",     "9334455667", "Forza Horizon 5", 200, "Split", 120, 80),        // 55 min in, 5 min left (urgent)
  makeActiveBooking(65, 60, "Setup 1 — PS5 Lounge", "Meera Sharma",    "9445566778", "God of War",     150, "UPI",   150, 0),          // 65 min in, OVERTIME (5 min past)
  makeActiveBooking(70, 30, "Setup 2 — PC Arena",   "Arjun Nair",      "9556677889", "BGMI",           60,  "Cash",  0,   60, 40),    // 70 min in, was paused 40 min ago → still running

  // ── Historical bookings (previous days) ──
  makeBooking(yesterday, 10, 0, 60, "Setup 1 — PS5 Lounge",  "Rahul Mehta",      "9876543210", "FIFA 24",       150, "UPI",   150, 0),
  makeBooking(yesterday, 11, 30, 60, "Setup 2 — PC Arena",   "Arjun Patel",      "9123456789", "Valorant",      100, "Cash",  0,   100),
  makeBooking(yesterday, 14, 0, 120, "Setup 1 — PS5 Lounge", "Sneha Kulkarni",   "9988776655", "GTA V",         300, "Split", 200, 100),
  makeBooking(yesterday, 16, 0, 60,  "Setup 3 — Racing Sim", "Vikram Desai",     "9112233445", "Forza Horizon 5", 200, "UPI", 200, 0),
  makeBooking(today,     10, 30, 60, "Setup 1 — PS5 Lounge", "Priya Sharma",     "9223344556", "Spider-Man 2",  150, "UPI",   150, 0),
  makeBooking(today,     12, 0, 30,  "Setup 2 — PC Arena",   "Amit Joshi",       "9334455667", "BGMI",          60,  "Cash",  0,   60),
  makeBooking(today,     13, 30, 60, "Setup 3 — Racing Sim", "Neha Gupta",       "9445566778", "Asphalt 9",     200, "Split", 100, 100),
  makeBooking(today,     15, 0, 60,  "Setup 1 — PS5 Lounge", "Karan Singh",      "9556677889", "God of War",    150, "UPI",   150, 0),
  makeBooking(today,     17, 30, 30, "Setup 2 — PC Arena",   "Divya Reddy",      "9667788990", "Call of Duty",  60,  "Cash",  0,   60),
  makeBooking(twoDaysAgo,11, 0, 60,  "Setup 1 — PS5 Lounge", "Rohit Verma",      "9778899001", "FC 25",         150, "UPI",   150, 0),
  makeBooking(twoDaysAgo,14, 30, 120,"Setup 2 — PC Arena",   "Pooja Nair",       "9889900112", "Minecraft",     200, "Split", 120, 80),
  makeBooking(twoDaysAgo,17, 0, 60,  "Setup 3 — Racing Sim", "Sanjay Rao",       "9990011223", "Forza Horizon 5", 200, "Cash", 0, 200),
];

export const defaultExpenses: Expense[] = [
  makeExpense(twoDaysAgo, "Monthly Rent — June",        "Rent",         12000, "Cash"),
  makeExpense(yesterday,  "Electricity Bill — May",     "Electricity",  3200,  "Cash",  "TANGEDCO bill"),
  makeExpense(yesterday,  "Broadband Internet — June",  "Internet",     1500,  "UPI",   "ACT Fibernet"),
  makeExpense(today,      "Snacks & Beverages Restock", "Snacks",       850,   "Cash",  "Chips, cold drinks, water bottles"),
  makeExpense(today,      "Controller Repair",          "Maintenance",  600,   "Cash",  "DualSense R2 button fix"),
  makeExpense(yesterday,  "Cleaning Staff Salary",      "Salary",       4000,  "Cash",  "Weekly pay"),
];

/** Format as Rs.150/-  (no decimals, Indian rupee) */
export const formatINR = (n: number) => {
  const val = Math.round(n || 0);
  return `Rs.${val}/-`;
};

/** Format a number with commas (for display in PDF) */
export const formatINRComma = (n: number) => {
  const val = Math.round(n || 0);
  const parts = val.toLocaleString("en-IN");
  return `Rs.${parts}/-`;
};
