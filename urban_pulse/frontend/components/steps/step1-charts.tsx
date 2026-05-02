"use client";

/* ─── Chart palette ────────────────────────────────────────────────── */

const PALETTE = ["#0f172a", "#334155", "#475569", "#64748b", "#94a3b8", "#cbd5e1"];

/* ─── Empty state ──────────────────────────────────────────────────── */

function EmptyChart({ title }: { title: string }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-800 mb-3">{title}</p>
      <div className="flex items-center justify-center h-16 text-xs text-slate-400 italic">
        No data available
      </div>
    </div>
  );
}

/* ─── Bar chart (horizontal) ───────────────────────────────────────── */

export function BarChart({ data, title }: { data: [string, number][]; title: string }) {
  if (!data.length) return <EmptyChart title={title} />;
  const max = Math.max(...data.map(([, v]) => v), 1);
  return (
    <div>
      <p className="text-xs font-bold text-slate-800 mb-3">{title}</p>
      <div className="space-y-2">
        {data.slice(0, 6).map(([label, value], i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span className="text-[11px] text-slate-500 w-[76px] truncate shrink-0 text-right" title={label}>
              {label}
            </span>
            <div className="flex-1 h-[18px] bg-slate-100 rounded overflow-hidden">
              <div
                className="h-full bg-slate-800 rounded transition-all duration-500"
                style={{ width: `${(value / max) * 100}%` }}
              />
            </div>
            <span className="text-[11px] tabular-nums text-slate-500 w-8 shrink-0">
              {value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Donut chart ──────────────────────────────────────────────────── */

export function DonutChart({ data, title }: { data: [string, number][]; title: string }) {
  if (!data.length) return <EmptyChart title={title} />;
  const slices = data.slice(0, 6);
  const total = slices.reduce((s, [, v]) => s + v, 0) || 1;

  let cum = 0;
  const gradient = slices
    .map(([, v], i) => {
      const pct = (v / total) * 100;
      const from = cum;
      cum += pct;
      return `${PALETTE[i]} ${from.toFixed(1)}% ${cum.toFixed(1)}%`;
    })
    .join(", ");

  return (
    <div>
      <p className="text-xs font-bold text-slate-800 mb-3">{title}</p>
      <div className="flex items-center gap-4">
        <div
          className="w-[72px] h-[72px] rounded-full shrink-0"
          style={{
            background: `conic-gradient(${gradient})`,
            WebkitMask: "radial-gradient(farthest-side, transparent 44%, #000 45%)",
            mask: "radial-gradient(farthest-side, transparent 44%, #000 45%)",
          }}
        />
        <div className="space-y-1.5 min-w-0 flex-1">
          {slices.map(([label, value], i) => (
            <div key={i} className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2 h-2 rounded-sm shrink-0"
                style={{ background: PALETTE[i] }}
              />
              <span className="text-[11px] text-slate-600 truncate flex-1">{label}</span>
              <span className="text-[11px] tabular-nums text-slate-400 shrink-0">
                {((value / total) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Line chart (SVG) ─────────────────────────────────────────────── */

export function LineChart({ data, title }: { data: [string, number][]; title: string }) {
  if (!data.length) return <EmptyChart title={title} />;

  const W = 300, H = 110;
  const PAD = { top: 12, right: 8, bottom: 22, left: 34 };
  const iW = W - PAD.left - PAD.right;
  const iH = H - PAD.top - PAD.bottom;

  const counts = data.map(([, v]) => Number(v));
  const maxV = Math.max(...counts, 1);
  const minV = Math.min(...counts, 0);
  const span = maxV - minV || 1;

  const xOf = (i: number) => PAD.left + (i / Math.max(data.length - 1, 1)) * iW;
  const yOf = (v: number) => PAD.top + (1 - (v - minV) / span) * iH;

  const pts = data.map(([, v], i) => `${xOf(i).toFixed(1)},${yOf(Number(v)).toFixed(1)}`).join(" ");
  const fillPts = `${xOf(0).toFixed(1)},${(PAD.top + iH).toFixed(1)} ${pts} ${xOf(data.length - 1).toFixed(1)},${(PAD.top + iH).toFixed(1)}`;

  const step = Math.max(1, Math.ceil(data.length / 5));
  const tickIdxs = Array.from(new Set([0, ...data.map((_, i: number) => i).filter((i: number) => i % step === 0), data.length - 1]));

  return (
    <div>
      <p className="text-xs font-bold text-slate-800 mb-1">{title}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
        <polygon points={fillPts} fill="#0f172a" fillOpacity="0.07" />
        <polyline
          points={pts}
          fill="none"
          stroke="#0f172a"
          strokeWidth="1.75"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {data.length <= 16 &&
          data.map(([, v], i) => (
            <circle key={i} cx={xOf(i)} cy={yOf(Number(v))} r="2.5" fill="#0f172a" />
          ))}
        {tickIdxs.map((idx) => (
          <text
            key={idx}
            x={xOf(idx)}
            y={H - 4}
            textAnchor="middle"
            fontSize="8"
            fill="#94a3b8"
          >
            {String(data[idx][0]).slice(-7)}
          </text>
        ))}
        <text x={PAD.left - 4} y={PAD.top + 4} textAnchor="end" fontSize="8" fill="#94a3b8">
          {maxV}
        </text>
        <text x={PAD.left - 4} y={PAD.top + iH + 4} textAnchor="end" fontSize="8" fill="#94a3b8">
          {minV}
        </text>
      </svg>
    </div>
  );
}
