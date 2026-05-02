"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useSession } from "@/contexts/session-context";
import Step1View from "@/components/step1-view";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ─── Step metadata ────────────────────────────────────────────────── */

const STEPS = [
  { num: 1, label: "Gatekeeper",        activeMsg: "Validating your dataset…",            doneMsg: "Dataset validated" },
  { num: 2, label: "Context Intelligence", activeMsg: "Detecting urban context and slang…",   doneMsg: "Context mapped" },
  { num: 3, label: "Semantic Mapping",        activeMsg: "Mapping semantic anchor issues…",      doneMsg: "Issues mapped" },
  { num: 4, label: "Finding Patterns",      activeMsg: "Clustering and classifying patterns…", doneMsg: "Patterns identified" },
  { num: 5, label: "Escalation Analysis",   activeMsg: "Analysing escalation signals…",        doneMsg: "Escalations flagged" },
  { num: 6, label: "Platform Comparing",      activeMsg: "Reading cross-platform signals…",      doneMsg: "Signals captured" },
  { num: 7, label: "Language Intelligence",      activeMsg: "Scoring novelty and impact…",          doneMsg: "Insights scored" },
  { num: 8, label: "Intelligence Reporting",    activeMsg: "Generating final intelligence…",        doneMsg: "Intelligence ready" },
] as const;

type StepNum = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/* ─── Helpers ──────────────────────────────────────────────────────── */

function parseStep(raw: number | string): number {
  if (typeof raw === "string") {
    const n = parseInt(raw.replace("A", ""), 10);
    return isNaN(n) ? 0 : n;
  }
  return typeof raw === "number" ? raw : 0;
}

/* ─── Shared micro-components ──────────────────────────────────────── */

function NoData() {
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
      {children}
    </p>
  );
}

function MetricCard({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">{label}</p>
      <p className="text-base font-bold text-slate-900 truncate">{value ?? "—"}</p>
    </div>
  );
}

type TagColor = "slate" | "emerald" | "amber" | "red" | "blue" | "violet";

