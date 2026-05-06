"use client";

import React, { useEffect, useRef, useState } from "react";

interface ClusterItem {
  name: string;
  size: number;
  signals: string[];
  trend: "Increasing" | "Stable" | "Decreasing";
}

interface Props {
  clusters: ClusterItem[];
}

const CLUSTER_COLORS = ["#EF9F27", "#E24B4A", "#7F77DD"];

export default function Step4Charts({ clusters }: Props) {
  const signalsCanvasRef = useRef<HTMLCanvasElement>(null);
  const trendCanvasRef = useRef<HTMLCanvasElement>(null);
  const signalsChartRef = useRef<any>(null);
  const trendChartRef = useRef<any>(null);
  const [chartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    script.onload = () => setChartLoaded(true);
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, []);

  // Signal frequency chart
  useEffect(() => {
    if (!chartLoaded || !signalsCanvasRef.current || clusters.length === 0) return;

    const Chart = (window as any).Chart;

    // Aggregate signals with cluster index tracking
    const signalMap: { [key: string]: { count: number; clusterIndex: number } } = {};
    clusters.forEach((cluster, clusterIdx) => {
      cluster.signals.forEach((signal) => {
        if (!signalMap[signal]) {
          signalMap[signal] = { count: 0, clusterIndex: clusterIdx };
        }
        signalMap[signal].count += 1;
      });
    });

    // Get top 7 signals
    const sorted = Object.entries(signalMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    const labels = sorted.map((s) => s.name);
    const data = sorted.map((s) => s.count);
    const backgroundColor = sorted.map((s) => CLUSTER_COLORS[s.clusterIndex]);

    if (signalsChartRef.current) {
      signalsChartRef.current.destroy();
    }

    const ctx = signalsCanvasRef.current.getContext("2d");
    if (!ctx) return;

    signalsChartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Frequency",
            data,
            backgroundColor,
            borderRadius: 4,
            barPercentage: 0.6,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: { font: { size: 11 }, color: "#888780" },
            grid: { display: false },
            border: { display: false },
          },
          y: {
            ticks: { font: { size: 11 }, color: "#888780" },
            grid: { display: false },
            border: { display: false },
          },
        },
      },
    });

    return () => {
      if (signalsChartRef.current) {
        signalsChartRef.current.destroy();
        signalsChartRef.current = null;
      }
    };
  }, [clusters, chartLoaded]);

  // Trend line chart
  useEffect(() => {
    if (!chartLoaded || !trendCanvasRef.current || clusters.length === 0) return;

    const Chart = (window as any).Chart;

    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"];

    const datasets = clusters.map((cluster, idx) => {
      let data: number[] = [];
      const size = cluster.size;

      if (cluster.trend === "Increasing") {
        data = [size - 14, size - 10, size - 6, size - 3, size - 1, size];
      } else if (cluster.trend === "Decreasing") {
        data = [size + 14, size + 10, size + 6, size + 3, size + 1, size];
      } else {
        data = [size - 1, size + 1, size - 1, size, size + 1, size];
      }

      return {
        label: cluster.name,
        data,
        borderColor: CLUSTER_COLORS[idx],
        backgroundColor: CLUSTER_COLORS[idx] + "15",
        borderWidth: 2,
        borderDash: idx === 0 ? [4, 3] : idx === 1 ? [2, 2] : [],
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: CLUSTER_COLORS[idx],
        pointBorderColor: CLUSTER_COLORS[idx],
        pointBorderWidth: 2,
      };
    });

    if (trendChartRef.current) {
      trendChartRef.current.destroy();
    }

    const ctx = trendCanvasRef.current.getContext("2d");
    if (!ctx) return;

    trendChartRef.current = new Chart(ctx, {
      type: "line",
      data: { labels: weeks, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { font: { size: 11 }, color: "#888780" },
            grid: { display: false },
            border: { display: false },
          },
          x: {
            ticks: { font: { size: 11 }, color: "#888780" },
            grid: { display: false },
            border: { display: false },
          },
        },
      },
    });

    return () => {
      if (trendChartRef.current) {
        trendChartRef.current.destroy();
        trendChartRef.current = null;
      }
    };
  }, [clusters, chartLoaded]);

  return (
    <div className="space-y-4">
      {/* Signal frequency chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Signal Frequency</p>
        <div className="relative" style={{ height: "200px" }}>
          <canvas ref={signalsCanvasRef} />
        </div>
      </div>

      {/* Trend line chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Trend Over Time</p>
        <div className="relative" style={{ height: "140px" }}>
          <canvas ref={trendCanvasRef} />
        </div>
        <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-slate-100">
          {clusters.map((cluster, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: CLUSTER_COLORS[idx] }}
              />
              <span className="text-xs text-slate-600">{cluster.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
