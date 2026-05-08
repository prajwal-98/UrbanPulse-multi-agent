import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # urban_pulse_v2/

UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

DEMO_DATA_PATH = BASE_DIR / "data" / "demo" / "demo_source.csv"
SAMPLE_DEMO_DATA_PATH = BASE_DIR / "data" / "sample_demo" / "sample_dataset.csv"
SAMPLE_DEMO_STATE_PATH = BASE_DIR / "data" / "sample_demo" / "sample_state.json"

CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://*.vercel.app",
    "https://urban-pulse-multi-agent.vercel.app"
]

AVAILABLE_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3.1-flash-lite-preview"
]

MAX_FILE_SIZE_MB = 50
MAX_FILTER_SELECTIONS = 3
SESSION_TTL_SECONDS = 3600
