"use client";

import { BarChart, DonutChart, LineChart, RatingChart } from "@/components/steps/step1-charts";

interface Step1ViewProps {
  data: any;
  onContinue?: () => void;
}

function SectionHeader({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="flex items-end justify-between mb-3.5">
      <div className="flex items-center gap-2.5">
        <span className="block w-[3px] h-3.5 rounded-full bg-gradient-to-b from-slate-900 to-slate-600" />
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      </div>
      {hint && <p className="text-[10px] text-slate-400 italic">{hint}</p>}
    </div>
  );
}

function QualityChecks({ quality }: { quality: Record<string, any> }) {
  const qualityChecks = [
    { label: "Required columns present", pass: quality.schema_valid },
    { label: "Data format valid",         pass: quality.format_valid },
    { label: "No major missing values",   pass: quality.missing_data_ok },
  ];

  return (
    <div>
      <SectionHeader label="Quality checks" hint="Schema, format, completeness" />
      <div className="grid grid-cols-3 gap-3">
        {qualityChecks.map(({ label, pass }) => {
          const isPassed = pass === true;
          const isFailed = pass === false;
          const nullRate = label === "No major missing values" && quality.null_rate ? ` · ${(quality.null_rate * 100).toFixed(1)}% null` : "";
          const statusText = isPassed ? "Passed" : isFailed ? "Failed" : "Unknown";

          const statusPill = isPassed
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : isFailed
            ? "bg-red-50 text-red-700 border-red-200"
            : "bg-slate-50 text-slate-500 border-slate-200";

          const accentBar = isPassed
            ? "from-emerald-400 to-emerald-300"
            : isFailed
            ? "from-red-400 to-red-300"
            : "from-slate-300 to-slate-200";

          return (
            <div
              key={label}
              className="relative bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] transition-shadow"
            >
              <div className={`h-[3px] bg-gradient-to-r ${accentBar}`} />
              <div className="p-3.5 flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isPassed ? "bg-emerald-50 ring-1 ring-emerald-100"
                  : isFailed ? "bg-red-50 ring-1 ring-red-100"
                  : "bg-slate-50 ring-1 ring-slate-100"
                }`}>
                  {isPassed ? (
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isFailed ? (
                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[12px] font-medium text-slate-700 leading-snug mb-1.5">{label}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusPill}`}>
                    {statusText}{nullRate}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SampleDataTable({ sample }: { sample: any[] }) {
  return (
    <div>
      <SectionHeader label="Sample data preview" hint={`First ${Math.min(5, sample.length)} of ${sample.length} rows`} />
      <div className="overflow-hidden border border-slate-200/80 rounded-xl shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gradient-to-b from-slate-50 to-slate-100/60">
                {Object.keys(sample[0] || {}).map((col) => (
                  <th
                    key={col}
                    className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 border-b border-slate-200 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {sample.slice(0, 5).map((row: Record<string, unknown>, i: number) => (
                <tr
                  key={i}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    i < sample.slice(0, 5).length - 1 ? "border-b border-slate-100" : ""
                  } ${i % 2 === 1 ? "bg-slate-50/30" : ""}`}
                >
                  {Object.values(row).map((val, j) => (
                    <td
                      key={j}
                      className="px-4 py-2.5 text-slate-700 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
                    >
                      {String(val ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function Step1View({ data, onContinue }: Step1ViewProps) {
  if (!data || Object.keys(data).length === 0) {
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

  const isValid: boolean = data.A1_is_valid !== false;
  const reasoning: string = data.A1_reasoning ?? "";
  const metrics: Record<string, any> = data.A1_metrics ?? {};
  const charts: Record<string, any> = data.A1_charts ?? {};
  const highlights: Record<string, any> = data.A1_highlights ?? {};
  const quality: Record<string, any> = data.A1_data_quality ?? {};
  const sample = data.A1_sample;

  const platformDist: [string, number][] = Array.isArray(charts.platform_distribution)
    ? charts.platform_distribution.map(([a, b]: [any, any]) => [String(a), Number(b)])
    : [];
  const categoryDist: [string, number][] = Array.isArray(charts.category_distribution)
    ? charts.category_distribution.map(([a, b]: [any, any]) => [String(a), Number(b)])
    : [];
  const reviewTrend: [string, number][] = Array.isArray(charts.review_trend)
    ? charts.review_trend.map(([a, b]: [any, any]) => [String(a), Number(b)])
    : [];
  const ratingDist: [number, number][] = Array.isArray(charts.rating_distribution)
    ? charts.rating_distribution.map(([a, b]: [any, any]) => [Number(a), Number(b)])
    : [];

  const hasSampleRows = Array.isArray(sample) && sample.length > 0;
  const sampleStripped = typeof sample === "string" && sample.startsWith("<DataFrame");

  const hasCharts =
    platformDist.length > 0 ||
    categoryDist.length > 0 ||
    reviewTrend.length > 0 ||
    Object.keys(highlights).length > 0;

  const hasQuality = quality.schema_valid !== undefined || quality.format_valid !== undefined || quality.missing_data_ok !== undefined;

  return (
    <div className="space-y-7">

      {/* ── Status banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 shadow-[0_8px_30px_rgba(15,23,42,0.12)] border border-slate-800">
        {/* Mesh gradient overlay */}
        <div className={`absolute inset-0 opacity-60 ${
          isValid
            ? "bg-[radial-gradient(ellipse_60%_80%_at_85%_50%,rgba(16,185,129,0.25)_0%,transparent_70%),radial-gradient(ellipse_50%_70%_at_15%_50%,rgba(20,184,166,0.15)_0%,transparent_70%)]"
            : "bg-[radial-gradient(ellipse_60%_80%_at_85%_50%,rgba(239,68,68,0.25)_0%,transparent_70%),radial-gradient(ellipse_50%_70%_at_15%_50%,rgba(244,63,94,0.15)_0%,transparent_70%)]"
        }`} />
        {/* Dot grid texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Icon with multi-layer glow */}
            <div className="relative shrink-0">
              <div className={`absolute inset-0 rounded-2xl blur-xl opacity-60 ${isValid ? "bg-emerald-400" : "bg-red-400"}`} />
              <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-white/20 ${
                isValid
                  ? "bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600"
                  : "bg-gradient-to-br from-red-400 via-red-500 to-rose-600"
              }`}>
                {isValid ? (
                  <svg className="w-5 h-5 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`relative flex h-1.5 w-1.5`}>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isValid ? "bg-emerald-400" : "bg-red-400"}`} />
                  <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isValid ? "bg-emerald-400" : "bg-red-400"}`} />
                </span>
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isValid ? "text-emerald-300" : "text-red-300"}`}>
                  {isValid ? "Gate Cleared" : "Gate Blocked"}
                </p>
              </div>
              <p className="text-base font-bold text-white leading-tight tracking-tight">
                {isValid ? "Validation passed" : "Validation failed"}
              </p>
              <p className="text-[12px] text-slate-400 mt-0.5">
                {isValid ? "Dataset cleared for downstream agents" : "Resolve issues before continuing"}
              </p>
            </div>
          </div>

          {/* Agent badge */}
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 shadow-inner">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md">
              <span className="text-[9px] font-black text-amber-900">A1</span>
            </div>
            <div className="flex flex-col leading-none gap-0.5">
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">Agent</span>
              <span className="text-[11px] font-bold text-white tracking-tight">Gatekeeper</span>
            </div>
          </div>
        </div>
      </div>

      {!isValid && reasoning && (
        <div className="bg-red-50/60 border border-red-200/70 rounded-xl px-4 py-3">
          <p className="text-xs text-red-700 leading-relaxed">{reasoning}</p>
        </div>
      )}

      {/* ── Agent context box ── */}
      <div className="relative bg-gradient-to-br from-slate-50 via-white to-slate-50/40 border border-slate-200/80 rounded-2xl p-5 flex gap-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-slate-900/10 rounded-xl blur-md" />
          <div className="relative w-9 h-9 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center shadow-md ring-1 ring-slate-900/10">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 mb-1.5">What this agent does</p>
          <p className="text-[13px] text-slate-700 leading-relaxed">
            Gatekeeper validates schema integrity, checks for missing values, and generates distribution signals. Only clean, structured data proceeds to downstream agents — this is the quality gate.
          </p>
        </div>
      </div>

      {/* ── Metrics row ── */}
      {Object.keys(metrics).length > 0 && (
        <div className="space-y-4">
          {Number(metrics.total_reviews ?? 0) < 10 && (
            <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-amber-50/60 border border-amber-200/70 rounded-xl px-4 py-3 shadow-[0_1px_2px_rgba(217,119,6,0.05)]">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 ring-1 ring-amber-200/50">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-bold text-amber-900 leading-tight">Limited dataset size</p>
                <p className="text-[11px] text-amber-700/80 mt-0.5">Insights may not be statistically strong</p>
              </div>
            </div>
          )}
          <div>
            <SectionHeader label="Dataset snapshot" hint="Volume, breadth, coverage" />
            <div className="grid grid-cols-4 gap-3">
              {(
                [
                  {
                    label: "Total Records",
                    value: Number(metrics.total_reviews ?? 0).toLocaleString(),
                    iconGrad: "from-slate-700 to-slate-900",
                    glow: "bg-slate-900",
                    numberGrad: "from-slate-900 via-slate-800 to-slate-600",
                    cardBg: "from-white via-white to-slate-50/60",
                    iconPath: "M9 17v-2a4 4 0 014-4h2m-6 6v3a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 17H7a2 2 0 01-2-2V5a2 2 0 012-2h6a2 2 0 012 2v2",
                  },
                  {
                    label: "Active Cities",
                    value: metrics.cities ?? 0,
                    iconGrad: "from-sky-500 to-blue-600",
                    glow: "bg-blue-500",
                    numberGrad: "from-blue-700 via-blue-600 to-sky-500",
                    cardBg: "from-white via-blue-50/30 to-sky-50/40",
                    iconPath: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
                  },
                  {
                    label: "Source Platforms",
                    value: metrics.platforms ?? 0,
                    iconGrad: "from-violet-500 to-purple-600",
                    glow: "bg-violet-500",
                    numberGrad: "from-violet-700 via-violet-600 to-purple-500",
                    cardBg: "from-white via-violet-50/30 to-purple-50/40",
                    iconPath: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
                  },
                  {
                    label: "Product Categories",
                    value: metrics.categories ?? 0,
                    iconGrad: "from-emerald-500 to-teal-600",
                    glow: "bg-emerald-500",
                    numberGrad: "from-emerald-700 via-emerald-600 to-teal-500",
                    cardBg: "from-white via-emerald-50/30 to-teal-50/40",
                    iconPath: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
                  },
                ] as {
                  label: string;
                  value: string | number;
                  iconGrad: string;
                  glow: string;
                  numberGrad: string;
                  cardBg: string;
                  iconPath: string;
                }[]
              ).map(({ label, value, iconGrad, glow, numberGrad, cardBg, iconPath }) => (
                <div
                  key={label}
                  className={`group relative bg-gradient-to-br ${cardBg} border border-slate-200/70 rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.10)] hover:-translate-y-0.5 hover:border-slate-300/80 transition-all duration-300`}
                >
                  {/* Decorative blur orb in corner */}
                  <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${glow} opacity-[0.06] blur-2xl group-hover:opacity-[0.10] transition-opacity`} />

                  <div className="relative p-5">
                    {/* Icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${iconGrad} flex items-center justify-center shadow-md ring-1 ring-white/40`}>
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                        </svg>
                      </div>
                      <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>

                    {/* Number */}
                    <p className={`text-[2.25rem] font-black tracking-tighter tabular-nums leading-none mb-1.5 bg-gradient-to-br ${numberGrad} bg-clip-text text-transparent`}>
                      {value}
                    </p>

                    {/* Label */}
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Quality checks ── */}
      {hasQuality && <QualityChecks quality={quality} />}

      {/* ── Charts 2 × 2 ── */}
      {hasCharts && (
        <div className="space-y-4">
          <SectionHeader label="Distribution overview" hint="Volume, share, momentum" />
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-white to-slate-50/30 border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] transition-shadow">
              <BarChart data={platformDist} title="Platform Distribution" />
              {platformDist.length > 0 && (
                <p className="text-[10px] text-slate-400 mt-3 italic leading-relaxed">Review volume segmented by source platform</p>
              )}
            </div>
            <div className="bg-gradient-to-br from-white to-slate-50/30 border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] transition-shadow">
              <DonutChart data={categoryDist} title="Category Share" />
              {categoryDist.length > 0 && (
                <p className="text-[10px] text-slate-400 mt-3 italic leading-relaxed">Proportion of reviews across product categories</p>
              )}
            </div>
            <div className="bg-gradient-to-br from-white to-slate-50/30 border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] transition-shadow">
              <LineChart data={reviewTrend} title="Review Trend" />
              {reviewTrend.length > 0 && (
                <p className="text-[10px] text-slate-400 mt-3 italic leading-relaxed">Temporal activity pattern across the dataset window</p>
              )}
            </div>
            <div className="bg-gradient-to-br from-white to-slate-50/30 border border-slate-200/80 rounded-2xl p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] transition-shadow">
              <RatingChart data={ratingDist} title="Star Rating Distribution" />
              <p className="text-[10px] text-slate-400 mt-3 italic leading-relaxed">Sentiment polarity — skew signals priority for downstream agents</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            {[
              { label: "Top Platform", value: highlights.top_platform, iconBg: "from-blue-500 to-blue-400", ring: "ring-blue-100", iconPath: "M5 3h14M5 21h14M3 12h18M12 3v18" },
              { label: "Dominant Category", value: highlights.top_category, iconBg: "from-violet-500 to-violet-400", ring: "ring-violet-100", iconPath: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
              { label: "Peak Activity", value: highlights.peak_month, iconBg: "from-amber-500 to-amber-400", ring: "ring-amber-100", iconPath: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
            ]
              .filter((h) => h.value != null)
              .map(({ label, value, iconBg, ring, iconPath }) => (
                <div
                  key={label}
                  className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center gap-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${iconBg} flex items-center justify-center shrink-0 shadow-sm ring-4 ${ring}`}>
                    <svg className="w-[18px] h-[18px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-1">{label}</p>
                    <p className="text-sm font-bold text-slate-900 truncate">{String(value)}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── Sample data ── */}
      {hasSampleRows && <SampleDataTable sample={sample} />}

      {sampleStripped && (
        <div className="bg-slate-50/60 border border-slate-200/80 rounded-xl px-4 py-3">
          <p className="text-xs text-slate-500 italic leading-relaxed">
            Sample data is available in the backend ({sample}). Row-level preview is not available in this view.
          </p>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onContinue}
          disabled={!isValid || !onContinue}
          className={`group relative w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 overflow-hidden
            ${
              isValid && onContinue
                ? "bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-[0_4px_12px_rgba(15,23,42,0.15)] hover:shadow-[0_6px_20px_rgba(15,23,42,0.25)] hover:-translate-y-0.5"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
        >
          {isValid && onContinue && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          )}
          <span className="relative">Proceed to A2 — Context Intelligence</span>
          {isValid && onContinue && (
            <svg className="relative w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          )}
        </button>
        {!isValid && (
          <p className="text-[10px] text-red-500 text-center mt-2 font-medium">
            Fix dataset issues before continuing
          </p>
        )}
        {isValid && !onContinue && (
          <p className="text-[10px] text-slate-400 text-center mt-2">
            Waiting for Context Detection to begin…
          </p>
        )}
      </div>

    </div>
  );
}
