"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/contexts/session-context";
import Step1View from "@/components/step1-view";
import Step2View from "./pipeline/steps/step2-view";
import Step3View from "./pipeline/steps/step3-view";
import Step4View from "./pipeline/steps/step4-view";
import Step5View from "./pipeline/steps/step5-view";
import Step6View from "./pipeline/steps/step6-view";
import Step7View from "./pipeline/steps/step7-view";
import { NoData } from "./pipeline/pipeline-shared-ui";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const STEPS = [
  {
    num: 1, agent: "A1", href: "/step-1",
    label: "Gatekeeper",
    activeMsg: "Preparing your data…",
    doneMsg: "Data prepared",
  },
  {
    num: 2, agent: "A2", href: "/step-2",
    label: "Context Intelligence",
    activeMsg: "Understanding the context…",
    doneMsg: "Context understood",
  },
  {
    num: 3, agent: "A3", href: "/step-3",
    label: "Semantic Mapping",
    activeMsg: "Mapping issues in the data…",
    doneMsg: "Issues mapped",
  },
  {
    num: 4, agent: "A4", href: "/step-4",
    label: "Finding Patterns",
    activeMsg: "Finding patterns and clusters…",
    doneMsg: "Patterns identified",
  },
  {
    num: 5, agent: "A5", href: "/step-5",
    label: "Escalation Analysis",
    activeMsg: "Analysing escalation signals…",
    doneMsg: "Escalations analysed",
  },
  {
    num: 6, agent: "A6", href: "/step-6",
    label: "Platform Comparing",
    activeMsg: "Reading platform signals…",
    doneMsg: "Platform signals captured",
  },
  {
    num: 7, agent: "A7", href: "/step-7",
    label: "Language Intelligence",
    activeMsg: "Scoring and ranking insights…",
    doneMsg: "Insights scored",
  },
  {
    num: 8, agent: "A8", href: "/dashboard",
    label: "Intelligence Reporting",
    activeMsg: "Generating final intelligence…",
    doneMsg: "Intelligence ready",
  },
];

