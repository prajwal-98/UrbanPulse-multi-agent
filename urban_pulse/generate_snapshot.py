import sys
from pathlib import Path

# Setup path
ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "backend"))

from backend.api.services.file_service import load_demo_session
from backend.api.services.analysis_service import run_pipeline_sync
import asyncio

API_KEY = ""
MODEL = "gemini-3.1-flash-lite-preview"

async def main():
    session_id, _, _ = await load_demo_session()
    print(f"Demo session created: {session_id}")
    run_pipeline_sync(session_id, API_KEY, MODEL, {
        "date_from": None,
        "date_to": None,
        "cities": [],
        "platforms": [],
        "categories": [],
    })
    print("Snapshot saved to data/state_snapshot.json")

asyncio.run(main())
