"use client";

import React, { useRef } from "react";
import type { Mode, UploadStatus } from "@/contexts/session-context";

const MODELS = [
  { id: "gemini-3.1-flash-lite-preview", label: "gemini-3.1-flash-lite-preview" },
];

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-2 px-1">
      {children}
    </p>
  );
}

interface UploadSession {
  mode: Mode;
  setMode: (m: Mode) => void;
  apiKey: string;
  setApiKey: (k: string) => void;
  model: string;
  setModel: (m: string) => void;
  uploadStatus: UploadStatus;
  uploadFile: (file: File) => Promise<void>;
  useDemo: () => Promise<void>;
  reset: () => void;
  filename: string | null;
  filterOptions: { totalRows: number };
  error: string | null;
}

interface Props {
  session: UploadSession;
}

export default function SidebarUploadPanel({ session }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) session.uploadFile(file);
    e.target.value = "";
  };

  return (
    <>
      {/* ── MODE TOGGLE ──────────────────────── */}
      <div className="mb-5">
        <SectionLabel>Mode</SectionLabel>
        <div className="flex gap-0.5 p-1 bg-slate-100 rounded-xl">
          {(["demo", "live"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => session.setMode(m)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150
                ${
                  session.mode === m
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
            >
              {m === "demo" ? "Demo" : "Live API"}
            </button>
          ))}
        </div>
        {session.mode === "demo" && (
          <p className="text-[10px] text-slate-400 mt-1.5 px-1">
            No API key required · uses sample data
          </p>
        )}
      </div>

      {/* ── API CONFIGURATION (live only) ────── */}
      {session.mode === "live" && (
        <div className="mb-6">
          <SectionLabel>API Configuration</SectionLabel>
          <input
            type="password"
            placeholder="Gemini API key"
            value={session.apiKey}
            onChange={(e) => session.setApiKey(e.target.value)}
            autoComplete="off"
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800
              placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10
              focus:border-slate-400 transition-colors mb-2"
          />
          <div className="relative">
            <select
              value={session.model}
              onChange={(e) => session.setModel(e.target.value)}
              disabled={!session.apiKey}
              className="w-full px-3 py-2 pr-8 text-xs border border-slate-200 rounded-lg bg-white
                text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10
                disabled:opacity-40 disabled:cursor-not-allowed appearance-none transition-colors"
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      )}

      {/* ── DATA INPUT ───────────────────────── */}
      <div className="mb-5">
        <SectionLabel>Data Input</SectionLabel>

        {session.uploadStatus === "uploading" && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin shrink-0" />
            <p className="text-xs text-slate-500">Loading dataset…</p>
          </div>
        )}

        {session.uploadStatus === "ready" && (
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-emerald-800 truncate">{session.filename}</p>
              <p className="text-[10px] text-emerald-600 mt-0.5">
                {session.filterOptions.totalRows.toLocaleString()} rows ready
              </p>
            </div>
            <button
              type="button"
              onClick={session.reset}
              title="Reset"
              className="shrink-0 text-emerald-400 hover:text-emerald-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {session.uploadStatus === "idle" && (
          <div className="space-y-2">
            {session.mode === "live" && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 border border-dashed border-slate-300
                    rounded-lg text-xs text-slate-500 hover:border-slate-400 hover:text-slate-700
                    hover:bg-slate-50/80 transition-colors"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload CSV file
                </button>
              </>
            )}

            <button
              type="button"
              onClick={session.useDemo}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors
                ${
                  session.mode === "demo"
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {session.mode === "demo" ? "Load Demo Dataset" : "Use Demo Dataset"}
            </button>
          </div>
        )}

        {session.uploadStatus === "error" && (
          <div className="mt-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-[10px] text-red-600 leading-relaxed">{session.error}</p>
            <button
              type="button"
              onClick={session.reset}
              className="mt-1 text-[10px] font-semibold text-red-500 hover:text-red-700 transition-colors"
            >
              Try again →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
