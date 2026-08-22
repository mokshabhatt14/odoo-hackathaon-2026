// src/pages/Profile.jsx
import { useState } from "react";
import { ArrowLeft, Pencil, FileText, Phone, MapPin, Briefcase, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileEditModal from "../components/ProfileEditModal";
import { updateOwnProfile } from "../lib/firestore";

export default function Profile() {
  const { userProfile, refreshProfile, setUserProfile } = useAuth();
  const [editing, setEditing] = useState(false);

  if (!userProfile) return null;

  const { personalDetails = {}, jobDetails = {} } = userProfile;

  const handleSave = async (updates) => {
    await updateOwnProfile(userProfile.uid, updates);
    // Optimistic local update so the UI reflects the change immediately.
    setUserProfile((prev) => ({
      ...prev,
      personalDetails: { ...prev.personalDetails, ...updates },
    }));
    await refreshProfile();
  };

  return (
    <div className="min-h-screen bg-[var(--df-bg)] pb-16">
      <header className="border-b border-[var(--df-border)] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-4">
          <Link to="/dashboard" className="rounded-lg p-1.5 text-[var(--df-text-soft)] hover:bg-slate-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-[var(--df-font-display)] text-lg font-semibold text-[var(--df-text)]">Profile</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--df-border)] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src={personalDetails.profilePictureUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${personalDetails.name || "U"}`}
              alt={`${personalDetails.name || "Employee"} avatar`}
              className="h-20 w-20 rounded-full border border-[var(--df-border)] object-cover"
            />
            <div>
              <h2 className="font-[var(--df-font-display)] text-2xl font-bold text-[var(--df-text)]">
                {personalDetails.name || "Unnamed employee"}
              </h2>
              <p className="text-sm text-[var(--df-text-soft)]">
                {jobDetails.designation || "Role not set"} · {jobDetails.department || "Dept. not set"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 rounded-lg border border-[var(--df-border)] px-4 py-2 text-sm font-semibold text-[var(--df-text)] hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4" strokeWidth={1.75} />
            Edit profile
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Section title="Personal details">
            <InfoRow icon={Phone} label="Phone" value={personalDetails.phone || "Not set"} />
            <InfoRow icon={MapPin} label="Address" value={personalDetails.address || "Not set"} />
          </Section>

          <Section title="Job details">
            <InfoRow icon={Briefcase} label="Employee ID" value={jobDetails.employeeId || "—"} mono />
            <InfoRow icon={Briefcase} label="Designation" value={jobDetails.designation || "Not set"} />
            <InfoRow icon={Briefcase} label="Department" value={jobDetails.department || "Not set"} />
          </Section>

          <Section title="Salary structure" hint="Read-only">
            <InfoRow icon={Wallet} label="Base salary" value={jobDetails.baseSalary ? `$${jobDetails.baseSalary}` : "Contact HR"} />
          </Section>

          <Section title="Documents">
            {(jobDetails.documents || []).length ? (
              jobDetails.documents.map((docItem) => (
                <InfoRow key={docItem.name} icon={FileText} label={docItem.name} value="View" />
              ))
            ) : (
              <p className="text-sm text-[var(--df-text-soft)]">No documents uploaded yet.</p>
            )}
          </Section>
        </div>
      </main>

      {editing && (
        <ProfileEditModal profile={userProfile} onClose={() => setEditing(false)} onSave={handleSave} />
      )}
    </div>
  );
}

function Section({ title, hint, children }) {
  return (
    <div className="rounded-2xl border border-[var(--df-border)] bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-[var(--df-font-display)] text-sm font-semibold uppercase tracking-wide text-[var(--df-text-soft)]">
          {title}
        </h3>
        {hint && <span className="text-xs text-[var(--df-text-soft)]">{hint}</span>}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-sm text-[var(--df-text-soft)]">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
        {label}
      </span>
      <span className={`text-sm font-medium text-[var(--df-text)] ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
