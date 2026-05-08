"use client";

import { createContext, useContext, useState, useRef, ReactNode } from "react";
import { type SessionState, type SessionContextValue, defaultState } from "./session/session-types";
import { createSessionActions } from "./session/session-actions";

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be inside <SessionProvider>");
  return ctx;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(() => {
    if (typeof window === "undefined") return defaultState;
    const mode = localStorage.getItem("session_mode");
    const savedUploadStatus = localStorage.getItem("session_upload_status");
    const savedSessionId = localStorage.getItem("session_id");
    const savedFilterOptionsRaw = localStorage.getItem("sample_filter_options");
    const savedFilterOptions = savedFilterOptionsRaw ? JSON.parse(savedFilterOptionsRaw) : null;
    if (mode === "demo" && savedUploadStatus === "ready") {
      return {
        ...defaultState,
        mode: "demo",
        uploadStatus: "ready",
        filename: "demo_dataset.csv",
        sessionId: savedSessionId,
      };
    }
    if (mode === "sample_demo" && savedUploadStatus === "ready") {
      return {
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
      };
    }
    return mode === "sample_demo" ? { ...defaultState, mode: "sample_demo", sessionId: savedSessionId } : defaultState;
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  const patch = (partial: Partial<SessionState>) =>
    setState((s) => ({ ...s, ...partial }));

  const actions = createSessionActions(setState, patch, stateRef);

  return (
    <SessionContext.Provider value={{ ...state, ...actions }}>
      {children}
    </SessionContext.Provider>
  );
}

export type { Mode, UploadStatus, PipelineStatus, FilterOptions, Filters } from "./session/session-types";
