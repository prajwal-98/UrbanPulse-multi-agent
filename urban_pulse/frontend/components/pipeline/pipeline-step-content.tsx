"use client";

import React, { useState, Dispatch, SetStateAction } from "react";
import Link from "next/link";
import Step1View from "@/components/step1-view";
import { NoData, SectionTitle, PriorityBadge } from "./pipeline-shared-ui";
import Step2View from "./steps/step2-view";
import Step3View from "./steps/step3-view";
import Step4View from "./steps/step4-view";
import Step5View from "./steps/step5-view";
import Step6View from "./steps/step6-view";
import Step7View from "./steps/step7-view";

/* ─── Step 8: Final Intelligence ─────────────────────────────────────────── */

function Step8View() {
  return (
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
  );
}

/* ─── PipelineStepContent ────────────────────────────────────────────── */

type StepNum = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

interface StepMeta {
  readonly num: number;
  readonly label: string;
  readonly activeMsg: string;
  readonly doneMsg: string;
}

interface PipelineStepContentProps {
  isIdle: boolean;
  isComplete: boolean;
  viewingStepStatus: "complete" | "running" | "pending";
  thisStep: StepMeta;
  loadingStepNum: number | null;
  viewingStep: number;
  stepData: Record<number, any>;
  canNavigateTo: (n: number) => boolean;
  setViewingStep: Dispatch<SetStateAction<number>>;
  stepsLength: number;
}

export default function PipelineStepContent({
  isIdle,
  isComplete,
  viewingStepStatus,
  thisStep,
  loadingStepNum,
  viewingStep,
  stepData,
  canNavigateTo,
  setViewingStep,
  stepsLength,
}: PipelineStepContentProps) {
  function renderContent() {
    if (isIdle) {
      return (
        <div className="py-16 flex flex-col items-center text-center gap-4">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600">Waiting to start</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Start the analysis from the control panel. Results will appear here automatically.
            </p>
          </div>
        </div>
      );
    }

    if (viewingStepStatus === "pending") {
      return (
        <div className="py-14 flex flex-col items-center text-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs text-slate-400">Waiting for {thisStep.label.toLowerCase()}…</p>
        </div>
      );
    }

    if (viewingStepStatus === "running") {
      return (
        <div className="py-14 flex flex-col items-center text-center gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-700">{thisStep.activeMsg}</p>
            <p className="text-xs text-slate-400 mt-1">Results will appear when the step completes</p>
          </div>
        </div>
      );
    }

    if (viewingStep === 8) return <Step8View />;

    if (loadingStepNum === viewingStep) {
      return (
        <div className="py-14 flex flex-col items-center text-center gap-3">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading step data…</p>
        </div>
      );
    }

    const d = stepData[viewingStep];

    switch (viewingStep as StepNum) {
      case 1: return (
        <Step1View
          data={d}
          onContinue={stepData[1] ? () => { setViewingStep(2); } : undefined}
        />
      );
      case 2: return <Step2View data={d} />;
      case 3: return <Step3View data={d} />;
      case 4: return <Step4View data={d} />;
      case 5: return <Step5View data={d} />;
      case 6: return <Step6View data={d} />;
      case 7: return <Step7View data={d} />;
      default: return <NoData />;
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className={`h-[3px] transition-colors ${
        viewingStepStatus === "complete" ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
        : viewingStepStatus === "running" ? "bg-gradient-to-r from-amber-500 to-amber-400"
        : "bg-gradient-to-r from-slate-200 to-slate-100"
      }`} />

      {!isIdle && (
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wider
            ${viewingStepStatus === "complete" ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : viewingStepStatus === "running"  ? "bg-amber-50 border-amber-200 text-amber-700"
            : "bg-slate-100 border-slate-200 text-slate-500"}`}
          >
            {viewingStepStatus === "running" && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            )}
            {viewingStepStatus === "complete" ? thisStep.doneMsg
            : viewingStepStatus === "running"  ? thisStep.activeMsg.replace("…", "")
            : `Waiting for ${thisStep.label.toLowerCase()}`}
          </div>

          {isComplete && viewingStep < stepsLength && (
            <button
              type="button"
              onClick={() => { setViewingStep(v => Math.min(v + 1, stepsLength)); }}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
            >
              Next
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}

      <div className="px-6 py-6">
        {renderContent()}
      </div>
    </div>
  );
}