function Tag({ children, color = "slate" }: { children: React.ReactNode; color?: TagColor }) {
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

function PriorityBadge({ priority }: { priority?: string | null }) {
  const p = (priority ?? "").toLowerCase();
  const color: TagColor = p.includes("high") || p.includes("critical") ? "red"
    : p.includes("medium") ? "amber"
    : p.includes("low") ? "emerald"
    : "slate";
  return <Tag color={color}>{priority ?? "Unknown"}</Tag>;
}

/* Step 1 is handled by the dedicated Step1View component imported above */

/* ─── Step 2: Understanding Context ────────────────────────────────── */

function Step2View({ data }: { data: any }) {
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

/* ─── Step 3: Mapping Issues ────────────────────────────────────────── */

function Step3View({ data }: { data: any }) {
  if (!data) return <NoData />;
  const out: any = data.A3_output ?? data;
  const anchor: any = out.anchor_review ?? null;
  const similar: any[] = Array.isArray(out.similar_reviews) ? out.similar_reviews : [];
  const theme: any = out.semantic_theme ?? null;

  return (
    <div className="space-y-6">
      {anchor && (
        <div>
          <SectionTitle>Anchor Review</SectionTitle>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-sm text-slate-800 leading-relaxed italic">
              "{anchor.text ?? anchor.review ?? String(anchor)}"
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {anchor.city && <Tag color="blue">{anchor.city}</Tag>}
              {anchor.platform && <Tag color="violet">{anchor.platform}</Tag>}
              {anchor.rating != null && <Tag color="amber">★ {anchor.rating}</Tag>}
            </div>
          </div>
        </div>
      )}

      {similar.length > 0 && (
        <div>
          <SectionTitle>Similar Reviews ({similar.length})</SectionTitle>
          <div className="space-y-2.5">
            {similar.slice(0, 5).map((r, i) => {
              const text = typeof r === "string" ? r : (r.text ?? r.review ?? "");
              return (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                  <p className="text-xs text-slate-700 leading-relaxed">{text}</p>
                  {typeof r === "object" && (
                    <div className="mt-2 flex gap-1.5">
                      {r.city && <Tag color="blue">{r.city}</Tag>}
                      {r.platform && <Tag color="violet">{r.platform}</Tag>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {theme && (
        <div>
          <SectionTitle>Semantic Theme</SectionTitle>
          <div className="bg-slate-900 text-white rounded-xl px-5 py-4">
            {typeof theme === "string" ? (
              <p className="text-sm font-medium">{theme}</p>
            ) : (
              <>
                {theme.title && <p className="text-sm font-bold mb-1">{theme.title}</p>}
                {theme.description && <p className="text-xs text-slate-400 leading-relaxed">{theme.description}</p>}
              </>
            )}
          </div>
        </div>
      )}

      {!anchor && !similar.length && !theme && <NoData />}
    </div>
  );
}

/* ─── Step 4: Finding Patterns ──────────────────────────────────────── */

function Step4View({ data }: { data: any }) {
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

/* ─── Step 5: Escalation Analysis ───────────────────────────────────── */

function Step5View({ data }: { data: any }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!data) return <NoData />;
  const issues: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data.A5_output)
    ? data.A5_output
    : [];

  if (issues.length === 0) return <NoData />;

  return (
    <div className="space-y-2">
      {issues.map((issue, i) => {
        const category = issue.issue_category ?? issue.category ?? `Issue ${i + 1}`;
        const priority: string = issue.priority ?? "unknown";
        const reason: string = issue.reason ?? "";
        const impact: string = issue.impact ?? "";
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
                {impact && (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">Impact</p>
                    <p className="text-xs text-slate-700 leading-relaxed">{impact}</p>
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

/* ─── Step 6: Platform Signals ──────────────────────────────────────── */

function RankedList({ title, items }: { title: string; items: any[] }) {
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

function Step6View({ data }: { data: any }) {
  if (!data) return <NoData />;
  const out: any = data.A6_output ?? data;
  const platforms: any[] = Array.isArray(out.platform) ? out.platform : [];
  const brands: any[] = Array.isArray(out.brand) ? out.brand : [];
  const categories: any[] = Array.isArray(out.category) ? out.category : [];
  const cities: any[] = Array.isArray(out.city) ? out.city : [];
  const time: any = out.time ?? null;

  const hasAny = platforms.length || brands.length || categories.length || cities.length || time;
  if (!hasAny) return <NoData />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-5">
        <RankedList title="Platforms" items={platforms} />
        <RankedList title="Brands" items={brands} />
        <RankedList title="Categories" items={categories} />
        <RankedList title="Cities" items={cities} />
      </div>

      {time && (
        <div>
          <SectionTitle>Time Signal</SectionTitle>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4">
            {time.label && <p className="text-sm font-bold text-slate-900">{time.label}</p>}
            {time.multiplier != null && (
              <p className="text-xs text-slate-600 mt-1">
                <span className="font-bold text-amber-600">{time.multiplier}×</span> complaint volume vs. average
              </p>
            )}
            {(time.context ?? time.insight) && <p className="text-xs text-slate-500 leading-relaxed mt-1">{time.context ?? time.insight}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Step 7: Scoring Insights ──────────────────────────────────────── */

function Step7View({ data }: { data: any }) {
  if (!data) return <NoData />;
  const out: any = data.A7_output ?? data;
  const slangIntelligence: any[] = Array.isArray(out.slang_intelligence) ? out.slang_intelligence : [];
  const citySlang: any[] = Array.isArray(out.city_slang) ? out.city_slang : [];
  const sentimentMapping: any[] = Array.isArray(out.sentiment_mapping) ? out.sentiment_mapping : [];
  const emergingSlang: any[] = Array.isArray(out.emerging_slang) ? out.emerging_slang : [];

  const hasAny = slangIntelligence.length || citySlang.length || sentimentMapping.length || emergingSlang.length;
  if (!hasAny) return <NoData />;

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

/* ─── Step 8: Final Intelligence ────────────────────────────────────── */

function Step8View() {
  return (
    <div className="py-12 flex flex-col items-center text-center gap-5">
      <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
        <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <p className="text-base font-bold text-slate-900 mb-1.5">Intelligence Ready</p>
        <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
          All 8 agents have completed. Full intelligence report is ready in the dashboard.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="mt-1 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
      >
        View Intelligence Dashboard
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  );
}

/* ─── Main PipelineScreen ────────────────────────────────────────────── */

export default function PipelineScreen() {
  const session = useSession();
  const { sessionId, pipelineStatus } = session;

  // isIdle tracks session context so we know when to start/stop polling
  const isIdle = pipelineStatus === "idle";

  // Local state driven by direct polling — current_step from /status is the source of truth
  const [currentStepNum, setCurrentStepNum] = useState(0);
  const [localStatus, setLocalStatus] = useState<"idle" | "running" | "complete" | "error">(pipelineStatus);
  const [localProgress, setLocalProgress] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);

  // Reset when the pipeline returns to idle (e.g. after a reset)
  useEffect(() => {
    if (isIdle) {
      setCurrentStepNum(0);
      setLocalStatus("idle");
      setLocalProgress(0);
      setLocalError(null);
      setStepData({});
      setViewingStep(1);
      setVisitedSteps(new Set<number>());
      prevIsComplete.current = false;
    }
  }, [isIdle]);

  // Poll /status every 3 s — always trust current_step from the backend
  useEffect(() => {
    if (!sessionId || isIdle) return;
    let active = true;
    let timerId = 0;

    const doPoll = async () => {
      try {
        const res = await fetch(`${BACKEND}/status/${sessionId}`);
        if (!res.ok || !active) return;
        const data = await res.json();
        const status: "running" | "complete" | "error" =
          data.status === "complete" ? "complete"
          : data.status === "error"  ? "error"
          : "running";
        setCurrentStepNum(parseStep(data.current_step));
        setLocalProgress(typeof data.progress === "number" ? data.progress : 0);
        setLocalStatus(status);
        if (status === "error") setLocalError(data.error ?? "Unknown error");
        if (status !== "complete" && status !== "error" && active) {
          timerId = window.setTimeout(doPoll, 3000);
        }
      } catch {
        if (active) timerId = window.setTimeout(doPoll, 3000);
      }
    };

    doPoll();
    return () => {
      active = false;
      window.clearTimeout(timerId);
    };
  }, [sessionId, isIdle]);

  const isComplete = localStatus === "complete";
  const isRunning  = localStatus === "running";
  const isError    = localStatus === "error";

  // Tracks whether we have already cleared the stale-null cache for the current run
  const prevIsComplete = useRef(false);
  // Incrementing this forces the fetch effect to re-run after cache is cleared
  const [reloadKey, setReloadKey] = useState(0);

  const [viewingStep, setViewingStep] = useState(1);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set<number>());
  const [stepData, setStepData] = useState<Record<number, any>>({});
  const [loadingStepNum, setLoadingStepNum] = useState<number | null>(null);

  const stepDataRef = useRef<Record<number, any>>({});
  stepDataRef.current = stepData;

  // When the pipeline first reaches "complete", session["state"] is now finalized.
  // Any step that returned null during the running phase (state not yet saved) must
  // be re-fetched. We clear those null cache entries once and bump reloadKey so the
  // fetch effect fires again with updated stepDataRef.
  useEffect(() => {
    if (isComplete && !prevIsComplete.current) {
      prevIsComplete.current = true;
      setStepData(prev => {
        const cleaned: Record<number, any> = {};
        for (const [k, v] of Object.entries(prev)) {
          if (v !== null) cleaned[Number(k)] = v;
        }
        return cleaned;
      });
      setReloadKey(k => k + 1);
    }
  }, [isComplete]);

  const canNavigateTo = (n: number) =>
    isComplete || ((isRunning || isError) && n <= currentStepNum);

  const fetchStepData = useCallback(async (n: number) => {
    if (!sessionId || stepDataRef.current[n] !== undefined) return;
    setLoadingStepNum(n);
    try {
      const res = await fetch(`${BACKEND}/steps/${sessionId}/${n}`);
      if (res.ok) {
        const json = await res.json();
        setStepData(prev => ({ ...prev, [n]: json.data ?? null }));
      } else {
        setStepData(prev => ({ ...prev, [n]: null }));
      }
    } catch {
      setStepData(prev => ({ ...prev, [n]: null }));
    } finally {
      setLoadingStepNum(null);
    }
  }, [sessionId]);

  // Fetch data for the viewing step whenever it becomes available.
  // Also runs when reloadKey bumps (after completion clears the null cache).
  useEffect(() => {
    if (isIdle) return;
    const stepIsDone = isComplete || ((isRunning || isError) && viewingStep <= currentStepNum);
    if (stepIsDone && stepDataRef.current[viewingStep] === undefined) {
      fetchStepData(viewingStep);
    }
  }, [viewingStep, currentStepNum, isComplete, isRunning, isError, isIdle, fetchStepData, reloadKey]);

  const handleClickStep = (n: number) => {
    if (isIdle) return;
    setViewingStep(n);
    setVisitedSteps(prev => new Set([...Array.from(prev), n]));
  };

  const thisStep = STEPS.find(s => s.num === viewingStep)!;

  const viewingStepStatus =
    isComplete                                                 ? "complete"
    : (isRunning || isError) && viewingStep < currentStepNum  ? "complete"
    : isRunning && viewingStep === currentStepNum              ? "running"
    : "pending";

  /* ── Step content renderer ── */
  function renderContent() {
    if (isIdle) {
      return (
        <div className="py-16 flex flex-col items-center text-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">Waiting to start</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Start the analysis from the control panel. Results will appear here automatically.
            </p>
          </div>
        </div>
      );
    }

    if (viewingStepStatus === "pending") {
      return (
        <div className="py-14 flex flex-col items-center text-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs text-slate-400">Waiting for {thisStep.label.toLowerCase()}…</p>
        </div>
      );
    }

    if (viewingStepStatus === "running") {
      return (
        <div className="py-14 flex flex-col items-center text-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">{thisStep.activeMsg}</p>
            <p className="text-xs text-slate-400 mt-1">Results will appear when the step completes</p>
          </div>
        </div>
      );
    }

    // Complete
    if (viewingStep === 8) return <Step8View />;

    if (loadingStepNum === viewingStep) {
      return (
        <div className="py-14 flex flex-col items-center text-center gap-3">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading step data…</p>
        </div>
      );
    }

    const d = stepData[viewingStep];

    switch (viewingStep as StepNum) {
      case 1: return (
        <Step1View
          data={d}
          onContinue={
            canNavigateTo(2)
              ? () => { setViewingStep(2); }
              : undefined
          }
        />
      );
      case 2: return <Step2View data={d} />;
      case 3: return <Step3View data={d} />;
      case 4: return <Step4View data={d} />;
      case 5: return <Step5View data={d} />;
      case 6: return <Step6View data={d} />;
      case 7: return <Step7View data={d} />;
      default: return <NoData />;
    }
  }

  /* ── Pipeline strip node ── */
  function StepDot({ s, isLast }: { s: typeof STEPS[number]; isLast: boolean }) {
    const visited = visitedSteps.has(s.num);
    const viewing = s.num === viewingStep;
    const clickable = !isIdle;

    const dotCls = visited  ? "bg-emerald-500 text-white"
                 : viewing  ? "bg-amber-500 text-white ring-4 ring-amber-100"
                 : "bg-amber-400 text-white";

    const labelCls = visited ? "text-emerald-600"
                   : viewing ? "text-amber-700 font-semibold"
                   : "text-amber-600";

    const dotEl = (
      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${dotCls}`}>
        {visited ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span>{s.num}</span>
        )}
      </div>
    );

    const labelEl = (
      <span className={`text-[10px] font-medium mt-2 text-center leading-tight max-w-[80px] block ${labelCls}`}>
        {s.label}
      </span>
    );

    const inner = (
      <div className="flex flex-col items-center">
        {dotEl}
        {labelEl}
      </div>
    );

    return (
      <div className="flex items-start shrink-0">
        {clickable ? (
          <button type="button" onClick={() => handleClickStep(s.num)} className="flex flex-col items-center hover:opacity-80 transition-opacity">
            {inner}
          </button>
        ) : inner}
        {!isLast && (
          <div className={`h-px w-8 mt-[22px] mx-1 shrink-0 transition-colors ${visited ? "bg-emerald-300" : "bg-amber-200"}`} />
        )}
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Page header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
          {isIdle
            ? "Analysis Pipeline"
            : `Step ${viewingStep} of ${STEPS.length} · Analysis Pipeline`}
        </p>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {isIdle ? "Ready to Analyse" : thisStep.label}
        </h1>
      </div>

      <div className="px-8 py-10 space-y-6">

        {/* Pipeline strip */}
        <div className="bg-white rounded-2xl border border-slate-200 px-6 pt-6 pb-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-5">
            Pipeline Progress
          </p>
          <div className="flex items-start overflow-x-auto pb-2">
            {STEPS.map((s, i) => (
              <StepDot key={s.num} s={s} isLast={i === STEPS.length - 1} />
            ))}
          </div>

          {!isIdle && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Overall Progress
                </span>
                <span className="text-[10px] font-bold tabular-nums text-slate-600">{localProgress}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${isComplete ? "bg-emerald-500" : "bg-amber-500"}`}
                  style={{ width: `${localProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Step content card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className={`h-[3px] transition-colors ${
            viewingStepStatus === "complete" ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
            : viewingStepStatus === "running" ? "bg-gradient-to-r from-amber-500 to-amber-400"
            : "bg-gradient-to-r from-slate-200 to-slate-100"
          }`} />

          {!isIdle && (
            <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wider
                ${viewingStepStatus === "complete" ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : viewingStepStatus === "running"  ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-slate-100 border-slate-200 text-slate-500"}`}
              >
                {viewingStepStatus === "running" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                )}
                {viewingStepStatus === "complete" ? thisStep.doneMsg
                : viewingStepStatus === "running"  ? thisStep.activeMsg.replace("…", "")
                : `Waiting for ${thisStep.label.toLowerCase()}`}
              </div>

              {isComplete && viewingStep < STEPS.length && (
                <button
                  type="button"
                  onClick={() => { setViewingStep(v => Math.min(v + 1, STEPS.length)); }}
                  className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
                >
                  Next
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          )}

          <div className="px-6 py-6">
            {renderContent()}
          </div>
        </div>

        {/* Error banner */}
        {isError && localError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <p className="text-xs font-semibold text-red-700 mb-1">Something went wrong</p>
            <p className="text-xs text-red-500 leading-relaxed line-clamp-4">{localError}</p>
          </div>
        )}

      </div>
    </div>
  );
}
