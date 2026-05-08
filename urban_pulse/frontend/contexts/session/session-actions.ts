import type { Dispatch, SetStateAction, MutableRefObject } from "react";
import { flushSync } from "react-dom";
import type { SessionState, Filters, Mode } from "./session-types";
import { defaultState } from "./session-types";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function createSessionActions(
  setState: Dispatch<SetStateAction<SessionState>>,
  patch: (partial: Partial<SessionState>) => void,
  stateRef: MutableRefObject<SessionState>,
) {
  const applyUploadResponse = (data: {
    session_id: string;
    filename: string;
    filter_options: {
      cities: string[];
      platforms: string[];
      categories: string[];
      date_min?: string | null;
      date_max?: string | null;
      total_rows: number;
    };
    pipeline_status?: string;
  }) => {
    localStorage.setItem("session_id", data.session_id);
    const opts = data.filter_options;
    setState((s) => ({
      ...s,
      sessionId: data.session_id,
      filename: data.filename,
      uploadStatus: "ready",
      filterOptions: {
        cities: opts.cities ?? [],
        platforms: opts.platforms ?? [],
        categories: opts.categories ?? [],
        dateMin: opts.date_min ?? null,
        dateMax: opts.date_max ?? null,
        totalRows: opts.total_rows ?? 0,
      },
      filters: {
        dateFrom: opts.date_min ?? "",
        dateTo: opts.date_max ?? "",
        cities: [],
        platforms: [],
        categories: [],
      },
      pipelineStatus: data.pipeline_status === "complete" ? "complete" : "idle",
      progress: 0,
      currentStep: 0,
      error: null,
    }));
  };

  const pollStatus = (sessionId: string) => {
    const interval = window.setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND}/status/${sessionId}`);
        if (!res.ok) {
          clearInterval(interval);
          return;
        }
        const data = await res.json();
        setState((s) => ({
          ...s,
          progress: data.progress ?? s.progress,
          currentStep: data.status === "complete" ? 1 : (parseInt(String(data.current_step ?? "").replace("A",""), 10) || s.currentStep),
          pipelineStatus:
            data.status === "complete"
              ? "complete"
              : data.status === "error"
              ? "error"
              : "running",
          error: data.status === "error" ? data.error ?? "Unknown error" : s.error,
          stepStatus: data.step_status ?? s.stepStatus,
        }));
        if (data.status === "complete" || data.status === "error") {
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
        setState((s) => ({ ...s, pipelineStatus: "error", error: "Connection lost" }));
      }
    }, 2000);
  };

  const setMode = (mode: Mode) =>
    setState((s) => ({
      ...defaultState,
      mode,
      apiKey: s.apiKey,
      model: s.model,
    }));

  const setApiKey = (apiKey: string) => patch({ apiKey });
  const setModel = (model: string) => patch({ model });
  const setFilters = (partial: Partial<Filters>) =>
    setState((s) => ({ ...s, filters: { ...s.filters, ...partial } }));

  const uploadFile = async (file: File) => {
    patch({ uploadStatus: "uploading", error: null });
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${BACKEND}/upload`, { method: "POST", body: form });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(detail);
      }
      applyUploadResponse(await res.json());
    } catch (e: unknown) {
      patch({ uploadStatus: "error", error: (e as Error).message });
    }
  };

  const useDemo = async () => {
    patch({ uploadStatus: "uploading", error: null });
    try {
      const res = await fetch(`${BACKEND}/upload/demo`, { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      applyUploadResponse(data);
      localStorage.setItem("session_mode", "demo");
      localStorage.setItem("session_upload_status", "ready");
      localStorage.setItem("demo_filter_options", JSON.stringify(data.filter_options));
    } catch (e: unknown) {
      patch({ uploadStatus: "error", error: (e as Error).message });
    }
  };

  const trySampleDemo = async () => {
    patch({ uploadStatus: "uploading", error: null });
    try {
      const res = await fetch(`${BACKEND}/upload/sample-demo`, { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      applyUploadResponse(await res.json());
      patch({ mode: "sample_demo" });
    } catch (e: unknown) {
      patch({ uploadStatus: "error", error: (e as Error).message });
    }
  };

  const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

  const runAnalysis = async () => {
    const { sessionId, apiKey, model, filters, mode } = stateRef.current;
    if (!sessionId) return;

    if (mode === "sample_demo") {
      const initialStatus: Record<string, string> = {};
      for (let i = 1; i <= 8; i++) initialStatus[`A${i}`] = "pending";
      patch({ pipelineStatus: "running", progress: 0, currentStep: 1, visitedSteps: [], error: null, stepStatus: initialStatus });
      for (let n = 1; n <= 8; n++) {
        flushSync(() => {
          patch({
            stepStatus: { ...stateRef.current.stepStatus, [`A${n}`]: "running" },
            currentStep: n,
            progress: (n - 1) * 12
          });
        });
        await delay(1000);
        flushSync(() => {
          patch({
            stepStatus: { ...stateRef.current.stepStatus, [`A${n}`]: "done" },
            progress: n * 12
          });
        });
      }
      patch({ pipelineStatus: "complete", progress: 100 });
      return;
    }

    if (mode === "demo") {
      const initialStatus: Record<string, string> = {};
      for (let i = 1; i <= 8; i++) initialStatus[`A${i}`] = "pending";
      patch({ pipelineStatus: "running", progress: 0, currentStep: 1, visitedSteps: [], error: null, stepStatus: initialStatus });
      for (let n = 1; n <= 8; n++) {
        flushSync(() => {
          patch({
            stepStatus: { ...stateRef.current.stepStatus, [`A${n}`]: "running" },
            currentStep: n,
            progress: (n - 1) * 12
          });
        });
        await delay(1000);
        flushSync(() => {
          patch({
            stepStatus: { ...stateRef.current.stepStatus, [`A${n}`]: "done" },
            progress: n * 12
          });
        });
      }
      patch({ pipelineStatus: "complete", progress: 100 });
      return;
    }

    patch({ pipelineStatus: "running", progress: 5, currentStep: 1, visitedSteps: [], error: null });
    try {
      const res = await fetch(`${BACKEND}/run-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          api_key: mode === "live" ? apiKey : "demo",
          model,
          filters: {
            date_from: filters.dateFrom || null,
            date_to: filters.dateTo || null,
            cities: filters.cities,
            platforms: filters.platforms,
            categories: filters.categories,
          },
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      pollStatus(sessionId);
    } catch (e: unknown) {
      patch({ pipelineStatus: "error", error: (e as Error).message });
    }
  };

  const addVisitedStep = (step: number) =>
    setState((s) => ({
      ...s,
      visitedSteps: s.visitedSteps.includes(step) ? s.visitedSteps : [...s.visitedSteps, step],
    }));

  const reset = () => setState(defaultState);

  return { setMode, setApiKey, setModel, setFilters, uploadFile, useDemo, trySampleDemo, runAnalysis, addVisitedStep, reset };
}
