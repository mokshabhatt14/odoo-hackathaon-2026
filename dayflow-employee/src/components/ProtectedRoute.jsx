// src/components/ProtectedRoute.jsx
// Wrap any page that requires authentication. Redirects to /login when
// there is no signed-in user, and optionally gates by role.

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Clock3 } from "lucide-react";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { firebaseUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--df-bg)]">
        <div className="flex flex-col items-center gap-3 text-[var(--df-text-soft)]">
          <Clock3 className="h-6 w-6 animate-spin" strokeWidth={1.75} />
          <p className="text-sm font-medium tracking-wide">Loading Dayflow…</p>
        </div>
      </div>
    );
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && userProfile?.role !== "Admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
