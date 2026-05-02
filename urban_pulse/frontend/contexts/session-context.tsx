"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  ReactNode,
} from "react";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/* ─── Types ──────────────────────────────────────────────────────────── */

export type Mode = "demo" | "live";
export type UploadStatus = "idle" | "uploading" | "ready" | "error";
export type PipelineStatus = "idle" | "running" | "complete" | "error";

export interface FilterOptions {
  cities: string[];
  platforms: string[];
  categories: string[];
  dateMin: string | null;
  dateMax: string | null;
  totalRows: number;
}

export interface Filters {
  dateFrom: string;
  dateTo: string;
  cities: string[];
  platforms: string[];
  categories: string[];
}

interface SessionState {
  mode: Mode;
  apiKey: string;
  model: string;
  sessionId: string | null;
  filename: string | null;
  uploadStatus: UploadStatus;
  filterOptions: FilterOptions;
  filters: Filters;
  pipelineStatus: PipelineStatus;
  progress: number;
  currentStep: number;
  visitedSteps: number[];
  error: string | null;
}

interface SessionContextValue extends SessionState {
  setMode: (mode: Mode) => void;
  setApiKey: (key: string) => void;
  setModel: (model: string) => void;
  setFilters: (partial: Partial<Filters>) => void;
  uploadFile: (file: File) => Promise<void>;
  useDemo: () => Promise<void>;
  runAnalysis: () => Promise<void>;
  addVisitedStep: (step: number) => void;
  reset: () => void;
}

/* ─── Defaults ───────────────────────────────────────────────────────── */

const defaultFilterOptions: FilterOptions = {
  cities: [],
  platforms: [],
  categories: [],
  dateMin: null,
  dateMax: null,
  totalRows: 0,
};

const defaultFilters: Filters = {
  dateFrom: "",
  dateTo: "",
  cities: [],
  platforms: [],
  categories: [],
};

const defaultState: SessionState = {
  mode: "demo",
  apiKey: "",
  model: "gemini-2.0-flash-lite",
  sessionId: null,
  filename: null,
  uploadStatus: "idle",
  filterOptions: defaultFilterOptions,
  filters: defaultFilters,
  pipelineStatus: "idle",
  progress: 0,
  currentStep: 0,
  visitedSteps: [],
  error: null,
};

/* ─── Context ────────────────────────────────────────────────────────── */

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be inside <SessionProvider>");
  return ctx;
}

/* ─── Provider ───────────────────────────────────────────────────────── */

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(defaultState);
  // Ref keeps actions' closures from going stale without needing useCallback deps.
  const stateRef = useRef(state);
  stateRef.current = state;

  const patch = (partial: Partial<SessionState>) =>
    setState((s) => ({ ...s, ...partial }));

  /* helpers */
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

  const pollStatus = useCallback((sessionId: string) => {
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
          currentStep: data.current_step ?? s.currentStep,
          pipelineStatus:
            data.status === "complete"
              ? "complete"
              : data.status === "error"
              ? "error"
              : "running",
          error: data.status === "error" ? data.error ?? "Unknown error" : s.error,
        }));
        if (data.status === "complete" || data.status === "error") {
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
        setState((s) => ({ ...s, pipelineStatus: "error", error: "Connection lost" }));
      }
    }, 2000);
  }, []);

  /* ── actions ── */

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

  const addVisitedStep = (step: number) =>
    setState((s) => ({
      ...s,
      visitedSteps: s.visitedSteps.includes(step) ? s.visitedSteps : [...s.visitedSteps, step],
    }));

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

  const reset = () => setState(defaultState);

  return (
    <SessionContext.Provider
      value={{
        ...state,
        setMode,
        setApiKey,
        setModel,
        setFilters,
        uploadFile,
        useDemo,
        runAnalysis,
        addVisitedStep,
        reset,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}
