"use client";

// ── Platform Donut Chart ──────────────────────────────────────────────────────
const DONUT_COLORS = ["#ef4444", "#f59e0b", "#22c55e"];

export function PlatformDonut({ platforms }: { platforms: { platform: string; share: number }[] }) {
  if (!platforms?.length) return null;
  const size = 160; const cx = 80; const cy = 80; const r = 60; const inner = 36;
  let cum = -Math.PI / 2;
  const slices = platforms.map((p, i) => {
    const angle = (p.share / 100) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(cum); const y1 = cy + r * Math.sin(cum);
    const x2 = cx + r * Math.cos(cum + angle); const y2 = cy + r * Math.sin(cum + angle);
    const xi1 = cx + inner * Math.cos(cum); const yi1 = cy + inner * Math.sin(cum);
    const xi2 = cx + inner * Math.cos(cum + angle); const yi2 = cy + inner * Math.sin(cum + angle);
    const large = angle > Math.PI ? 1 : 0;
    const d = `M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${xi2},${yi2} A${inner},${inner} 0 ${large},0 ${xi1},${yi1} Z`;
    const slice = { d, color: DONUT_COLORS[i % DONUT_COLORS.length], platform: p.platform, share: p.share };
    cum += angle;
    return slice;
  });
  const top = platforms[0];
  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} opacity={0.9} />)}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600" opacity="0.6">TOP</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#fff" fontSize="22" fontWeight="800">{top.share}%</text>
      </svg>
      <div className="space-y-2">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-sm text-white font-medium">{s.platform}</span>
            <span className="text-sm font-bold ml-auto pl-4" style={{ color: s.color }}>{s.share}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── City Horizontal Bar Chart ─────────────────────────────────────────────────
export function CityBarChart({ cities }: { cities: { city: string; mentions: number }[] }) {
  if (!cities?.length) return null;
  const max = Math.max(...cities.map(c => c.mentions));
  const colors = ["#ef4444", "#94a3b8", "#64748b"];
  return (
    <div className="space-y-4">
      {cities.map((c, i) => (
        <div key={i}>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-sm font-semibold text-white">{c.city}</span>
            <span className="text-sm font-bold" style={{ color: colors[i] }}>{c.mentions}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(c.mentions / max) * 100}%`, background: colors[i] }} />
          </div>
          {i === 0 && <p className="text-xs text-white/40 mt-1">78% of complaints inside 4-block radius.</p>}
          {i === 1 && <p className="text-xs text-white/40 mt-1">Spillover from re-routed couriers.</p>}
          {i === 2 && <p className="text-xs text-white/40 mt-1">Background level.</p>}
        </div>
      ))}
    </div>
  );
}

// ── Category Vertical Bar Chart ───────────────────────────────────────────────
const CAT_COLORS: Record<string, string> = {
  "Late delivery": "#ef4444",
  "Order missing": "#f59e0b",
  "App / payments": "#8b5cf6",
  "Cold food": "#94a3b8",
};

export function CategoryBarChart({ categories }: { categories: { name: string; pct?: number; mentions?: number }[] }) {
  if (!categories?.length) return null;
  const data = categories.map((c, i) => ({
    name: c.name,
    val: c.pct ?? c.mentions ?? 0,
    color: CAT_COLORS[c.name] ?? DONUT_COLORS[i % DONUT_COLORS.length],
  }));
  const max = Math.max(...data.map(d => d.val));
  return (
    <div className="flex items-end gap-3 h-36 pt-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
          <span className="text-xs font-bold" style={{ color: d.color }}>{d.val}%</span>
          <div className="w-full rounded-t-md transition-all duration-700"
            style={{ height: `${(d.val / max) * 90}px`, background: d.color, opacity: 0.85 }} />
          <span className="text-[10px] text-white/50 text-center leading-tight">{d.name}</span>
        </div>
      ))}
    </div>
  );
}

// ── Time of Day Band ──────────────────────────────────────────────────────────
export function TimeBandChart({ peak, quiet }: { peak: string; quiet: string }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const parseHour = (t: string) => parseInt(t.split(":")[0]);
  const peakParts = peak?.split("–") ?? ["19:00", "21:00"];
  const quietParts = quiet?.split("–") ?? ["06:00", "09:00"];
  const p1 = parseHour(peakParts[0]); const p2 = parseHour(peakParts[1]);
  const q1 = parseHour(quietParts[0]); const q2 = parseHour(quietParts[1]);
  return (
    <div className="space-y-3">
      <div className="flex gap-0.5 items-end h-16">
        {hours.map(h => {
          const isPeak = h >= p1 && h < p2;
          const isQuiet = h >= q1 && h < q2;
          const height = isPeak ? 64 : isQuiet ? 16 : 28 + Math.sin(h * 0.8) * 10;
          const color = isPeak ? "#ef4444" : isQuiet ? "#22c55e" : "#334155";
          return (
            <div key={h} className="flex-1 rounded-sm transition-all"
              style={{ height: `${height}px`, background: color, opacity: isPeak || isQuiet ? 1 : 0.5 }} />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-white/40">
        <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span>
      </div>
      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-red-500 inline-block" />Peak {peak}</span>
        <span className="flex items-center gap-1.5 text-white/50"><span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />Quiet {quiet}</span>
      </div>
    </div>
  );
}

// ── Word Cloud ────────────────────────────────────────────────────────────────
const WORD_POSITIONS = [
  { x: "18%", y: "22%", rotate: 0 }, { x: "55%", y: "14%", rotate: -8 },
  { x: "75%", y: "30%", rotate: 5 }, { x: "8%", y: "55%", rotate: -5 },
  { x: "38%", y: "48%", rotate: 3 }, { x: "65%", y: "58%", rotate: -3 },
  { x: "20%", y: "75%", rotate: 8 }, { x: "52%", y: "78%", rotate: -6 },
  { x: "80%", y: "72%", rotate: 4 }, { x: "42%", y: "25%", rotate: -2 },
  { x: "85%", y: "18%", rotate: 6 }, { x: "10%", y: "88%", rotate: -4 },
];

const SENTIMENT_COLOR: Record<string, string> = {
  negative: "#ef4444", positive: "#22c55e", neutral: "#94a3b8",
};

export function WordCloud({ words }: { words: { slang: string; usage: number; sentiment: string }[] }) {
  if (!words?.length) return null;
  const max = Math.max(...words.map(w => w.usage));
  const min = Math.min(...words.map(w => w.usage));
  const fontSize = (u: number) => 14 + ((u - min) / (max - min || 1)) * 52;
  return (
    <div className="relative w-full" style={{ height: "300px" }}>
      {words.slice(0, 12).map((w, i) => {
        const pos = WORD_POSITIONS[i % WORD_POSITIONS.length];
        return (
          <span key={i} className="absolute font-black leading-none select-none cursor-default hover:opacity-80 transition-opacity"
            style={{
              left: pos.x, top: pos.y,
              fontSize: `${fontSize(w.usage)}px`,
              color: SENTIMENT_COLOR[w.sentiment] ?? "#94a3b8",
              transform: `rotate(${pos.rotate}deg)`,
              textShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}>
            {w.slang}
          </span>
        );
      })}
    </div>
  );
}

// ── Mini Sparkline ────────────────────────────────────────────────────────────
export function Sparkline({ color, trend }: { color: string; trend: "up" | "down" }) {
  const pts = trend === "up"
    ? "0,35 15,30 30,28 45,22 60,18 75,14 90,10 100,8"
    : "0,10 15,14 30,16 45,20 60,24 75,26 90,28 100,32";
  return (
    <svg viewBox="0 0 100 40" className="w-full h-10" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}