from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict


class FilterOptions(BaseModel):
    cities: List[str]
    platforms: List[str]
    categories: List[str]
    date_min: Optional[str] = None
    date_max: Optional[str] = None
    total_rows: int


class UploadResponse(BaseModel):
    session_id: str
    filename: str
    total_rows: int
    filter_options: FilterOptions
    mode: str  # "live" | "demo"
    pipeline_status: str = "idle"


class AnalysisStatus(BaseModel):
    session_id: str
    status: str                                    # "pending" | "running" | "complete" | "error"
    progress: int                                  # 0–100
    current_step: Optional[str] = None            # "A1" … "A8", None when not started
    step_status: Dict[str, str] = Field(          # {"A1": "done", "A2": "running", …}
        default_factory=dict
    )
    error: Optional[str] = None


class StepResponse(BaseModel):
    session_id: str
    step: int
    status: str
    data: Optional[Dict[str, Any]] = None


# ── Dashboard structured models ───────────────────────────────────────────────

class KPIModel(BaseModel):
    revenue_at_risk: Optional[str] = None
    affected_customers: Optional[str] = None
    top_issue: Optional[str] = None
    top_opportunity: Optional[str] = None


class ExecutiveSummaryModel(BaseModel):
    what: Optional[str] = None   # the story
    why: Optional[str] = None    # root cause
    decision: Optional[str] = None  # top recommended action


class HeroAlertModel(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None


class TimeInsightsModel(BaseModel):
    peak_window: Optional[str] = None
    peak_multiplier: Optional[str] = None
    context: Optional[str] = None


class DriverModel(BaseModel):
    title: Optional[str] = None
    impact: Optional[str] = None          # e.g. "High"
    recommendation: Optional[str] = None


class DashboardDataModel(BaseModel):
    kpis: Optional[KPIModel] = None
    executive_summary: Optional[ExecutiveSummaryModel] = None
    hero_alert: Optional[HeroAlertModel] = None
    time_insights: Optional[TimeInsightsModel] = None
    drivers: List[DriverModel] = Field(default_factory=list)


class DashboardResponse(BaseModel):
    session_id: str
    status: str
    data: Optional[Dict[str, Any]] = None


class FilterPreviewResponse(BaseModel):
    row_count: int
    cities: List[str]
    platforms: List[str]
    categories: List[str]
