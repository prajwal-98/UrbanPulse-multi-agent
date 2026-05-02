import type { DashboardHeroAlert, DashboardKPIs, DashboardDriver } from "@/lib/api";

const DRIVER_STYLE = [
  "bg-red-50 border-red-200 text-red-700",
  "bg-amber-50 border-amber-200 text-amber-700",
  "bg-slate-50 border-slate-200 text-slate-600",
];
const DRIVER_DOT = ["bg-red-500", "bg-amber-500", "bg-emerald-500"];

interface Props {
  heroAlert: DashboardHeroAlert | null;
  kpis: DashboardKPIs | null;
  drivers: DashboardDriver[];
}

export default function HeroAlert({ heroAlert, kpis, drivers: rawDrivers }: Props) {
  const drivers = rawDrivers ?? [];
  return (
    <section className="bg-white rounded-2xl border border-red-200 overflow-hidden">
      <div className="h-[3px] bg-gradient-to-r from-red-600 via-red-500 to-red-400" />

      <div className="px-8 pt-7 pb-8 lg:px-10 lg:pt-8 lg:pb-9">
        {/* Meta row */}
        <div className="flex items-center gap-2.5 mb-8">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-red-600">
            Business Alert
          </span>
        </div>

        {/* Hero content */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-start">
          <div>
            {kpis?.revenue_at_risk && (
              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-6xl lg:text-7xl font-bold text-red-600 tracking-tight leading-none">
                  {kpis.revenue_at_risk}
                </span>
                <span className="text-xl font-medium text-slate-600 leading-none pb-1">
                  revenue at risk
                </span>
              </div>
            )}
            {heroAlert?.subtitle && (
              <p className="text-lg font-medium text-slate-600 leading-relaxed max-w-2xl">
                {heroAlert.subtitle}
              </p>
            )}
            {heroAlert?.title && !heroAlert.subtitle && (
              <p className="text-2xl font-semibold text-slate-800">
                {heroAlert.title}
              </p>
            )}
          </div>

          {/* Signal drivers */}
          {drivers.length > 0 && (
            <div className="flex flex-col gap-2 min-w-[240px] pt-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
                Signal Drivers
              </p>
              {drivers.map((driver, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border text-xs font-medium leading-snug ${DRIVER_STYLE[i] ?? DRIVER_STYLE[2]}`}
                >
                  <span
                    className={`mt-[3px] w-1.5 h-1.5 rounded-full flex-shrink-0 ${DRIVER_DOT[i] ?? DRIVER_DOT[2]}`}
                  />
                  {driver.title}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer stats strip */}
        {kpis && (
          <div className="mt-8 bg-slate-50 rounded-xl px-6 py-4 flex flex-wrap items-center gap-6">
            {kpis.affected_customers && (
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-amber-600 tracking-tight tabular-nums">
                  {kpis.affected_customers}
                </span>
                <span className="text-sm font-medium text-slate-400">
                  customers affected
                </span>
              </div>
            )}
            {kpis.affected_customers && kpis.top_issue && (
              <div className="w-px h-5 bg-slate-200" />
            )}
            {kpis.top_issue && (
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  {kpis.top_issue}
                </span>
                <span className="text-sm font-medium text-slate-400">
                  top issue
                </span>
              </div>
            )}
            {kpis.top_opportunity && (
              <>
                <div className="w-px h-5 bg-slate-200" />
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-emerald-600 tracking-tight">
                    {kpis.top_opportunity}
                  </span>
                  <span className="text-sm font-medium text-slate-400">
                    top opportunity
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
