"use client";

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

export default function PipelineScreen() {
  const { sessionId, pipelineStatus } = useSession();
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
  const stepDataRef    = useRef<Record<number, any>>({});
  stepDataRef.current  = stepData;

  useEffect(() => {
    if (isIdle) {
      setStepData({});
      setViewingStep(1);
      setVisitedSteps(new Set<number>());
      prevIsComplete.current = false;
    }
  }, [isIdle]);

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
    </div>
  );
}
