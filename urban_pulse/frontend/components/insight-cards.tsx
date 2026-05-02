import type { DashboardTimeInsights } from "@/lib/api";

interface Props {
  timeInsights: DashboardTimeInsights | null;
}

const CARD = "bg-white rounded-xl border border-slate-200 p-6";
const CARD_LABEL = "text-xs font-bold uppercase tracking-widest text-emerald-600 mb-5";

function TimeInsight({ time }: { time: DashboardTimeInsights }) {
  return (
    <div className={CARD}>
      <p className={CARD_LABEL}>Time Insight</p>

      {time.peak_window && (
        <div className="mb-5">
          <p className="text-xs text-slate-400 font-medium mb-1">Peak window</p>
          <p className="text-2xl font-bold text-red-600 tracking-tight">
            {time.peak_window}
          </p>
        </div>
      )}

      {time.peak_multiplier && (
        <div className="mt-3 px-4 py-3.5 rounded-lg bg-amber-50 border border-amber-200">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-lg font-bold text-amber-700">
              {time.peak_multiplier}×
            </span>
            <span className="text-xs font-semibold text-amber-700">
              above baseline
            </span>
          </div>
          {time.context && (
            <p className="text-xs text-amber-600 leading-relaxed">
              {time.context}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function InsightCards({ timeInsights }: Props) {
  if (!timeInsights) return null;
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">
        Insight Breakdown
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TimeInsight time={timeInsights} />
      </div>
    </div>
  );
}
