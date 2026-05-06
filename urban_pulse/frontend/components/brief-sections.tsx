"use client";

import { useState } from "react";
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

// ── Customer Reviews ──────────────────────────────────────────────────────────
const REVIEW_TAGS: Record<string, string> = {
  "CHURN RISK": "bg-red-500/20 text-red-400 border-red-500/30",
  "TRUST": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "LOGISTICS": "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export function ReviewCards({ evidence }: { evidence: string[] }) {
  if (!evidence?.length) return <p className="text-sm text-slate-400">No customer reviews available.</p>;
  const tags = ["CHURN RISK", "TRUST", "LOGISTICS"];
  const stars = [1, 2, 1];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {evidence.slice(0, 3).map((quote, i) => (
        <div key={i} className="rounded-2xl p-5 flex flex-col gap-3 min-h-[160px]"
          style={{ background: "linear-gradient(145deg, #1e293b, #0f172a)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, j) => (
              <span key={j} className={j < stars[i] ? "text-amber-400" : "text-white/15"} style={{ fontSize: 13 }}>★</span>
            ))}
          </div>
          <p className="text-sm text-white/80 leading-relaxed flex-1">{quote}</p>
          <span className={`text-[10px] font-bold tracking-widest px-2 py-1 rounded border self-start ${REVIEW_TAGS[tags[i]]}`}>{tags[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ── Action Queue ──────────────────────────────────────────────────────────────
interface ActionCardProps {
  num: string; title: string; priority: string; timing: string; dept: string;
  description: string; detail: string; id: number;
  approved: boolean; onApprove: () => void;
}

function ActionCard({ num, title, priority, timing, dept, description, detail, id, approved, onApprove }: ActionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const priorityStyle = priority === "HIGH"
    ? "bg-red-500/20 text-red-400 border border-red-500/30"
    : "bg-amber-500/20 text-amber-400 border border-amber-500/30";
  return (
    <div className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: approved ? "linear-gradient(145deg,rgba(34,197,94,0.08),rgba(15,23,42,0.9))" : "linear-gradient(145deg,#1e293b,#0f172a)", border: `1px solid ${approved ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.07)"}`, borderLeft: `4px solid ${approved ? "#22c55e" : priority === "HIGH" ? "#ef4444" : "#f59e0b"}` }}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <span className="text-3xl font-black text-white/20 leading-none mt-0.5">{num}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-bold text-white leading-snug">{title}</h3>
              <button onClick={() => setExpanded(!expanded)} className="text-white/30 hover:text-white/60 transition flex-shrink-0 mt-0.5">
                <ChevronDown size={18} className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${priorityStyle}`}>{priority}</span>
              <span className="text-[10px] font-semibold text-white/30 uppercase">{timing}</span>
              <span className="text-[10px] text-white/20">·</span>
              <span className="text-[10px] font-semibold text-white/30 uppercase">{dept}</span>
              {approved && <span className="text-[10px] font-bold text-emerald-400">· dispatched ✓</span>}
            </div>
            <p className="text-xs text-white/50 mt-2 leading-relaxed">{description}</p>
            {expanded && (
              <p className="text-xs text-white/40 mt-3 pt-3 border-t border-white/5 leading-relaxed">{detail}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          {approved ? (
            <button disabled className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              <Check size={13} /> Approved
            </button>
          ) : (
            <button onClick={onApprove} className="px-4 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition">APPROVE</button>
          )}
          {!approved && <>
            <button className="px-4 py-1.5 text-white/40 text-xs font-bold hover:text-white/70 transition">EDIT</button>
            <button className="px-4 py-1.5 text-white/40 text-xs font-bold hover:text-white/70 transition">DEFER</button>
          </>}
        </div>
      </div>
    </div>
  );
}

export function ActionQueue({ actions }: { actions: DashboardData["actions"] }) {
  const [approved, setApproved] = useState<Set<number>>(new Set());
  const [allDispatched, setAllDispatched] = useState(false);

  const cards = (actions ?? []).slice(0, 3).map((a, i) => ({
    num: String(i + 1).padStart(2, "0"),
    title: a.title ?? "—",
    priority: a.priority === "High" ? "HIGH" : a.priority === "Low" ? "LOW" : "MED",
    timing: "TODAY",
    dept: "OPS",
    description: a.description ?? "",
    detail: a.description ?? "",
  }));

    // TO:
    const approveCard = (id: number) => setApproved(prev => {
        const next = Array.from(prev);
        next.push(id);
        return new Set(next);
      });    const approveAll = () => {
        const allIds = cards.map((_, i) => i);
        setApproved(new Set(allIds));
        setAllDispatched(true);
    };

  return (
    <div className="space-y-3">
      {cards.map((c, i) => (
        <ActionCard key={i} {...c} id={i} approved={approved.has(i)} onApprove={() => approveCard(i)} />
      ))}
      <button onClick={approveAll} disabled={allDispatched}
        className={`w-full py-3 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 ${allDispatched ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default" : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"}`}>
        {allDispatched ? `✓ All ${cards.length} Dispatched` : `Approve All ${cards.length} — dispatch by 18:00`}
      </button>
    </div>
  );
}