export default function PipelineView({ stepNum }: { stepNum: number }) {
  const router = useRouter();
  const session = useSession();
  const [stepData, setStepData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const isComplete = session.pipelineStatus === "complete";
  const isIdle = session.pipelineStatus === "idle";

  useEffect(() => {
    if (!session.sessionId || stepNum === 8 || isIdle || (!isComplete && session.pipelineStatus !== "complete")) return;

    setLoading(true);
    fetch(`${BACKEND}/steps/${session.sessionId}/${stepNum}`)
      .then(res => res.json())
      .then(json => {
        setStepData(json.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [session.sessionId, stepNum, isIdle, session.pipelineStatus]);

  const thisStep = STEPS.find((s) => s.num === stepNum)!;
  const isVisited = session.currentStep >= stepNum;
  const displayStatus = isIdle ? "idle" : isVisited ? "complete" : "pending";
  const completionPercent = Math.round((stepNum / STEPS.length) * 100);

  const canNavigate = () => !isIdle;

  /* ─── Pipeline Progress Component (Sticky) ───────────────────── */
  function PipelineProgressBar() {
    const navigable = canNavigate();

    return (
      <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            {/* Label and Progress Percent */}
            <div className="flex items-center justify-between mb-3.5 px-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Pipeline Progress
              </p>
              {!isIdle && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 tabular-nums">
                    {completionPercent}%
                  </span>
                  <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isComplete 
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600" 
                          : "bg-gradient-to-r from-blue-500 to-cyan-500"
                      }`}
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Steps Container */}
            <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-2 px-2 scrollbar-hide">
              {STEPS.map((s, i) => {
                const visited = session.stepStatus?.[s.agent] === "done" || session.pipelineStatus === "complete";
                const viewing = s.num === stepNum;
                const isPending = !visited && !viewing;

                return (
                  <div key={s.agent} className="flex items-center shrink-0 gap-1">
                    {/* Step Node */}
                    <button
                      onClick={() => navigable && router.push(s.href)}
                      disabled={!navigable || isPending}
                      className={`relative group transition-all duration-300 ${
                        navigable && !isPending ? "cursor-pointer" : ""
                      }`}
                      title={s.label}
                    >
                      {/* Glow background for active/error states */}
                      {viewing && (
                        <div className="absolute inset-0 -m-2 rounded-full bg-blue-500/20 animate-pulse" />
                      )}

                      {/* Main dot */}
                      <div
                        className={`relative w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          visited
                            ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                            : viewing
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/40 ring-2 ring-blue-300"
                            : "bg-slate-200 text-slate-500 group-hover:bg-slate-300"
                        }`}
                      >
                        {visited ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : viewing ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        ) : (
                          <span>{s.num}</span>
                        )}
                      </div>

                      {/* Tooltip label */}
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        <div className="bg-slate-900 text-white text-xs font-medium px-2 py-1 rounded whitespace-nowrap">
                          {s.label}
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-slate-900" />
                      </div>
                    </button>

                    {/* Connecting line */}
                    {i < STEPS.length - 1 && (
                      <div
                        className={`h-0.5 w-2 sm:w-3 transition-all duration-500 ${
                          visited
                            ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                            : viewing
                            ? "bg-gradient-to-r from-slate-300 to-slate-200"
                            : "bg-slate-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Step Node for Full View ───────────────────── */
  function StepNode({ s }: { s: (typeof STEPS)[number] }) {
    const visited = session.stepStatus?.[s.agent] === "done" || session.pipelineStatus === "complete";
    const viewing = s.num === stepNum;
    const navigable = canNavigate();

    return (
      <button
        onClick={() => navigable && router.push(s.href)}
        disabled={!navigable || (!visited && !viewing)}
        className={`flex flex-col items-center gap-3 p-3 rounded-lg transition-all ${
          navigable && (visited || viewing) ? "cursor-pointer hover:bg-slate-50" : ""
        }`}
      >
        <div
          className={`
            relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
            ${
              visited
                ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                : viewing
                ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/40 ring-4 ring-blue-200"
                : "bg-slate-200 text-slate-500"
            }
          `}
        >
          {visited ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span>{s.num}</span>
          )}
        </div>
        <span
          className={`text-xs font-semibold text-center max-w-16 leading-tight ${
            visited ? "text-emerald-600" : viewing ? "text-blue-700" : "text-slate-500"
          }`}
        >
          {s.label}
        </span>
      </button>
    );
  }

  /* ─── Render ────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Sticky Progress Bar ── */}
      <PipelineProgressBar />

      {/* ── Page Header (Below Sticky) ── */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-4 sm:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
            Step {stepNum} of {STEPS.length}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            {stepNum === 1 ? "Data Validation — Gatekeeper" : thisStep.label}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">

        {/* ── Full Pipeline Overview Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
              All Steps
            </h2>
            {!isIdle && (
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">{completionPercent}%</p>
                <p className="text-xs text-slate-500">Complete</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {STEPS.map((s) => (
              <StepNode key={s.agent} s={s} />
            ))}
          </div>
        </div>

        {/* ── Status Card ── */}
        {isIdle ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="h-1 bg-gradient-to-r from-slate-300 to-slate-200" />
            <div className="py-16 flex flex-col items-center text-center gap-4 px-6">
              <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-800 mb-2">Ready to Begin</p>
                <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                  Start the analysis from the control panel. All 8 agents will execute sequentially, and results will appear here.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div
              className={`h-1 transition-all duration-500 ${
                displayStatus === "complete"
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  : "bg-gradient-to-r from-blue-500 to-cyan-400"
              }`}
            />

            <div className="px-6 sm:px-8 py-8">
              {loading && (
                <div className="py-16 flex flex-col items-center text-center gap-4">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Processing step {stepNum}…</p>
                </div>
              )}

              {!loading && stepNum === 8 && (
                <div className="py-12 flex flex-col items-center text-center gap-5">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full bg-emerald-100/50 animate-pulse" />
                    <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900 mb-2">Intelligence Ready</p>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                      All 8 agents have completed. Your comprehensive intelligence report is ready.
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition-all"
                  >
                    View Dashboard
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              )}

              {!loading && stepNum !== 8 && (
                <>
                  {stepNum === 1 && (
                    <Step1View
                      data={stepData}
                      onContinue={isComplete ? () => router.push("/step-2") : undefined}
                    />
                  )}
                  {stepNum === 2 && <Step2View data={stepData} />}
                  {stepNum === 3 && <Step3View data={stepData} />}
                  {stepNum === 4 && <Step4View data={stepData} />}
                  {stepNum === 5 && <Step5View data={stepData} />}
                  {stepNum === 6 && <Step6View data={stepData} />}
                  {stepNum === 7 && <Step7View data={stepData} />}
                  {!stepData && <NoData />}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Error Card ── */}
        {session.pipelineStatus === "error" && session.error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-6 py-5 shadow-sm">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-red-800 mb-1">Pipeline Error</p>
                <p className="text-sm text-red-700 line-clamp-4">{session.error}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
