"use client";

import { PlatformDonut, CityBarChart, CategoryBarChart, TimeBandChart, WordCloud } from "@/components/brief-charts";
import { Scoreboard, SignalDrivers, ReviewCards, ActionQueue } from "@/components/brief-sections";
import type { DashboardData } from "@/lib/mock-data";

const SECTION_LABEL = "text-[10px] font-bold tracking-widest text-emerald-400 uppercase flex items-center gap-2";
const CARD_DARK = { background: "linear-gradient(145deg, #1e293b 0%, #0f172a 100%)", border: "1px solid rgba(255,255,255,0.07)" };
const SECTION_DIVIDER = "w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2";

function SectionLabel({ text }: { text: string }) {
  return (
    <div className={SECTION_LABEL}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      {text}
    </div>
  );
}

interface Props { data: DashboardData }

export default function BriefDashboard({ data }: Props) {
  const { story, metrics, impact, breakdown, root_cause, evidence, actions, language, confidence, drivers } = data;
  const platforms = breakdown?.platform ?? [];
  const cities = (breakdown as any)?.city?.map((c: any) => ({ city: c.city, mentions: c.mentions })) ?? [];
  const categories = (breakdown?.category ?? []).map((c: any) => ({ name: c.name, pct: c.pct ?? c.mentions }));
  const peakTime = (breakdown?.time as any)?.peak ?? breakdown?.time?.range ?? "19:00–21:00";
  const quietTime = (breakdown?.time as any)?.quiet ?? "06:00–09:00";

  return (
    <div className="min-h-screen font-sans" style={{ background: "#ffffff" }}>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black tracking-widest text-slate-800 uppercase">UrbanPulse</span>
            <span className="text-slate-200 text-sm">·</span>
            <span className="text-sm font-semibold text-slate-500">The Brief</span>
            <span className="text-slate-200 text-sm hidden sm:inline">·</span>
            <span className="text-xs text-slate-400 hidden sm:inline">Tuesday · May 6, 2026 · 17:02 IST</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">Synthesis Complete</span>
            </div>
            <button onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition shadow-sm shadow-emerald-500/30">
              Export Brief <span className="px-1.5 py-0.5 rounded bg-emerald-600/50 text-[10px]">PDF</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">

          {/* ── MAIN COLUMN ── */}
          <div className="space-y-12">

            {/* § 1 HERO NARRATIVE */}
            <section>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-bold tracking-widest text-red-500 uppercase bg-red-500/10 px-2 py-1 rounded border border-red-500/20">● HIGH IMPACT</span>
                <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">CONFIDENCE · {Math.round((confidence ?? 0.92) * 100)}%</span>
              </div>
              <div className="rounded-3xl p-8 mt-4" style={CARD_DARK}>
                <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight mb-5">
                  {metrics?.top_issue
                    ? `${metrics.top_issue} complaints are surging — pushing past food quality as the #1 issue for the first time in 12 weeks.`
                    : story?.split(".")[0] + "."}
                </h1>
                <p className="text-base text-white/55 leading-relaxed max-w-2xl">
                  {story ?? "Intelligence synthesis complete. Review the findings below."}
                </p>
              </div>
            </section>

            <div className={SECTION_DIVIDER} />

            {/* § 2 THE SCALE */}
            <section className="space-y-4">
              <SectionLabel text="The Scale" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Reviews Analysed", value: metrics?.total_reviews?.toLocaleString() ?? "—", sub: "this week", gradient: "from-blue-600 to-cyan-500" },
                  { label: "Negative Sentiment", value: `${metrics?.negative_percent ?? 0}%`, sub: "+8 pts WoW", gradient: "from-red-700 to-red-500" },
                  { label: "Top Issue", value: metrics?.top_issue ?? "—", sub: "overtook food quality", gradient: "from-amber-600 to-orange-500" },
                  { label: "Top Affected Brand", value: metrics?.top_brand ?? "—", sub: "highest complaint volume", gradient: "from-indigo-700 to-violet-600" },
                ].map((k, i) => (
                  <div key={i} className={`rounded-2xl p-5 bg-gradient-to-br ${k.gradient}`}>
                    <p className="text-[10px] font-bold tracking-widest text-white/60 uppercase mb-2">{k.label}</p>
                    <p className="text-2xl font-black text-white leading-none mb-1">{k.value}</p>
                    <p className="text-xs text-white/50">{k.sub}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl p-6 bg-gradient-to-br from-red-900 to-red-700">
                  <p className="text-[10px] font-bold tracking-widest text-white/60 uppercase mb-2">Affected Reviews</p>
                  <p className="text-4xl font-black text-white leading-none">{impact?.affected_reviews?.toLocaleString() ?? "—"}</p>
                  <p className="text-xs text-white/50 mt-1">{metrics?.negative_percent ? `${metrics.negative_percent}% of weekly volume` : "of weekly volume"}</p>
                </div>
                <div className="rounded-2xl p-6 bg-gradient-to-br from-orange-700 to-red-600">
                  <p className="text-[10px] font-bold tracking-widest text-white/60 uppercase mb-2">Revenue at Risk</p>
                  <p className="text-4xl font-black text-white leading-none">{impact?.revenue_risk ?? "—"}</p>
                  <p className="text-xs text-white/50 mt-1">if trend holds 30 days</p>
                </div>
              </div>
            </section>

            <div className={SECTION_DIVIDER} />

            {/* § 3 WHERE IT'S HAPPENING */}
            <section className="space-y-5">
              <SectionLabel text="Where it's happening" />
              <h2 className="text-2xl font-black text-slate-900">The disruption is geographic, not categorical.</h2>
              <p className="text-sm text-slate-500 leading-relaxed">One zone, one corridor, one shared courier pool — the issue is concentrated, which means it's also fixable.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl p-6 space-y-4" style={CARD_DARK}>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">By City</p>
                  {cities.length ? <CityBarChart cities={cities} /> : <p className="text-xs text-white/30">No city data available</p>}
                </div>
                <div className="rounded-2xl p-6 space-y-4" style={CARD_DARK}>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">By Platform</p>
                  {platforms.length ? <PlatformDonut platforms={platforms} /> : <p className="text-xs text-white/30">No platform data available</p>}
                </div>
                <div className="rounded-2xl p-6 space-y-4" style={CARD_DARK}>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">By Complaint Category</p>
                  {categories.length ? <CategoryBarChart categories={categories} /> : <p className="text-xs text-white/30">No category data available</p>}
                </div>
                <div className="rounded-2xl p-6 space-y-4" style={CARD_DARK}>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest">By Time of Day</p>
                  <p className="text-xs text-white/30">Peak {peakTime} · Quiet {quietTime}</p>
                  <TimeBandChart peak={peakTime} quiet={quietTime} />
                </div>
              </div>
            </section>

            <div className={SECTION_DIVIDER} />

            {/* § 4 WHY IT'S HAPPENING */}
            <section className="space-y-4">
              <SectionLabel text="Why it's happening" />
              <h2 className="text-2xl font-black text-slate-900">Root cause</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 rounded-2xl p-6 text-sm text-white/70 leading-relaxed" style={CARD_DARK}>
                  {root_cause ?? "Root cause analysis not available."}
                </div>
                <div className="rounded-2xl p-6" style={{ background: "linear-gradient(145deg, #14532d, #052e16)", border: "1px solid rgba(34,197,94,0.2)" }}>
                  <p className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase mb-3">Pattern Type</p>
                  <p className="text-xl font-black text-white mb-2">{impact?.urgency ?? "Operational issue"}</p>
                  <p className="text-xs text-white/50 leading-relaxed">Reversible with targeted operational intervention.</p>
                </div>
              </div>
            </section>

            <div className={SECTION_DIVIDER} />

            {/* § 5 CUSTOMER VOICE */}
            <section className="space-y-4">
              <SectionLabel text="In customers' words" />
              <h2 className="text-2xl font-black text-slate-900">Three reviews that captured the shift.</h2>
              <ReviewCards evidence={evidence ?? []} />
            </section>

            <div className={SECTION_DIVIDER} />

            {/* § 6 ACTIONS */}
            <section className="space-y-4">
              <SectionLabel text="What to do next" />
              <h2 className="text-2xl font-black text-slate-900">Three actions, prioritised.</h2>
              <p className="text-sm text-slate-500">Each is individually approvable. Click to expand details.</p>
              <ActionQueue actions={actions ?? []} />
            </section>

            <div className={SECTION_DIVIDER} />

            {/* § 7 LANGUAGE INTELLIGENCE */}
            <section className="space-y-4">
              <SectionLabel text="How customers are talking" />
              <h2 className="text-2xl font-black text-slate-900">Emerging slang. The earliest indicator of the next pattern.</h2>
              <p className="text-sm text-slate-500">Words sized by frequency. Color-coded by sentiment.</p>
              <div className="rounded-3xl p-6 relative overflow-hidden" style={CARD_DARK}>
                {language?.length
                  ? <WordCloud words={language} />
                  : <p className="text-xs text-white/30 h-40 flex items-center justify-center">No language data available</p>}
                <div className="flex gap-4 mt-4 text-xs text-white/40">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />Negative</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400" />Neutral</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Positive</span>
                </div>
              </div>
              {language?.length > 0 && (
                <div className="rounded-2xl overflow-hidden" style={CARD_DARK}>
                  <div className="px-5 py-3 border-b border-white/5 flex justify-between">
                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Top trending phrases · this week</span>
                    <span className="text-xs text-emerald-400 font-semibold cursor-pointer hover:underline">See full glossary →</span>
                  </div>
                  {language.slice(0, 6).map((l, i) => (
                    <div key={i} className="px-5 py-3 flex items-center gap-4 border-b border-white/5 last:border-0">
                      <code className="text-sm font-mono font-bold text-red-400 w-28 flex-shrink-0">"{l.slang}"</code>
                      <span className="text-xs text-white/40 flex-1">{l.sentiment === "negative" ? "Frustration / complaint signal" : l.sentiment === "positive" ? "Positive reinforcement" : "Contextual expression"}</span>
                      <span className="text-sm font-bold text-white/60 tabular-nums">{l.usage}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${l.sentiment === "negative" ? "bg-red-500/20 text-red-400" : l.sentiment === "positive" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"}`}>{l.sentiment}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="space-y-4 lg:block">
            <Scoreboard metrics={metrics} confidence={confidence} />
            <SignalDrivers drivers={Array.isArray(drivers) && typeof drivers[0] === "string" ? drivers as unknown as string[] : (drivers as any[])?.map((d: any) => d?.title ?? d) ?? []} />
          </aside>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between text-xs text-slate-400">
          <span>UrbanPulse Intelligence · The Brief · Synthesis confidence {Math.round((confidence ?? 0.92) * 100)}%</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>LIVE · 17:02 IST</span>
          </div>
        </div>
      </footer>
    </div>
  );
}