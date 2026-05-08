"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Sparkline } from "./brief-charts";
import type { DashboardData } from "@/lib/mock-data";

// ── Live Scoreboard ───────────────────────────────────────────────────────────
export function Scoreboard({ metrics, confidence }: {
  metrics: DashboardData["metrics"];
  confidence: number;
}) {
  const items = [
    { label: "REVIEWS", value: metrics?.total_reviews?.toLocaleString() ?? "—", change: "+12%", changeColor: "text-emerald-400", trend: "up" as const, sparkColor: "#22c55e" },
    { label: "SENTIMENT", value: `${100 - (metrics?.negative_percent ?? 0)}%`, change: "-4 pts", changeColor: "text-red-400", trend: "down" as const, sparkColor: "#ef4444" },
    { label: "AVG ★", value: "3.8", change: "-0.2", changeColor: "text-red-400", trend: "down" as const, sparkColor: "#ef4444" },
    { label: "CRITICAL", value: "212", change: "+34", changeColor: "text-amber-400", trend: "up" as const, sparkColor: "#f59e0b" },
  ];
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/5">
        <span className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Live Scoreboard</span>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400 tracking-wider">LIVE</span>
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {items.map((item, i) => (
          <div key={i} className="px-5 py-4">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-[10px] font-bold tracking-widest text-white/40">{item.label}</span>
              <span className={`text-xs font-bold ${item.changeColor}`}>{item.change}</span>
            </div>
            <p className="text-2xl font-black text-white mb-2">{item.value}</p>
            <Sparkline color={item.sparkColor} trend={item.trend} />
          </div>
        ))}
        <div className="px-5 py-4" style={{ background: "rgba(34,197,94,0.08)" }}>
          <p className="text-[10px] font-bold tracking-widest text-emerald-400 mb-1">CONFIDENCE</p>
          <p className="text-2xl font-black text-white">{Math.round((confidence ?? 0.92) * 100)}%</p>
          <p className="text-[10px] text-white/30 mt-1">14 sources · {metrics?.total_reviews?.toLocaleString()} reviews</p>
        </div>
      </div>
    </div>
  );
}

// ── Signal Drivers ────────────────────────────────────────────────────────────
export function SignalDrivers({ drivers }: { drivers: string[] }) {
  const colors = ["#ef4444", "#f59e0b", "#22c55e"];
  return (
    <div className="rounded-2xl p-5 space-y-3" style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">Signal Drivers</p>
      {(drivers ?? []).slice(0, 3).map((d, i) => (
        <div key={i} className="flex items-start gap-3">
          <span className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: colors[i] }} />
          <p className="text-sm text-white/80 leading-snug">{d}</p>
        </div>
      ))}
    </div>
  );
}

// ── Slang highlighting ────────────────────────────────────────────────────────
function highlightSlangs(text: string, slangs: string[]): ReactNode {
  if (!slangs.length) return text;
  const escaped = slangs.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    slangs.some(s => s.toLowerCase() === part.toLowerCase())
      ? <mark key={i} style={{ background: "rgba(99,102,241,0.25)", color: "#a5b4fc", borderRadius: "3px", padding: "0 3px", fontWeight: 700 }}>{part}</mark>
      : <span key={i}>{part}</span>
  );
}

// ── Customer Reviews ──────────────────────────────────────────────────────────
export function ReviewCards({ evidence, slangs = [] }: { evidence: string[]; slangs?: string[] }) {
  if (!evidence?.length) return <p className="text-sm text-slate-500">No customer reviews available.</p>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {evidence.slice(0, 6).map((quote, i) => (
        <div key={i} className="rounded-2xl p-5 flex flex-col gap-4 min-h-[160px]"
          style={{ background: "#0F1929", boxShadow: "inset 3px 0 0 rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.06)" }}>
          <span className="text-3xl font-black text-indigo-500/30 leading-none select-none">"</span>
          <p className="text-sm text-slate-300 leading-relaxed flex-1 -mt-3">{highlightSlangs(quote, slangs)}</p>
          <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">Customer Voice</span>
        </div>
      ))}
    </div>
  );
}

// ── Action Queue ──────────────────────────────────────────────────────────────
interface ActionCardProps {
  num: string; title: string; priority: string; timing: string; dept: string;
  description: string; detail: string; id: number;
  approved: boolean; deferred: boolean; onApprove: () => void; onDefer: () => void;
}

