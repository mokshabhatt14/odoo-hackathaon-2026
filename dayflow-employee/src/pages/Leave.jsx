import { useEffect, useState } from "react";
import { CalendarDays, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  applyForLeave,
  getLeaveRequestsForUser,
} from "../lib/firestore";
import StatusBadge from "../components/StatusBadge";

export default function Leave() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [type, setType] = useState("Paid");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadLeaves() {
      if (!userProfile?.uid) return;

      try {
        setLoading(true);
        const requests = await getLeaveRequestsForUser(
          userProfile.uid
        );
        setLeaveRequests(requests);
      } catch (err) {
        console.error(err);
        setError("Couldn't load your leave requests.");
      } finally {
        setLoading(false);
      }
    }

    loadLeaves();
  }, [userProfile?.uid]);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!startDate || !endDate) {
      setError("Please select both start and end dates.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be before start date.");
      return;
    }

    try {
      setSubmitting(true);

      await applyForLeave(userProfile.uid, {
        type,
        startDate,
        endDate,
        remarks,
      });

      const updatedRequests = await getLeaveRequestsForUser(
        userProfile.uid
      );

      setLeaveRequests(updatedRequests);

      setStartDate("");
      setEndDate("");
      setRemarks("");

      setSuccess("Leave request submitted successfully.");
    } catch (err) {
      console.error(err);
      setError("Couldn't submit your leave request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--df-bg)] pb-16">
      {/* Header */}
      <header className="border-b border-[var(--df-border)] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm font-medium text-[var(--df-text-soft)] hover:text-[var(--df-text)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[var(--df-primary)]" />

            <span className="font-[var(--df-font-display)] font-semibold text-[var(--df-text)]">
              Leave Requests
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-8">
        {/* Page heading */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--df-primary)]">
            Leave Management
          </p>

          <h1 className="mt-1 font-[var(--df-font-display)] text-3xl font-bold text-[var(--df-text)]">
            Apply for leave
          </h1>

          <p className="mt-2 text-sm text-[var(--df-text-soft)]">
            Submit a request and track its approval status.
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Apply form */}
          <section className="rounded-2xl border border-[var(--df-border)] bg-white p-6 shadow-sm">
            <h2 className="font-[var(--df-font-display)] text-lg font-semibold text-[var(--df-text)]">
              New leave request
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--df-text)]">
                  Leave type
                </label>

                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full rounded-lg border border-[var(--df-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--df-primary)]"
                >
                  <option value="Paid">Paid Leave</option>
                  <option value="Sick">Sick Leave</option>
                  <option value="Unpaid">Unpaid Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--df-text)]">
                    Start date
                  </label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-lg border border-[var(--df-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--df-primary)]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[var(--df-text)]">
                    End date
                  </label>

                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-[var(--df-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--df-primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--df-text)]">
                  Remarks
                </label>

                <textarea
                  rows="5"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add a reason or additional information..."
                  className="w-full resize-none rounded-lg border border-[var(--df-border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--df-primary)]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--df-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {submitting
                  ? "Submitting..."
                  : "Submit Leave Request"}
              </button>
            </form>
          </section>

          {/* Requests */}
          <section className="rounded-2xl border border-[var(--df-border)] bg-white p-6 shadow-sm">
            <h2 className="font-[var(--df-font-display)] text-lg font-semibold text-[var(--df-text)]">
              My requests
            </h2>

            <p className="mt-1 text-sm text-[var(--df-text-soft)]">
              Your submitted leave requests appear here.
            </p>

            {loading ? (
              <div className="mt-6 flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--df-primary)]" />
              </div>
            ) : leaveRequests.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-[var(--df-border)] px-5 py-10 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />

                <p className="mt-3 text-sm font-medium text-[var(--df-text)]">
                  No leave requests yet
                </p>

                <p className="mt-1 text-xs text-[var(--df-text-soft)]">
                  Your requests will appear here after submission.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {leaveRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-xl border border-[var(--df-border)] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[var(--df-text)]">
                          {request.type}
                        </p>

                        <p className="mt-1 text-sm text-[var(--df-text-soft)]">
                          {request.startDate} → {request.endDate}
                        </p>
                      </div>

                      <StatusBadge status={request.status} />
                    </div>

                    {request.remarks && (
                      <p className="mt-3 text-sm text-[var(--df-text-soft)]">
                        {request.remarks}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}