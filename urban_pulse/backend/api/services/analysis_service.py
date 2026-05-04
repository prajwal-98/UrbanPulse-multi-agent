import sys
import traceback
import pandas as pd
from pathlib import Path

# Add urban_pulse_v2/ to sys.path so orchestrator.py's bare imports
# (from core.schema, from agents.*) resolve correctly.
_UP2_DIR = Path(__file__).resolve().parent.parent.parent.parent  # ../urban_pulse_v2
if str(_UP2_DIR) not in sys.path:
    sys.path.insert(0, str(_UP2_DIR))

from .file_service import get_session, set_session
from .filter_service import apply_filters
from .state_service import _strip_state


def run_pipeline_sync(session_id: str, api_key: str, model: str, filters: dict) -> None:
    """Runs synchronously inside a background thread."""
    print(f"\n[PIPELINE] Starting session={session_id} model={model} filters={filters}", flush=True)

    session = get_session(session_id)
    if not session:
        print(f"[PIPELINE ERROR] Session {session_id} not found - aborting.", flush=True)
        return

    set_session(session_id, {
        **session,
        "status": "running",
        "progress": 5,
        "current_step": None,
        "step_status": {f"A{i}": "pending" for i in range(1, 9)},
    })

    try:
        # Use bare import - consistent with orchestrator.py's own bare imports
        # (from core.schema / from agents.*) so all modules share one registration.
        print("[PIPELINE] Importing orchestrator...", flush=True)
        from core.orchestrator import build_urban_pulse_graph
        print("[PIPELINE] Orchestrator imported.", flush=True)

        df_raw: pd.DataFrame = session["df"]
        print(f"[PIPELINE] Raw dataset: {len(df_raw)} rows, columns={list(df_raw.columns)}", flush=True)

        filtered = apply_filters(
            df_raw,
            date_from=filters.get("date_from"),
            date_to=filters.get("date_to"),
            cities=filters.get("cities", []),
            platforms=filters.get("platforms", []),
            categories=filters.get("categories", []),
        )
        print(f"[PIPELINE] After filters: {len(filtered)} rows", flush=True)

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

        print("[PIPELINE] Building graph...", flush=True)
        graph = build_urban_pulse_graph()
        print("[PIPELINE] Graph built. Starting stream...", flush=True)

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
                print(f"[PIPELINE] A{step_num} complete -> {progress}%", flush=True)
                # Build per-step status: everything up to step_num is done,
                # the next step is running, the rest are pending.
                step_status = {f"A{i}": "done" for i in range(1, step_num + 1)}
                if step_num < 8:
                    step_status[f"A{step_num + 1}"] = "running"
                    step_status.update({f"A{i}": "pending" for i in range(step_num + 2, 9)})
                    print(f"[PIPELINE] A{step_num + 1} starting...", flush=True)
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
            print("[PIPELINE] Stream yielded nothing - falling back to invoke()", flush=True)
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
        print(f"[PIPELINE] Complete [OK] session={session_id}", flush=True)
        from .state_service import save_snapshot
        save_snapshot(stripped)

    except Exception as exc:
        tb = traceback.format_exc()
        print(f"\n[PIPELINE ERROR] session={session_id}", flush=True)
        print(f"[PIPELINE ERROR] {type(exc).__name__}: {exc}", flush=True)
        print(f"[PIPELINE ERROR] Full traceback:\n{tb}", flush=True)
        current_session = get_session(session_id) or session
        set_session(session_id, {
            **current_session,
            "status": "error",
            "progress": 0,
            "error": f"{type(exc).__name__}: {exc}\n{tb}",
        })
