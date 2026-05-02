"use client";

import React, { useState } from "react";
import { NoData, SectionTitle, Tag, PriorityBadge } from "../pipeline-shared-ui";

export default function Step4View({ data }: { data: any }) {
  const [openCluster, setOpenCluster] = useState<number | null>(0);

  if (!data) return <NoData />;
  const out: any = data.A4_output ?? data;
  const summary: string = out.summary ?? "";
  const clusters: any[] = Array.isArray(out.clusters) ? out.clusters : [];
  const metaInsight: string = out.meta_insight ?? "";

  return (
    <div className="space-y-6">
      {summary && (
        <div className="bg-slate-900 text-white rounded-xl px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Pattern Summary</p>
          <p className="text-sm leading-relaxed">{summary}</p>
        </div>
      )}

      {clusters.length > 0 && (
        <div>
          <SectionTitle>Clusters ({clusters.length})</SectionTitle>
          <div className="space-y-2">
            {clusters.map((c, i) => {
              const label = c.label ?? c.name ?? c.title ?? `Cluster ${i + 1}`;
              const count = c.count ?? c.size ?? null;
              const description = c.description ?? c.summary ?? null;
              const keywords: string[] = Array.isArray(c.keywords) ? c.keywords : [];
              const isOpen = openCluster === i;
              return (
                <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenCluster(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm font-semibold text-slate-800 truncate">{label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {count != null && <span className="text-[10px] text-slate-400">{count} reviews</span>}
                      <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/60 space-y-2">
                      {description && <p className="text-xs text-slate-600 leading-relaxed">{description}</p>}
                      {keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {keywords.map((kw, ki) => <Tag key={ki}>{kw}</Tag>)}
                        </div>
                      )}
                      {!description && !keywords.length && (
                        <p className="text-xs text-slate-400">No additional details</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {metaInsight && (
        <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600 mb-1.5">Key Insight</p>
          <p className="text-xs text-violet-900 leading-relaxed">{metaInsight}</p>
        </div>
      )}

      {!summary && !clusters.length && !metaInsight && <NoData />}
    </div>
  );
}
