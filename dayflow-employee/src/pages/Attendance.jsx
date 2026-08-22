// src/pages/Attendance.jsx
import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, LayoutGrid, List } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getAttendanceForUser } from "../lib/firestore";
import AttendanceTable from "../components/AttendanceTable";
import AttendanceWeekView from "../components/AttendanceWeekView";

export default function Attendance() {
  const { userProfile } = useAuth();
  const [records, setRecords] = useState([]);
  const [view, setView] = useState("week"); // "week" | "daily"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!userProfile?.uid) return;
    setLoading(true);
    setError(null);
    try {
      // Scoped strictly to the current user, per spec.
      const data = await getAttendanceForUser(userProfile.uid);
      setRecords(data);
    } catch (err) {
      console.error(err);
      setError("Couldn't load attendance records.");
    } finally {
      setLoading(false);
    }
  }, [userProfile?.uid]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-screen bg-[var(--df-bg)] pb-16">
      <header className="border-b border-[var(--df-border)] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-4">
          <Link to="/dashboard" className="rounded-lg p-1.5 text-[var(--df-text-soft)] hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-[var(--df-font-display)] text-lg font-semibold text-[var(--df-text)]">Attendance</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pt-8">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--df-text-soft)]">Your check-in history, all in one place.</p>
          <div className="flex items-center gap-1 rounded-lg border border-[var(--df-border)] bg-white p-1">
            <ToggleButton active={view === "week"} onClick={() => setView("week")} icon={LayoutGrid} label="Weekly" />
            <ToggleButton active={view === "daily"} onClick={() => setView("daily")} icon={List} label="Daily log" />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-5">
          {loading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
          ) : view === "week" ? (
            <AttendanceWeekView records={records} />
          ) : (
            <AttendanceTable records={records} />
          )}
        </div>
      </main>
    </div>
  );
}

function ToggleButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-[var(--df-primary)] text-white" : "text-[var(--df-text-soft)] hover:bg-slate-100"
      }`}
    >
      <Icon className="h-4 w-4" strokeWidth={1.75} />
      {label}
    </button>
  );
}
