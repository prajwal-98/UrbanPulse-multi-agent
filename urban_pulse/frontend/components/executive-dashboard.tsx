"use client";

import type { DashboardApiData, DashboardDriver } from "@/lib/api";
import { exportReport } from "@/lib/api";
import HeroAlert from "./hero-alert";
import KpiStrip from "./kpi-strip";
import InsightCards from "./insight-cards";
import RecommendationCards from "./recommendation-cards";
import { SectionHead, DRIVER_ROW, DRIVER_DOT, SEC } from "@/components/executive-dashboard-sections";

interface Props {
  data: DashboardApiData;
}

export default function ExecutiveDashboard({ data }: Props) {
  const { kpis, executive_summary, hero_alert, time_insights } = data;
  const drivers: DashboardDriver[] = data.drivers ?? [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ══ HEADER ══ */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                UrbanPulse
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <h1 className="text-sm font-semibold text-slate-700 tracking-tight">
              Intelligence Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Synced just now
            </div>
            <div className="h-5 w-px bg-slate-200" />
            <button
              onClick={() => exportReport()}
              className="group flex items-center gap-2 px-5 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-700 transition-colors duration-150 shadow-sm"
            >
              <svg
                className="w-3.5 h-3.5 text-slate-300 group-hover:text-white transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export Report
              <span className="ml-0.5 px-1.5 py-0.5 rounded bg-slate-700 text-[10px] font-bold text-slate-300 group-hover:bg-slate-600">
                PDF
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ══ MAIN ══ */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* § 1 — Hero Business Alert */}
        <div className="py-8">
          <HeroAlert heroAlert={hero_alert} kpis={kpis} drivers={drivers} />
        </div>

        {/* § 2 — KPI Strip */}
        <div className={SEC}>
          <SectionHead label="Key Performance Indicators" />
          <KpiStrip kpis={kpis} />
        </div>

        {/* § 3 — Executive Summary */}
        <div className={SEC}>
          <SectionHead label="Executive Summary" />
          <div className="bg-white rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
              <div className="p-8 flex flex-col">

                {executive_summary?.what && (
                  <div className="pb-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2.5">
                      What is happening
                    </p>
                    <p className="text-sm text-slate-700 leading-[1.85]">
                      {executive_summary.what}
                    </p>
                  </div>
                )}

                {executive_summary?.why && (
                  <>
                    <div className="border-t border-slate-100" />
                    <div className="py-6">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-2.5">
                        Why it matters
                      </p>
                      <p className="text-sm text-slate-700 leading-[1.85]">
                        {executive_summary.why}
                      </p>
                    </div>
                  </>
                )}

                {executive_summary?.decision && (
                  <>
                    <div className="border-t border-slate-100" />
                    <div className="py-6">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-700 mb-2.5">
                        Leadership decision
                      </p>
                      <p className="text-sm font-semibold text-slate-900 leading-[1.85]">
                        {executive_summary.decision}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Signal Drivers panel */}
              {drivers.length > 0 && (
                <div className="p-8">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
                    Signal Drivers
                  </p>
                  <div className="flex flex-col gap-2">
                    {drivers.slice(0, 3).map((d, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2.5 text-xs font-medium leading-snug px-3.5 py-2.5 rounded-lg border ${DRIVER_ROW[i] ?? DRIVER_ROW[2]}`}
                      >
                        <span
                          className={`mt-[3px] w-1.5 h-1.5 rounded-full shrink-0 ${DRIVER_DOT[i] ?? DRIVER_DOT[2]}`}
                        />
                        {d.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* § 4 — Insight Breakdown */}
        <div className={SEC}>
          <InsightCards timeInsights={time_insights} />
        </div>

        {/* § 5 — Recommended Actions */}
        <div className={SEC}>
          <RecommendationCards drivers={drivers} />
        </div>

      </main>

      {/* ══ FOOTER ══ */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-xs font-medium text-slate-400">
              UrbanPulse Intelligence
            </span>
            <span className="text-slate-200">·</span>
            <span className="text-xs text-slate-400">
              Powered by multi-agent AI
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 text-xs font-semibold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live Synthesis Complete
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
