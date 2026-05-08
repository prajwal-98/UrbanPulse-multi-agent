"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/contexts/session-context";
import SidebarUploadPanel from "@/components/sidebar/sidebar-upload-panel";
import SidebarFilterPanel from "@/components/sidebar/sidebar-filter-panel";

export default function Sidebar() {
  const router = useRouter();
  const session = useSession();

  const [collapsed, setCollapsed] = useState(session.pipelineStatus !== "idle");

  const canRun =
    session.uploadStatus === "ready" &&
    session.pipelineStatus === "idle" &&
    (session.mode === "demo" || session.mode === "sample_demo" || Boolean(session.apiKey));

  const handleRunAnalysis = () => {
    setCollapsed(true);
    session.runAnalysis();
    router.push("/landing");
  };

  /* ── status dot ── */
  const dotColor =
    session.pipelineStatus === "running"  ? "bg-amber-500"
    : session.pipelineStatus === "complete" ? "bg-emerald-500"
    : session.pipelineStatus === "error"    ? "bg-red-500"
    : "bg-slate-300";

  const dotLabel =
    session.pipelineStatus === "running"  ? "Running Pipeline"
    : session.pipelineStatus === "complete" ? "Analysis Complete"
    : session.pipelineStatus === "error"    ? "Pipeline Error"
    : session.uploadStatus === "ready"      ? "Data Ready"
    : "Awaiting Input";

  const dotLabelColor =
    session.pipelineStatus === "running"  ? "text-amber-600"
    : session.pipelineStatus === "complete" ? "text-emerald-600"
    : session.pipelineStatus === "error"    ? "text-red-500"
    : session.uploadStatus === "ready"      ? "text-emerald-600"
    : "text-slate-400";

  /* ══════════════════════════════════════════
     COLLAPSED
  ══════════════════════════════════════════ */
  if (collapsed) {
    return (
      <aside className="w-14 shrink-0 h-full bg-white border-r border-slate-100 flex flex-col items-center">

        <div className="pt-4 pb-3 border-b border-slate-100 w-full flex flex-col items-center gap-2 shrink-0">
          <Link href="/">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-slate-700 transition-colors">
              <span className="text-white text-[11px] font-bold tracking-tight">UP</span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center gap-4 pt-5 px-3">
          <div title={dotLabel}>
            <span className="relative flex h-2.5 w-2.5">
              {session.pipelineStatus === "running" && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-60`} />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColor}`} />
            </span>
          </div>

          {(session.pipelineStatus === "running" || session.pipelineStatus === "complete") && (
            <span className="text-[10px] font-bold tabular-nums text-slate-500">
              {session.progress}%
            </span>
          )}

          {session.pipelineStatus === "running" && (
            <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
          )}

          {session.pipelineStatus === "complete" && (
            <Link href="/dashboard" title="View Dashboard">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </Link>
          )}

          {session.pipelineStatus === "error" && (
            <button
              type="button"
              onClick={session.reset}
              title="Reset"
              className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>

        {session.sessionId && (
          <div className="pb-3 shrink-0">
            <span
              className="text-[8px] text-slate-300 font-mono block text-center w-10 truncate"
              title={session.sessionId}
            >
              {session.sessionId.slice(0, 6)}
            </span>
          </div>
        )}

      </aside>
    );
  }

  /* ══════════════════════════════════════════
     EXPANDED
  ══════════════════════════════════════════ */
  return (
    <aside className="w-64 shrink-0 h-full bg-white border-r border-slate-100 flex flex-col">

      {/* ══ BRAND ════════════════════════════════ */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-3.5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 group-hover:bg-slate-700 transition-colors">
              <span className="text-white text-[11px] font-bold tracking-tight">UP</span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 leading-none tracking-tight">
                UrbanPulse
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5 tracking-wide">
                Multi-Agent Intelligence
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
            className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            {session.pipelineStatus === "running" && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-60`} />
            )}
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`} />
          </span>
          <span className={`text-[10px] font-semibold uppercase tracking-widest ${dotLabelColor}`}>
            {dotLabel}
          </span>
        </div>
      </div>

      {/* ══ SCROLLABLE CONTROLS ══════════════════ */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-0">

        {session.mode === "sample_demo" ? (
          <>
            {/* ── DEMO INFO CARD ───────────────────── */}
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3.5 mb-4">
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5 mb-2">
                Try Demo
              </span>
              <p className="text-sm font-semibold text-slate-800 leading-snug">
                Pre-loaded demo dataset
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {session.filterOptions?.totalRows ?? "—"} reviews ready
              </p>
            </div>

            <div className="border-t border-slate-100 my-4" />

            {/* ── START ANALYSIS CTA ───────────────── */}
            <div className="mb-5">
              <button
                type="button"
                onClick={handleRunAnalysis}
                disabled={!canRun}
                className={`w-full py-2.5 text-sm font-semibold rounded-xl transition-all duration-150
                  ${
                    canRun
                      ? "bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow-md"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
              >
                Run Analysis →
              </button>
              {canRun && (
                <p className="text-[10px] text-slate-400 text-center mt-1.5">
                  Runs A1 → A8 pipeline
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <SidebarUploadPanel session={session} />
            <SidebarFilterPanel session={session} />

            <div className="border-t border-slate-100 my-4" />

            {/* ── START ANALYSIS CTA ───────────────── */}
            {session.uploadStatus === "ready" && (
              <div className="mb-5">
                <button
                  type="button"
                  onClick={handleRunAnalysis}
                  disabled={!canRun}
                  className={`w-full py-2.5 text-sm font-semibold rounded-xl transition-all duration-150
                    ${
                      canRun
                        ? "bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow-md"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed"
                    }`}
                >
                  {session.mode === "live" && !session.apiKey
                    ? "Enter API key to run"
                    : "Run Analysis →"}
                </button>
                {canRun && (
                  <p className="text-[10px] text-slate-400 text-center mt-1.5">
                    Runs A1 → A8 pipeline
                  </p>
                )}
              </div>
            )}
          </>
        )}

      </div>

      {/* ══ BOTTOM BAR ══════════════════════════ */}
      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between shrink-0">
        <a
          href={
            session.sessionId && session.pipelineStatus === "complete"
              ? `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/export/${session.sessionId}`
              : undefined
          }
          className={`flex items-center gap-1.5 text-xs transition-colors
            ${
              session.sessionId && session.pipelineStatus === "complete"
                ? "text-slate-500 hover:text-slate-800"
                : "text-slate-300 pointer-events-none"
            }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </a>
        <span className="text-[10px] text-slate-300 font-medium">
          v0.1 · 8 agents
        </span>
      </div>

    </aside>
  );
}
