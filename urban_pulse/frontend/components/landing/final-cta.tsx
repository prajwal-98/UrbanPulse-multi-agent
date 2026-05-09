"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function FinalCta() {
  const router = useRouter();
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const handleSampleDemo = async () => {
    setIsDemoLoading(true);
    try {
      const res = await fetch(`${BACKEND}/upload/sample-demo`, { method: "POST" });
      if (!res.ok) return;
      const data = await res.json();
      localStorage.setItem("session_id", data.session_id);
      localStorage.setItem("session_mode", "sample_demo");
      localStorage.setItem("session_upload_status", "ready");
      localStorage.setItem("sample_filter_options", JSON.stringify(data.filter_options));
      router.push("/landing");
    } finally {
      setIsDemoLoading(false);
    }
  };
  return (
    <section className="bg-slate-900 py-28 lg:py-36 relative overflow-hidden">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Radial fade */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(5,150,105,0.08)_0%,transparent_100%)]" />

      <div className="relative max-w-3xl mx-auto px-6 lg:px-8 text-center">
        {/* Live badge */}
        <div className="inline-flex items-center gap-2 mb-10 px-4 py-2 rounded-full bg-white/10 border border-white/20">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold text-slate-300">
            Multi-Agent AI · Ready to Analyze
          </span>
        </div>

        {/* Headline */}
        <h2 className="text-4xl lg:text-6xl font-bold text-white tracking-tight leading-tight mb-6">
          Ready to generate
          <br />
          <span className="text-emerald-400">intelligence?</span>
        </h2>

        <p className="text-lg text-slate-400 leading-relaxed mb-12 max-w-md mx-auto">
          Upload your customer review data and watch eight coordinated AI agents
          transform it into executive-grade business decisions.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/landing"
            className="group flex items-center gap-2.5 px-8 py-4 rounded-xl bg-white text-slate-900 text-sm font-bold hover:bg-slate-100 transition-colors shadow-sm"
          >
            Get Started
            <svg
              className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <button
            onClick={handleSampleDemo}
            disabled={isDemoLoading}
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isDemoLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Waking up server...
              </span>
            ) : "Try Demo"}
          </button>
        </div>

        {/* Footer note */}
        <p className="mt-12 text-xs text-slate-600">
          No API keys required to explore · Mock data available
        </p>
      </div>
    </section>
  );
}
