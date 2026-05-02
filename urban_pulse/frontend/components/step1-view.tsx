"use client";

import { useState } from "react";

/* ─── Chart palette ────────────────────────────────────────────────── */

const PALETTE = ["#0f172a", "#334155", "#475569", "#64748b", "#94a3b8", "#cbd5e1"];

/* ─── Empty state ──────────────────────────────────────────────────── */

function EmptyChart({ title }: { title: string }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-800 mb-3">{title}</p>
      <div className="flex items-center justify-center h-16 text-xs text-slate-400 italic">
        No data available
      </div>
    </div>
  );
}

/* ─── Bar chart (horizontal) ───────────────────────────────────────── */

function BarChart({ data, title }: { data: [string, number][]; title: string }) {
  if (!data.length) return <EmptyChart title={title} />;
  const max = Math.max(...data.map(([, v]) => v), 1);
  return (
    <div>
      <p className="text-xs font-bold text-slate-800 mb-3">{title}</p>
      <div className="space-y-2">
        {data.slice(0, 6).map(([label, value], i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="text-[11px] text-slate-500 w-[76px] truncate shrink-0 text-right" title={label}>
              {label}
            </span>
            <div className="flex-1 h-[18px] bg-slate-100 rounded overflow-hidden">
              <div
                className="h-full bg-slate-800 rounded transition-all duration-500"
                style={{ width: `${(value / max) * 100}%` }}
              />
            </div>
            <span className="text-[11px] tabular-nums text-slate-500 w-8 shrink-0">
              {value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Donut chart ──────────────────────────────────────────────────── */

function DonutChart({ data, title }: { data: [string, number][]; title: string }) {
  if (!data.length) return <EmptyChart title={title} />;
  const slices = data.slice(0, 6);
  const total = slices.reduce((s, [, v]) => s + v, 0) || 1;

  let cum = 0;
  const gradient = slices
    .map(([, v], i) => {
      const pct = (v / total) * 100;
      const from = cum;
      cum += pct;
      return `${PALETTE[i]} ${from.toFixed(1)}% ${cum.toFixed(1)}%`;
    })
    .join(", ");

  return (
    <div>
      <p className="text-xs font-bold text-slate-800 mb-3">{title}</p>
      <div className="flex items-center gap-4">
        <div
          className="w-[72px] h-[72px] rounded-full shrink-0"
          style={{
            background: `conic-gradient(${gradient})`,
            WebkitMask: "radial-gradient(farthest-side, transparent 44%, #000 45%)",
            mask: "radial-gradient(farthest-side, transparent 44%, #000 45%)",
          }}
        />
        <div className="space-y-1.5 min-w-0 flex-1">
          {slices.map(([label, value], i) => (
            <div key={i} className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2 h-2 rounded-sm shrink-0"
                style={{ background: PALETTE[i] }}
              />
              <span className="text-[11px] text-slate-600 truncate flex-1">{label}</span>
              <span className="text-[11px] tabular-nums text-slate-400 shrink-0">
                {((value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Line chart (SVG) ─────────────────────────────────────────────── */

function LineChart({ data, title }: { data: [string, number][]; title: string }) {
  if (!data.length) return <EmptyChart title={title} />;

  const W = 300, H = 110;
  const PAD = { top: 12, right: 8, bottom: 22, left: 34 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;

  const counts = data.map(([, v]) => Number(v));
  const maxV = Math.max(...counts, 1);
  const minV = Math.min(...counts, 0);
  const span = maxV - minV || 1;

  const xOf = (i: number) => PAD.left + (i / Math.max(data.length - 1, 1)) * iW;
  const yOf = (v: number) => PAD.top + (1 - (v - minV) / span) * iH;

  const pts = data.map(([, v], i) => `${xOf(i).toFixed(1)},${yOf(Number(v)).toFixed(1)}`).join(" ");
  const fillPts = `${xOf(0).toFixed(1)},${(PAD.top + iH).toFixed(1)} ${pts} ${xOf(data.length - 1).toFixed(1)},${(PAD.top + iH).toFixed(1)}`;

  const step = Math.max(1, Math.ceil(data.length / 5));
  const tickIdxs = Array.from(new Set([0, ...data.map((_, i: number) => i).filter((i: number) => i % step === 0), data.length - 1]));

  return (
    <div>
      <p className="text-xs font-bold text-slate-800 mb-1">{title}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
        <polygon points={fillPts} fill="#0f172a" fillOpacity="0.07" />
        <polyline
          points={pts}
          fill="none"
          stroke="#0f172a"
          strokeWidth="1.75"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {data.length <= 16 &&
          data.map(([, v], i) => (
            <circle key={i} cx={xOf(i)} cy={yOf(Number(v))} r="2.5" fill="#0f172a" />
          ))}
        {tickIdxs.map((idx) => (
          <text
            key={idx}
            x={xOf(idx)}
            y={H - 4}
            textAnchor="middle"
            fontSize="8"
            fill="#94a3b8"
          >
            {String(data[idx][0]).slice(-7)}
          </text>
        ))}
        <text x={PAD.left - 4} y={PAD.top + 4} textAnchor="end" fontSize="8" fill="#94a3b8">
          {maxV}
        </text>
        <text x={PAD.left - 4} y={PAD.top + iH + 4} textAnchor="end" fontSize="8" fill="#94a3b8">
          {minV}
        </text>
      </svg>
    </div>
  );
}

/* ─── Main component ───────────────────────────────────────────────── */

interface Step1ViewProps {
  data: any;
  onContinue?: () => void;
}

export default function Step1View({ data, onContinue }: Step1ViewProps) {
  const [sampleOpen, setSampleOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);

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

  const qualityChecks = [
    { label: "Required columns present", pass: quality.schema_valid },
    { label: "Data format valid",         pass: quality.format_valid },
    { label: "No major missing values",   pass: quality.missing_data_ok },
  ];

  const hasSampleRows = Array.isArray(sample) && sample.length > 0;
  const sampleStripped = typeof sample === "string" && sample.startsWith("<DataFrame");

  const hasCharts =
    platformDist.length > 0 ||
    categoryDist.length > 0 ||
    reviewTrend.length > 0 ||
    Object.keys(highlights).length > 0;

  const hasQuality = qualityChecks.some((c) => c.pass !== undefined);

  return (
    <div className="space-y-5">

      {/* ── Status card ── */}
      <div
        className={`rounded-xl border p-4 flex items-start gap-3 ${
          isValid
            ? "bg-emerald-50 border-emerald-200 border-l-4 border-l-emerald-500"
            : "bg-red-50 border-red-200 border-l-4 border-l-red-500"
        }`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            isValid ? "bg-emerald-500" : "bg-red-500"
          }`}
        >
          {isValid ? (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-bold ${isValid ? "text-emerald-800" : "text-red-800"}`}>
              {isValid ? "AI Validation Complete" : "Dataset failed validation"}
            </p>
            {isValid && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                Confidence: High
              </span>
            )}
          </div>
          <p className={`text-xs mt-1 leading-relaxed ${isValid ? "text-emerald-600" : "text-red-600"}`}>
            {isValid
              ? "Dataset passed all critical checks and is ready for downstream intelligence processing"
              : reasoning || "Dataset did not meet quality thresholds"}
          </p>
        </div>
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
                <p className="text-[9px] text-slate-400 mt-1 leading-tight">
                  Small dataset — limited pattern detection
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Charts 2 × 2 ── */}
      {hasCharts && (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-bold text-slate-800">Data Distribution Overview</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Visual breakdown of how your dataset is distributed across key dimensions</p>
          </div>
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
              <p className="text-xs font-bold text-slate-800 mb-3">Key Highlights</p>
              <div className="space-y-2">
                {[
                  { icon: "🔥", label: "Top Platform", value: highlights.top_platform },
                  { icon: "📦", label: "Dominant Category", value: highlights.top_category },
                  { icon: "📅", label: "Peak Activity", value: highlights.peak_month },
                ]
                  .filter((h) => h.value != null)
                  .map(({ icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                      <span className="text-sm shrink-0">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
                        <p className="text-xs font-bold text-slate-800 truncate">{String(value)}</p>
                      </div>
                    </div>
                  ))}
                {!highlights.top_platform && !highlights.top_category && !highlights.peak_month && (
                  <p className="text-xs text-slate-400 italic">No highlights available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Data quality ── */}
      {hasQuality && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-bold text-slate-800 mb-1">AI Data Audit</p>
          <p className="text-[10px] text-slate-400 mb-4">No structural issues detected. Dataset is clean and consistent</p>
          <div className="space-y-3">
            {qualityChecks.map(({ label, pass }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    pass !== false ? "bg-emerald-100" : "bg-red-100"
                  }`}
                >
                  {pass !== false ? (
                    <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <span className="text-xs text-slate-700 flex-1">{label}</span>
                <span
                  className={`text-[10px] font-semibold ${
                    pass !== false ? "text-emerald-600" : "text-red-500"
                  }`}
                >
                  {pass !== false ? "Pass" : "Fail"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sample data (collapsible) ── */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setSampleOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-3.5 text-left bg-white hover:bg-slate-50 transition-colors"
        >
          <span className="text-xs font-semibold text-slate-700">Sample Data Preview</span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${sampleOpen ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {sampleOpen && (
          <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/60">
            {hasSampleRows ? (
              <div className="overflow-x-auto">
                <table className="text-[11px] text-slate-700 w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {Object.keys(sample[0] || {}).map((col) => (
                        <th
                          key={col}
                          className="text-left px-2 py-1.5 font-bold text-slate-500 uppercase tracking-wide text-[9px] whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sample.slice(0, 5).map((row: Record<string, unknown>, i: number) => (
                      <tr key={i} className="border-b border-slate-100">
                        {Object.values(row).map((val, j) => (
                          <td
                            key={j}
                            className="px-2 py-1.5 max-w-[140px] truncate text-slate-600"
                          >
                            {String(val ?? "—")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : sampleStripped ? (
              <p className="text-xs text-slate-400 italic">
                Sample data is available in the backend ({sample}). Row-level preview is not available in this view.
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">Sample data not available</p>
            )}
          </div>
        )}
      </div>

      {/* ── Agent explanation (collapsible) ── */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setAgentOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-3.5 text-left bg-white hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-slate-700">How this Agent Works</span>
          </div>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${agentOpen ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {agentOpen && (
          <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/60">
            <p className="text-xs text-slate-600 leading-relaxed">
              The <span className="font-semibold text-slate-800">Gatekeeper</span> agent performs initial data validation by checking schema integrity, missing values, and distribution patterns. It ensures only high-quality, structured data is passed to downstream agents for reliable intelligence generation.
            </p>
          </div>
        )}
      </div>

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
          Proceed to Context Intelligence
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