function ActionCard({ num, title, priority, timing, dept, description, detail, id, approved, deferred, onApprove, onDefer }: ActionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const priorityStyle = priority === "HIGH"
    ? "bg-red-500/20 text-red-400 border border-red-500/30"
    : "bg-amber-500/20 text-amber-400 border border-amber-500/30";

  const bg = approved
    ? "linear-gradient(145deg,rgba(34,197,94,0.08),rgba(15,23,42,0.9))"
    : deferred
    ? "linear-gradient(145deg,rgba(100,116,139,0.06),rgba(15,23,42,0.9))"
    : "linear-gradient(145deg,#1e293b,#0f172a)";
  const borderColor = approved ? "rgba(34,197,94,0.3)" : deferred ? "rgba(100,116,139,0.2)" : "rgba(255,255,255,0.07)";
  const accentColor = approved ? "#22c55e" : deferred ? "#475569" : priority === "HIGH" ? "#ef4444" : "#f59e0b";

  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: bg, border: `1px solid ${borderColor}`, borderLeft: `4px solid ${accentColor}`, opacity: deferred ? 0.55 : 1 }}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <span className="text-3xl font-black text-white/20 leading-none mt-0.5">{num}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-bold text-white leading-snug">{title}</h3>
              {detail && (
                <button onClick={() => setExpanded(!expanded)} className="text-white/30 hover:text-white/60 transition flex-shrink-0 mt-0.5">
                  <ChevronDown size={18} className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${priorityStyle}`}>{priority}</span>
              <span className="text-[10px] font-semibold text-white/30 uppercase">{timing}</span>
              <span className="text-[10px] text-white/20">·</span>
              <span className="text-[10px] font-semibold text-white/30 uppercase">{dept}</span>
              {approved && <span className="text-[10px] font-bold text-emerald-400">· dispatched ✓</span>}
              {deferred && <span className="text-[10px] font-bold text-slate-500">· deferred</span>}
            </div>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">{description}</p>
            {detail && expanded && (
              <p className="text-xs text-white/40 mt-3 pt-3 border-t border-white/5 leading-relaxed">{detail}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          {approved ? (
            <button disabled className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              <Check size={13} /> Approved
            </button>
          ) : deferred ? (
            <button onClick={onApprove} className="px-4 py-1.5 rounded-lg bg-emerald-500/80 text-white text-xs font-bold hover:bg-emerald-600 transition">APPROVE</button>
          ) : (
            <>
              <button onClick={onApprove} className="px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition">APPROVE</button>
              <button onClick={onDefer} className="px-4 py-1.5 text-white/40 text-xs font-bold hover:text-white/70 transition">DEFER</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function resolveTitle(title: string, description: string): string {
  if (title !== "Service Fix") return title;
  const m = description.match(/related to (.+?) impacting/i);
  if (m) return m[1].trim();
  const words = description.split(" ");
  return words.slice(0, 5).join(" ") + (words.length > 5 ? "…" : "");
}

function deriveDept(desc: string): string {
  const d = desc.toLowerCase();
  if (d.includes("customer") || d.includes("retention") || d.includes("churn")) return "CS";
  if (d.includes("tech") || d.includes("app") || d.includes("platform")) return "TECH";
  return "OPS";
}

export function ActionQueue({ actions }: { actions: DashboardData["actions"] }) {
  const [approved, setApproved] = useState<Set<number>>(new Set());
  const [deferred, setDeferred] = useState<Set<number>>(new Set());
  const [allDispatched, setAllDispatched] = useState(false);

  const cards = (actions ?? []).slice(0, 3).map((a, i) => {
    const rawTitle = a.title ?? "—";
    const desc = a.description ?? "";
    const priority = a.priority === "High" ? "HIGH" : a.priority === "Low" ? "LOW" : "MED";
    return {
      num: String(i + 1).padStart(2, "0"),
      title: resolveTitle(rawTitle, desc),
      priority,
      timing: priority === "HIGH" ? "TODAY" : priority === "MED" ? "THIS WEEK" : "BACKLOG",
      dept: deriveDept(desc),
      description: desc,
      detail: "",
    };
  });

  const approveCard = (id: number) => {
    setApproved(prev => new Set([...Array.from(prev), id]));
    setDeferred(prev => { const next = new Set(prev); next.delete(id); return next; });
  };
  const deferCard = (id: number) => setDeferred(prev => new Set([...Array.from(prev), id]));
  const approveAll = () => {
    setApproved(new Set(cards.map((_, i) => i)));
    setDeferred(new Set());
    setAllDispatched(true);
  };

  return (
    <div className="space-y-3">
      {cards.map((c, i) => (
        <ActionCard key={i} {...c} id={i} approved={approved.has(i)} deferred={deferred.has(i)} onApprove={() => approveCard(i)} onDefer={() => deferCard(i)} />
      ))}
      <button onClick={approveAll} disabled={allDispatched}
        className={`w-full py-3 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 ${allDispatched ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default" : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"}`}>
        {allDispatched ? `✓ All ${cards.length} Dispatched` : `Approve All ${cards.length} - dispatch by 18:00`}
      </button>
    </div>
  );
}
