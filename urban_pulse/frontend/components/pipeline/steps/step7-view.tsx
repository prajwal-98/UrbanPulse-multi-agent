"use client";

import React from "react";
import Link from "next/link";
import { NoData } from "../pipeline-shared-ui";

// ── Helpers ──────────────────────────────────────────────────────────────────

function SentimentPill({ sentiment }: { sentiment: string }) {
  const s = sentiment?.toLowerCase() ?? "neutral";
  const styles =
    s.includes("pos") ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : s.includes("neg") ? "bg-red-50 text-red-600 border-red-200"
    : "bg-slate-100 text-slate-500 border-slate-200";
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles}`}>
      {s}
    </span>
  );
}

function UsageBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-violet-400 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-slate-400 shrink-0">{value}×</span>
    </div>
  );
}

function ActHeader({ num, label, sub }: { num: string; label: string; sub: string }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <span className="mt-0.5 w-6 h-6 rounded-md bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
        {num}
      </span>
      <div>
        <p className="text-sm font-bold text-slate-900">{label}</p>
        <p className="text-xs text-slate-400">{sub}</p>
      </div>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function Step7View({ data }: { data: any }) {
  if (!data) return <NoData />;

  const out: any = data.A7_output ?? data;
  const narrative: string = out.narrative ?? "";
  const topCity: string = out.top_city ?? "";
  const slangIntelligence: any[] = Array.isArray(out.slang_intelligence) ? out.slang_intelligence : [];
  const citySlang: any[] = Array.isArray(out.city_slang) ? out.city_slang : [];
  const emergingSlang: any[] = Array.isArray(out.emerging_slang) ? out.emerging_slang : [];

  const hasAnyData = slangIntelligence.length || citySlang.length || emergingSlang.length;
  if (!hasAnyData) {
    return (
      <div className="py-14 flex flex-col items-center text-center gap-3">
        <p className="text-sm font-semibold text-slate-600">No Language Patterns Detected</p>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          No localized language was found. Try uploading reviews with more city-specific expressions.
        </p>
      </div>
    );
  }

  const maxUsage = Math.max(...slangIntelligence.map((s) => s.total_usage ?? 0), 1);
  const topTerm = slangIntelligence.reduce(
    (best, s) => (s.total_usage > (best?.total_usage ?? 0) ? s : best),
    null as any
  );

  return (
    
    <div className="space-y-8">
      {/* ── Agent description banner ── */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <p className="text-xs font-semibold text-amber-800">Insights scored</p>
        </div>
        <span className="text-[10px] font-semibold text-slate-500">A7 · Language Intelligence</span>
      </div>

      {/* ── Agent info box ── */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3">
        <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Language Intelligence scans customer reviews for city-specific slang, detects emerging expressions using frequency analysis, and uses an LLM to explain meaning and sentiment — revealing how customers <em>really</em> talk about their experience.
        </p>
      </div>
      {/* ── Headline ── */}
      <div className="bg-slate-900 text-white rounded-2xl px-6 py-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Language Intelligence</span>
          {topCity && (
            <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {topCity} speaks loudest
            </span>
          )}
        </div>
        {narrative && (
          <p className="text-sm leading-relaxed text-slate-200">{narrative}</p>
        )}
        {topTerm && (
          <div className="flex items-center gap-3 pt-1 border-t border-slate-700">
            <span className="text-[10px] text-slate-400">Top signal</span>
            <span className="text-sm font-bold text-white">"{topTerm.slang}"</span>
            {topTerm.meaning && (
              <span className="text-xs text-slate-400">— {topTerm.meaning}</span>
            )}
            <span className="ml-auto text-xs font-bold text-violet-300">{topTerm.total_usage}×</span>
          </div>
        )}
      </div>

      {/* ── ACT 1: What words are people using? ── */}
      {slangIntelligence.length > 0 && (
        <div>
          <ActHeader
            num="1"
            label="What words are customers using?"
            sub="Detected slang ranked by frequency — each term enriched with meaning and sentiment"
          />
          <div className="space-y-2">
            {slangIntelligence
              .sort((a, b) => (b.total_usage ?? 0) - (a.total_usage ?? 0))
              .map((s, i) => {
                const term = s.slang ?? `Term ${i + 1}`;
                const meaning = s.meaning ?? "";
                const usage = s.total_usage ?? 0;
                const sentiment = s.dominant_sentiment ?? "neutral";
                const isNew = s.is_known === false;
                return (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-slate-900">"{term}"</span>
                          {isNew && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200">
                              NEW
                            </span>
                          )}
                        </div>
                        {meaning && (
                          <p className="text-xs text-slate-500 leading-relaxed">{meaning}</p>
                        )}
                        <UsageBar value={usage} max={maxUsage} />
                      </div>
                      <SentimentPill sentiment={sentiment} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── ACT 2: Which cities speak this way? ── */}
      {citySlang.length > 0 && (
        <div>
          <ActHeader
            num="2"
            label="Which cities speak this way?"
            sub="Slang grouped by city — shows where localized language is strongest"
          />
          <div className="grid grid-cols-2 gap-3">
            {citySlang.map((cs, i) => {
              const city = cs.city ?? `City ${i + 1}`;
              const terms: any[] = Array.isArray(cs.terms) ? cs.terms : [];
              const totalUsage = terms.reduce((sum, t) => sum + (t.usage ?? 0), 0);
              return (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-slate-800">{city}</p>
                    <span className="text-[10px] text-slate-400">{totalUsage} signals</span>
                  </div>
                  <div className="space-y-1.5">
                    {terms.map((t, ti) => (
                      <div key={ti} className="flex items-center justify-between">
                        <span className="text-xs text-slate-600 font-medium">"{t.slang}"</span>
                        <span className="text-[10px] text-slate-400">{t.usage}×</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ACT 3: What's just emerging? ── */}
      {emergingSlang.length > 0 && (
        <div>
          <ActHeader
            num="3"
            label="What's just starting to emerge?"
            sub="Rare signals — seen only a handful of times, but worth watching"
          />
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-[10px] text-amber-700 font-semibold mb-3 uppercase tracking-widest">
              Early signals — low volume, high potential
            </p>
            <div className="flex flex-wrap gap-2">
              {emergingSlang.map((s, i) => {
                const term = typeof s === "string" ? s : (s.slang ?? "");
                const usage = s.usage ?? null;
                const meaning = s.meaning ?? null;
                const isNew = s.is_new ?? false;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
                      ${isNew
                        ? "bg-violet-50 border-violet-200 text-violet-800"
                        : "bg-amber-100 border-amber-300 text-amber-900"
                      }`}
                    title={meaning ?? undefined}
                  >
                    {isNew && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />}
                    {term}
                    {usage != null && (
                      <span className="opacity-60 text-[10px]">{usage}×</span>
                    )}
                  </div>
                );
              })}
            </div>
            {emergingSlang.some((s) => s.is_new) && (
              <p className="text-[10px] text-amber-600 mt-3">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-500 mr-1" />
                Purple = newly discovered slang not in our known dictionary
              </p>
            )}
          </div>
        </div>
      )},

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
            Back to Language Detection
          </button>
        </Link>
        <Link href="/step-6">
          <button
            type="button"
            className="w-full py-3 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            Proceed to Final Dashboard
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </Link>
      </div>
    </div>
  );
}