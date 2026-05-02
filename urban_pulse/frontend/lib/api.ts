const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// ── Types matching backend DashboardDataModel ─────────────────────────────

export interface DashboardKPIs {
  revenue_at_risk: string | null;
  affected_customers: string | null;
  top_issue: string | null;
  top_opportunity: string | null;
}

export interface DashboardExecutiveSummary {
  what: string | null;
  why: string | null;
  decision: string | null;
}

export interface DashboardHeroAlert {
  title: string | null;
  subtitle: string | null;
}

export interface DashboardTimeInsights {
  peak_window: string | null;
  peak_multiplier: string | null;
  context: string | null;
}

export interface DashboardDriver {
  title: string | null;
  impact: string | null;        // "High" | "Medium" | "Low"
  recommendation: string | null;
}

export interface DashboardApiData {
  kpis: DashboardKPIs | null;
  executive_summary: DashboardExecutiveSummary | null;
  hero_alert: DashboardHeroAlert | null;
  time_insights: DashboardTimeInsights | null;
  drivers: DashboardDriver[];
}

// ── Fetch ─────────────────────────────────────────────────────────────────

export async function fetchDashboardData(sessionId: string): Promise<DashboardApiData> {
  const res = await fetch(`${API_BASE}/dashboard/${sessionId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Backend returned ${res.status}`);
  const json = await res.json();
  return json.data;
}

// ── Export ────────────────────────────────────────────────────────────────

export async function exportReport(sessionId?: string): Promise<void> {
  if (!sessionId) {
    window.print();
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/export/${sessionId}`);
    if (!res.ok) throw new Error(`export failed ${res.status}`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `urbanpulse-report-${sessionId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    window.print();
  }
}
