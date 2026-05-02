import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure the project root is on sys.path so urban_pulse_v2.* packages are importable
# when uvicorn is started from D:\taxoflow-agents\urban_pulse_v2 or the project root.
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent  # D:\taxoflow-agents\
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from .routes import upload, analysis, steps, dashboard, export  # noqa: E402
from .config import CORS_ORIGINS  # noqa: E402

app = FastAPI(
    title="UrbanPulse API",
    description=(
        "FastAPI bridge layer for the UrbanPulse multi-agent intelligence platform. "
        "Connects the Next.js frontend to the A1–A8 LangGraph agent pipeline."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(analysis.router)
app.include_router(steps.router)
app.include_router(dashboard.router)
app.include_router(export.router)


@app.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "service": "UrbanPulse API", "version": "0.1.0"}
