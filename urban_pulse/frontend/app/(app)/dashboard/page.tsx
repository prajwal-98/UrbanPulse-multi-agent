"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/contexts/session-context";
import type { DashboardApiData } from "@/lib/api";
import { fetchDashboardData } from "@/lib/api";
import ExecutiveDashboard from "@/components/executive-dashboard";

export default function DashboardPage() {
  const { sessionId } = useSession();
  const [data, setData] = useState<DashboardApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [noSession, setNoSession] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // URL param → context session → localStorage fallback
    const searchParams = new URLSearchParams(window.location.search);
    const resolvedId =
      searchParams.get("session_id") ??
      sessionId ??
      localStorage.getItem("session_id");

    if (!resolvedId) {
      setLoading(false);
      setNoSession(true);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);
    setData(null);

    async function load() {
      try {
        const d = await fetchDashboardData(resolvedId!);
        if (cancelled) return;

        if (d) {
          console.log("REAL DASHBOARD DATA:", d);
          setData(d);
          setLoading(false);
          return;
        }

        // null data — pipeline may still be finalising; retry once after 3 s
        await new Promise((r) => setTimeout(r, 3000));
        if (cancelled) return;

        const d2 = await fetchDashboardData(resolvedId!);
        if (cancelled) return;
        console.log("REAL DASHBOARD DATA (retry):", d2);
        setData(d2);
      } catch (err) {
        if (cancelled) return;
        console.error("Dashboard fetch error:", err);
        setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-500">
            Loading intelligence dashboard…
          </p>
        </div>
      </div>
    );
  }

  if (noSession) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-amber-600 mb-1">
            No session found
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Upload a dataset and run the pipeline from the control panel, or
            open this page with a valid <code>?session_id=</code> parameter.
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-red-600 mb-1">
            Failed to load dashboard
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ensure the A1–A8 pipeline has completed and a valid session is
            active in the control panel.
          </p>
        </div>
      </div>
    );
  }

  return <ExecutiveDashboard data={data} />;
}
