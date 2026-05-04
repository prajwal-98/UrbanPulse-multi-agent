"use client";

import { BarChart, DonutChart, LineChart, RatingChart } from "@/components/steps/step1-charts";

interface Step1ViewProps {
  data: any;
  onContinue?: () => void;
}

function QualityChecks({ quality }: { quality: Record<string, any> }) {
  const qualityChecks = [
    { label: "Required columns present", pass: quality.schema_valid },
    { label: "Data format valid",         pass: quality.format_valid },
    { label: "No major missing values",   pass: quality.missing_data_ok },
  ];

  return (
    <>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Quality checks</p>
      <div className="flex gap-3">
        {qualityChecks.map(({ label, pass }) => {
          const isPassed = pass === true;
          const isFailed = pass === false;
          const nullRate = label === "No major missing values" && quality.null_rate ? ` — ${(quality.null_rate * 100).toFixed(1)}% null rate` : "";
          const statusText = isPassed ? "Passed" : isFailed ? "Failed" : "Unknown";
          const statusColor = isPassed ? "text-emerald-600" : isFailed ? "text-red-600" : "text-slate-400";

          return (
            <div key={label} className="bg-white border border-slate-200 rounded-xl p-3 flex-1 flex items-center gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isPassed ? "bg-emerald-100" : isFailed ? "bg-red-100" : "bg-slate-100"
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
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-600">{label}</p>
                <p className={`text-[11px] font-semibold ${statusColor}`}>
                  {isPassed && nullRate ? `${statusText}${nullRate}` : statusText}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function SampleDataTable({ sample }: { sample: any[] }) {
  return (
    <>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Sample data preview</p>
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50">
              {Object.keys(sample[0] || {}).map((col) => (
                <th
                  key={col}
                  className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sample.slice(0, 5).map((row: Record<string, unknown>, i: number) => (
              <tr key={i} className={`hover:bg-slate-50 ${i < sample.slice(0, 5).length - 1 ? "border-b border-slate-100" : ""}`}>
                {Object.values(row).map((val, j) => (
                  <td
                    key={j}
                    className="px-3 py-2 text-slate-700 max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    {String(val ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
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
    <div className="space-y-5">

      {/* ── Status banner ── */}
      <div className={`border rounded-lg px-4 py-3 flex items-center justify-between ${
        isValid ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isValid ? "bg-emerald-500" : "bg-red-500"}`} />
          <p className={`text-xs font-semibold ${isValid ? "text-emerald-800" : "text-red-800"}`}>
            {isValid ? "Validation passed" : "Validation failed"}
          </p>
        </div>
        <span className="text-[10px] font-semibold text-slate-500">A1 · Gatekeeper</span>
      </div>

      {!isValid && reasoning && (
        <p className="text-xs text-red-600 leading-relaxed">{reasoning}</p>
      )}

      {/* ── Agent context box ── */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3">
        <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Gatekeeper validates schema integrity, checks for missing values, and generates distribution signals. Only clean, structured data proceeds to downstream agents — this is the quality gate.
        </p>
      </div>

      {/* ── Metrics row ── */}
      {Object.keys(metrics).length > 0 && (
        <>
          {Number(metrics.total_reviews ?? 0) < 10 && (
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span className="text-base shrink-0">⚠️</span>
              <p className="text-xs text-amber-700 font-medium">
                Limited dataset size — insights may not be statistically strong
              </p>
            </div>
          )}
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Dataset snapshot</p>
          <div className="grid grid-cols-4 gap-3">
            {(
              [
                { label: "Total Records",     value: Number(metrics.total_reviews ?? 0).toLocaleString() },
                { label: "Active Cities",     value: metrics.cities ?? 0 },
                { label: "Source Platforms",  value: metrics.platforms ?? 0 },
                { label: "Product Categories", value: metrics.categories ?? 0 },
              ] as { label: string; value: string | number }[]
            ).map(({ label, value }) => (
              <div
                key={label}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center"
              >
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                  {label}
                </p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Quality checks ── */}
      {hasQuality && <QualityChecks quality={quality} />}

      {/* ── Charts 2 × 2 ── */}
      {hasCharts && (
        <div className="space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Distribution overview</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <BarChart data={platformDist} title="Platform Distribution" />
              {platformDist.length > 0 && (
                <p className="text-[10px] text-slate-400 mt-2 italic">Review volume segmented by source platform</p>
              )}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <DonutChart data={categoryDist} title="Category Share" />
              {categoryDist.length > 0 && (
                <p className="text-[10px] text-slate-400 mt-2 italic">Proportion of reviews across product categories</p>
              )}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <LineChart data={reviewTrend} title="Review Trend" />
              {reviewTrend.length > 0 && (
                <p className="text-[10px] text-slate-400 mt-2 italic">Temporal activity pattern across the dataset window</p>
              )}
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <RatingChart data={ratingDist} title="Star Rating Distribution" />
              <p className="text-[10px] text-slate-400 mt-2 italic">Sentiment polarity — skew signals priority for downstream agents</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-800 mb-3">Key Highlights</p>
            <div className="space-y-3">
              {[
                { label: "Top Platform", sub: "Highest review volume", value: highlights.top_platform, badgeColor: "bg-blue-100 text-blue-700" },
                { label: "Dominant Category", sub: "Most reviewed product type", value: highlights.top_category, badgeColor: "bg-purple-100 text-purple-700" },
                { label: "Peak Activity", sub: "Highest review density", value: highlights.peak_month, badgeColor: "bg-amber-100 text-amber-700" },
              ]
                .filter((h) => h.value != null)
                .map(({ label, sub, value, badgeColor }) => (
                  <div key={label} className="flex items-center justify-between gap-3 py-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">{label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
                    </div>
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${badgeColor}`}>
                      {String(value)}
                    </div>
                  </div>
                ))}
              {!highlights.top_platform && !highlights.top_category && !highlights.peak_month && (
                <p className="text-xs text-slate-400 italic">No highlights available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Sample data ── */}
      {hasSampleRows && <SampleDataTable sample={sample} />}

      {sampleStripped && (
        <p className="text-xs text-slate-400 italic">
          Sample data is available in the backend ({sample}). Row-level preview is not available in this view.
        </p>
      )}

      {/* ── CTA ── */}
      <div className="pt-1">
        <button
          type="button"
          onClick={onContinue}
          disabled={!isValid || !onContinue}
          className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-150 flex items-center justify-center gap-2
            ${
              isValid && onContinue
                ? "bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow-md"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
        >
          Proceed to A2 — Context Intelligence →
          {isValid && onContinue && (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          )}
        </button>
        {!isValid && (
          <p className="text-[10px] text-red-500 text-center mt-1.5">
            Fix dataset issues before continuing
          </p>
        )}
        {isValid && !onContinue && (
          <p className="text-[10px] text-slate-400 text-center mt-1.5">
            Waiting for Context Detection to begin…
          </p>
        )}
      </div>

    </div>
  );
}
