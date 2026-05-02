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
  const [state, setState] = useState<SessionState>(defaultState);
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
