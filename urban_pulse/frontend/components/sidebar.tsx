"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/contexts/session-context";

/* ─── Constants ──────────────────────────────────────────────────────── */

const MODELS = [
  { id: "gemini-3.1-flash-lite-preview",      label: "gemini-3.1-flash-lite-preview" }
];

/* ─── Micro-components ───────────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-2 px-1">
      {children}
    </p>
  );
}

function Divider() {
  return <div className="border-t border-slate-100 my-4" />;
}

/* ─── FilterGroup ────────────────────────────────────────────────────── */

function FilterGroup({
  label,
  options,
  selected,
  onChange,
  disabled,
  max = 3,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  disabled?: boolean;
  max?: number;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((x) => x !== val));
    } else if (selected.length < max) {
      onChange([...selected, val]);
    }
  };

  const summary =
    selected.length === 0
      ? `All ${label}s`
      : selected.length === 1
      ? selected[0]
      : `${selected.length} selected`;

  const isEmpty = options.length === 0;

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => !disabled && !isEmpty && setOpen((o) => !o)}
        disabled={disabled || isEmpty}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-colors
          ${
            disabled || isEmpty
              ? "border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed"
              : open
              ? "border-slate-300 bg-slate-50 text-slate-800"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
          }`}
      >
        <span className="truncate font-medium">{isEmpty ? label : summary}</span>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {selected.length > 0 && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
              {selected.length}
            </span>
          )}
          {!isEmpty && (
            <svg
              className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </button>

      {open && (
        <div className="mt-1 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="max-h-[130px] overflow-y-auto">
            {options.map((opt) => {
              const checked = selected.includes(opt);
              const atMax = !checked && selected.length >= max;
              return (
                <label
                  key={opt}
                  className={`flex items-center gap-2.5 px-3 py-1.5 cursor-pointer transition-colors text-xs
                    ${atMax ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-50"}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={atMax}
                    onChange={() => toggle(opt)}
                    className="w-3 h-3 rounded accent-slate-900"
                  />
                  <span className="text-slate-700">{opt}</span>
                </label>
              );
            })}
          </div>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full px-3 py-1.5 text-[10px] text-slate-400 hover:text-slate-600 border-t border-slate-100 text-left hover:bg-slate-50 transition-colors"
            >
              Clear selection
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Sidebar ────────────────────────────────────────────────────────── */

