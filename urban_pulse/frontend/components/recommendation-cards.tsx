import type { DashboardDriver } from "@/lib/api";

interface Props {
  drivers: DashboardDriver[];
}

const STYLES: Record<string, {
  topBorder: string;
  badge: string;
  number: string;
  arrow: string;
}> = {
  High: {
    topBorder: "border-t-red-500",
    badge: "bg-red-50 text-red-600 border-red-200",
    number: "bg-red-50 text-red-600 border-red-200",
    arrow: "text-red-400 group-hover:text-red-600",
  },
  Medium: {
    topBorder: "border-t-amber-500",
    badge: "bg-amber-50 text-amber-600 border-amber-200",
    number: "bg-amber-50 text-amber-600 border-amber-200",
    arrow: "text-amber-400 group-hover:text-amber-600",
  },
  Low: {
    topBorder: "border-t-emerald-500",
    badge: "bg-emerald-50 text-emerald-600 border-emerald-200",
    number: "bg-emerald-50 text-emerald-600 border-emerald-200",
    arrow: "text-emerald-400 group-hover:text-emerald-600",
  },
};

export default function RecommendationCards({ drivers: rawDrivers }: Props) {
  const drivers = rawDrivers ?? [];
  if (!drivers.length) return null;
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">
        Recommended Actions
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {drivers.slice(0, 3).map((driver, i) => {
          const s = STYLES[driver.impact ?? ""] ?? STYLES.Medium;
          return (
            <div
              key={i}
              className={`group bg-white rounded-xl border border-slate-200 border-t-[3px] ${s.topBorder} p-7 flex flex-col justify-between gap-5 min-h-[220px] hover:shadow-sm transition-shadow duration-150 cursor-pointer`}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`w-9 h-9 rounded-lg border flex items-center justify-center text-sm font-bold ${s.number}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {driver.impact && (
                    <span
                      className={`px-2.5 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${s.badge}`}
                    >
                      {driver.impact}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-900 leading-snug mb-2">
                    {driver.title}
                  </h3>
                  {driver.recommendation && (
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {driver.recommendation}
                    </p>
                  )}
                </div>
              </div>

              <div
                className={`flex items-center gap-1.5 text-xs font-semibold transition-colors duration-150 ${s.arrow}`}
              >
                Take action
                <span className="transition-transform duration-150 group-hover:translate-x-0.5">
                  → Proceed to {driver.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
