"use client";

import { useState } from "react";
import type { FilterOptions, Filters, UploadStatus } from "@/contexts/session-context";
import { SectionLabel } from "./sidebar-upload-panel";

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

/* ─── SidebarFilterPanel ─────────────────────────────────────────────── */

interface FilterSession {
  filterOptions: FilterOptions;
  filters: Filters;
  setFilters: (partial: Partial<Filters>) => void;
  uploadStatus: UploadStatus;
}

interface Props {
  session: FilterSession;
}

export default function SidebarFilterPanel({ session }: Props) {
  if (session.uploadStatus !== "ready") return null;

  return (
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
  );
}
