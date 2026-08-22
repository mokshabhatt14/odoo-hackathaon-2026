// src/components/QuickAccessCard.jsx
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export default function QuickAccessCard({ to, icon: Icon, title, subtitle, accent = "indigo" }) {
  const accents = {
    indigo: "bg-[var(--df-primary)]/10 text-[var(--df-primary)]",
    amber: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <Link
      to={to}
      className="group relative flex flex-col justify-between rounded-2xl border border-[var(--df-border)] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--df-primary)] focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${accents[accent]}`}>
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <ChevronRight className="h-4 w-4 text-[var(--df-text-soft)] transition-transform group-hover:translate-x-0.5" />
      </div>
      <div className="mt-4">
        <h3 className="font-[var(--df-font-display)] text-base font-semibold text-[var(--df-text)]">
          {title}
        </h3>
        <p className="mt-0.5 text-sm text-[var(--df-text-soft)]">{subtitle}</p>
      </div>
    </Link>
  );
}
