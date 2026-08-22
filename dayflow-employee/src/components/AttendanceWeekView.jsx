// src/components/AttendanceWeekView.jsx
// A 7-day "week-at-a-glance" strip, evoking the calendar-grid motif used
// throughout Dayflow (see index.css hero grid) at a smaller scale.

const DOT = {
  Present: "bg-emerald-500",
  Absent: "bg-rose-500",
  "Half-day": "bg-amber-500",
  Leave: "bg-blue-500",
};

function getCurrentWeekDates() {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function AttendanceWeekView({ records }) {
  const week = getCurrentWeekDates();
  const byDate = Object.fromEntries(records.map((r) => [r.date, r]));
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="grid grid-cols-7 gap-2">
      {week.map((d) => {
        const dateStr = d.toISOString().slice(0, 10);
        const record = byDate[dateStr];
        const isToday = dateStr === todayStr;
        const isFuture = dateStr > todayStr;

        return (
          <div
            key={dateStr}
            className={`flex flex-col items-center gap-2 rounded-xl border p-3 ${
              isToday ? "border-[var(--df-primary)] bg-[var(--df-primary)]/5" : "border-[var(--df-border)] bg-white"
            }`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--df-text-soft)]">
              {d.toLocaleDateString(undefined, { weekday: "short" })}
            </span>
            <span className="font-[var(--df-font-display)] text-sm font-bold text-[var(--df-text)]">
              {d.getDate()}
            </span>
            <span
              className={`h-2 w-2 rounded-full ${
                isFuture ? "bg-slate-200" : record ? DOT[record.status] || "bg-slate-300" : "bg-slate-200"
              }`}
              title={record?.status || (isFuture ? "Upcoming" : "No record")}
            />
          </div>
        );
      })}
    </div>
  );
}
