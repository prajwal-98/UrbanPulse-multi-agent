from fastapi import APIRouter, HTTPException

from ..services.file_service import get_session
from ..services.analysis_service import get_step_data
from ..schemas.response_models import StepResponse

router = APIRouter(tags=["Steps"])


@router.get("/steps/{session_id}/{step}", response_model=StepResponse)
def get_step(session_id: str, step: int):
    """Return the output data for a single pipeline step (1–8)."""
    if not 1 <= step <= 8:
        raise HTTPException(status_code=400, detail="Step must be between 1 and 8.")
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    session_status = session.get("status", "pending")
    step_status = session.get("step_status") or {}
    step_done = step_status.get(f"A{step}") == "done"

    if session_status not in ("complete", "error") and not step_done:
        raise HTTPException(status_code=409, detail="Step not yet complete.")
    data = get_step_data(session_id, step)
    return StepResponse(
        session_id=session_id,
        step=step,
        status=session.get("status", "pending"),
        data=data,
    )
