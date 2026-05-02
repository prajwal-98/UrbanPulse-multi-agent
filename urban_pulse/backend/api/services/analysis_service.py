import sys
import traceback
import pandas as pd
from pathlib import Path
from typing import Optional
from datetime import date

# Add urban_pulse_v2/ to sys.path so orchestrator.py's bare imports
# (from core.schema, from agents.*) resolve correctly.
_UP2_DIR = Path(__file__).resolve().parent.parent.parent.parent  # …/urban_pulse_v2
if str(_UP2_DIR) not in sys.path:
    sys.path.insert(0, str(_UP2_DIR))

from .file_service import get_session, set_session


def apply_filters(
    df: pd.DataFrame,
    date_from: Optional[date],
    date_to: Optional[date],
    cities: list,
    platforms: list,
    categories: list,
) -> pd.DataFrame:
    filtered = df.copy()

    date_col = None
    for c in ["date", "review_date", "created_at", "timestamp"]:
        if c in filtered.columns:
            date_col = c
            break

    if date_col and date_from:
        filtered = filtered[pd.to_datetime(filtered[date_col], errors="coerce") >= pd.Timestamp(date_from)]
    if date_col and date_to:
        filtered = filtered[pd.to_datetime(filtered[date_col], errors="coerce") <= pd.Timestamp(date_to)]

    for col_candidates, values in [
        (["city", "cities", "location"], cities),
        (["platform", "platforms", "source", "channel"], platforms),
        (["category", "categories", "product_category", "type"], categories),
    ]:
        if not values:
            continue
        for col in col_candidates:
            if col in filtered.columns:
                filtered = filtered[filtered[col].isin(values)]
                break

    return filtered


def _strip_state(state: dict) -> dict:
    """Remove non-serializable objects (DataFrames) from LangGraph state."""
    result = {}
    for k, v in state.items():
        if isinstance(v, pd.DataFrame):
            result[k] = f"<DataFrame rows={len(v)}>"
        elif isinstance(v, dict):
            result[k] = _strip_state(v)
        elif isinstance(v, list):
            result[k] = [
                _strip_state(i) if isinstance(i, dict) else
                (f"<DataFrame rows={len(i)}>" if isinstance(i, pd.DataFrame) else i)
                for i in v
            ]
        else:
            try:
                import json
                json.dumps(v)
                result[k] = v
            except (TypeError, ValueError):
                result[k] = str(v)
    return result


def run_pipeline_sync(session_id: str, api_key: str, model: str, filters: dict) -> None:
    """Runs synchronously inside a background thread."""
    session = get_session(session_id)
    if not session:
        return

    set_session(session_id, {
        **session,
        "status": "running",
        "progress": 5,
        "current_step": None,
        "step_status": {f"A{i}": "pending" for i in range(1, 9)},
    })

    try:
        # Use bare import — consistent with orchestrator.py's own bare imports
        # (from core.schema / from agents.*) so all modules share one registration.
        from core.orchestrator import build_urban_pulse_graph

        df_raw: pd.DataFrame = session["df"]
        filtered = apply_filters(
            df_raw,
            date_from=filters.get("date_from"),
            date_to=filters.get("date_to"),
            cities=filters.get("cities", []),
            platforms=filters.get("platforms", []),
            categories=filters.get("categories", []),
        )

        input_state = {
            "raw_df": df_raw,
            "filtered_df": filtered,
            "api_key": api_key,
            "model": model,
            "active_filters": {
                "cities": filters.get("cities", []),
                "platforms": filters.get("platforms", []),
                "categories": filters.get("categories", []),
                "date_from": str(filters["date_from"]) if filters.get("date_from") else None,
                "date_to": str(filters["date_to"]) if filters.get("date_to") else None,
            },
            "filters_locked": True,
            "current_step": 0,
            "completed_steps": [],
            "system_logs": [],
        }

        set_session(session_id, {
            **session,
            "status": "running",
            "progress": 10,
            "current_step": "A1",
            "step_status": {"A1": "running", **{f"A{i}": "pending" for i in range(2, 9)}},
        })

        graph = build_urban_pulse_graph()

        # stream_mode="values" yields the full accumulated state after each node,
        # so final_state is complete and we never re-invoke the pipeline.
        step_weights = {1: 15, 2: 25, 3: 35, 4: 45, 5: 55, 6: 65, 7: 80, 8: 95}
        final_state = None
        prev_completed: set = set()

        for state_snapshot in graph.stream(input_state, stream_mode="values"):
            final_state = state_snapshot
            completed = set(state_snapshot.get("completed_steps") or [])
            newly_done = completed - prev_completed
            prev_completed = completed
            if newly_done:
                step_num = max(newly_done)
                progress = step_weights.get(step_num, 50)
                # Build per-step status: everything up to step_num is done,
                # the next step is running, the rest are pending.
                step_status = {f"A{i}": "done" for i in range(1, step_num + 1)}
                if step_num < 8:
                    step_status[f"A{step_num + 1}"] = "running"
                    step_status.update({f"A{i}": "pending" for i in range(step_num + 2, 9)})
                current_session = get_session(session_id) or session
                stripped_partial = _strip_state(
                    state_snapshot if isinstance(state_snapshot, dict) else {}
                )

                set_session(session_id, {
                    **current_session,
                    "state": stripped_partial,
                    "status": "running",
                    "progress": progress,
                    "current_step": f"A{step_num + 1}" if step_num < 8 else "A8",
                    "step_status": step_status,
                })
        if final_state is None:
            final_state = graph.invoke(input_state)

        stripped = _strip_state(final_state if isinstance(final_state, dict) else {})
        current_session = get_session(session_id) or session
        set_session(session_id, {
            **current_session,
            "state": stripped,
            "status": "complete",
            "progress": 100,
            "current_step": "A8",
            "step_status": {f"A{i}": "done" for i in range(1, 9)},
            "error": None,
        })

    except Exception as exc:
        tb = traceback.format_exc()
        current_session = get_session(session_id) or session
        set_session(session_id, {
            **current_session,
            "status": "error",
            "progress": 0,
            "error": f"{type(exc).__name__}: {exc}\n{tb}",
        })


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
