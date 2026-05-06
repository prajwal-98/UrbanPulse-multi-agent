"use client";

import React, { useState } from "react";
import Link from "next/link";
import { NoData } from "../pipeline-shared-ui";

const PRIORITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

function getCategoryIcon(category: string, colorClass: string) {
  const cat = category.toLowerCase();
  if (cat.includes("delivery")) {
    return (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} className={colorClass}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (cat.includes("packag")) {
    return (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} className={colorClass}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    );
  }
  if (cat.includes("wrong") || cat.includes("item")) {
    return (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} className={colorClass}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    );
  }
  if (cat.includes("app")) {
    return (
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} className={colorClass}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} className={colorClass}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}

const PRIORITY_CONFIG: Record<string, { border: string; iconBg: string; iconColor: string; pill: string; bar: string }> = {
  High:   { border: "border-l-red-400",   iconBg: "bg-red-50",   iconColor: "text-red-600",   pill: "bg-red-50 text-red-700",   bar: "bg-red-400" },
  Medium: { border: "border-l-amber-400", iconBg: "bg-amber-50", iconColor: "text-amber-600", pill: "bg-amber-50 text-amber-700", bar: "bg-amber-400" },
  Low:    { border: "border-l-green-500", iconBg: "bg-green-50", iconColor: "text-green-600", pill: "bg-green-50 text-green-700", bar: "bg-green-500" },
};

export default function Step5View({ data }: { data: any }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!data) return <NoData />;

  const raw: any[] = Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [];
  if (raw.length === 0) return <NoData />;

  const issues = [...raw].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 99;
    const pb = PRIORITY_ORDER[b.priority] ?? 99;
    return pa - pb;
  });

  const highCount   = issues.filter(i => i.priority === "High").length;
  const medCount    = issues.filter(i => i.priority === "Medium").length;
  const lowCount    = issues.filter(i => i.priority === "Low").length;
  const maxCount    = Math.max(highCount, medCount, lowCount, 1);

  const metaInsight: string = data.meta_insight ?? "";

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <p className="text-xs font-semibold text-amber-800">Escalations analysed</p>
        </div>
        <span className="text-[10px] font-semibold text-slate-500">A5 · Escalation Analysis</span>
      </div>

      {/* Agent info box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3">
        <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Category & Escalation converts issue clusters into business action plans — assigning priority, responsible teams, and impact scope so the right people act on the right problems immediately.
        </p>
      </div>

      

      {/* Triage row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "High priority",   count: highCount, color: "text-red-500",   bar: "bg-red-400",   pct: (highCount / maxCount) * 100 },
          { label: "Medium priority", count: medCount,  color: "text-amber-500", bar: "bg-amber-400", pct: (medCount  / maxCount) * 100 },
          { label: "Low priority",    count: lowCount,  color: "text-green-600", bar: "bg-green-500", pct: (lowCount  / maxCount) * 100 },
        ].map(({ label, count, color, bar, pct }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4">
            <p className={`text-3xl font-semibold ${color}`}>{count}</p>
            <p className="text-xs text-slate-400 mt-1 mb-3">{label}</p>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Section label */}
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        Issue briefings — click to expand
      </p>

      {/* Issue cards */}
      <div className="space-y-2">
        {issues.map((issue, i) => {
          const category = issue.issue_category ?? issue.category ?? `Issue ${i + 1}`;
          const priority: string = issue.priority ?? "Low";
          const reason: string = issue.reason ?? "";
          const impact = issue.impact ?? {};
          const pct: number = impact.affected_reviews_percent ?? 0;
          const cities: string[] = impact.cities ?? [];
          const platforms: string[] = impact.platforms ?? [];
          const teams: string[] = Array.isArray(issue.escalation_teams) ? issue.escalation_teams : [];
          const reviews: string[] = Array.isArray(issue.supporting_reviews) ? issue.supporting_reviews : [];
          const isOpen = openIndex === i;
          const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.Low;

          return (
            <div key={i} className={`bg-white border border-slate-200 rounded-xl overflow-hidden border-l-4 ${cfg.border}`}>

              {/* Card header */}
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`${cfg.iconBg} p-2 rounded-lg shrink-0`}>
                    {getCategoryIcon(category, cfg.iconColor)}
                  </div>
                  <span className="text-sm font-semibold text-slate-800 truncate">{category}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.pill}`}>{priority}</span>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expandable body */}
              {isOpen && (
                <div className="border-t border-slate-100 px-4 py-4 space-y-4 bg-white">

                  {reason && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Reason</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{reason}</p>
                    </div>
                  )}

                  {/* Impact bar */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Impact</p>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                      <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-slate-500">{pct}% of reviews affected</p>
                  </div>

                  {/* City + platform chips */}
                  {(cities.length > 0 || platforms.length > 0) && (
                    <div className="flex flex-wrap gap-1.5">
                      {cities.map((c, ci) => (
                        <span key={ci} className="rounded-full px-2.5 py-0.5 text-xs bg-purple-50 text-purple-700 border border-purple-200">{c}</span>
                      ))}
                      {platforms.map((p, pi) => (
                        <span key={pi} className="rounded-full px-2.5 py-0.5 text-xs bg-teal-50 text-teal-700 border border-teal-200">{p}</span>
                      ))}
                    </div>
                  )}

                  {/* Escalation teams */}
                  {teams.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Escalate to</p>
                      <div className="flex flex-wrap gap-1.5">
                        {teams.map((t, ti) => (
                          <span key={ti} className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-2.5 py-1 text-xs text-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Customer voice */}
                  {reviews.length > 0 && (
                    <div className="bg-slate-50 border-l-2 border-slate-300 px-3 py-2.5 rounded-r-lg">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Customer voice</p>
                      <p className="text-xs text-slate-600 italic">"{reviews[0]}"</p>
                    </div>
                  )}

                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Navigation buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Link href="/step-4">
          <button
            type="button"
            className="w-full py-3 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Finding Patterns
          </button>
        </Link>
        <Link href="/step-6">
          <button
            type="button"
            className="w-full py-3 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            Proceed to Platform Comparing
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </Link>
      </div>
    </div>
  );
}