import type { Dispatch, SetStateAction, MutableRefObject } from "react";
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
      pipelineStatus: "idle",
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
      applyUploadResponse(await res.json());
    } catch (e: unknown) {
      patch({ uploadStatus: "error", error: (e as Error).message });
    }
  };

  const runAnalysis = async () => {
    const { sessionId, apiKey, model, filters, mode } = stateRef.current;
    if (!sessionId) return;
    patch({ pipelineStatus: "running", progress: 5, currentStep: 1, visitedSteps: [], error: null });
    try {
      const res = await fetch(`${BACKEND}/run-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          api_key: mode === "demo" ? "demo" : apiKey,
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

  return { setMode, setApiKey, setModel, setFilters, uploadFile, useDemo, runAnalysis, addVisitedStep, reset };
}
