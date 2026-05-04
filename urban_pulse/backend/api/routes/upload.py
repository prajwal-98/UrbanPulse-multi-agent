from fastapi import APIRouter, UploadFile, File, HTTPException

from ..services.file_service import save_upload, load_demo_session
from ..schemas.response_models import UploadResponse
from ..config import MAX_FILE_SIZE_MB

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """
    Upload a CSV dataset for analysis.
    Returns a session_id and filter options extracted from the dataset.
    """
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE_MB} MB.",
        )

    try:
        session_id, _, filter_opts = await save_upload(content, file.filename)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Failed to parse CSV: {exc}")

    return UploadResponse(
        session_id=session_id,
        filename=file.filename,
        total_rows=filter_opts.total_rows,
        filter_options=filter_opts,
        mode="live",
    )


@router.post("/demo", response_model=UploadResponse)
async def use_demo_dataset():
    """
    Load the built-in demo dataset. No file upload required.
    Use this to preview the full A1→A8 pipeline without real data.
    """
    try:
        session_id, _, filter_opts = await load_demo_session()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to load demo data: {exc}")

    from ..services.state_service import load_snapshot
    has_snapshot = load_snapshot() is not None
    return UploadResponse(
        session_id=session_id,
        filename="demo_dataset.csv",
        total_rows=filter_opts.total_rows,
        filter_options=filter_opts,
        mode="demo",
        pipeline_status="complete" if has_snapshot else "idle",
    )
