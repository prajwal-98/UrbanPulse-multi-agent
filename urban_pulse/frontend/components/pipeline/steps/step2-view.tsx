"use client";

import React from "react";
import Link from "next/link";

export default function Step2View({ data }: { data: any }) {
  if (!data) {
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

  const out = data.A2_output ?? data;
  const city = out.city || "Unknown";
  const reviewCount = out.review_count ?? 0;
  const sentiment = out.sentiment_score || "neutral";
  const urgency = out.urgency_level || "medium";
  const localizedSentiment = out.localized_sentiment || "";
  const operationalContext = out.operational_context || "";
  const cityContext = out.city_context || "";
  const slangDetected = Array.isArray(out.slang_detected) ? out.slang_detected : [];
  const topThemes = Array.isArray(out.top_themes) ? out.top_themes : [];
  const topEntities = out.top_entities || {};
  const sampleReviews = Array.isArray(out.sample_reviews) ? out.sample_reviews : [];

  const sentimentColors = {
    positive: { bg: "bg-emerald-50", text: "text-emerald-800" },
    neutral: { bg: "bg-slate-100", text: "text-slate-700" },
    negative: { bg: "bg-red-50", text: "text-red-800" },
  };
  const urgencyColors = {
    low: { bg: "bg-slate-100", text: "text-slate-700" },
    medium: { bg: "bg-amber-50", text: "text-amber-800" },
    high: { bg: "bg-red-50", text: "text-red-800" },
  };

  const cityInitials = city.slice(0, 2).toUpperCase();
  const sentimentColor = sentimentColors[sentiment as keyof typeof sentimentColors] || sentimentColors.neutral;
  const urgencyColor = urgencyColors[urgency as keyof typeof urgencyColors] || urgencyColors.medium;

  const hasContent = localizedSentiment || operationalContext || cityContext || slangDetected.length > 0 || topThemes.length > 0 || sampleReviews.length > 0;

  if (!hasContent) {
    return (
      <div className="py-14 flex flex-col items-center text-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-xs text-slate-400">No context data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Status banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <p className="text-xs font-semibold text-emerald-800">Context detected</p>
        </div>
        <span className="text-[10px] font-semibold text-slate-500">A2 · Context Detector</span>
      </div>

      {/* Agent info box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3">
        <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Context Detector reads the filtered dataset and extracts situational intelligence — city dynamics, platform signals, recurring complaint themes, and local slang. It converts raw reviews into a structured understanding of what kind of problem the data describes, before deeper analysis begins in A3.
        </p>
      </div>

      {/* City strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-blue-800">{cityInitials}</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-900">{city}</p>
          <p className="text-xs text-slate-500">{reviewCount.toLocaleString()} reviews</p>
        </div>
        <div className={`px-2.5 py-1.5 rounded-full text-xs font-semibold ${sentimentColor.bg} ${sentimentColor.text}`}>
          {sentiment}
        </div>
        <div className={`px-2.5 py-1.5 rounded-full text-xs font-semibold ${urgencyColor.bg} ${urgencyColor.text}`}>
          {urgency}
        </div>
      </div>

      {/* Localized sentiment */}
      {localizedSentiment && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Localized Sentiment</p>
          <p className="text-sm text-slate-700 leading-relaxed">{localizedSentiment}</p>
        </div>
      )}

      {/* Operational context */}
      {operationalContext && (
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1.5">Operational Context</p>
          <p className="text-xs text-amber-800 leading-relaxed">{operationalContext}</p>
        </div>
      )}

      {/* 2-col grid: themes + entities */}
      {(topThemes.length > 0 || Object.keys(topEntities).length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {/* Top themes */}
          {topThemes.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Top Themes</p>
              <div className="space-y-2">
                {topThemes.slice(0, 5).map((theme: any, i: number) => {
                  const label = typeof theme === "string" ? theme : (theme.theme ?? theme.name ?? String(theme));
                  const count = typeof theme === "object" ? (theme.count ?? theme.score ?? 0) : 0;
                  const maxCount = Math.max(...topThemes.slice(0, 5).map((t: any) => typeof t === "object" ? (t.count ?? t.score ?? 1) : 1), 1);
                  const shade = ["bg-slate-900", "bg-slate-700", "bg-slate-600", "bg-slate-500", "bg-slate-400"][i] || "bg-slate-400";
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="flex-1 truncate text-slate-700">{label}</span>
                      <div className="w-16 h-1.5 bg-slate-100 rounded overflow-hidden">
                        <div className={`h-full ${shade}`} style={{ width: `${Math.min(100, (count / maxCount) * 100)}%` }} />
                      </div>
                      <span className="w-6 text-right text-slate-500 tabular-nums">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top entities */}
          {(topEntities.cities?.length > 0 || topEntities.platforms?.length > 0 || topEntities.categories?.length > 0) && (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Top Entities</p>
              <div className="space-y-3">
                {topEntities.cities?.length > 0 && (
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 mb-1.5">Cities</p>
                    <div className="flex flex-wrap gap-1.5">
                      {topEntities.cities.slice(0, 3).map((c: string, i: number) => (
                        <span key={i} className="px-2 py-1 rounded-full text-[10px] font-medium bg-blue-50 text-blue-800 border border-blue-200">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {topEntities.platforms?.length > 0 && (
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 mb-1.5">Platforms</p>
                    <div className="flex flex-wrap gap-1.5">
                      {topEntities.platforms.slice(0, 3).map((p: string, i: number) => (
                        <span key={i} className="px-2 py-1 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
                {topEntities.categories?.length > 0 && (
                  <div>
                    <p className="text-[9px] font-semibold text-slate-500 mb-1.5">Categories</p>
                    <div className="flex flex-wrap gap-1.5">
                      {topEntities.categories.slice(0, 3).map((cat: string, i: number) => (
                        <span key={i} className="px-2 py-1 rounded-full text-[10px] font-medium bg-violet-50 text-violet-800 border border-violet-200">{cat}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* City context */}
      {cityContext && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">City Context</p>
          <p className="text-xs text-slate-600 leading-relaxed">{cityContext}</p>
        </div>
      )}

      {/* Slang detected */}
      {slangDetected.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">Slang Detected</p>
          <div className="flex flex-wrap gap-2">
            {slangDetected.map((slang: string, i: number) => (
              <span key={i} className="px-3 py-1.5 rounded-full text-xs font-medium bg-orange-50 text-orange-800 border border-orange-200">{slang}</span>
            ))}
          </div>
        </div>
      )}

      {/* Sample reviews */}
      {sampleReviews.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Sample Reviews</p>
          <div className="space-y-3">
            {sampleReviews.slice(0, 3).map((review: any, i: number) => (
              <div key={i} className="border-l-2 border-slate-200 pl-3 py-1">
                <p className="text-xs text-slate-700 leading-relaxed italic">"{review.text || review}"</p>
                {(review.platform || review.city) && (
                  <p className="text-[10px] text-slate-500 mt-1.5">{review.platform} · {review.city}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nav buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Link href="/step-1">
          <button type="button" className="w-full py-3 rounded-xl text-sm font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Gatekeeper
          </button>
        </Link>
        <Link href="/step-3">
          <button type="button" className="w-full py-3 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
            Proceed to Semantic Mapping
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </Link>
      </div>
    </div>
  );
}
