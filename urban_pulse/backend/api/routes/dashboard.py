from fastapi import APIRouter, HTTPException

from ..services.file_service import get_session
from ..services.analysis_service import get_dashboard_data
from ..schemas.response_models import DashboardResponse

router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard/{session_id}", response_model=DashboardResponse)
def get_dashboard(session_id: str):
    """Return the A8 executive insight dashboard for a completed session."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    data = get_dashboard_data(session_id)
    return DashboardResponse(
        session_id=session_id,
        status=session.get("status", "pending"),
        data=data,
    )
