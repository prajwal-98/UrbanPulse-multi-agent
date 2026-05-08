"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "@/contexts/session-context";
import { usePipelinePoller } from "@/components/pipeline/use-pipeline-poller";
import PipelineStatusBar from "@/components/pipeline/pipeline-status-bar";
import PipelineStepContent from "@/components/pipeline/pipeline-step-content";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const STEPS = [
  { num: 1, label: "Gatekeeper",            activeMsg: "Validating your dataset…",            doneMsg: "Dataset validated"       },
  { num: 2, label: "Context Intelligence",  activeMsg: "Detecting urban context and slang…",   doneMsg: "Context mapped"          },
  { num: 3, label: "Semantic Mapping",      activeMsg: "Mapping semantic anchor issues…",      doneMsg: "Issues mapped"           },
  { num: 4, label: "Finding Patterns",      activeMsg: "Clustering and classifying patterns…", doneMsg: "Patterns identified"     },
  { num: 5, label: "Escalation Analysis",   activeMsg: "Analysing escalation signals…",        doneMsg: "Escalations flagged"     },
  { num: 6, label: "Platform Comparing",    activeMsg: "Reading cross-platform signals…",      doneMsg: "Signals captured"        },
  { num: 7, label: "Language Intelligence", activeMsg: "Scoring novelty and impact…",          doneMsg: "Insights scored"         },
  { num: 8, label: "Intelligence Reporting",activeMsg: "Generating final intelligence…",       doneMsg: "Intelligence ready"      },
] as const;

