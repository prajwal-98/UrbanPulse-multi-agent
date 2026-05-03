"use client";

import React from "react";
import { NoData, SectionTitle, Tag, TagColor } from "../pipeline-shared-ui";

export default function Step7View({ data }: { data: any }) {
  if (!data) return <NoData />;
  const out: any = data.A7_output ?? data;
  const slangIntelligence: any[] = Array.isArray(out.slang_intelligence) ? out.slang_intelligence : [];
  const citySlang: any[] = Array.isArray(out.city_slang) ? out.city_slang : [];
  const sentimentMapping: any[] = Array.isArray(out.sentiment_mapping) ? out.sentiment_mapping : [];
  const emergingSlang: any[] = Array.isArray(out.emerging_slang) ? out.emerging_slang : [];

  if (!slangIntelligence.length && !citySlang.length && !sentimentMapping.length && !emergingSlang.length) {
    return (
      <div className="py-14 flex flex-col items-center text-center gap-3">
        <p className="text-sm font-semibold text-slate-600">No Language Patterns Detected</p>
        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
          No city-specific slang was found in this dataset. Try uploading reviews with more localized language.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {slangIntelligence.length > 0 && (
        <div>
          <SectionTitle>Slang Intelligence</SectionTitle>
          <div className="space-y-3">
            {slangIntelligence.slice(0, 5).map((s, i) => {
              const term = s.term ?? s.slang ?? s.word ?? `Term ${i + 1}`;
              const meaning = s.meaning ?? s.definition ?? "";
              const score = s.novelty_score ?? s.score ?? s.total_usage ?? null;
              const pos = s.positive ?? s.positive_pct ?? s.sentiment?.positive ?? null;
              const neg = s.negative ?? s.negative_pct ?? s.sentiment?.negative ?? null;
              return (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-900">"{term}"</span>
                    {score != null && (
                      <span className="text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded-full">
                        {typeof score === "number" ? score.toFixed(1) : score}
                      </span>
                    )}
                  </div>
                  {meaning && <p className="text-xs text-slate-600 leading-relaxed mb-2">{meaning}</p>}
                  {(pos != null || neg != null) && (
                    <div className="flex gap-3 text-[10px]">
                      {pos != null && <span className="text-emerald-600 font-semibold">+{pos}% positive</span>}
                      {neg != null && <span className="text-red-500 font-semibold">-{neg}% negative</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {citySlang.length > 0 && (
        <div>
          <SectionTitle>City Slang Map</SectionTitle>
          <div className="grid grid-cols-2 gap-2">
            {citySlang.slice(0, 6).map((cs, i) => {
              const city = cs.city ?? cs.location ?? `City ${i + 1}`;
              const terms: string[] = Array.isArray(cs.terms) ? cs.terms
                : Array.isArray(cs.slang) ? cs.slang
                : typeof cs.slang === "string" && cs.slang ? [cs.slang]
                : [];
              return (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <p className="text-[11px] font-bold text-slate-700 mb-1.5">{city}</p>
                  <div className="flex flex-wrap gap-1">
                    {terms.slice(0, 4).map((t, ti) => <Tag key={ti} color="violet">{t}</Tag>)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {sentimentMapping.length > 0 && (
        <div>
          <SectionTitle>Sentiment Mapping</SectionTitle>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {sentimentMapping.slice(0, 8).map((sm, i) => {
              const term = sm.term ?? sm.slang ?? `Term ${i + 1}`;
              const sentiment = sm.sentiment ?? sm.polarity ?? sm.dominant_sentiment ?? null;
              const isPos = sentiment && (sentiment.toLowerCase().includes("pos") || sentiment.toLowerCase() === "positive");
              const isNeg = sentiment && (sentiment.toLowerCase().includes("neg") || sentiment.toLowerCase() === "negative");
              return (
                <div key={i} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-slate-700 font-medium">{term}</span>
                  {sentiment && (
                    <Tag color={isPos ? "emerald" : isNeg ? "red" : "slate"}>{sentiment}</Tag>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {emergingSlang.length > 0 && (
        <div>
          <SectionTitle>Emerging Expressions</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {emergingSlang.map((s, i) => {
              const term = typeof s === "string" ? s : (s.term ?? s.slang ?? s.word ?? String(s));
              return <Tag key={i} color="amber">{term}</Tag>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
