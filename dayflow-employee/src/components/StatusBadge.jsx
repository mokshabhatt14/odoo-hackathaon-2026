// src/components/StatusBadge.jsx
// Small pill badge for attendance/leave statuses. Colors are fixed per
// spec: Present=green, Absent=red, Half-day=yellow, Leave=blue.

const STYLES = {
  Present: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Absent: "bg-rose-50 text-rose-700 ring-rose-600/20",
  "Half-day": "bg-amber-50 text-amber-700 ring-amber-600/20",
  Leave: "bg-blue-50 text-blue-700 ring-blue-600/20",
  Pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-600/20",
};

const DOT = {
  Present: "bg-emerald-500",
  Absent: "bg-rose-500",
  "Half-day": "bg-amber-500",
  Leave: "bg-blue-500",
  Pending: "bg-amber-500",
  Approved: "bg-emerald-500",
  Rejected: "bg-rose-500",
};

export default function StatusBadge({ status, className = "" }) {
  const style = STYLES[status] || "bg-slate-100 text-slate-600 ring-slate-500/20";
  const dot = DOT[status] || "bg-slate-400";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}
