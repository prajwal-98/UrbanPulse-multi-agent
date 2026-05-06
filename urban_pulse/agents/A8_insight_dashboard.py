import pandas as pd
from core.schema import UrbanPulseState
from agents.A8_insight_builders import (
    build_metrics, build_story, build_confidence, build_impact,
    build_root_cause, build_actions, build_evidence, build_language_highlights,
)


def decision_dashboard_node(state: UrbanPulseState) -> UrbanPulseState:
    """
    Step 8 — Final Decision Dashboard (A8)

    Combines outputs from A1–A7 into:
    - Story
    - Metrics
    - Impact
    - Actions
    """
    print("[PIPELINE] A8 starting...", flush=True)

    df = state.get("filtered_df")
    a4 = state.get("A4_output", {}).get("clusters", [])
    a5 = state.get("A5_output", [])
    a6 = state.get("A6_output", {})
    a7 = state.get("A7_output", {})

    if df is None or df.empty:
        state["A8_output"] = {}
        return state

    try:
        # -------------------------------
        # 1. TOP CLUSTER
        # -------------------------------
        top_cluster = max(a4, key=lambda x: x.get("size", 0)) if a4 else {}

        issue = top_cluster.get("name", "General Issue")
        size = top_cluster.get("size", 0)

        # -------------------------------
        # 3. TIME CONTEXT
        # -------------------------------
        peak_time = a6.get("time", {}).get("label", "peak hours")

        # -------------------------------
        # BUILDER CALLS
        # -------------------------------
        metrics_data = build_metrics(df)
        story = build_story(issue, peak_time, df)
        confidence, drivers = build_confidence(
            size, metrics_data["total_reviews"], metrics_data["negative_pct"], issue, peak_time
        )
        impact = build_impact(size, metrics_data["negative_pct"])
        root_cause = build_root_cause(peak_time, issue)
        actions = build_actions(a5)
        evidence = build_evidence(df)
        language_highlights = build_language_highlights(a7)

        # -------------------------------
        # FINAL OUTPUT
        # -------------------------------
        state["A8_output"] = {
            "story": story,
            "confidence": confidence,
            "drivers": drivers,
            "metrics": {
                "total_reviews": metrics_data["total_reviews"],
                "negative_percent": metrics_data["negative_pct"],
                "top_issue": issue,
                "top_brand": metrics_data["top_brand"],
            },
            "impact": impact,
            "breakdown": a6,
            "root_cause": root_cause,
            "actions": actions,
            "evidence": evidence,
            "language": language_highlights,
        }

    except Exception as e:
        state["A8_output"] = {"error": str(e)}

    # -------------------------------
    # STATE UPDATE
    # -------------------------------
    steps = state.get("completed_steps", [])
    if 8 not in steps:
        steps.append(8)

    state["completed_steps"] = steps
    state["current_step"] = 9
    print("[PIPELINE] A8 complete.", flush=True)
    return state
