"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "@/contexts/session-context";
import PipelineStatusBar from "@/components/pipeline/pipeline-status-bar";

const STEPS = [
  { num: 1, label: "Gatekeeper",             agent: "A1", short: "Gate"     },
  { num: 2, label: "Context Intelligence",   agent: "A2", short: "Context"  },
  { num: 3, label: "Semantic Mapping",       agent: "A3", short: "Semantic" },
  { num: 4, label: "Finding Patterns",       agent: "A4", short: "Patterns" },
  { num: 5, label: "Escalation Analysis",    agent: "A5", short: "Escalate" },
  { num: 6, label: "Platform Comparing",     agent: "A6", short: "Platform" },
  { num: 7, label: "Language Intelligence",  agent: "A7", short: "Language" },
  { num: 8, label: "Intelligence Reporting", agent: "A8", short: "Report"   },
] as const;

export default function LandingPage() {
  const session = useSession();
  const { pipelineStatus, stepStatus, progress, currentStep } = session;

  const [viewingStep, setViewingStep] = useState(1);

  const isIdle     = pipelineStatus === "idle";
  const isComplete = pipelineStatus === "complete";
  const isError    = pipelineStatus === "error";

  const visitedSteps = new Set(
    Object.entries(stepStatus)
      .filter(([, v]) => v === "done")
      .map(([k]) => parseInt(k.replace("A", ""), 10))
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <PipelineStatusBar
        steps={STEPS}
        currentStepNum={currentStep}
        viewingStep={viewingStep}
        visitedSteps={visitedSteps}
        isIdle={isIdle}
        isComplete={isComplete}
        isError={isError}
        localProgress={progress}
        onClickStep={setViewingStep}
      />

      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-16">
        <div className="w-full max-w-4xl flex flex-col items-center gap-10">

          {pipelineStatus === "idle" && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="h-[3px] bg-gradient-to-r from-slate-200 to-slate-100" />
              <div className="py-16 flex flex-col items-center text-center gap-4 px-8">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1.5">Ready for Analysis</p>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                    Configure your settings in the panel and click Start Analysis to begin the A1→A8 pipeline.
                  </p>
                </div>
              </div>
            </div>
          )}

          {pipelineStatus === "running" && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="h-[3px] bg-gradient-to-r from-amber-400 to-amber-300 animate-pulse" />
              <div className="py-16 flex flex-col items-center text-center gap-4 px-8">
                <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-amber-400 border-t-amber-600 rounded-full animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1.5">Agents are running…</p>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                    Your data is being processed through all 8 AI agents. This may take a few minutes — please keep this tab open.
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-full">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-widest">
                    Processing {session.progress ?? 0}% complete
                  </span>
                </div>
              </div>
            </div>
          )}

          {pipelineStatus === "complete" && (
            <div className="flex flex-col items-center gap-6 w-full">
              <p className="text-lg font-semibold text-emerald-600">Analysis complete</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
                <Link
                  href="/step-1"
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm hover:border-slate-300 hover:shadow-md transition-all text-center"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-slate-200 transition-colors mb-1">
                    <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 018.25 20.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-slate-800">View Agent Workflow</p>
                  <p className="text-xs text-slate-400">Step-by-step agent output</p>
                </Link>

                <Link
                  href="/dashboard"
                  className="group flex flex-col items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 shadow-sm hover:border-emerald-300 hover:shadow-md transition-all text-center"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 transition-colors mb-1">
                    <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-emerald-800">View Dashboard</p>
                  <p className="text-xs text-emerald-500">Executive intelligence report</p>
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
