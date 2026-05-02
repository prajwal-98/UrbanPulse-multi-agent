"use client";

import React from "react";

export type TagColor = "slate" | "emerald" | "amber" | "red" | "blue" | "violet";

export function NoData() {
  return (
    <div className="py-14 flex flex-col items-center text-center gap-3">
      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="text-xs text-slate-400">No output data available for this step</p>
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
      {children}
    </p>
  );
}

export function Tag({ children, color = "slate" }: { children: React.ReactNode; color?: TagColor }) {
  const cls: Record<TagColor, string> = {
    slate:   "bg-slate-100 text-slate-700 border-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber:   "bg-amber-50 text-amber-700 border-amber-200",
    red:     "bg-red-50 text-red-700 border-red-200",
    blue:    "bg-blue-50 text-blue-700 border-blue-200",
    violet:  "bg-violet-50 text-violet-700 border-violet-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${cls[color]}`}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority?: string | null }) {
  const p = (priority ?? "").toLowerCase();
  const color: TagColor = p.includes("high") || p.includes("critical") ? "red"
    : p.includes("medium") ? "amber"
    : p.includes("low") ? "emerald"
    : "slate";
  return <Tag color={color}>{priority ?? "Unknown"}</Tag>;
}

export function RankedList({ title, items }: { title: string; items: any[] }) {
  if (!items.length) return null;
  return (
    <div>
      <SectionTitle>{title}</SectionTitle>
      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {items.slice(0, 5).map((item, i) => {
          const name = typeof item === "string" ? item
            : (item.name ?? item.label ?? item.platform ?? item.city ?? item.brand ?? item.category ?? String(item));
          const count = typeof item === "object" ? (item.count ?? item.reviews ?? item.mentions ?? null) : null;
          const pct = typeof item === "object" ? (item.percentage ?? item.pct ?? item.share ?? null) : null;
          const dominant = typeof item === "object" ? (item.dominant_issue ?? null) : null;
          return (
            <div key={i} className="flex items-center gap-3 px-4 py-2.5">
              <span className="text-[10px] font-bold text-slate-400 w-4 shrink-0">{i + 1}</span>
              <span className="text-xs font-semibold text-slate-800 flex-1 truncate">{name}</span>
              {pct != null && <span className="text-[10px] text-slate-500 shrink-0">{pct}%</span>}
              {count != null && pct == null && <span className="text-[10px] text-slate-400 shrink-0">{count}</span>}
              {dominant && <span className="text-[10px] text-slate-400 italic truncate max-w-[100px]">{dominant}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
