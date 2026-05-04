import json
import pandas as pd
from typing import Optional

from .file_service import get_session


def _serialize_value(v):
    """Convert non-JSON-serializable objects to JSON-safe types."""
    if isinstance(v, pd.DataFrame):
        return f"<DataFrame rows={len(v)}>"
    elif isinstance(v, pd.Timestamp):
        return v.isoformat()
    elif isinstance(v, dict):
        return {k: _serialize_value(val) for k, val in v.items()}
    elif isinstance(v, list):
        return [_serialize_value(item) for item in v]
    else:
        try:
            json.dumps(v)
            return v
        except (TypeError, ValueError):
            return str(v)


def _strip_state(state: dict) -> dict:
    """Remove non-serializable objects (DataFrames) from LangGraph state."""
    result = {}
    for k, v in state.items():
        if k == "A1_sample" and isinstance(v, pd.DataFrame):
            result[k] = v.to_dict(orient="records")
        else:
            result[k] = _serialize_value(v)
    return result


def get_step_data(session_id: str, step: int) -> Optional[dict]:
    session = get_session(session_id)
    if not session or not session.get("state"):
        return None
    state = session["state"]
    # A1 spreads its output across multiple A1_* keys; A2-A8 use A{N}_output.
    if step == 1:
        return {k: v for k, v in state.items() if k.startswith("A1_")} or None
    for key in [f"A{step}_output", f"agent_{step}_output", f"A{step}", f"step_{step}"]:
        if key in state:
            return state[key]
    return None


def get_dashboard_data(session_id: str) -> Optional[dict]:
    session = get_session(session_id)
    if not session or not session.get("state"):
        return None
    state = session["state"]

    # Locate A8 output — never expose raw full_state to the frontend.
    a8: dict = {}
    for key in ["A8_output", "agent_8_output", "executive_insights"]:
        if key in state and isinstance(state[key], dict):
            a8 = state[key]
            break

    if not a8:
        return None

    # Safe extractions from A8_output sub-structures.
    metrics: dict = a8.get("metrics") or {}
    impact: dict = a8.get("impact") or {}
    breakdown: dict = a8.get("breakdown") or {}
    time_data: dict = breakdown.get("time") or {} if isinstance(breakdown, dict) else {}
    actions: list = a8.get("actions") or []
    drivers_raw: list = a8.get("drivers") or []

    first_action: dict = actions[0] if actions else {}

    # KPIs
    affected = impact.get("affected_reviews")
    kpis = {
        "revenue_at_risk": impact.get("revenue_risk"),
        "affected_customers": str(affected) if affected is not None else None,
        "top_issue": metrics.get("top_issue"),
        "top_opportunity": first_action.get("title"),
    }

    # Executive summary
    executive_summary = {
        "what": a8.get("story"),
        "why": a8.get("root_cause"),
        "decision": first_action.get("description"),
    }

    # Hero alert — leading title + narrative subtitle
    hero_alert = {
        "title": metrics.get("top_issue"),
        "subtitle": a8.get("story"),
    }

    # Time insights — sourced from A6 breakdown stored inside A8_output
    peak_mult = time_data.get("multiplier")
    time_insights = {
        "peak_window": time_data.get("label"),
        "peak_multiplier": str(peak_mult) if peak_mult is not None else None,
        "context": time_data.get("context"),
    }

    # Drivers — use structured actions when available; fall back to string drivers list.
    if actions:
        drivers = [
            {
                "title": action.get("title"),
                "impact": action.get("priority"),
                "recommendation": action.get("description"),
            }
            for action in actions
        ]
    else:
        drivers = [
            {"title": d, "impact": None, "recommendation": None}
            for d in drivers_raw
            if isinstance(d, str)
        ]

    return {
        "kpis": kpis,
        "executive_summary": executive_summary,
        "hero_alert": hero_alert,
        "time_insights": time_insights,
        "drivers": drivers,
    }


def save_snapshot(state: dict) -> None:
    from pathlib import Path
    import json

    class TimestampEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, pd.Timestamp):
                return obj.isoformat()
            return super().default(obj)

    snapshot_path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "state_snapshot.json"
    snapshot_path.parent.mkdir(exist_ok=True)
    with open(snapshot_path, "w") as f:
        json.dump(state, f, cls=TimestampEncoder)


def load_snapshot() -> dict | None:
    from pathlib import Path
    import json
    snapshot_path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "state_snapshot.json"
    if not snapshot_path.exists():
        return None
    with open(snapshot_path, "r") as f:
        return json.load(f)
