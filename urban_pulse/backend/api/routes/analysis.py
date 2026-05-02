import threading
import pandas as pd
from fastapi import APIRouter, HTTPException

from ..services.file_service import get_session
from ..services.analysis_service import run_pipeline_sync, apply_filters
from ..schemas.request_models import RunAnalysisRequest, FilterPreviewRequest
from ..schemas.response_models import AnalysisStatus, FilterPreviewResponse

router = APIRouter(tags=["Analysis"])


@router.post("/run-analysis", response_model=AnalysisStatus, status_code=202)
def run_analysis(request: RunAnalysisRequest):
    """
    Trigger the full A1→A8 pipeline for a given session.
    Executes in a background thread. Poll GET /status/{session_id} for progress.
    """
    session = get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    if session.get("status") == "running":
        raise HTTPException(
            status_code=409, detail="Pipeline already running for this session."
        )

    filters = {
        "date_from":  request.filters.date_from,
        "date_to":    request.filters.date_to,
        "cities":     request.filters.cities,
        "platforms":  request.filters.platforms,
        "categories": request.filters.categories,
    }

    thread = threading.Thread(
        target=run_pipeline_sync,
        args=(request.session_id, request.api_key, request.model, filters),
        daemon=True,
    )
    thread.start()

    return AnalysisStatus(
        session_id=request.session_id,
        status="running",
        progress=0,
        current_step=None,
        step_status={f"A{i}": "pending" for i in range(1, 9)},
    )


@router.get("/status/{session_id}", response_model=AnalysisStatus)
def get_status(session_id: str):
    """
    Poll the current pipeline status and progress percentage for a session.
    Frontend should poll this every 2 seconds while status == 'running'.
    """
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    return AnalysisStatus(
        session_id=session_id,
        status=session.get("status", "pending"),
        progress=session.get("progress", 0),
        current_step=session.get("current_step"),
        step_status=session.get("step_status", {}),
        error=session.get("error"),
    )


@router.post("/filter-preview", response_model=FilterPreviewResponse)
def filter_preview(request: FilterPreviewRequest):
    """
    Return the row count and available values after applying a filter combination.
    Used by the frontend filter panel to show live dataset sizes before running analysis.
    """
    session = get_session(request.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    df: pd.DataFrame = session.get("df")
    if df is None:
        raise HTTPException(
            status_code=422, detail="No dataset loaded for this session."
        )

    filtered = apply_filters(
        df,
        date_from=request.filters.date_from,
        date_to=request.filters.date_to,
        cities=request.filters.cities,
        platforms=request.filters.platforms,
        categories=request.filters.categories,
    )

    def unique_vals(col: str) -> list:
        return (
            sorted(filtered[col].dropna().unique().tolist())
            if col in filtered.columns
            else []
        )

    return FilterPreviewResponse(
        row_count=len(filtered),
        cities=unique_vals("city"),
        platforms=unique_vals("platform"),
        categories=unique_vals("category"),
    )
