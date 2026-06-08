import { useMemo, useState } from "react";
import { Calendar, FileDown, BarChart3 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Booking, Expense } from "../types";
import { formatINR, formatINRComma } from "../store";

export default function Reports({
  bookings,
  expenses,
}: {
  bookings: Booking[];
  expenses: Expense[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);
  const [from, setFrom] = useState(weekAgo);
  const [to, setTo] = useState(today);

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => b.date >= from && b.date <= to)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [bookings, from, to]);

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => e.date >= from && e.date <= to)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [expenses, from, to]);

  const revenue = filteredBookings.reduce((s, b) => s + b.amount, 0);
  const upiTotal = filteredBookings.reduce((s, b) => s + b.upiAmount, 0);
  const cashTotal = filteredBookings.reduce((s, b) => s + b.cashAmount, 0);
  const expenseTotal = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = revenue - expenseTotal;
  const splitCount = filteredBookings.filter((b) => b.paymentMode === "Split").length;

  const hasRows = filteredBookings.length > 0 || filteredExpenses.length > 0;

  // ── Revenue analytics: daily breakdown across selected date range (max 14 cols) ──
  const dailyRevenue = useMemo(() => {
    const start = new Date(from);
    const end = new Date(to);
    const days: { date: string; label: string; total: number }[] = [];
    let cursor = new Date(start);
    let guard = 0;
    while (cursor <= end && guard < 60) {
      const key = cursor.toISOString().slice(0, 10);
      const total = bookings
        .filter((b) => b.date === key)
        .reduce((s, b) => s + b.amount, 0);
      days.push({
        date: key,
        label: cursor.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        total,
      });
      cursor = new Date(cursor.getTime() + 864e5);
      guard++;
    }
    // keep the most recent 14 days for readability
    return days.slice(-14);
  }, [bookings, from, to]);

  const maxDailyRevenue = Math.max(...dailyRevenue.map((d) => d.total), 1);
  const today2 = new Date().toISOString().slice(0, 10);

  const downloadPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const mL = 40;
    const mR = 40;
    const uW = pageW - mL - mR;

    /* ========== HEADER ========== */
    const headerH = 90;
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, headerH, "F");
    doc.setFillColor(168, 85, 247);
    doc.rect(0, headerH - 4, pageW, 4, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("POWERPLAY GAMING ZONE", mL, 34);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 210, 230);
    doc.text("Owner Dashboard — Revenue & Expense Report", mL, 52);

    const prettyRange = `${new Date(from).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    })}  —  ${new Date(to).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    })}`;
    doc.setFontSize(8);
    doc.setTextColor(160, 170, 190);
    doc.text(`Period: ${prettyRange}`, mL, 70);
    doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, mL, 82);

    /* ========== SUMMARY CARDS ========== */
    const summaryY = headerH + 22;
    const boxH = 50;
    const boxGap = 8;
    const boxW = (uW - boxGap * 3) / 4;
    const boxes: { label: string; val: string; color: [number, number, number] }[] = [
      { label: "Total Bookings", val: String(filteredBookings.length), color: [99, 102, 241] },
      { label: "Revenue",   val: formatINRComma(revenue),      color: [16, 185, 129] },
      { label: "Expenses",  val: formatINRComma(expenseTotal), color: [244, 63, 94] },
      { label: "Net Profit",  val: formatINRComma(netProfit),   color: [34, 211, 238] },
    ];

    boxes.forEach((box, i) => {
      const x = mL + i * (boxW + boxGap);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, summaryY, boxW, boxH, 6, 6, "F");
      doc.setFillColor(box.color[0], box.color[1], box.color[2]);
      doc.rect(x, summaryY, 4, boxH, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(box.val, x + 14, summaryY + 22);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(box.label, x + 14, summaryY + 38);
    });

    let cursorY = summaryY + boxH + 22;

    /* ========== BOOKING INCOME TABLE ========== */
    if (filteredBookings.length > 0) {
      // thin separator line
      doc.setDrawColor(210, 218, 230);
      doc.setLineWidth(0.5);
      doc.line(mL, cursorY, pageW - mR, cursorY);
      cursorY += 8;

      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.text("Booking Income", mL, cursorY + 10);

      const bCols = [
        { w: 20,  ha: "center" as const },
        { w: 44,  ha: "left" as const },
        { w: 56,  ha: "left" as const },
        { w: 56,  ha: "left" as const },
        { w: 48,  ha: "left" as const },
        { w: 42,  ha: "left" as const },
        { w: 26,  ha: "center" as const },
        { w: 50,  ha: "right" as const },
        { w: 50,  ha: "right" as const },
        { w: 50,  ha: "right" as const },
        { w: 36,  ha: "center" as const },
      ];
      const bTotalW = bCols.reduce((s, c) => s + c.w, 0);

      autoTable(doc, {
        startY: cursorY + 14,
        margin: { left: mL, right: mL + (uW - bTotalW) },
        tableWidth: bTotalW,
        head: [["#", "Date", "Customer", "Mobile", "Setup", "Game", "Dur", "Total", "UPI", "Cash", "Type"]],
        body: [
          ...filteredBookings.map((b, idx) => [
            String(idx + 1),
            pretty(b.date),
            b.customerName || "-",
            b.customerPhone || "-",
            b.setupName,
            b.game || "-",
            `${b.durationMinutes}m`,
            formatINRComma(b.amount),
            formatINRComma(b.upiAmount),
            formatINRComma(b.cashAmount),
            b.isEmergency ? "EMERGENCY" : b.paymentMode,
          ]),
          [
            "",
            "",
            "",
            "",
            "",
            "",
            `Total: ${filteredBookings.length}`,
            formatINRComma(revenue),
            formatINRComma(upiTotal),
            formatINRComma(cashTotal),
            `${splitCount} split`,
          ],
        ],
        headStyles: { fillColor: [168, 85, 247], textColor: 255, fontStyle: "bold", fontSize: 8, cellPadding: 6 },
        bodyStyles: { fontSize: 7.8, textColor: [30, 41, 59], cellPadding: 5 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        styles: { lineColor: [226, 232, 240], lineWidth: 0.25 },
        columnStyles: bCols.reduce((acc, c, i) => ({ ...acc, [i]: { cellWidth: c.w, halign: c.ha } }), {} as any),
        didParseCell: (data: any) => {
          // Style the last row (totals row)
          if (data.section === "body" && data.row.index === filteredBookings.length) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [245, 243, 255];
            data.cell.styles.fontSize = 7.8;
            if ([7, 8, 9].includes(data.column.index)) {
              data.cell.styles.textColor = [15, 23, 42];
            }
          }
          // Emergency entry rows — amber tint
          if (data.section === "body" && data.row.index < filteredBookings.length) {
            const booking = filteredBookings[data.row.index];
            if (booking?.isEmergency) {
              data.cell.styles.fillColor = [255, 251, 235];
              // Type column text
              if (data.column.index === 10) {
                data.cell.styles.textColor = [180, 83, 9];
                data.cell.styles.fontStyle = "bold";
              }
            }
          }
        },
      });
      cursorY = ((doc as any).lastAutoTable?.finalY ?? cursorY) + 16;
    }

    /* ========== EXPENSES TABLE ========== */
    if (filteredExpenses.length > 0) {
      doc.setDrawColor(210, 218, 230);
      doc.setLineWidth(0.5);
      doc.line(mL, cursorY, pageW - mR, cursorY);
      cursorY += 8;

      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.text("Expenses", mL, cursorY + 10);

      const eCols = [
        { w: 22,  ha: "center" as const },
        { w: 50,  ha: "left" as const },
        { w: 120, ha: "left" as const },
        { w: 68,  ha: "left" as const },
        { w: 56,  ha: "left" as const },
        { w: 60,  ha: "right" as const },
        { w: 102, ha: "left" as const },
      ];
      const eTotalW = eCols.reduce((s, c) => s + c.w, 0);

      autoTable(doc, {
        startY: cursorY + 14,
        margin: { left: mL, right: mL + (uW - eTotalW) },
        tableWidth: eTotalW,
        head: [["#", "Date", "Title", "Category", "Paid By", "Amount", "Notes"]],
        body: [
          ...filteredExpenses.map((e, idx) => [
            String(idx + 1),
            pretty(e.date),
            e.title,
            e.category,
            e.paidBy,
            formatINRComma(e.amount),
            e.notes || "-",
          ]),
          [
            "",
            "",
            "",
            "",
            `Total: ${filteredExpenses.length}`,
            formatINRComma(expenseTotal),
            "",
          ],
        ],
        headStyles: { fillColor: [244, 63, 94], textColor: 255, fontStyle: "bold", fontSize: 8, cellPadding: 6 },
        bodyStyles: { fontSize: 7.8, textColor: [30, 41, 59], cellPadding: 5 },
        alternateRowStyles: { fillColor: [255, 247, 247] },
        styles: { lineColor: [226, 232, 240], lineWidth: 0.25 },
        columnStyles: eCols.reduce((acc, c, i) => ({ ...acc, [i]: { cellWidth: c.w, halign: c.ha } }), {} as any),
        didParseCell: (data: any) => {
          if (data.section === "body" && data.row.index === filteredExpenses.length) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [255, 240, 240];
            data.cell.styles.fontSize = 7.8;
            if (data.column.index === 5) {
              data.cell.styles.textColor = [190, 18, 60];
            }
          }
        },
      });
      cursorY = ((doc as any).lastAutoTable?.finalY ?? cursorY) + 16;
    }

    /* ========== FINAL TOTALS ROW ========== */
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(1);
    doc.line(mL, cursorY, pageW - mR, cursorY);
    cursorY += 10;

    const totCols = [
      { w: 62 },
      { w: 54 },
      { w: 54 },
      { w: 54 },
      { w: 54 },
      { w: 58 },
      { w: 48 },
      { w: 48 },
      { w: 42 },
    ];
    const totTotalW = totCols.reduce((s, c) => s + c.w, 0);

    autoTable(doc, {
      startY: cursorY,
      margin: { left: mL, right: mL + (uW - totTotalW) },
      tableWidth: totTotalW,
      head: [["GRAND TOTAL", "Income", "UPI", "Cash", "Expenses", "Net Profit", "Bookings", "Expense Items", "Split"]],
      body: [[
        "—",
        formatINRComma(revenue),
        formatINRComma(upiTotal),
        formatINRComma(cashTotal),
        formatINRComma(expenseTotal),
        formatINRComma(netProfit),
        String(filteredBookings.length),
        String(filteredExpenses.length),
        String(splitCount),
      ]],
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold", fontSize: 8, cellPadding: 6 },
      bodyStyles: { fontSize: 8, textColor: [15, 23, 42], fontStyle: "bold", fillColor: [248, 250, 252], cellPadding: 6 },
      styles: { lineColor: [180, 190, 205], lineWidth: 0.4 },
      columnStyles: {
        0: { cellWidth: totCols[0].w, halign: "center" },
        1: { cellWidth: totCols[1].w, halign: "right" },
        2: { cellWidth: totCols[2].w, halign: "right" },
        3: { cellWidth: totCols[3].w, halign: "right" },
        4: { cellWidth: totCols[4].w, halign: "right", textColor: [190, 18, 60] },
        5: { cellWidth: totCols[5].w, halign: "right",
              textColor: netProfit >= 0 ? [5, 150, 105] : [190, 18, 60] },
        6: { cellWidth: totCols[6].w, halign: "center" },
        7: { cellWidth: totCols[7].w, halign: "center" },
        8: { cellWidth: totCols[8].w, halign: "center" },
      },
    });

    /* ========== FOOTER ========== */
    const footerY = pageH - 24;
    doc.setDrawColor(200, 210, 230);
    doc.setLineWidth(0.5);
    doc.line(mL, footerY - 10, pageW - mR, footerY - 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(130, 140, 160);
    doc.text("Computer-generated report — Powerplay Gaming Zone Owner Dashboard", mL, footerY);
    doc.text("Page 1 of 1", pageW - mR, footerY, { align: "right" });

    doc.save(`Powerplay-Report_${from}_to_${to}.pdf`);
  };

  return (
    <div className="space-y-5 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-3xl font-bold text-white">Reports</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Export bookings, expenses, and net profit by date range.
        </p>
      </div>

      <div className="rounded-2xl bg-navy-900/60 border border-white/5 p-4 md:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <DateInput label="From" value={from} onChange={setFrom} />
          <DateInput label="To" value={to} onChange={setTo} />
          <button
            onClick={downloadPDF}
            disabled={!hasRows}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[48px] rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-bold text-sm hover:opacity-90 shadow-lg shadow-fuchsia-500/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition sm:col-span-1 col-span-full"
          >
            <FileDown className="h-4 w-4" /> Download PDF
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3 mt-4">
          <Stat label="Bookings" value={String(filteredBookings.length)} />
          <Stat label="Revenue" value={formatINR(revenue)} accent="emerald" />
          <Stat label="Expenses" value={formatINR(expenseTotal)} accent="rose" />
          <Stat label="Net Profit" value={formatINR(netProfit)} accent={netProfit >= 0 ? "cyan" : "rose"} />
          <Stat label="Expense Rows" value={String(filteredExpenses.length)} />
        </div>
      </div>

      {/* ── Revenue Analytics chart ── */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.05]">
          <span
            className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8" }}
          >
            <BarChart3 className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-white">Revenue Analytics</p>
            <p className="text-[11px] text-slate-500">Daily revenue across selected range</p>
          </div>
        </div>
        <div className="px-5 pb-5 pt-4">
          {dailyRevenue.length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-xs">No data for selected range.</p>
          ) : (
            <div className="flex items-end gap-2 h-[180px]">
              {dailyRevenue.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full min-w-0">
                  <div className="w-full flex flex-col justify-end h-full relative">
                    {/* tooltip */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="px-2 py-1 rounded-md text-[10px] font-bold whitespace-nowrap" style={{ background: "rgba(8,12,23,0.95)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}>
                        {formatINR(d.total)}
                      </div>
                    </div>
                    <div
                      className="w-full rounded-t-lg transition-all duration-500 group-hover:brightness-125"
                      style={{
                        height: `${Math.max((d.total / maxDailyRevenue) * 100, 3)}%`,
                        background: d.date === today2
                          ? "linear-gradient(180deg, #6366f1, #a855f7)"
                          : "rgba(99, 102, 241, 0.22)",
                        border: d.date === today2 ? "none" : "1px solid rgba(99, 102, 241, 0.12)",
                        boxShadow: d.date === today2 ? "0 0 12px rgba(99,102,241,0.3)" : "none",
                      }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 truncate w-full text-center">{d.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <PreviewSection title={`Booking Preview (${filteredBookings.length})`} empty="No bookings in this range.">
        {filteredBookings.length > 0 && <BookingPreview bookings={filteredBookings} />}
      </PreviewSection>

      <PreviewSection title={`Expense Preview (${filteredExpenses.length})`} empty="No expenses in this range.">
        {filteredExpenses.length > 0 && <ExpensePreview expenses={filteredExpenses} />}
      </PreviewSection>
    </div>
  );
}

/* ---- sub-components ---- */

function DateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">{label}</label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="input pl-9" />
      </div>
    </div>
  );
}

function PreviewSection({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const hasContent = Boolean(children);
  return (
    <div className="rounded-2xl bg-navy-900/60 border border-white/5 overflow-hidden">
      <div className="px-4 md:px-5 py-3 border-b border-white/5 text-sm text-slate-300 font-medium">{title}</div>
      {hasContent ? children : <div className="p-10 text-center text-slate-500 text-sm">{empty}</div>}
    </div>
  );
}

function BookingPreview({ bookings }: { bookings: Booking[] }) {
  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-400 text-xs uppercase tracking-wider">
            <tr className="text-left border-b border-white/5">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Setup</th>
              <th className="px-5 py-3">Game</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">UPI</th>
              <th className="px-5 py-3">Cash</th>
              <th className="px-5 py-3">Mode</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b border-white/5 last:border-0">
                <td className="px-5 py-3 text-slate-300">{pretty(b.date)}</td>
                <td className="px-5 py-3 text-white">{b.customerName || "-"}</td>
                <td className="px-5 py-3 text-slate-300">{b.setupName}</td>
                <td className="px-5 py-3 text-slate-300 text-xs">{b.game || "-"}</td>
                <td className="px-5 py-3 text-white font-semibold">{formatINR(b.amount)}</td>
                <td className="px-5 py-3 text-emerald-300">{formatINR(b.upiAmount)}</td>
                <td className="px-5 py-3 text-amber-300">{formatINR(b.cashAmount)}</td>
                <td className="px-5 py-3 text-slate-300">{b.paymentMode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="md:hidden divide-y divide-white/5">
        {bookings.map((b) => (
          <li key={b.id} className="p-4 flex justify-between gap-3">
            <div>
              <p className="text-white font-semibold">{b.customerName || "Walk-in"}</p>
              <p className="text-[11px] text-slate-400 mt-1">{pretty(b.date)} · {b.setupName}</p>
            </div>
            <p className="text-white font-bold shrink-0">{formatINR(b.amount)}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function ExpensePreview({ expenses }: { expenses: Expense[] }) {
  return (
    <>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-slate-400 text-xs uppercase tracking-wider">
            <tr className="text-left border-b border-white/5">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Paid By</th>
              <th className="px-5 py-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} className="border-b border-white/5 last:border-0">
                <td className="px-5 py-3 text-slate-300">{pretty(e.date)}</td>
                <td className="px-5 py-3 text-white">
                  <div>{e.title}</div>
                  {e.notes && <div className="text-xs text-slate-500 mt-0.5">{e.notes}</div>}
                </td>
                <td className="px-5 py-3 text-slate-300">{e.category}</td>
                <td className="px-5 py-3 text-slate-300">{e.paidBy}</td>
                <td className="px-5 py-3 text-rose-300 font-semibold">{formatINR(e.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="md:hidden divide-y divide-white/5">
        {expenses.map((e) => (
          <li key={e.id} className="p-4 flex justify-between gap-3">
            <div>
              <p className="text-white font-semibold">{e.title}</p>
              <p className="text-[11px] text-slate-400 mt-1">{pretty(e.date)} · {e.category}</p>
            </div>
            <p className="text-rose-300 font-bold shrink-0">{formatINR(e.amount)}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: "emerald" | "amber" | "rose" | "cyan" }) {
  const color =
    accent === "emerald" ? "text-emerald-300"
    : accent === "amber" ? "text-amber-300"
    : accent === "rose" ? "text-rose-300"
    : accent === "cyan" ? "text-cyan-300"
    : "text-white";
  return (
    <div className="rounded-xl bg-white/5 border border-white/5 p-3">
      <p className="text-[10px] md:text-[11px] uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`text-base md:text-lg font-bold mt-0.5 ${color} truncate`}>{value}</p>
    </div>
  );
}

function pretty(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
