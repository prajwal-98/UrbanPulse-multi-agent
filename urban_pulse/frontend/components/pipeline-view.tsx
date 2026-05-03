"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  const session = useSession();
  const [stepData, setStepData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const isComplete = session.pipelineStatus === "complete";
  const isIdle     = session.pipelineStatus === "idle";

  useEffect(() => {
    if (!session.sessionId || stepNum === 8 || isIdle) return;

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
  }, [session.sessionId, stepNum, isIdle]);

  const thisStep = STEPS.find((s) => s.num === stepNum)!;
  const isVisited = session.currentStep >= stepNum;
  const displayStatus = isIdle ? "idle" : isVisited ? "complete" : "pending";

  const canNavigate = () => !isIdle;

  /* ─── Pipeline progress strip ───────────────────── */
  function StepNode({ s }: { s: (typeof STEPS)[number] }) {
    const visited = session.currentStep >= s.num;
    const viewing = s.num === stepNum;
    const navigable = canNavigate();

    const dot = (
      <div
        className={`
          relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all
          ${visited  ? "bg-emerald-500 text-white"
          : viewing  ? "bg-amber-500 text-white ring-4 ring-amber-100"
          : "bg-amber-400 text-white"}
          ${navigable && !viewing ? "cursor-pointer hover:opacity-80" : ""}
        `}
      >
        {visited ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span>{s.num}</span>
        )}
      </div>
    );

    const label = (
      <span className={`text-[10px] font-medium mt-1.5 text-center leading-tight max-w-[72px] block
        ${visited ? "text-emerald-600" : viewing ? "text-amber-700 font-semibold" : "text-amber-600"}`}
      >
        {s.label}
      </span>
    );

    const node = (
      <div className="flex flex-col items-center gap-0">
        {dot}
        {label}
      </div>
    );

    return navigable
      ? (
        <Link
          href={s.href}
          className="flex flex-col items-center"
          onClick={() => session.currentStep = s.num}
        >
          {node}
        </Link>
      )
      : node;
  }

  /* ─── Render ────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="max-w-7xl mx-auto px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
            Step {stepNum} of {STEPS.length} · Analysis Pipeline
          </p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {stepNum === 1 ? "Validating Data — Gatekeeper" : thisStep.label}
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10 space-y-6">

        {/* ── Pipeline progress strip ── */}
        <div className="bg-white rounded-2xl border border-slate-200 px-6 pt-6 pb-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-5">
            Pipeline Progress
          </p>

          {/* Nodes + connecting lines */}
          <div className="flex items-start overflow-x-auto pb-2">
            {STEPS.map((s, i) => {
              const visited = session.currentStep >= s.num;
              return (
                <div key={s.agent} className="flex items-start shrink-0">
                  <StepNode s={s} />
                  {i < STEPS.length - 1 && (
                    <div className={`h-px w-6 mt-4 mx-0.5 shrink-0 transition-colors ${visited ? "bg-emerald-300" : "bg-amber-200"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Overall progress bar */}
          {!isIdle && (
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Overall Progress
                </span>
                <span className="text-[10px] font-bold tabular-nums text-slate-600">
                  {session.progress}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out
                    ${isComplete ? "bg-emerald-500" : "bg-amber-500"}`}
                  style={{ width: `${session.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Status card ── */}
        {isIdle ? (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="h-[3px] bg-gradient-to-r from-slate-200 to-slate-100" />
            <div className="py-16 flex flex-col items-center text-center gap-4 px-8">
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-1.5">Waiting to start</p>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                  Start the analysis from the control panel. Results will appear here automatically.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className={`h-[3px] transition-colors ${
              displayStatus === "complete" ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
              : "bg-gradient-to-r from-amber-400 to-amber-300"
            }`} />

            <div className="px-8 py-6">
              {loading && (
                <div className="py-12 flex flex-col items-center text-center gap-3">
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                  <p className="text-xs text-slate-400">Loading step data…</p>
                </div>
              )}

              {!loading && stepNum === 8 && (
                <div className="py-12 flex flex-col items-center text-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900 mb-1.5">Intelligence Ready</p>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                      All 8 agents have completed. Full intelligence report is ready in the dashboard.
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="mt-1 flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    View Intelligence Dashboard
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              )}

              {!loading && stepNum !== 8 && (
                <>
                  {stepNum === 1 && <Step1View data={stepData} />}
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

        {/* ── Error detail ── */}
        {session.pipelineStatus === "error" && session.error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <p className="text-xs font-semibold text-red-700 mb-1">Something went wrong</p>
            <p className="text-xs text-red-500 leading-relaxed line-clamp-4">{session.error}</p>
          </div>
        )}

      </div>
    </div>
  );
}
