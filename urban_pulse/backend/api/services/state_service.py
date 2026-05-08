import json
import pandas as pd
from typing import Optional

from .file_service import get_session


def _serialize_value(v):
    """Convert non-JSON-serializable objects to JSON-safe types."""
    import math
    if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
        return None
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

    a8: dict = {}
    for key in ["A8_output", "agent_8_output", "executive_insights"]:
        if key in state and isinstance(state[key], dict):
            a8 = state[key]
            break

    if not a8:
        return None

    # print("[A8 OUTPUT]", a8)
    return {
        "story":      a8.get("story"),
        "confidence": a8.get("confidence"),
        "drivers":    a8.get("drivers") or [],
        "metrics":    a8.get("metrics") or {},
        "impact":     a8.get("impact") or {},
        "breakdown":  a8.get("breakdown") or {},
        "root_cause": a8.get("root_cause"),
        "actions":    a8.get("actions") or [],
        "evidence":   a8.get("evidence") or [],
        "language":   a8.get("language") or [],
    }

def save_snapshot(state: dict) -> None:
    from pathlib import Path
    import json
    import math

    class SafeEncoder(json.JSONEncoder):
        def default(self, obj):
            if isinstance(obj, pd.Timestamp):
                return obj.isoformat()
            return super().default(obj)

        def encode(self, obj):
            obj = self._clean(obj)
            return super().encode(obj)

        def _clean(self, obj):
            if isinstance(obj, float) and (math.isnan(obj) or math.isinf(obj)):
                return None
            if isinstance(obj, dict):
                return {k: self._clean(v) for k, v in obj.items()}
            if isinstance(obj, list):
                return [self._clean(i) for i in obj]
            return obj

    snapshot_path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "state_snapshot.json"
    snapshot_path.parent.mkdir(exist_ok=True)
    with open(snapshot_path, "w") as f:
        json.dump(state, f, cls=SafeEncoder)


def load_snapshot() -> dict | None:
    from pathlib import Path
    import json
    snapshot_path = Path(__file__).resolve().parent.parent.parent.parent / "data" / "state_snapshot.json"
    if not snapshot_path.exists():
        return None
    with open(snapshot_path, "r") as f:
        return json.load(f)


def load_sample_snapshot() -> dict | None:
    from ..config import SAMPLE_DEMO_STATE_PATH
    if not SAMPLE_DEMO_STATE_PATH.exists():
        return None
    raw = SAMPLE_DEMO_STATE_PATH.read_text()
    return json.loads(raw) if raw else None
