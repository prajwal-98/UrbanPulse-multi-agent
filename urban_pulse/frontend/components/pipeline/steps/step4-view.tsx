"use client";

import React, { useState } from "react";
import Link from "next/link";
import { NoData, SectionTitle, Tag } from "../pipeline-shared-ui";
import Step4Charts from "./step4-charts";

export default function Step4View({ data }: { data: any }) {
  const [expandedCluster, setExpandedCluster] = useState<number | null>(0);

  if (!data) return <NoData />;
  const out: any = data.A4_output ?? data;
  const summary: string = out.summary ?? "";
  const metaInsight: string = out.meta_insight ?? "";
  const clusters: any[] = Array.isArray(out.clusters) ? out.clusters : [];

  if (!summary && !clusters.length && !metaInsight) return <NoData />;

  // Compute total for percentage labels
  const total = clusters.reduce((sum, c) => sum + (c.size || 0), 0);

  // Color palette per cluster index
  const clusterColors = [
    { border: "#BA7517", bg: "#FAEEDA", text: "#633806", badge: "#FFF3E0" },
    { border: "#A32D2D", bg: "#FCEBEB", text: "#501313", badge: "#FFEBEE" },
    { border: "#534AB7", bg: "#EEEDFE", text: "#26215C", badge: "#F3E5FF" },
  ];

  return (
    <div className="space-y-5">
      {/* Status banner - amber */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <p className="text-xs font-semibold text-amber-800">Patterns identified</p>
        </div>
        <span className="text-[10px] font-semibold text-slate-500">A4 · Cluster Intelligence</span>
      </div>

      {/* Agent info box */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3">
        <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.5a2 2 0 00-1 .268M17 21a4 4 0 004-4V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4z" />
          </svg>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Cluster Intelligence groups customer reviews into behavioural patterns using TF-IDF vectorisation and KMeans — turning raw complaints into named, actionable issue clusters.
        </p>
      </div>

      {/* Donut chart + legend */}
      {clusters.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="grid grid-cols-[200px_1fr] gap-6 items-center">
            {/* SVG Donut */}
            <div className="flex justify-center">
              <svg width="200" height="200" viewBox="0 0 200 200">
                {clusters.reduce((acc: any, item: any, i: number) => {
                  const size = (item.size || 0) / total;
                  const startAngle = acc.angle;
                  const endAngle = acc.angle + size * 2 * Math.PI;
                  const color = clusterColors[i] || clusterColors[0];

                  const x1 = 100 + 65 * Math.cos(startAngle - Math.PI / 2);
                  const y1 = 100 + 65 * Math.sin(startAngle - Math.PI / 2);
                  const x2 = 100 + 65 * Math.cos(endAngle - Math.PI / 2);
                  const y2 = 100 + 65 * Math.sin(endAngle - Math.PI / 2);
                  const x3 = 100 + 40 * Math.cos(endAngle - Math.PI / 2);
                  const y3 = 100 + 40 * Math.sin(endAngle - Math.PI / 2);
                  const x4 = 100 + 40 * Math.cos(startAngle - Math.PI / 2);
                  const y4 = 100 + 40 * Math.sin(startAngle - Math.PI / 2);

                  const largeArc = size > 0.5 ? 1 : 0;
                  const path = `M ${x1} ${y1} A 65 65 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A 40 40 0 ${largeArc} 0 ${x4} ${y4} Z`;

                  acc.paths.push(<path key={i} d={path} fill={color.bg} stroke={color.border} strokeWidth="2" />);

                  return { angle: endAngle, paths: acc.paths };
                }, { angle: 0, paths: [] }).paths}
              </svg>
            </div>

            {/* Legend */}
            <div className="space-y-2.5">
              {clusters.map((c, i) => {
                const color = clusterColors[i] || clusterColors[0];
                const percentage = Math.round((c.size / total) * 100 * 10) / 10;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: color.bg, border: `2px solid ${color.border}` }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{c.name || `Cluster ${i + 1}`}</p>
                      <p className="text-xs text-slate-500">{percentage}% of reviews</p>
                    </div>
                    <div className="h-1 w-16 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                      <div
                        className="h-full transition-all"
                        style={{ width: `${percentage}%`, backgroundColor: color.border }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Cluster cards */}
      {clusters.length > 0 && (
        <div>
          <SectionTitle>Clusters ({clusters.length})</SectionTitle>
          <div className="space-y-3">
            {clusters.map((c, i) => {
              const color = clusterColors[i] || clusterColors[0];
              const isOpen = expandedCluster === i;
              const percentage = Math.round((c.size / total) * 100 * 10) / 10;
              const trendBgColor = c.trend === "Increasing" ? "bg-red-50" : c.trend === "Decreasing" ? "bg-green-50" : "bg-slate-100";
              const trendTextColor = c.trend === "Increasing" ? "text-red-700" : c.trend === "Decreasing" ? "text-green-700" : "text-slate-600";

              return (
                <div
                  key={i}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                  style={{ borderTop: `2px solid ${color.border}` }}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedCluster(isOpen ? null : i)}
                    className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                        style={{ backgroundColor: color.badge, color: color.text }}
                      >
                        C{i + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{c.name || `Cluster ${i + 1}`}</p>
                        {c.description && <p className="text-xs text-slate-500 truncate">{c.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      <div className="text-right">
                        <p className="text-lg font-bold" style={{ color: color.text }}>
                          {percentage}%
                        </p>
                        <p className="text-[10px] text-slate-500">of reviews</p>
                      </div>
                      <div className={`${trendBgColor} ${trendTextColor} text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0`}>
                        {c.trend || "Stable"}
                      </div>
                      <svg
                        className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 space-y-3">
                      {/* Signals */}
                      {Array.isArray(c.signals) && c.signals.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-2">Key Signals</p>
                          <div className="flex flex-wrap gap-1.5">
                            {c.signals.map((sig: string, si: number) => (
                              <span
                                key={si}
                                className="text-xs px-2 py-1 rounded"
                                style={{ backgroundColor: color.bg, color: color.text, border: `1px solid ${color.border}` }}
                              >
                                {sig}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Example reviews */}
                      {Array.isArray(c.examples) && c.examples.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-600 mb-2">Example Reviews</p>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {c.examples.map((ex: string, ei: number) => (
                              <div key={ei} className="border-l-2 border-slate-200 bg-white rounded px-3 py-2">
                                <p className="text-xs text-slate-600 italic">"{ex}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(!Array.isArray(c.signals) || c.signals.length === 0) &&
                        (!Array.isArray(c.examples) || c.examples.length === 0) && (
                          <p className="text-xs text-slate-400">No additional details</p>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts section */}
      {clusters.length > 0 && <Step4Charts clusters={clusters} />}

      {/* Summary insight */}
      {metaInsight && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
          <p className="text-xs font-semibold text-slate-600 mb-2">Meta Insight</p>
          <p className="text-sm text-blue-900">{metaInsight}</p>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <Link href="/step-3">
          <button
            type="button"
            className="w-full py-3 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back To Sematic Mapping
          </button>
        </Link>
        <Link href="/step-5">
          <button
            type="button"
            className="w-full py-3 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">          
            Proceed to Escalation Analysis
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </Link>
      </div>
    </div>
  );
}
