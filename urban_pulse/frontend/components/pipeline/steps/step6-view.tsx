"use client";

import React from "react";
import Link from "next/link";
import { NoData } from "../pipeline-shared-ui";

const TIME_SLOTS = [
  { label: "Morning", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  )},
  { label: "Afternoon", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/>
    </svg>
  )},
  { label: "Evening", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="9" x2="12" y2="2"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/>
    </svg>
  )},
  { label: "Night", icon: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )},
];

const CITY_STYLES = [
  { size: 34, fill: "#e0e7ff", stroke: "#6366f1", textFill: "#4338ca", fontSize: 9 },
  { size: 27, fill: "#f1f5f9", stroke: "#cbd5e1", textFill: "#475569", fontSize: 8 },
  { size: 20, fill: "#f8fafc", stroke: "#e2e8f0", textFill: "#94a3b8", fontSize: 7 },
];

const BAR_COLORS = ["bg-indigo-500", "bg-indigo-300", "bg-indigo-100"];

export default function Step6View({ data }: { data: any }) {
  if (!data) return <NoData />;
  const out: any = data.A6_output ?? data;
  const platforms: any[] = Array.isArray(out.platform) ? out.platform : [];
  const brands: any[]    = Array.isArray(out.brand)    ? out.brand    : [];
  const categories: any[] = Array.isArray(out.category) ? out.category : [];
  const cities: any[]    = Array.isArray(out.city)     ? out.city     : [];
  const time: any        = out.time ?? null;
  const reasoning: string = data.A6_reasoning ?? "";

  if (!platforms.length && !brands.length && !categories.length && !cities.length && !time) return <NoData />;

  const p0 = platforms[0];

  return (
    <div className="space-y-5">

      {/* Status banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <p className="text-xs font-semibold text-emerald-800">Platform signals captured</p>
        </div>
        <span className="text-[10px] font-semibold text-slate-500">A6 · Platform Signal Intelligence</span>
      </div>

      {/* Agent info box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3">
        <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Platform Signal Intelligence compares complaint volume across delivery platforms, brands, and categories - identifying which platform dominates negative sentiment, which cities are loudest, and when complaints peak during the day.
        </p>
      </div>
      {/* Lede */}
      <div className="border-l-4 border-indigo-400 bg-slate-50 rounded-xl px-6 py-4 mb-6">
        <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400 mb-1">A6 · Platform signal intelligence</p>
        <p className="text-lg font-medium text-slate-800 leading-snug">
          {p0 ? (
            <><span className="text-indigo-600">{p0.platform}</span> leads with {p0.share}% of complaint volume - peaking during <span className="text-indigo-600">{time?.label}</span> hours</>
          ) : "No dominant platform detected."}
        </p>
        <p className="text-xs text-slate-400 mt-1">{platforms.length} platforms · {cities.length} cities tracked</p>
      </div>

      {/* Platform bars + City dots */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-3">Platform share</p>
          {platforms.map((p, i) => (
            <div key={p.platform} className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">{p.platform}</span>
                <span className="text-xs text-slate-400">{p.share}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${BAR_COLORS[i] ?? "bg-indigo-100"}`} style={{ width: `${p.share}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-3">City breakdown</p>
          {cities.slice(0, 3).map((c, i) => {
            const s = CITY_STYLES[i];
            const code = c.city.slice(0, 3).toUpperCase();
            return (
              <div key={c.city} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                <svg width={s.size} height={s.size} viewBox={`0 0 ${s.size} ${s.size}`} className="shrink-0">
                  <circle cx={s.size/2} cy={s.size/2} r={s.size/2 - 1} fill={s.fill} stroke={s.stroke} strokeWidth="1"/>
                  <text x={s.size/2} y={s.size/2 + s.fontSize*0.4} textAnchor="middle" fill={s.textFill} fontSize={s.fontSize} fontWeight="500" fontFamily="inherit">{code}</text>
                </svg>
                <div>
                  <p className="text-sm font-medium text-slate-700">{c.city}</p>
                  <p className="text-xs text-slate-400">{c.mentions.toLocaleString()} mentions</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-100 mb-6" />

      {/* Brands + Categories */}
      <div className="grid grid-cols-2 gap-8 mb-6">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-3">Brands flagged</p>
          {brands.map((b, i) => (
            <div key={b.name} className="flex items-baseline gap-2 mb-1.5">
              <span className={`font-medium text-slate-${i === 0 ? "900" : i === 1 ? "700" : "500"} ${i === 0 ? "text-xl" : i === 1 ? "text-base" : "text-sm"}`}>{b.name}</span>
              <span className={`text-slate-400 ${i === 0 ? "text-sm" : "text-xs"}`}>{b.mentions.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-3">Categories in focus</p>
          {categories.map((c, i) => (
            <div key={c.name} className="flex items-baseline gap-2 mb-1.5">
              <span className={`font-medium text-slate-${i === 0 ? "900" : i === 1 ? "700" : "500"} ${i === 0 ? "text-xl" : i === 1 ? "text-base" : "text-sm"}`}>{c.name}</span>
              <span className={`text-slate-400 ${i === 0 ? "text-sm" : "text-xs"}`}>{c.mentions.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Time slots */}
      {time && (
        <>
          <hr className="border-slate-100 mb-6" />
          <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-3">When complaints spike</p>
          <div className="grid grid-cols-4 gap-3 mb-6">
            {TIME_SLOTS.map((slot) => {
              const isActive = time.label === slot.label;
              return (
                <div key={slot.label} 
                  className={`rounded-lg border p-3 ${isActive ? "border-red-300 bg-red-50" : "border-slate-200"}`}>
                  <span className={isActive ? "text-red-400" : "text-slate-400"}>{slot.icon}</span>
                  <p className={`text-xs font-medium mt-1 ${isActive ? "text-red-600" : "text-slate-500"}`}>{slot.label}</p>
                  {isActive && (
                    <p className="text-[10px] text-red-400 mt-0.5">{time.peak_hour ? `Peak · ${time.peak_hour}:00` : "Peak window"}</p>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Reasoning */}
      {reasoning && (
        <>
          <hr className="border-slate-100 mb-4" />
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Agent reasoning</p>
          <div className="border-l-2 border-slate-200 pl-4">
            <p className="text-xs italic text-slate-400 leading-relaxed">{reasoning}</p>
          </div>
        </>
      )},
      {/* Navigation buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Link href="/step-5">
          <button
            type="button"
            className="w-full py-3 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Escalation Analysis
          </button>
        </Link>
        <Link href="/step-7">
          <button
            type="button"
            className="w-full py-3 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
          >
            Proceed to Language Detection
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </Link>
      </div>
    </div>
  );
}