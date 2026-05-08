// File: urban_pulse/frontend/components/pipeline/steps/step3-view.tsx

"use client";

import React from "react";
import Link from "next/link";
import { NoData, Tag } from "../pipeline-shared-ui";

export default function Step3View({ data }: { data: any }) {
  if (!data) return <NoData />;

  const out: any = data.A3_output ?? data;
  const anchor: any = out.anchor_review ?? null;
  const similar: any[] = Array.isArray(out.similar_reviews) ? out.similar_reviews : [];
  const extracted: any = out.extracted_meaning ?? null;
  const theme: string | null = out.semantic_theme ?? null;
  const patternCount: number = out.pattern_count ?? 0;
  const similarityLabel: string = out.similarity_label ?? "";

  const hasData = anchor || similar.length > 0 || theme;
  if (!hasData) return <NoData />;

  return (
    <div className="space-y-5">

      {/* Status banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <p className="text-xs font-semibold text-emerald-800">Pattern detected</p>
        </div>
        <span className="text-[10px] font-semibold text-slate-500">A3 · Semantic Shaper</span>
      </div>

      {/* Agent info box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3">
        <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.346.346a3 3 0 01-4.243-4.243 3 3 0 014.243 4.243l-.346-.346z" />
          </svg>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Semantic Shaper finds the most representative complaint in the dataset,
          then surfaces similar reviews using TF-IDF and cosine similarity - turning one isolated complaint into a recognisable pattern.
        </p>
      </div>

      {/* Split panel */}
      <div className="grid grid-cols-2 gap-4">

        {/* Left column */}
        <div className="space-y-4">

          {/* Anchor review */}
          {anchor && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Anchor review</p>
              <div className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-sm text-slate-800 leading-relaxed italic">
                  "{typeof anchor === "string" ? anchor : anchor.text ?? "—"}"
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {anchor.city && <Tag color="blue">{anchor.city}</Tag>}
                  {anchor.platform && <Tag color="violet">{anchor.platform}</Tag>}
                  {anchor.rating != null && <Tag color="amber">★ {anchor.rating}</Tag>}
                </div>
              </div>
            </div>
          )}

          {/* Extracted meaning */}
          {extracted && (extracted.primary_issue || extracted.experience_type) && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Extracted meaning</p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Primary Issue</p>
                  <p className="text-sm font-medium text-slate-800">{extracted.primary_issue ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Experience Type</p>
                  <p className="text-sm font-medium text-slate-800">{extracted.experience_type ?? "—"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right column — similar reviews */}
        {similar.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">
              Similar reviews ({similar.length})
            </p>
            <div className="space-y-3">
              {similar.slice(0, 5).map((r, i) => {
                const text = typeof r === "string" ? r : (r.text ?? "");
                const score = typeof r === "object" ? (r.score ?? 0) : 0;
                const pct = Math.min(Math.max(score * 100, 0), 100);
                return (
                  <div key={i} className="border-l-4 border-slate-200 bg-white rounded-lg px-4 py-3">
                    <p className="text-xs text-slate-700 leading-relaxed italic">"{text}"</p>
                    <div className="mt-2.5">
                      <div className="h-1 bg-slate-100 rounded overflow-hidden">
                        <div className="h-full rounded" style={{ width: `${pct}%`, backgroundColor: "#1D9E75" }} />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-slate-500">
                          {r.platform && r.city ? `${r.platform} · ${r.city}` : r.city || r.platform || "—"}
                        </span>
                        <span className="text-[10px] font-medium text-slate-600">{Math.round(pct)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Pattern block */}
      {theme && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-xs font-semibold text-slate-600">Pattern identified</p>
            {patternCount > 0 && similarityLabel && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-800 flex-shrink-0">
                {patternCount} reviews · {similarityLabel} similarity
              </span>
            )}
          </div>
          <p className="text-lg font-semibold text-blue-900">{theme}</p>
        </div>
      )}

      {/* Nav buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Link href="/step-2">
          <button type="button" className="w-full py-3 rounded-xl text-sm font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Context Intelligence
          </button>
        </Link>
        <Link href="/step-4">
          <button type="button" className="w-full py-3 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
            Proceed to Finding Patterns
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </Link>
      </div>

    </div>
  );
}