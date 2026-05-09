"use client";

import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";11
import { PlatformDonut, CityBarChart, CategoryBarChart, TimeBandChart } from "@/components/brief-charts";
import { ReviewCards, ActionQueue } from "@/components/brief-sections";
import type { DashboardData } from "@/lib/mock-data";

const CARD: React.CSSProperties = { background: "#0F1929", boxShadow: "0 0 0 1px rgba(255,255,255,0.06)" };
const CARD_GLOW = (hex: string): React.CSSProperties => ({ background: "#0F1929", boxShadow: `inset 3px 0 0 ${hex}, 0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px ${hex}18` });
const SC: Record<string, string> = { negative: "#ef4444", positive: "#10b981", neutral: "#64748b" };
const SB: Record<string, string> = { negative: "rgba(239,68,68,0.1)", positive: "rgba(16,185,129,0.1)", neutral: "rgba(100,116,139,0.1)" };
const BRIDGE = "border-l-2 border-indigo-500/30 pl-4 text-sm italic text-slate-500 leading-relaxed mb-5";
const H2 = "text-lg font-semibold text-slate-300 mt-2 mb-4 tracking-tight";

function Label({ t }: { t: string }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-indigo-400 uppercase mb-2">
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />{t}
    </div>
  );
}
function Bridge({ children }: { children: React.ReactNode }) { return <p className={BRIDGE}>{children}</p>; }
function Div() {
  return <div className="w-full h-px my-12" style={{ background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.06),transparent)" }} />;
}

interface Props { data: DashboardData }

