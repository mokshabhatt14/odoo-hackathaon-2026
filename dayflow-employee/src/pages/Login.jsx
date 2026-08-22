// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Loader2, Clock3 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { signIn, signUp, firebaseUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [role, setRole] = useState("Employee");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  if (!authLoading && firebaseUser) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      if (mode === "signin") {
        await signIn(email, password);
      } else {
        if (password.length < 6) {
          setFormError("Password should be at least 6 characters.");
          setSubmitting(false);
          return;
        }
        await signUp({ email, password, name, employeeId, role });
      }
      navigate("/dashboard");
    } catch (err) {
      setFormError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--df-bg)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--df-primary)] text-white">
            <Clock3 className="h-6 w-6" strokeWidth={1.75} />
          </span>
          <h1 className="mt-3 font-[var(--df-font-display)] text-2xl font-bold text-[var(--df-text)]">Dayflow</h1>
          <p className="text-sm text-[var(--df-text-soft)]">Every workday, perfectly aligned.</p>
        </div>

        <div className="rounded-2xl border border-[var(--df-border)] bg-white p-6 shadow-sm">
          <div className="mb-5 flex rounded-lg bg-slate-100 p-1 text-sm font-medium">
            <button
              className={`flex-1 rounded-md py-1.5 transition-colors ${mode === "signin" ? "bg-white shadow-sm text-[var(--df-text)]" : "text-[var(--df-text-soft)]"}`}
              onClick={() => setMode("signin")}
              type="button"
            >
              Sign in
            </button>
            <button
              className={`flex-1 rounded-md py-1.5 transition-colors ${mode === "signup" ? "bg-white shadow-sm text-[var(--df-text)]" : "text-[var(--df-text-soft)]"}`}
              onClick={() => setMode("signup")}
              type="button"
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <>
                <input
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="df-input"
                />
                <input
                  type="text"
                  placeholder="Employee ID"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  required
                  className="df-input"
                />
                <select value={role} onChange={(e) => setRole(e.target.value)} className="df-input">
                  <option value="Employee">Employee</option>
                  <option value="HR">HR / Admin</option>
                </select>
              </>
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="df-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="df-input"
            />

            {formError && <p className="text-sm text-rose-600">{formError}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--df-primary)] py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
