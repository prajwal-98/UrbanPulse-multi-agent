"use client";

import React from "react";
import { NoData, SectionTitle, Tag, TagColor } from "../pipeline-shared-ui";

export default function Step2View({ data }: { data: any }) {
  if (!data) return <NoData />;
  const out: any = data.A2_output ?? data;
  const sentiment: string = out.localized_sentiment ?? "";
  const slang: string[] = Array.isArray(out.slang_detected) ? out.slang_detected : [];
  const themes: any[] = Array.isArray(out.top_themes) ? out.top_themes : [];
  const context: string = out.operational_context ?? "";
  const tagColors: TagColor[] = ["violet", "blue", "emerald", "amber"];

  return (
    <div className="space-y-6">
      {sentiment && (
        <div className="bg-slate-900 text-white rounded-xl px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Localized Sentiment</p>
          <p className="text-sm leading-relaxed">{sentiment}</p>
        </div>
      )}

      {slang.length > 0 && (
        <div>
          <SectionTitle>Urban Slang Detected</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {slang.map((s, i) => (
              <Tag key={i} color={tagColors[i % tagColors.length]}>{s}</Tag>
            ))}
          </div>
        </div>
      )}

      {themes.length > 0 && (
        <div>
          <SectionTitle>Top Themes</SectionTitle>
          <div className="space-y-2.5">
            {themes.slice(0, 7).map((t, i) => {
              const label = typeof t === "string" ? t : (t.theme ?? t.name ?? String(t));
              const raw = typeof t === "object" ? (t.score ?? t.count ?? null) : null;
              const score = raw != null ? Number(raw) : null;
              const maxScore = themes.slice(0, 7).reduce((mx, th) => {
                const v = typeof th === "object" ? Number(th.score ?? th.count ?? 0) : 0;
                return Math.max(mx, v);
              }, 1);
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-slate-700 flex-1 truncate">{label}</span>
                  {score != null && (
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-700 rounded-full" style={{ width: `${Math.min(100, (score / maxScore) * 100)}%` }} />
                      </div>
                      <span className="text-[10px] tabular-nums text-slate-500 w-5 text-right">{score}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {context && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1.5">Attention</p>
          <p className="text-xs text-amber-800 leading-relaxed">{context}</p>
        </div>
      )}

      {!sentiment && !slang.length && !themes.length && !context && <NoData />}
    </div>
  );
}