export default function Sidebar() {
  const router = useRouter();
  const session = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [collapsed, setCollapsed] = useState(session.pipelineStatus !== "idle");

  const canRun =
    session.uploadStatus === "ready" &&
    session.pipelineStatus === "idle" &&
    (session.mode === "demo" || Boolean(session.apiKey));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) session.uploadFile(file);
    e.target.value = "";
  };

  const handleRunAnalysis = async () => {
    setCollapsed(true);
    await session.runAnalysis();
    router.push("/step-1");
  };

  /* ── status dot ── */
  const dotColor =
    session.pipelineStatus === "running"
      ? "bg-amber-500"
      : session.pipelineStatus === "complete"
      ? "bg-emerald-500"
      : session.pipelineStatus === "error"
      ? "bg-red-500"
      : "bg-slate-300";

  const dotLabel =
    session.pipelineStatus === "running"
      ? "Running Pipeline"
      : session.pipelineStatus === "complete"
      ? "Analysis Complete"
      : session.pipelineStatus === "error"
      ? "Pipeline Error"
      : session.uploadStatus === "ready"
      ? "Data Ready"
      : "Awaiting Input";

  const dotLabelColor =
    session.pipelineStatus === "running"
      ? "text-amber-600"
      : session.pipelineStatus === "complete"
      ? "text-emerald-600"
      : session.pipelineStatus === "error"
      ? "text-red-500"
      : session.uploadStatus === "ready"
      ? "text-emerald-600"
      : "text-slate-400";

  /* ══════════════════════════════════════════
     COLLAPSED — analysis running / complete / error
  ══════════════════════════════════════════ */
  if (collapsed) {
    return (
      <aside className="w-14 shrink-0 h-full bg-white border-r border-slate-100 flex flex-col items-center">

        {/* Brand icon + expand toggle */}
        <div className="pt-4 pb-3 border-b border-slate-100 w-full flex flex-col items-center gap-2 shrink-0">
          <Link href="/">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center hover:bg-slate-700 transition-colors">
              <span className="text-white text-[11px] font-bold tracking-tight">UP</span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Status area */}
        <div className="flex-1 flex flex-col items-center gap-4 pt-5 px-3">

          {/* Animated status dot */}
          <div title={dotLabel}>
            <span className="relative flex h-2.5 w-2.5">
              {session.pipelineStatus === "running" && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-60`} />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dotColor}`} />
            </span>
          </div>

          {/* Progress % */}
          {(session.pipelineStatus === "running" || session.pipelineStatus === "complete") && (
            <span className="text-[10px] font-bold tabular-nums text-slate-500">
              {session.progress}%
            </span>
          )}

          {/* Running spinner */}
          {session.pipelineStatus === "running" && (
            <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
          )}

          {/* Dashboard link when complete */}
          {session.pipelineStatus === "complete" && (
            <Link href="/dashboard" title="View Dashboard">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </Link>
          )}

          {/* Reset on error */}
          {session.pipelineStatus === "error" && (
            <button
              type="button"
              onClick={session.reset}
              title="Reset"
              className="w-8 h-8 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          )}
        </div>

        {/* Session ID hint */}
        {session.sessionId && (
          <div className="pb-3 shrink-0">
            <span
              className="text-[8px] text-slate-300 font-mono block text-center w-10 truncate"
              title={session.sessionId}
            >
              {session.sessionId.slice(0, 6)}
            </span>
          </div>
        )}

      </aside>
    );
  }

  /* ══════════════════════════════════════════
     EXPANDED — full control panel
  ══════════════════════════════════════════ */
  return (
    <aside className="w-64 shrink-0 h-full bg-white border-r border-slate-100 flex flex-col">

      {/* ══ BRAND ════════════════════════════════ */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center justify-between mb-3.5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 group-hover:bg-slate-700 transition-colors">
              <span className="text-white text-[11px] font-bold tracking-tight">UP</span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 leading-none tracking-tight">
                UrbanPulse
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5 tracking-wide">
                Multi-Agent Intelligence
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar"
            className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* System status pill */}
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5">
            {session.pipelineStatus === "running" && (
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-60`} />
            )}
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`} />
          </span>
          <span className={`text-[10px] font-semibold uppercase tracking-widest ${dotLabelColor}`}>
            {dotLabel}
          </span>
        </div>
      </div>

      {/* ══ SCROLLABLE CONTROLS ══════════════════ */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-0">

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

        {/* ── DATA SCOPE / FILTERS ─────────────── */}
        {session.uploadStatus === "ready" && (
          <div className="mb-5">
            <SectionLabel>Data Scope</SectionLabel>

            <div className="flex items-center gap-1.5 mb-2">
              <input
                type="date"
                value={session.filters.dateFrom}
                min={session.filterOptions.dateMin ?? undefined}
                max={session.filterOptions.dateMax ?? undefined}
                onChange={(e) => session.setFilters({ dateFrom: e.target.value })}
                className="flex-1 px-2 py-1.5 text-[11px] border border-slate-200 rounded-lg bg-white
                  text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 min-w-0"
              />
              <svg className="w-3 h-3 text-slate-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <input
                type="date"
                value={session.filters.dateTo}
                min={session.filterOptions.dateMin ?? undefined}
                max={session.filterOptions.dateMax ?? undefined}
                onChange={(e) => session.setFilters({ dateTo: e.target.value })}
                className="flex-1 px-2 py-1.5 text-[11px] border border-slate-200 rounded-lg bg-white
                  text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/10 min-w-0"
              />
            </div>

            <FilterGroup
              label="City"
              options={session.filterOptions.cities}
              selected={session.filters.cities}
              onChange={(v) => session.setFilters({ cities: v })}
            />
            <FilterGroup
              label="Platform"
              options={session.filterOptions.platforms}
              selected={session.filters.platforms}
              onChange={(v) => session.setFilters({ platforms: v })}
            />
            <FilterGroup
              label="Category"
              options={session.filterOptions.categories}
              selected={session.filters.categories}
              onChange={(v) => session.setFilters({ categories: v })}
            />
          </div>
        )}

        <Divider />

        {/* ── START ANALYSIS CTA ───────────────── */}
        {session.uploadStatus === "ready" && (
          <div className="mb-5">
            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={!canRun}
              className={`w-full py-2.5 text-sm font-semibold rounded-xl transition-all duration-150
                ${
                  canRun
                    ? "bg-slate-900 text-white hover:bg-slate-800 shadow-sm hover:shadow-md"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
            >
              {session.mode === "live" && !session.apiKey
                ? "Enter API key to run"
                : "Start Analysis →"}
            </button>
            {canRun && (
              <p className="text-[10px] text-slate-400 text-center mt-1.5">
                Runs A1 → A8 pipeline
              </p>
            )}
          </div>
        )}

      </div>

      {/* ══ BOTTOM BAR ══════════════════════════ */}
      <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between shrink-0">
        <a
          href={
            session.sessionId && session.pipelineStatus === "complete"
              ? `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/export/${session.sessionId}`
              : undefined
          }
          className={`flex items-center gap-1.5 text-xs transition-colors
            ${
              session.sessionId && session.pipelineStatus === "complete"
                ? "text-slate-500 hover:text-slate-800"
                : "text-slate-300 pointer-events-none"
            }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </a>
        <span className="text-[10px] text-slate-300 font-medium">
          v0.1 · 8 agents
        </span>
      </div>

    </aside>
  );
}
