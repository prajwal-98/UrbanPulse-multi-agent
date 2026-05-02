import { useEffect, useState } from "react";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function parseStep(raw: number | string): number {
  if (typeof raw === "string") {
    const n = parseInt(raw.replace("A", ""), 10);
    return isNaN(n) ? 0 : n;
  }
  return typeof raw === "number" ? raw : 0;
}

export interface PipelinePollerResult {
  localStatus: "idle" | "running" | "complete" | "error";
  localProgress: number;
  currentStepNum: number;
  localError: string | null;
}

export function usePipelinePoller(
  sessionId: string | null | undefined,
  pipelineStatus: "idle" | "running" | "complete" | "error"
): PipelinePollerResult {
  const isIdle = pipelineStatus === "idle";

  const [currentStepNum, setCurrentStepNum] = useState(0);
  const [localStatus, setLocalStatus] = useState<"idle" | "running" | "complete" | "error">(pipelineStatus);
  const [localProgress, setLocalProgress] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isIdle) {
      setCurrentStepNum(0);
      setLocalStatus("idle");
      setLocalProgress(0);
      setLocalError(null);
    }
  }, [isIdle]);

  useEffect(() => {
    if (!sessionId || isIdle) return;
    let active = true;
    let timerId = 0;

    const doPoll = async () => {
      try {
        const res = await fetch(`${BACKEND}/status/${sessionId}`);
        if (!res.ok || !active) return;
        const data = await res.json();
        const status: "running" | "complete" | "error" =
          data.status === "complete" ? "complete"
          : data.status === "error"  ? "error"
          : "running";
        setCurrentStepNum(parseStep(data.current_step));
        setLocalProgress(typeof data.progress === "number" ? data.progress : 0);
        setLocalStatus(status);
        if (status === "error") setLocalError(data.error ?? "Unknown error");
        if (status !== "complete" && status !== "error" && active) {
          timerId = window.setTimeout(doPoll, 3000);
        }
      } catch {
        if (active) timerId = window.setTimeout(doPoll, 3000);
      }
    };

    doPoll();
    return () => {
      active = false;
      window.clearTimeout(timerId);
    };
  }, [sessionId, isIdle]);

  return { localStatus, localProgress, currentStepNum, localError };
}
