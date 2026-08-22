// src/components/CheckInOutButton.jsx
// Dayflow's signature interaction: a "time-clock punch" toggle. Sliding
// the pill triggers a Firestore check-in/check-out write. Reflects the
// brief's thesis — "every workday, perfectly aligned" — as a literal
// physical metaphor rather than a generic button.

import { useState } from "react";
import { LogIn, LogOut, Loader2 } from "lucide-react";

export default function CheckInOutButton({ status, onCheckIn, onCheckOut, checkInTime, checkOutTime }) {
  const [busy, setBusy] = useState(false);

  const isCheckedIn = status === "checked-in";
  const isDone = status === "checked-out";

  const handleClick = async () => {
    if (busy || isDone) return;
    setBusy(true);
    try {
      if (isCheckedIn) {
        await onCheckOut();
      } else {
        await onCheckIn();
      }
    } finally {
      setBusy(false);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return null;
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--df-border)] bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--df-text-soft)]">
        {isDone ? "Day complete" : isCheckedIn ? "Currently clocked in" : "Ready to start"}
      </p>

      <button
        type="button"
        onClick={handleClick}
        disabled={busy || isDone}
        aria-pressed={isCheckedIn}
        className={`relative flex h-14 w-56 items-center rounded-full border transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--df-primary)] disabled:cursor-not-allowed disabled:opacity-70 ${
          isCheckedIn
            ? "border-[var(--df-primary)] bg-[var(--df-primary)]/10"
            : "border-[var(--df-border)] bg-slate-50"
        }`}
      >
        <span
          className={`absolute top-1 flex h-12 w-12 items-center justify-center rounded-full shadow-md transition-all duration-300 ease-out ${
            isCheckedIn ? "left-[calc(100%-3.25rem)] bg-[var(--df-primary)]" : "left-1 bg-[var(--df-accent)]"
          }`}
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : isCheckedIn ? (
            <LogOut className="h-5 w-5 text-white" strokeWidth={1.75} />
          ) : (
            <LogIn className="h-5 w-5 text-white" strokeWidth={1.75} />
          )}
        </span>
        <span
          className={`w-full text-sm font-semibold ${
            isCheckedIn ? "pr-14 text-left pl-5 text-[var(--df-primary)]" : "pl-14 pr-5 text-right text-[var(--df-text)]"
          }`}
        >
          {isCheckedIn ? "Punch out" : "Punch in"}
        </span>
      </button>

      <div className="flex gap-6 text-xs text-[var(--df-text-soft)]">
        <span>In: <span className="font-mono font-medium text-[var(--df-text)]">{formatTime(checkInTime) || "—"}</span></span>
        <span>Out: <span className="font-mono font-medium text-[var(--df-text)]">{formatTime(checkOutTime) || "—"}</span></span>
      </div>
    </div>
  );
}
