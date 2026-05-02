export interface Platform {
  platform: string;
  share: number;
}

export interface Brand {
  name: string;
  mentions: number;
}

export interface Category {
  name: string;
}

export interface TimeInsight {
  label: string;
  insight: string;
  range: string;
  peak_stat?: {
    multiplier: string;
    label: string;
    context: string;
  };
}

export interface Breakdown {
  platform: Platform[];
  brand: Brand[];
  category: Category[];
  time: TimeInsight;
}

export interface Action {
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
}

export interface LanguageEntry {
  slang: string;
  usage: number;
  sentiment: "positive" | "negative" | "neutral";
}

export interface Impact {
  revenue_risk: string;
  affected_reviews: number;
  churn_risk_percent: number;
  urgency: string;
  /** Short metric value for the KPI card — must be a number/label, not a sentence */
  top_opportunity: string;
  platform_most_affected: string;
  /** One sentence shown under the hero revenue number — must come from backend, never hardcoded in JSX */
  hero_subtitle: string;
}

export interface ExecutiveSummary {
  what: string;
  why: string;
  decision: string;
}

export interface Metrics {
  total_reviews: number;
  negative_percent: number;
  top_issue: string;
  top_brand: string;
}

export interface DashboardData {
  story: string;
  executive_summary: ExecutiveSummary;
  confidence: number;
  drivers: string[];
  metrics: Metrics;
  impact: Impact;
  breakdown: Breakdown;
  root_cause: string;
  actions: Action[];
  evidence: string[];
  language: LanguageEntry[];
}

export const mockDashboardData: DashboardData = {
  story:
    "Significant quality degradation detected in the Ice Cream category across quick-commerce platforms in Bangalore and Mumbai. Delivery-related melt incidents have driven a 34% negative sentiment spike over the past 30 days, disproportionately affecting Amul and Mother Dairy SKUs during peak afternoon delivery windows. Immediate intervention in last-mile cold chain protocols is required to prevent an estimated ₹75L revenue erosion and 28% at-risk customer churn.",

  executive_summary: {
    what: "Significant delivery quality failures in the Ice Cream and Frozen Desserts category are driving a 34% negative sentiment surge across Bangalore and Mumbai over the past 30 days, with melt incidents concentrated during 2PM–6PM peak delivery windows.",
    why: "4,368 high-LTV customers are at active churn risk — translating to an estimated ₹75L revenue erosion if last-mile cold-chain failures persist through the upcoming peak season. Blinkit accounts for 42% of affected volume, with Zepto at 31%.",
    decision:
      "Enforce cold-bag SLA compliance on Blinkit and Zepto within 72 hours. Restrict Ice Cream SKU deliveries during 2PM–5PM in high-complaint pin codes until the audit is complete. Launch a targeted retention offer for the 4,368 impacted customers within 48 hours.",
  },

  confidence: 91,

  drivers: [
    "Ice cream melt during 2PM–6PM peak delivery window",
    "Last-mile cold chain failure on Blinkit and Zepto",
    "High-LTV customer churn signals in Bangalore metro",
  ],

  metrics: {
    total_reviews: 12847,
    negative_percent: 34,
    top_issue: "Delivery Failure",
    top_brand: "Amul",
  },

  impact: {
    revenue_risk: "₹75L",
    affected_reviews: 4368,
    churn_risk_percent: 28,
    urgency: "Critical",
    top_opportunity: "₹18L",
    platform_most_affected: "Blinkit",
    hero_subtitle:
      "Due to delivery quality failures in the Ice Cream category — concentrated on Blinkit (42%) and Zepto (31%) during 2PM–6PM peak delivery windows.",
  },

  breakdown: {
    platform: [
      { platform: "Blinkit", share: 42 },
      { platform: "Zepto", share: 31 },
      { platform: "Swiggy Instamart", share: 18 },
      { platform: "BigBasket Now", share: 9 },
    ],
    brand: [
      { name: "Amul", mentions: 3241 },
      { name: "Mother Dairy", mentions: 2187 },
      { name: "Kwality Wall's", mentions: 1654 },
      { name: "Baskin-Robbins", mentions: 892 },
    ],
    category: [
      { name: "Ice Cream" },
      { name: "Frozen Desserts" },
      { name: "Kulfi" },
      { name: "Beverages" },
    ],
    time: {
      label: "Peak Complaint Window",
      insight: "2PM – 6PM daily",
      range: "Jan 1 – Mar 31, 2024",
      peak_stat: {
        multiplier: "2.4×",
        label: "higher complaint volume",
        context:
          "During the 2–6 PM window vs. morning deliveries. Peak-hour delivery failures are the single largest driver of negative sentiment.",
      },
    },
  },

  root_cause:
    "Root cause analysis identifies a systemic failure in temperature-controlled last-mile delivery during peak afternoon hours (2–6 PM) when ambient temperatures exceed 38°C across Bangalore and Mumbai metro areas. Current delivery SLAs do not account for cold-chain degradation thresholds, and packaging insulation ratings are insufficient for delivery windows exceeding 25 minutes. This is compounded by a surge in order volume that strains available cold-bag inventory among third-party delivery partners on Blinkit and Zepto.",

  actions: [
    {
      title: "Enforce cold-bag SLA for all frozen SKUs",
      description:
        "Mandate temperature-rated packaging for deliveries exceeding 20 minutes. Audit delivery partner cold-bag inventory within 72 hours and enforce compliance before the next peak season.",
      priority: "High",
    },
    {
      title: "Introduce peak-hour delivery blackout",
      description:
        "Restrict Ice Cream SKU deliveries between 2PM–5PM in high-complaint pin codes in Bangalore and Mumbai until cold-chain audit is complete. Surface substitute delivery windows to customers.",
      priority: "High",
    },
    {
      title: "Launch proactive churn recovery campaign",
      description:
        "Identify the 4,368 affected customers and trigger a targeted retention offer — cashback or free replacement — within 48 hours to recover at-risk lifetime value before competitive migration.",
      priority: "Medium",
    },
  ],

  evidence: [
    "Ordered Amul vanilla from Blinkit at 3PM. Arrived completely melted — the box was soaking wet. Third time in two weeks. Not ordering again.",
    "Zepto delivered kulfi in a regular plastic bag in 40-degree heat. The delivery guy had no cold bag at all. Zero accountability from the platform.",
    "Mother Dairy chocolate bar was fully liquid on arrival. Delivery took 47 minutes. Support gave me an automated response — no resolution.",
    "Genuinely disappointed. Used to love quick commerce for frozen items but now it's a gamble every single time. BigBasket is the only one that's been reliable.",
  ],

  language: [
    { slang: "pighal gaya", usage: 847, sentiment: "negative" },
    { slang: "bakwaas hai", usage: 634, sentiment: "negative" },
    { slang: "thanda nahi tha", usage: 421, sentiment: "negative" },
    { slang: "solid delivery", usage: 198, sentiment: "positive" },
  ],
};
