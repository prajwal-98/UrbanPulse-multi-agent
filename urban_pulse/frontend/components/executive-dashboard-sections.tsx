"use client";

export const SEC = "py-12 border-b border-slate-100";

export function SectionHead({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-100" />
    </div>
  );
}

export const DRIVER_ROW = [
  "bg-red-50 border-red-200 text-red-700",
  "bg-amber-50 border-amber-200 text-amber-700",
  "bg-emerald-50 border-emerald-200 text-emerald-700",
];

export const DRIVER_DOT = ["bg-red-500", "bg-amber-500", "bg-emerald-500"];
