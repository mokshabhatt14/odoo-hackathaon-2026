// src/pages/Dashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { User, CalendarClock, CalendarDays, LogOut, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import QuickAccessCard from "../components/QuickAccessCard";
import CheckInOutButton from "../components/CheckInOutButton";
import StatusBadge from "../components/StatusBadge";
import {
  getAttendanceForUser,
  getTodayAttendance,
  checkIn as checkInMutation,
  checkOut as checkOutMutation,
  computeMonthlyAttendancePct,
  getLeaveRequestsForUser,
  computeLeaveRemaining,
} from "../lib/firestore";

export default function Dashboard() {
  const { userProfile, signOut } = useAuth();
  const [today, setToday] = useState(null);
  const [attendancePct, setAttendancePct] = useState(0);
  const [leaveRemaining, setLeaveRemaining] = useState(null);
  const [latestLeave, setLatestLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!userProfile?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const [todayRecord, records, leaves] = await Promise.all([
        getTodayAttendance(userProfile.uid),
        getAttendanceForUser(userProfile.uid),
        getLeaveRequestsForUser(userProfile.uid),
      ]);
      setToday(todayRecord);
      setAttendancePct(computeMonthlyAttendancePct(records));
      setLeaveRemaining(computeLeaveRemaining(leaves));
      setLatestLeave(leaves[0] || null);
    } catch (err) {
      console.error(err);
      setError("Couldn't load your dashboard. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [userProfile?.uid]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCheckIn = async () => {
    const record = await checkInMutation(userProfile.uid);
    setToday(record);
  };

  const handleCheckOut = async () => {
    if (!today) return;
    await checkOutMutation(today.id);
    setToday({ ...today, checkOut: new Date() });
  };

  const punchStatus = !today ? "not-started" : today.checkOut ? "checked-out" : "checked-in";

  const firstName = userProfile?.personalDetails?.name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-[var(--df-bg)] pb-16">
      <header className="border-b border-[var(--df-border)] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--df-primary)] font-[var(--df-font-display)] text-sm font-bold text-white">
              D
            </span>
            <span className="font-[var(--df-font-display)] text-lg font-semibold text-[var(--df-text)]">
              Dayflow
            </span>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--df-text-soft)] transition-colors hover:bg-slate-100 hover:text-[var(--df-text)]"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--df-primary)]">
              {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="mt-1 font-[var(--df-font-display)] text-3xl font-bold text-[var(--df-text)]">
              Good to see you, {firstName}.
            </h1>
          </div>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Stats + punch clock */}
        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="grid grid-cols-2 gap-4 lg:col-span-2 lg:grid-cols-2">
            <StatTile
              label="Attendance this month"
              value={loading ? "—" : `${attendancePct}%`}
              hint="Present + half-day"
            />
            <StatTile
              label="Leave days remaining"
              value={loading ? "—" : leaveRemaining}
              hint="Paid leave, annual"
            />
            <div className="col-span-2 rounded-2xl border border-[var(--df-border)] bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--df-text-soft)]">
                Latest leave request
              </p>
              {loading ? (
                <div className="mt-3 h-5 w-32 animate-pulse rounded bg-slate-100" />
              ) : latestLeave ? (
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <StatusBadge status={latestLeave.status} />
                  <span className="text-sm text-[var(--df-text)]">
                    {latestLeave.type} · {latestLeave.startDate} → {latestLeave.endDate}
                  </span>
                </div>
              ) : (
                <p className="mt-2 text-sm text-[var(--df-text-soft)]">No leave requests yet.</p>
              )}
            </div>
          </div>

          <CheckInOutButton
            status={punchStatus === "not-started" ? "idle" : punchStatus}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            checkInTime={today?.checkIn}
            checkOutTime={today?.checkOut}
          />
        </section>

        {/* Quick access */}
        <section className="mt-10">
          <h2 className="font-[var(--df-font-display)] text-lg font-semibold text-[var(--df-text)]">
            Quick access
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <QuickAccessCard
              to="/profile"
              icon={User}
              title="Profile"
              subtitle="Personal & job details"
              accent="indigo"
            />
            <QuickAccessCard
              to="/attendance"
              icon={CalendarClock}
              title="Attendance"
              subtitle="Daily & weekly log"
              accent="blue"
            />
            <QuickAccessCard
              to="/leave"
              icon={CalendarDays}
              title="Leave requests"
              subtitle="Apply & track status"
              accent="amber"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function StatTile({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-[var(--df-border)] bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--df-text-soft)]">{label}</p>
      <p className="mt-2 font-[var(--df-font-display)] text-3xl font-bold text-[var(--df-text)]">{value}</p>
      <p className="mt-1 text-xs text-[var(--df-text-soft)]">{hint}</p>
    </div>
  );
}
