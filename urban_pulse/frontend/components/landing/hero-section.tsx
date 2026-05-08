"use client";

import { useRouter } from "next/navigation";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function HeroSection() {
  const router = useRouter();

  const handleStartAnalysis = () => {
    localStorage.removeItem("session_mode");
    localStorage.removeItem("session_upload_status");
    localStorage.removeItem("session_id");
    router.push("/landing");
  };

  const handleSampleDemo = async () => {
    const res = await fetch(`${BACKEND}/upload/sample-demo`, { method: "POST" });
    if (!res.ok) return;
    const data = await res.json();
    localStorage.setItem("session_id", data.session_id);
    localStorage.setItem("session_mode", "sample_demo");
    localStorage.setItem("session_upload_status", "ready");
    localStorage.setItem("sample_filter_options", JSON.stringify(data.filter_options));
    router.push("/landing");
  };
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-white">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #e2e8f0 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Radial gradient overlay — fades dot grid toward edges */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.6)_60%,transparent_100%)]" />

      <div className="relative max-w-5xl mx-auto px-6 lg:px-8 py-24 lg:py-32">
        {/* System badge */}
        <div className="inline-flex items-center gap-2.5 mb-10 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-slate-600">
            Multi-Agent Intelligence System
          </span>
          <span className="w-px h-3 bg-slate-200" />
          <span className="text-xs font-semibold text-slate-400">
            8 AI Agents
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 tracking-tight leading-[1.05] mb-7 max-w-3xl">
          Turn customer
          <br />
          reviews into{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-500">
            boardroom
          </span>
          <br />
          decisions.
        </h1>

        {/* Subheadline */}
        <p className="text-xl text-slate-600 font-medium leading-relaxed max-w-xl mb-5">
          UrbanPulse is a multi-agent AI system that transforms raw customer
          feedback from quick-commerce platforms into executive-grade business
          intelligence.
        </p>
        <p className="text-base text-slate-400 leading-relaxed max-w-lg mb-12">
          From delivery failures to revenue leakage — surface what matters,
          before it hits your P&amp;L.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-4 mb-16">
          <button
            onClick={handleStartAnalysis}
            className="group flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors shadow-sm"
          >
            Get Started
            <svg
              className="w-4 h-4 text-slate-400 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
          <button
            onClick={handleSampleDemo}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-slate-700 text-sm font-semibold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Try Demo
          </button>
        </div>

        {/* Stats strip */}
        <div className="flex flex-wrap items-center gap-8 pt-8 border-t border-slate-100">
          {[
            ["8", "AI Agents"],
            ["A1 → A8", "Pipeline Depth"],
            ["91%", "Analysis Confidence"],
            ["Real-time", "Intelligence Synthesis"],
          ].map(([val, label]) => (
            <div key={label}>
              <div className="text-lg font-bold text-slate-900 tracking-tight">
                {val}
              </div>
              <div className="text-xs font-medium text-slate-400 mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
