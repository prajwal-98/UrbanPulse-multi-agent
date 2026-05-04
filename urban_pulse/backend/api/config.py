import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # urban_pulse_v2/

UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

DEMO_DATA_PATH = BASE_DIR / "data" / "demo" / "demo_source.csv"

CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

AVAILABLE_MODELS = [
    "gemini-3.1-flash-lite-preview",
]

MAX_FILE_SIZE_MB = 50
MAX_FILTER_SELECTIONS = 3
SESSION_TTL_SECONDS = 3600
