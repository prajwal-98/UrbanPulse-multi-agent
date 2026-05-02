const VALUES = [
  {
    num: "01",
    headline: "Revenue Risk Detection",
    body: "Identify and quantify financial exposure from quality failures before they appear in quarterly earnings. Move from reactive to predictive.",
    accent: "red",
  },
  {
    num: "02",
    headline: "Platform Failure Intelligence",
    body: "Know which platforms are underperforming — and exactly why — before your brand team hears about it from customers or press.",
    accent: "amber",
  },
  {
    num: "03",
    headline: "Brand Opportunity Discovery",
    body: "Surface unmet customer expectations and competitive white spaces that traditional brand tracking tools miss entirely.",
    accent: "emerald",
  },
  {
    num: "04",
    headline: "Customer Churn Prevention",
    body: "Detect and act on churn signals weeks before they register in cohort reports. Retain high-LTV customers before competitive migration.",
    accent: "blue",
  },
  {
    num: "05",
    headline: "Faster Executive Decisions",
    body: "Replace manual analysis cycles with real-time intelligence synthesis. From data upload to boardroom-ready insight in minutes.",
    accent: "emerald",
  },
];

const ACCENT_STYLES: Record<string, { num: string; bar: string }> = {
  red:     { num: "text-red-500",     bar: "bg-red-500" },
  amber:   { num: "text-amber-500",   bar: "bg-amber-500" },
  emerald: { num: "text-emerald-500", bar: "bg-emerald-500" },
  blue:    { num: "text-blue-500",    bar: "bg-blue-500" },
};

export default function ValueSection() {
  return (
    <section className="bg-white py-24 lg:py-32 border-y border-slate-100">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-16 lg:gap-24 items-start">
          {/* Left — sticky header */}
          <div className="lg:sticky lg:top-12">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4">
              Why it matters
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
              The business
              <br />
              case for
              <br />
              intelligence.
            </h2>
            <p className="text-base text-slate-500 leading-relaxed">
              UrbanPulse isn&apos;t a reporting tool. It&apos;s an intelligence
              layer that changes how leadership teams make decisions about
              customers, platforms, and products.
            </p>
          </div>

          {/* Right — value props */}
          <div className="flex flex-col gap-0 divide-y divide-slate-100">
            {VALUES.map((v) => {
              const a = ACCENT_STYLES[v.accent] ?? ACCENT_STYLES.emerald;
              return (
                <div key={v.num} className="py-7 flex gap-5 group">
                  <span className={`text-xs font-bold tabular-nums mt-0.5 shrink-0 ${a.num}`}>
                    {v.num}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                      {v.headline}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {v.body}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
