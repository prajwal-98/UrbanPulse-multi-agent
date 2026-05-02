const STEPS = [
  {
    agent: "—",
    label: "Upload Data",
    desc: "CSV or Excel of customer reviews",
    accent: false,
  },
  {
    agent: "A1",
    label: "Validate",
    desc: "Schema check & quality score",
    accent: false,
  },
  {
    agent: "A2",
    label: "Detect Context",
    desc: "Platform, brand, city, category",
    accent: false,
  },
  {
    agent: "A3–A4",
    label: "Map & Cluster",
    desc: "Semantic patterns & issue groups",
    accent: false,
  },
  {
    agent: "A5–A6",
    label: "Escalate & Compare",
    desc: "Revenue risk & platform signals",
    accent: false,
  },
  {
    agent: "A7",
    label: "Novelty Score",
    desc: "Emerging language & trend signals",
    accent: false,
  },
  {
    agent: "A8",
    label: "Final Dashboard",
    desc: "Executive intelligence, ready to act",
    accent: true,
  },
];

function Arrow() {
  return (
    <div className="hidden lg:flex items-center justify-center w-8 shrink-0 text-slate-300">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </div>
  );
}

export default function WorkflowStrip() {
  return (
    <section className="bg-white py-24 lg:py-32 border-y border-slate-100">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4">
            How it works
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight max-w-lg">
            Eight agents.
            <br />
            One complete picture.
          </h2>
        </div>

        {/* Workflow */}
        <div className="flex flex-col lg:flex-row items-start lg:items-stretch gap-3 lg:gap-0">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex items-start lg:items-stretch gap-3 lg:gap-0 flex-1">
              {/* Step card */}
              <div
                className={`flex-1 rounded-xl border p-5 flex flex-col gap-2 transition-colors
                  ${
                    step.accent
                      ? "bg-slate-900 border-slate-900"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
              >
                {/* Agent badge */}
                <span
                  className={`inline-flex items-center self-start px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider
                    ${
                      step.accent
                        ? "bg-white/10 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                >
                  {step.agent}
                </span>
                <span
                  className={`text-sm font-bold leading-snug ${
                    step.accent ? "text-white" : "text-slate-900"
                  }`}
                >
                  {step.label}
                </span>
                <span
                  className={`text-xs leading-relaxed ${
                    step.accent ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {step.desc}
                </span>
              </div>
              {/* Arrow connector */}
              {i < STEPS.length - 1 && <Arrow />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