function CompletionModal({ onClose, showSavedBanner }: { onClose: () => void; showSavedBanner: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
        <div className="px-6 pt-6 pb-7">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">All Agents Complete</h2>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-xs">
              All 8 agents have finished processing. What would you like to do next?
            </p>
          </div>

          {showSavedBanner && (
            <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-3 mb-2">
              <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-[11px] text-emerald-700 leading-relaxed">
                <span className="font-semibold">Run saved automatically.</span> Next time, switch to <span className="font-semibold">Last Run</span> in the sidebar to replay this analysis — no API key needed.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link href="/step-1" onClick={onClose}>
              <button type="button" className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 group text-left">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} style={{width:18,height:18}} className="text-slate-600">
                    <circle cx="5" cy="6" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="19" cy="12" r="2" />
                    <path strokeLinecap="round" d="M7 6h4l6 6-6 6H7" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 leading-none mb-0.5">Analyse Agent Workflow</p>
                  <p className="text-[11px] text-slate-400">Review each agent's step-by-step output</p>
                </div>
                <svg className="w-4 h-4 text-slate-300 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </Link>

            <Link href="/dashboard" onClick={onClose}>
              <button type="button" className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-sm hover:shadow-md transition-all duration-150 group text-left">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} style={{width:18,height:18}} className="text-white">
                    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 17.5h7M17.5 14v7" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white leading-none mb-0.5">View Agents Report</p>
                  <p className="text-[11px] text-white/60">Full executive intelligence dashboard</p>
                </div>
                <svg className="w-4 h-4 text-white/50 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </Link>
          </div>

          <button type="button" onClick={onClose} className="w-full mt-3 py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PipelineScreen() {
  const { sessionId, pipelineStatus, mode } = useSession();
  const isIdle = pipelineStatus === "idle";

  const { localStatus, localProgress, currentStepNum, localError } = usePipelinePoller(sessionId, pipelineStatus);

  const isComplete = localStatus === "complete";
  const isRunning  = localStatus === "running";
  const isError    = localStatus === "error";

  const [viewingStep, setViewingStep]     = useState(1);
  const [visitedSteps, setVisitedSteps]   = useState<Set<number>>(new Set<number>());
  const [stepData, setStepData]           = useState<Record<number, any>>({});
  const [loadingStepNum, setLoadingStepNum] = useState<number | null>(null);
  const [reloadKey, setReloadKey]         = useState(0);

  const prevIsComplete = useRef(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const prevIsRunning  = useRef(false);
  useEffect(() => {
  if (isComplete && !prevIsComplete.current) {
      prevIsComplete.current = true;
      setShowCompletionModal(true);
    }
  }, [isComplete]);
  const stepDataRef    = useRef<Record<number, any>>({});
  stepDataRef.current  = stepData;

  useEffect(() => {
    if (isIdle) {
      setStepData({});
      setViewingStep(1);
      setVisitedSteps(new Set<number>());
      prevIsComplete.current = false;
      prevIsRunning.current  = false;
    }
  }, [isIdle]);

  // Jump to A1 the moment the pipeline starts running.
  useEffect(() => {
    if (isRunning && !prevIsRunning.current) {
      prevIsRunning.current = true;
      setViewingStep(1);
    }
  }, [isRunning]);

  // Auto-mark every completed step as visited so dots turn green progressively.
  useEffect(() => {
    if (currentStepNum > 0) {
      setVisitedSteps(prev => {
        const next = new Set(prev);
        for (let i = 1; i < currentStepNum; i++) next.add(i);
        return next;
      });
    }
  }, [currentStepNum]);

  // On first completion, evict any null entries cached during the run and re-fetch them.
  useEffect(() => {
    if (isComplete && !prevIsComplete.current) {
      prevIsComplete.current = true;
      setStepData(prev => {
        const cleaned: Record<number, any> = {};
        for (const [k, v] of Object.entries(prev)) {
          if (v !== null) cleaned[Number(k)] = v;
        }
        return cleaned;
      });
      setReloadKey(k => k + 1);
    }
  }, [isComplete]);

  const canNavigateTo = (n: number) =>
    isComplete || ((isRunning || isError) && n <= currentStepNum);

  const fetchStepData = useCallback(async (n: number) => {
    if (!sessionId || stepDataRef.current[n] !== undefined) return;
    setLoadingStepNum(n);
    try {
      const res = await fetch(`${BACKEND}/steps/${sessionId}/${n}`);
      if (res.ok) {
        const json = await res.json();
        setStepData(prev => ({ ...prev, [n]: json.data ?? null }));
      } else {
        setStepData(prev => ({ ...prev, [n]: null }));
      }
    } catch {
      setStepData(prev => ({ ...prev, [n]: null }));
    } finally {
      setLoadingStepNum(null);
    }
  }, [sessionId]);

  useEffect(() => {
    if (isIdle) return;
    const stepIsDone = isComplete || ((isRunning || isError) && viewingStep <= currentStepNum);
    if (stepIsDone && stepDataRef.current[viewingStep] === undefined) {
      fetchStepData(viewingStep);
    }
  }, [viewingStep, currentStepNum, isComplete, isRunning, isError, isIdle, fetchStepData, reloadKey]);

  const handleClickStep = (n: number) => {
    if (isIdle) return;
    setViewingStep(n);
    setVisitedSteps(prev => new Set([...Array.from(prev), n]));
  };

  const thisStep = STEPS.find(s => s.num === viewingStep)!;

  const viewingStepStatus =
    isComplete                                                ? "complete"
    : (isRunning || isError) && viewingStep < currentStepNum ? "complete"
    : isRunning && viewingStep === currentStepNum             ? "running"
    : "pending";

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
          {isIdle ? "Analysis Pipeline" : `Step ${viewingStep} of ${STEPS.length} · Analysis Pipeline`}
        </p>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {isIdle ? "Ready to Analyse" : thisStep.label}
        </h1>
      </div>

      <div className="px-8 py-10 space-y-6">

        <PipelineStatusBar
          steps={STEPS}
          isIdle={isIdle}
          isComplete={isComplete}
          localProgress={localProgress}
          visitedSteps={visitedSteps}
          viewingStep={viewingStep}
          currentStepNum={currentStepNum}
          onClickStep={handleClickStep}
        />

        <PipelineStepContent
          isIdle={isIdle}
          isComplete={isComplete}
          viewingStepStatus={viewingStepStatus}
          thisStep={thisStep}
          loadingStepNum={loadingStepNum}
          viewingStep={viewingStep}
          stepData={stepData}
          canNavigateTo={canNavigateTo}
          setViewingStep={setViewingStep}
          stepsLength={STEPS.length}
        />

        {isError && localError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <p className="text-xs font-semibold text-red-700 mb-1">Something went wrong</p>
            <p className="text-xs text-red-500 leading-relaxed line-clamp-4">{localError}</p>
          </div>
        )}

      </div>
      {showCompletionModal && (
        <CompletionModal
          onClose={() => setShowCompletionModal(false)}
          showSavedBanner={mode === "live"}
        />
      )}
    </div>
  );
}
