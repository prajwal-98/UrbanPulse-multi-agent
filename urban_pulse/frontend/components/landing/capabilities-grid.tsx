const CAPABILITIES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    label: "Understand Reviews",
    desc: "Deep semantic analysis of raw customer feedback across Zepto, Blinkit, Swiggy Instamart, and BigBasket at scale.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    label: "Detect Hidden Patterns",
    desc: "Surface non-obvious trends across brands, cities, categories, and time windows that standard analytics miss.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
    label: "Analyze Local Language",
    desc: "Interpret regional slang, Gen Z signals, and hyperlocal colloquial patterns for accurate sentiment mapping.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: "Identify Revenue Risks",
    desc: "Quantify business impact in rupees before issues reach executive reporting — with confidence scores.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: "Root Cause Analysis",
    desc: "Go beyond symptoms. Understand why issues occur systematically — from cold chain failures to packaging gaps.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    label: "Recommend Leadership Actions",
    desc: "Generate boardroom-quality action plans with priority rankings — ready for executive decision-making.",
  },
];

export default function CapabilitiesGrid() {
  return (
    <section className="bg-slate-50 py-24 lg:py-32">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-4">
            Capabilities
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight max-w-lg">
            What the system does.
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 rounded-2xl overflow-hidden">
          {CAPABILITIES.map((cap) => (
            <div
              key={cap.label}
              className="group bg-white p-8 hover:bg-slate-50 transition-colors duration-150"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 mb-5 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                {cap.icon}
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-2 leading-snug">
                {cap.label}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{cap.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
