import type { DashboardData } from "@/lib/mock-data";

interface Props {
  language: DashboardData["language"];
}

/* Explicit static classes — Tailwind must see these at build time */
const SENTIMENT_STYLES = {
  negative: {
    bar: "bg-red-400",
    pill: "bg-red-50 text-red-600 border-red-200",
    dot: "bg-red-400",
  },
  positive: {
    bar: "bg-emerald-400",
    pill: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dot: "bg-emerald-400",
  },
  neutral: {
    bar: "bg-amber-400",
    pill: "bg-amber-50 text-amber-600 border-amber-200",
    dot: "bg-amber-400",
  },
};

export default function LanguageInsights({ language }: Props) {
  const maxUsage = Math.max(...language.map((l) => l.usage));

  return (
    <div className="w-80 shrink-0">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">
        Language Insights
      </p>
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-6">
        {/* Slang Frequency */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4">
            Slang Frequency
          </p>
          <div className="flex flex-col gap-4">
            {language.map((l) => {
              const s =
                SENTIMENT_STYLES[l.sentiment] ?? SENTIMENT_STYLES.neutral;
              return (
                <div key={l.slang} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {l.slang}
                    </code>
                    <span className="text-xs font-bold text-slate-500 tabular-nums">
                      {l.usage.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${s.bar}`}
                      style={{ width: `${(l.usage / maxUsage) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-100" />

        {/* Sentiment Mapping */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4">
            Sentiment Mapping
          </p>
          <div className="flex flex-col gap-3">
            {language.map((l) => {
              const s =
                SENTIMENT_STYLES[l.sentiment] ?? SENTIMENT_STYLES.neutral;
              return (
                <div key={l.slang} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
                    <code className="text-xs font-mono text-slate-600">
                      {l.slang}
                    </code>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${s.pill}`}
                  >
                    {l.sentiment}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
