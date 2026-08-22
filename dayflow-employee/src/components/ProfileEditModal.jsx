// src/components/ProfileEditModal.jsx
// Editing is restricted to address, phone, and profilePictureUrl per spec.
// The avatar field accepts a pasted image URL or simulates an upload by
// reading a local file into a base64 data URL (no real storage bucket
// required to demo the flow — swap in Firebase Storage for production).

import { useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";

export default function ProfileEditModal({ profile, onClose, onSave }) {
  const [phone, setPhone] = useState(profile?.personalDetails?.phone || "");
  const [address, setAddress] = useState(profile?.personalDetails?.address || "");
  const [avatarPreview, setAvatarPreview] = useState(profile?.personalDetails?.profilePictureUrl || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Please choose an image under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result); // simulated upload
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSave({ phone, address, profilePictureUrl: avatarPreview });
      onClose();
    } catch (err) {
      console.error(err);
      setError("Couldn't save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="font-[var(--df-font-display)] text-lg font-semibold text-[var(--df-text)]">
            Edit profile
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--df-text-soft)] hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={avatarPreview || "https://api.dicebear.com/7.x/initials/svg?seed=" + (profile?.personalDetails?.name || "U")}
              alt="Profile avatar preview"
              className="h-16 w-16 rounded-full border border-[var(--df-border)] object-cover"
            />
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--df-border)] px-3 py-2 text-sm font-medium text-[var(--df-text)] hover:bg-slate-50">
              <Upload className="h-4 w-4" strokeWidth={1.75} />
              Change photo
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>

          <Field label="Phone number">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="df-input"
            />
          </Field>

          <Field label="Address">
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              placeholder="Street, city, state, ZIP"
              className="df-input resize-none"
            />
          </Field>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--df-text-soft)] hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-[var(--df-primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--df-text-soft)]">
        {label}
      </span>
      {children}
    </label>
  );
}
