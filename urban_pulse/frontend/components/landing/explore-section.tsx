const EXAMPLES = [
  {
    category: "Platform Comparison",
    title: "Zepto vs Blinkit delivery performance",
    desc: "Surface complaint volume, sentiment delta, and operational gaps across both platforms in the Ice Cream category.",
    signal: "34% more melt complaints on Blinkit vs Zepto",
    tag: "Competitive Intelligence",
  },
  {
    category: "Brand Analysis",
    title: "Amul vs Mother Dairy quality signals",
    desc: "Compare brand-level sentiment, issue frequency, and customer retention risk across major dairy brands.",
    signal: "Amul leads in mentions · Mother Dairy recovers faster",
    tag: "Brand Intelligence",
  },
  {
    category: "Regional Intelligence",
    title: "Bangalore vs Mumbai complaint patterns",
    desc: "Detect city-level differences in issue type, peak complaint hours, and delivery expectation gaps.",
    signal: "Bangalore 2.4× more complaints in 2PM–6PM window",
    tag: "Geographic Signals",
  },
  {
    category: "Language Detection",
    title: "Gen Z & hyperlocal language signals",
    desc: "Identify regional slang, colloquial expressions, and new vocabulary that standard NLP tools miss.",
    signal: "\"pighal gaya\" · 847 mentions · Negative signal",
    tag: "Language Intelligence",
  },
  {
    category: "Operational Risk",
    title: "Frozen food cold chain failure patterns",
    desc: "Root cause analysis of delivery temperature failures, cold-bag non-compliance, and SLA breach patterns.",
    signal: "Cold chain failure in 42% of peak-hour Ice Cream orders",
    tag: "Risk Analysis",
  },
  {
    category: "Revenue Impact",
    title: "Revenue leakage from repeat complaints",
    desc: "Quantify how recurring quality failures translate into churn, review suppression, and revenue erosion.",
    signal: "₹75L estimated erosion · 28% churn risk",
    tag: "Business Impact",
  },
];

const TAG_COLORS: Record<string, string> = {
  "Competitive Intelligence": "bg-blue-50 text-blue-600 border-blue-200",
  "Brand Intelligence":       "bg-purple-50 text-purple-600 border-purple-200",
  "Geographic Signals":       "bg-amber-50 text-amber-600 border-amber-200",
  "Language Intelligence":    "bg-emerald-50 text-emerald-600 border-emerald-200",
  "Risk Analysis":            "bg-red-50 text-red-600 border-red-200",
  "Business Impact":          "bg-red-50 text-red-600 border-red-200",
};

export default function ExploreSection() {
  return (
    <section className="bg-slate-50 py-24 lg:py-32">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4">
            Explore
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight max-w-xl">
            What you can discover.
          </h2>
          <p className="mt-4 text-base text-slate-500 max-w-md leading-relaxed">
            Every analysis unlocks a new layer of intelligence. Here are examples
            of what UrbanPulse surfaces from real data.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXAMPLES.map((ex) => (
            <div
              key={ex.title}
              className="group bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-4 hover:shadow-sm hover:border-slate-300 transition-all duration-150 cursor-pointer"
            >
              {/* Tag */}
              <span
                className={`self-start px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                  TAG_COLORS[ex.tag] ?? "bg-slate-100 text-slate-500 border-slate-200"
                }`}
              >
                {ex.tag}
              </span>

              {/* Content */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">
                  {ex.category}
                </p>
                <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2.5">
                  {ex.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {ex.desc}
                </p>
              </div>

              {/* Signal finding */}
              <div className="mt-auto pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-700 font-mono">
                  → {ex.signal}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
