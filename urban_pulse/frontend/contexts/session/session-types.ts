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

export interface SessionState {
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
  stepStatus: Record<string, string>;
}

export interface SessionContextValue extends SessionState {
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

export const defaultFilterOptions: FilterOptions = {
  cities: [],
  platforms: [],
  categories: [],
  dateMin: null,
  dateMax: null,
  totalRows: 0,
};

export const defaultFilters: Filters = {
  dateFrom: "",
  dateTo: "",
  cities: [],
  platforms: [],
  categories: [],
};

export const defaultState: SessionState = {
  mode: "demo",
  apiKey: "",
  model: "gemini-3.1-flash-lite-preview",
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
  stepStatus: {},
};
