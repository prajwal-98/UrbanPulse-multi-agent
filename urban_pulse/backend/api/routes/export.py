from fastapi import APIRouter, HTTPException

from ..services.file_service import get_session
from ..services.export_service import generate_report_placeholder

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/{session_id}")
def export_report(session_id: str):
    """Export the analysis report for a session (PDF coming soon)."""
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    if session.get("status") != "complete":
        raise HTTPException(status_code=409, detail="Analysis not yet complete.")
    return generate_report_placeholder(session_id)
