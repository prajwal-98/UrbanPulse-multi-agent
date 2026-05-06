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
  story: string | null;
  confidence: number | null;
  drivers: string[];
  metrics: {
    total_reviews: number;
    negative_percent: number;
    top_issue: string;
    top_brand: string;
  } | null;
  impact: {
    revenue_risk: string;
    affected_reviews: number;
    urgency: string;
  } | null;
  breakdown: {
    platform: { platform: string; share: number }[];
    brand: { name: string; mentions: number }[];
    category: { name: string; mentions?: number }[];
    city: { city: string; mentions: number }[];
    time: { label: string; peak?: string; quiet?: string };
  } | null;
  root_cause: string | null;
  actions: { title: string; description: string; priority: string }[];
  evidence: string[];
  language: { slang: string; usage: number; sentiment: string }[];
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
