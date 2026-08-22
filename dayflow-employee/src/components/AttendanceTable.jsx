// src/components/AttendanceTable.jsx
import StatusBadge from "./StatusBadge";

export default function AttendanceTable({ records }) {
  const formatTime = (ts) => {
    if (!ts) return "—";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--df-border)] bg-white p-10 text-center">
        <p className="text-sm text-[var(--df-text-soft)]">No attendance records yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--df-border)] bg-white shadow-sm">
      <table className="min-w-full divide-y divide-[var(--df-border)]">
        <thead className="bg-slate-50">
          <tr>
            {["Date", "Check-in", "Check-out", "Status"].map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--df-text-soft)]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--df-border)]">
          {records.map((r) => (
            <tr key={r.id} className="hover:bg-slate-50/60">
              <td className="whitespace-nowrap px-5 py-3 font-mono text-sm text-[var(--df-text)]">{r.date}</td>
              <td className="whitespace-nowrap px-5 py-3 font-mono text-sm text-[var(--df-text-soft)]">
                {formatTime(r.checkIn)}
              </td>
              <td className="whitespace-nowrap px-5 py-3 font-mono text-sm text-[var(--df-text-soft)]">
                {formatTime(r.checkOut)}
              </td>
              <td className="whitespace-nowrap px-5 py-3">
                <StatusBadge status={r.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
