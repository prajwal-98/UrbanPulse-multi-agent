"use client";

import React, { useState } from "react";
import { NoData, SectionTitle, PriorityBadge, Tag } from "../pipeline-shared-ui";

export default function Step5View({ data }: { data: any }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!data) return <NoData />;
  const issues: any[] = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data)
    ? data
    : [];

  if (issues.length === 0) return <NoData />;

  return (
    <div className="space-y-2">
      {issues.map((issue, i) => {
        const category = issue.issue_category ?? issue.category ?? `Issue ${i + 1}`;
        const priority: string = issue.priority ?? "unknown";
        const reason: string = issue.reason ?? "";
        const impact = issue.impact ?? {};
        const impactText = typeof impact === "object"
          ? [
              impact.affected_reviews_percent != null ? `${impact.affected_reviews_percent}% reviews affected` : null,
              impact.cities?.length ? `Cities: ${impact.cities.join(", ")}` : null,
              impact.platforms?.length ? `Platforms: ${impact.platforms.join(", ")}` : null,
            ].filter(Boolean).join(" · ")
          : String(impact);
        const teams: string[] = Array.isArray(issue.escalation_teams) ? issue.escalation_teams : [];
        const reviews: string[] = Array.isArray(issue.supporting_reviews) ? issue.supporting_reviews : [];
        const isOpen = openIndex === i;

        return (
          <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <PriorityBadge priority={priority} />
                <span className="text-sm font-semibold text-slate-800 truncate">{category}</span>
              </div>
              <svg className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-2 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <div className="border-t border-slate-100 px-4 py-4 bg-slate-50/60 space-y-3">
                {reason && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Reason</p>
                    <p className="text-xs text-slate-700 leading-relaxed">{reason}</p>
                  </div>
                )}
                {impactText && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Impact</p>
                    <p className="text-xs text-slate-700 leading-relaxed">{impactText}</p>
                  </div>
                )}
                {teams.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Escalation Teams</p>
                    <div className="flex flex-wrap gap-1.5">
                      {teams.map((t, ti) => <Tag key={ti} color="blue">{t}</Tag>)}
                    </div>
                  </div>
                )}
                {reviews.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Supporting Reviews</p>
                    <div className="space-y-1.5">
                      {reviews.slice(0, 3).map((r, ri) => (
                        <p key={ri} className="text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-2 italic">"{r}"</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
