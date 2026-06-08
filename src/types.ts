export type Setup = {
  id: string;
  name: string;
  type: "PS5" | "Xbox" | "PC" | "VR" | "Racing Sim" | "Other";
  status: "Active" | "Maintenance" | "Inactive";
  location?: string;
  notes?: string;
  image?: string;
  pricePerHour?: number;
};

export type PriceRule = {
  id: string;
  label: string;
  durationMinutes: number;
  amount: number;
  appliesTo?: Setup["type"];
};

export type PaymentMode = "UPI" | "Cash" | "Split";

export type ExpensePaymentMode = "Cash" | "UPI" | "Card" | "Other";

export type Expense = {
  id: string;
  date: string;
  title: string;
  category: "Rent" | "Electricity" | "Internet" | "Salary" | "Maintenance" | "Snacks" | "Other";
  amount: number;
  paidBy: ExpensePaymentMode;
  notes?: string;
  createdAt: string;
};

/** Owner-dashboard booking record (history/active-sessions/reports). */
export type Booking = {
  id: string;
  setupId: string;
  setupName: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  game?: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  amount: number;
  paymentMode: PaymentMode;
  upiAmount: number;
  cashAmount: number;
  status: "Confirmed" | "Completed" | "Cancelled";
  createdAt: string;
  /** Legacy alias kept for existing filters */
  date: string;
  /** Legacy alias kept from older booking form */
  priceRuleId: string;
  /** Timer pause/resume support for powercut scenarios */
  pausedAt?: string;
  totalPausedMs?: number;
  extendedMinutes?: number;
  /** Marked true when added retroactively via Settings emergency entry */
  isEmergency?: boolean;
};

/** Game catalog master record. */
export type Game = {
  id: string;
  name: string;
  genre?: string;
  platform?: string;
};

/** Individual time-slot unit shown on the new customer booking UI. */
export type TimeSlot = {
  id: string;
  time: string;
  available: boolean;
  price: number;
  label?: string;
};
