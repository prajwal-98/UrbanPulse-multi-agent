"use client";

import { createContext, useContext, useState, useRef, useEffect, ReactNode } from "react";
import { type SessionState, type SessionContextValue, defaultState } from "./session/session-types";
import { createSessionActions } from "./session/session-actions";

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be inside <SessionProvider>");
  return ctx;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const mode = localStorage.getItem("session_mode");
    const savedUploadStatus = localStorage.getItem("session_upload_status");
    const savedSessionId = localStorage.getItem("session_id");
    const savedFilterOptionsRaw = localStorage.getItem("sample_filter_options");
    const savedFilterOptions = savedFilterOptionsRaw ? JSON.parse(savedFilterOptionsRaw) : null;
    const savedDemoFilterOptionsRaw = localStorage.getItem("demo_filter_options");
    const savedDemoFilterOptions = savedDemoFilterOptionsRaw ? JSON.parse(savedDemoFilterOptionsRaw) : null;
    if (mode === "demo" && savedUploadStatus === "ready") {
      setState({
        ...defaultState,
        mode: "demo",
        uploadStatus: "ready",
        filename: "demo_dataset.csv",
        sessionId: savedSessionId,
        ...(savedDemoFilterOptions && {
          filterOptions: {
            cities: savedDemoFilterOptions.cities ?? [],
            platforms: savedDemoFilterOptions.platforms ?? [],
            categories: savedDemoFilterOptions.categories ?? [],
            dateMin: savedDemoFilterOptions.date_min ?? null,
            dateMax: savedDemoFilterOptions.date_max ?? null,
            totalRows: savedDemoFilterOptions.total_rows ?? 0,
          },
        }),
      });
    } else if (mode === "sample_demo" && savedUploadStatus === "ready") {
      setState({
        ...defaultState,
        mode: "sample_demo",
        uploadStatus: "ready",
        filename: "sample_dataset.csv",
        sessionId: savedSessionId,
        ...(savedFilterOptions && {
          filterOptions: {
            cities: savedFilterOptions.cities ?? [],
            platforms: savedFilterOptions.platforms ?? [],
            categories: savedFilterOptions.categories ?? [],
            dateMin: savedFilterOptions.date_min ?? null,
            dateMax: savedFilterOptions.date_max ?? null,
            totalRows: savedFilterOptions.total_rows ?? 0,
          },
        }),
      });
    } else if (mode === "sample_demo") {
      setState({ ...defaultState, mode: "sample_demo", sessionId: savedSessionId });
    }
    setHydrated(true);
  }, []);

  const patch = (partial: Partial<SessionState>) =>
    setState((s) => ({ ...s, ...partial }));

  const actions = createSessionActions(setState, patch, stateRef);

  return (
    <SessionContext.Provider value={{ ...state, hydrated, ...actions }}>
      {children}
    </SessionContext.Provider>
  );
}

export type { Mode, UploadStatus, PipelineStatus, FilterOptions, Filters } from "./session/session-types";