export default function BriefDashboard({ data }: Props) {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { story, metrics, impact, breakdown, root_cause, evidence, actions, language, confidence, drivers } = data;

  const handleExportPDF = async () => {
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#09111F",
      logging: false,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save("urbanpulse-brief.pdf");
  };
  const imp = impact as any;
  const platforms = breakdown?.platform ?? [];
  const cities = (breakdown as any)?.city ?? [];
  const categories = (breakdown?.category ?? []).map((c: any) => ({ name: c.name, pct: c.pct ?? c.mentions ?? 0 }));
  const rawTime = breakdown?.time as any;
  const peakHour: number | undefined = rawTime?.peak_hour;
  const peakTime = peakHour != null
    ? `${String(peakHour).padStart(2, "0")}:00–${String((peakHour + 3) % 24).padStart(2, "0")}:00`
    : rawTime?.peak ?? "19:00–21:00";
  const quietTime = rawTime?.quiet ?? "06:00–09:00";
  const langs = (language ?? []) as { slang: string; usage: number; sentiment: string }[];
  const allActions = (actions ?? []) as any[];
  const highC = allActions.filter(a => a.priority === "High").length;
  const medC = allActions.filter(a => a.priority === "Medium").length;
  const lowC = allActions.length - highC - medC;
  const confScore = typeof confidence === "number" ? (confidence > 1 ? Math.round(confidence) : Math.round(confidence * 100)) : 60;
  const confColor = confScore >= 80 ? "#10b981" : confScore >= 60 ? "#f59e0b" : "#ef4444";
  const confLabel = confScore >= 80 ? "HIGH CONFIDENCE" : confScore >= 60 ? "MEDIUM - VALIDATE" : "LOW - DIRECTIONAL";
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) + " IST";
  const headline = metrics?.top_issue && metrics?.top_brand
    ? `${metrics.top_issue} complaints are mounting - ${metrics.top_brand} sees the highest volume this week.`
    : (story?.split(".")[0] ?? "Intelligence synthesis complete") + ".";

  return (
    <div className="min-h-screen font-sans text-slate-100" style={{ background: "#09111F" }}>
      <style>{`
        @keyframes ticker { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        .ticker-run { animation: ticker 40s linear infinite; }
        .ticker-run:hover { animation-play-state: paused; }
        .glow { filter: drop-shadow(0 0 6px currentColor); }

        @media print {
          @page { size: A4 portrait; margin: 14mm 12mm; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .no-print { display: none !important; }
          header { position: static !important; backdrop-filter: none !important; background: #09111F !important; }
          footer { display: none !important; }
          .ticker-run { animation: none !important; transform: none !important; }
          .ticker-wrap { overflow: visible !important; }
          .ticker-wrap > div { flex-wrap: wrap !important; width: auto !important; }
          .print-break { break-before: page; }
          section { margin-bottom: 6mm; }
          .rounded-2xl { break-inside: avoid; }
          .grid { break-inside: avoid; }
        }
      `}</style>

      {/* ── STICKY HEADER ── */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-md" style={{ background: "rgba(9,17,31,0.92)" }}>
        <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[9px] font-black">UP</span>
            </div>
            <span className="text-xs font-bold text-slate-300">UrbanPulse</span>
            <span className="text-white/15">·</span>
            <span className="text-xs text-slate-600">Intelligence Brief</span>
            <span className="hidden sm:inline text-white/15">·</span>
            <span className="hidden sm:inline text-[11px] font-mono text-slate-700">{dateStr} · {timeStr}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-white/6" style={{ background: "rgba(255,255,255,0.03)" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: confColor }} />
              <span className="text-[10px] font-bold tracking-widest" style={{ color: confColor }}>{confScore}% · {confLabel}</span>
            </div>
            <button onClick={handleExportPDF}
              className="no-print flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-80"
              style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)", boxShadow: "0 2px 16px rgba(99,102,241,0.35)" }}>
              Export PDF
            </button>
          </div>
        </div>
      </header>

      {/* ── BRIEF CONTENT (captured for PDF) ── */}
      <div ref={dashboardRef}>

      {/* ── HERO ── */}
      <div style={{ background: "linear-gradient(160deg,#0B1220 0%,#09111F 100%)" }}>
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-14">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-red-400 uppercase px-2.5 py-1 rounded mb-6" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> {imp?.urgency ?? "HIGH"} IMPACT
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-[1.05] tracking-tight mb-4 max-w-4xl">{headline}</h1>
          <p className="text-base text-slate-400 leading-relaxed max-w-2xl mb-10">
            {metrics?.negative_percent}% of {metrics?.total_reviews?.toLocaleString()} reviews flagged issues this week. Revenue at risk: {imp?.revenue_risk ?? "—"}.
          </p>
          <div className="flex flex-wrap rounded-xl overflow-hidden border border-white/6" style={{ background: "rgba(255,255,255,0.02)" }}>
            {[
              { label: "REVIEWS ANALYZED", value: metrics?.total_reviews?.toLocaleString() ?? "—", color: "#f1f5f9" },
              { label: "NEGATIVE SENTIMENT", value: `${metrics?.negative_percent ?? 0}%`, color: (metrics?.negative_percent ?? 0) > 25 ? "#ef4444" : "#f59e0b" },
              { label: "CHURN RISK", value: `${imp?.churn_risk_percent ?? 0}%`, color: "#f59e0b" },
              { label: "REVENUE AT RISK", value: imp?.revenue_risk ?? "—", color: "#ef4444" },
            ].map((p, i) => (
              <div key={i} className="flex-1 min-w-[140px] px-6 py-5 border-r border-white/5 last:border-r-0">
                <p className="text-[10px] font-bold tracking-widest text-slate-600 uppercase mb-1.5">{p.label}</p>
                <p className="text-2xl font-black tabular-nums" style={{ color: p.color, textShadow: `0 0 24px ${p.color}60` }}>{p.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-6xl mx-auto px-6 pt-14 pb-8">

        {/* § SCALE */}
        <section className="mb-12">
          <Label t="What It Is Costing You" />
          <Bridge>The situation above is not abstract - here is the price tag on your operation right now.</Bridge>
          <h2 className={H2}>Scale of impact.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "AFFECTED REVIEWS", value: imp?.affected_reviews?.toLocaleString() ?? "—", sub: "reviews flagging the issue", hex: "#ef4444" },
              { label: "REVENUE AT RISK", value: imp?.revenue_risk ?? "—", sub: "if trend holds 30 days", hex: "#f59e0b" },
              { label: "CHURN RISK", value: `${imp?.churn_risk_percent ?? 0}%`, sub: "likely to switch platforms", hex: "#64748b" },
            ].map((t, i) => (
              <div key={i} className="rounded-2xl p-6" style={CARD_GLOW(t.hex)}>
                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-3">{t.label}</p>
                <p className="text-4xl font-black leading-none mb-2" style={{ color: t.hex, textShadow: `0 0 30px ${t.hex}50` }}>{t.value}</p>
                <p className="text-xs text-slate-600">{t.sub}</p>
              </div>
            ))}
          </div>
        </section>

        <Div />

        {/* § SLANG TICKER */}
        {langs.length > 0 && (
          <section className="mb-12">
            <Label t="Live Language Signal" />
            <Bridge>This is how your customers are describing their experience right now, in their own words, unfiltered.</Bridge>
            <h2 className={H2}>Trending Local Slangs Across Cities</h2>
            <div className="rounded-2xl overflow-hidden" style={CARD}>
              <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">Live slang feed · hover to pause</span>
              </div>
              <div className="ticker-wrap overflow-hidden py-6">
                <div className="flex ticker-run" style={{ width: "max-content" }}>
                  {[...langs, ...langs].map((l, i) => (
                    <div key={i} className="flex items-center gap-3 px-6 border-r border-white/5 last:border-0">
                      <code className="text-xl font-black font-mono" style={{ color: SC[l.sentiment] ?? "#94a3b8", textShadow: `0 0 16px ${SC[l.sentiment] ?? "#94a3b8"}70` }}>{l.slang}</code>
                      <span className="text-[10px] font-bold tabular-nums text-slate-600">{l.usage}×</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: SC[l.sentiment], background: SB[l.sentiment] }}>{l.sentiment}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <Div />

        {/* § WHERE IT HURTS */}
        <section className="mb-12 print-break">
          <Label t="Where the Pain Is Concentrated" />
          <Bridge>That cost is not spread evenly, it clusters in specific platforms, cities, and time windows.</Bridge>
          <h2 className={H2}>Geographic and platform breakdown.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { title: "By Platform", chart: platforms.length ? <PlatformDonut platforms={platforms} /> : null, hint: platforms[0] ? `${platforms[0].platform} accounts for ${platforms[0].share}% of complaints — the dominant pain point.` : null },
              { title: "By City", chart: cities.length ? <CityBarChart cities={cities} /> : null, hint: cities[0] ? `${cities[0].city} drives the highest complaint volume — geographically concentrated.` : null },
              { title: "By Category", chart: categories.length ? <CategoryBarChart categories={categories} /> : null, hint: categories[0] ? `${categories[0].name} dominates complaint categories this week.` : null },
              { title: "By Time of Day", chart: <TimeBandChart peak={peakTime} quiet={quietTime} />, hint: `Complaints cluster around ${peakTime} - a fulfillment-window failure.` },
            ].map((card, i) => (
              <div key={i} className="rounded-2xl p-6 space-y-4" style={CARD}>
                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{card.title}</p>
                {card.chart ?? <p className="text-xs text-slate-600">No data available</p>}
                {card.hint && <p className="text-xs text-slate-500 italic pt-3 border-t border-white/5">{card.hint}</p>}
              </div>
            ))}
          </div>
        </section>

        <Div />

        {/* § ROOT CAUSE */}
        <section className="mb-12">
          <Label t="The Root Cause" />
          <Bridge>Knowing where it hurts is half the answer, here is why it is happening.</Bridge>
          <h2 className={H2}>Diagnosis.</h2>
          <div className="rounded-2xl p-6" style={CARD_GLOW("#6366f1")}>
            <p className="text-base text-slate-300 leading-relaxed mb-5">{root_cause ?? "Root cause analysis not available."}</p>
            {Array.isArray(drivers) && drivers.length > 0 && (
              <div>
                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-3">Contributing factors</p>
                <div className="flex flex-wrap gap-2">
                  {(drivers as any[]).map((d: any, i: number) => (
                    <span key={i} className="text-xs font-medium px-3 py-1.5 rounded-full text-indigo-300" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                      {typeof d === "string" ? d : d?.title ?? d}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <Div />

        {/* § PLAYBOOK */}
        <section className="mb-12 print-break">
          <Label t="The Playbook" />
          <Bridge>We have translated the diagnosis into {allActions.length} moves, ranked by urgency. Each is individually actionable.</Bridge>
          <h2 className={H2}>What to do next.</h2>
          <div className="flex items-center gap-2 mb-5 text-xs font-bold">
            {highC > 0 && <span className="px-2.5 py-1 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>{highC} URGENT</span>}
            {medC > 0 && <span className="px-2.5 py-1 rounded-full" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>{medC} THIS WEEK</span>}
            {lowC > 0 && <span className="px-2.5 py-1 rounded-full" style={{ background: "rgba(100,116,139,0.1)", color: "#64748b", border: "1px solid rgba(100,116,139,0.2)" }}>{lowC} BACKLOG</span>}
          </div>
          <ActionQueue actions={actions ?? []} />
        </section>

        <Div />

        {/* § PROOF */}
        <section className="mb-12 print-break">
          <Label t="In Their Own Words" />
          <Bridge>If you doubt the diagnosis, here is the raw signal, unfiltered customer voice from this week.</Bridge>
          <h2 className={H2}>The reviews that captured the shift.</h2>
          <ReviewCards evidence={evidence ?? []} slangs={langs.map(l => l.slang)} />
        </section>

        <Div />

        {/* § CONFIDENCE */}
        <section className="mb-8">
          <Label t="Confidence & Method" />
          <Bridge>Before you act on any of this, here is how confident we are and how we arrived at these findings.</Bridge>
          <h2 className={H2}>How sure we are.</h2>
          <div className="rounded-2xl p-6 flex flex-col sm:flex-row gap-8 items-start" style={CARD}>
            <div className="flex-shrink-0 flex flex-col items-center gap-3">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke={confColor} strokeWidth="10"
                    strokeDasharray={`${(confScore / 100) * 251} 251`} strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 6px ${confColor})` }} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black text-slate-100">{confScore}%</span>
                </div>
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: confColor }}>{confLabel}</span>
            </div>
            <div className="flex-1 space-y-3 text-sm text-slate-400">
              <p><span className="font-semibold text-slate-200">Reviews analysed:</span> {metrics?.total_reviews?.toLocaleString() ?? "—"}</p>
              <p><span className="font-semibold text-slate-200">Pipeline:</span> A1 → A2 → A3 → A4 → A5 → A6 → A7 → A8</p>
              <p><span className="font-semibold text-slate-200">Verdict:</span> {confScore >= 80 ? "Decision-grade. Act on this." : confScore >= 60 ? "Medium - validate with one spot-check before acting." : "Directional - escalate before acting."}</p>
              {Array.isArray(drivers) && drivers.length > 0 && (
                <p><span className="font-semibold text-slate-200">Key drivers:</span> {(drivers as any[]).slice(0, 3).map((d: any) => typeof d === "string" ? d : d?.title ?? d).join(" · ")}</p>
              )}
            </div>
          </div>
        </section>

      </div>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 py-5" style={{ background: "rgba(9,17,31,0.8)" }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-slate-700">
          <span>UrbanPulse Intelligence · {dateStr} · Confidence {confScore}%</span>
          <span style={{ color: confColor }}>● {confLabel}</span>
        </div>
      </footer>

      </div>{/* end dashboardRef */}
    </div>
  );
}
