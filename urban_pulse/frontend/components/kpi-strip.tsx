import type { DashboardKPIs } from "@/lib/api";

interface Props {
  kpis: DashboardKPIs | null;
}

interface KpiCardProps {
  label: string;
  value: string | null;
  sub: string;
  accent: "red" | "green" | "amber" | "slate";
  badge?: string;
  trend?: "up" | "down" | "none";
}

const VALUE_COLOR = {
  red: "text-red-600",
  green: "text-emerald-600",
  amber: "text-amber-600",
  slate: "text-slate-900",
};
const TOP_BORDER = {
  red: "border-t-red-500",
  green: "border-t-emerald-500",
  amber: "border-t-amber-500",
  slate: "border-t-slate-400",
};
const BADGE_COLOR = {
  red: "bg-red-50 text-red-600 border-red-200 ring-red-100",
  green: "bg-emerald-50 text-emerald-600 border-emerald-200 ring-emerald-100",
  amber: "bg-amber-50 text-amber-600 border-amber-200 ring-amber-100",
  slate: "bg-slate-50 text-slate-600 border-slate-200 ring-slate-100",
};

function KpiCard({ label, value, sub, accent, badge, trend = "none" }: KpiCardProps) {
  if (!value) return null;
  return (
    <div
      className={`group bg-white rounded-xl border border-slate-200 border-t-[3px] ${TOP_BORDER[accent]} p-7 flex flex-col gap-1.5 hover:shadow-sm transition-shadow duration-150`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          {label}
        </span>
        {trend !== "none" && (
          <span
            className={`text-xs font-bold ${
              trend === "up" ? "text-red-500" : "text-emerald-500"
            }`}
          >
            {trend === "up" ? "↑" : "↓"}
          </span>
        )}
      </div>

      <div className="flex items-end gap-2.5 mt-1">
        <span
          className={`text-4xl font-bold tracking-tight leading-none ${VALUE_COLOR[accent]}`}
        >
          {value}
        </span>
        {badge && (
          <span
            className={`mb-0.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ring-2 ${BADGE_COLOR[accent]}`}
          >
            {badge}
          </span>
        )}
      </div>

      <span className="text-sm text-slate-500 mt-1 leading-snug">{sub}</span>
    </div>
  );
}

export default function KpiStrip({ kpis }: Props) {
  if (!kpis) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        label="Revenue at Risk"
        value={kpis.revenue_at_risk}
        sub="Estimated erosion from delivery quality failures"
        accent="red"
        trend="up"
      />
      <KpiCard
        label="Top Opportunity"
        value={kpis.top_opportunity}
        sub="Highest-impact corrective action available now"
        accent="green"
        trend="down"
      />
      <KpiCard
        label="Customers Affected"
        value={kpis.affected_customers}
        sub="Unique customers impacted by reported issues"
        accent="amber"
      />
      <KpiCard
        label="Top Issue"
        value={kpis.top_issue}
        sub="Primary driver of negative sentiment in dataset"
        accent="slate"
        badge="Priority"
        trend="up"
      />
    </div>
  );
}
