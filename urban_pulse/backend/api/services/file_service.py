import uuid
import pandas as pd
from pathlib import Path
from typing import Optional
from datetime import datetime

from ..config import UPLOAD_DIR, DEMO_DATA_PATH
from ..schemas.response_models import FilterOptions

# In-memory session store: session_id -> { df, filename, mode, state, status, progress }
_sessions: dict = {}


def create_session() -> str:
    return str(uuid.uuid4())


def get_session(session_id: str) -> Optional[dict]:
    return _sessions.get(session_id)


def set_session(session_id: str, data: dict) -> None:
    _sessions[session_id] = data


def normalize_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    # Ensure raw_text column exists
    for candidate in ["review_text", "text", "review", "comment", "feedback"]:
        if candidate in df.columns and "raw_text" not in df.columns:
            df["raw_text"] = df[candidate].astype(str).str.strip()
    if "raw_text" not in df.columns and len(df.columns) > 0:
        # Fall back to first string column
        for col in df.columns:
            if df[col].dtype == object:
                df["raw_text"] = df[col].astype(str).str.strip()
                break
    # Ensure star_rating column exists
    for candidate in ["star_rating", "rating", "stars", "score"]:
        if candidate in df.columns and "star_rating" not in df.columns:
            df["star_rating"] = pd.to_numeric(df[candidate], errors="coerce")
            break

    # Parse date column
    for candidate in ["date", "review_date", "created_at", "timestamp"]:
        if candidate in df.columns:
            df[candidate] = pd.to_datetime(df[candidate], errors="coerce")
            if "date" not in df.columns:
                df["date"] = df[candidate]
            break
    return df


def _extract_filter_options(df: pd.DataFrame) -> FilterOptions:
    cities: list = []
    platforms: list = []
    categories: list = []
    date_min: Optional[str] = None
    date_max: Optional[str] = None

    for col in ["city", "cities", "location"]:
        if col in df.columns:
            cities = sorted(df[col].dropna().unique().tolist())
            break

    for col in ["platform", "platforms", "source", "channel"]:
        if col in df.columns:
            platforms = sorted(df[col].dropna().unique().tolist())
            break

    for col in ["category", "categories", "product_category", "type"]:
        if col in df.columns:
            categories = sorted(df[col].dropna().unique().tolist())
            break

    for col in ["date", "review_date", "created_at", "timestamp"]:
        if col in df.columns:
            series = pd.to_datetime(df[col], errors="coerce").dropna()
            if not series.empty:
                date_min = series.min().strftime("%Y-%m-%d")
                date_max = series.max().strftime("%Y-%m-%d")
            break

    return FilterOptions(
        cities=cities,
        platforms=platforms,
        categories=categories,
        date_min=date_min,
        date_max=date_max,
        total_rows=len(df),
    )


async def save_upload(file_bytes: bytes, filename: str) -> tuple[str, pd.DataFrame, FilterOptions]:
    session_id = create_session()
    dest = UPLOAD_DIR / f"{session_id}_{filename}"
    dest.write_bytes(file_bytes)

    df = pd.read_csv(dest)
    df = normalize_dataframe(df)
    filter_opts = _extract_filter_options(df)

    set_session(session_id, {
        "df": df,
        "filename": filename,
        "mode": "live",
        "state": None,
        "status": "pending",
        "progress": 0,
        "current_step": None,
        "error": None,
    })
    return session_id, df, filter_opts


async def load_demo_session() -> tuple[str, pd.DataFrame, FilterOptions]:
    session_id = create_session()

    if DEMO_DATA_PATH.exists():
        df = pd.read_csv(DEMO_DATA_PATH)
    else:
        # Minimal synthetic demo data so the backend never crashes
        df = pd.DataFrame({
            "date": pd.date_range("2024-01-01", periods=100, freq="D"),
            "platform": (["Blinkit"] * 40 + ["Zepto"] * 35 + ["Swiggy Instamart"] * 25),
            "city": (["Bangalore"] * 50 + ["Mumbai"] * 30 + ["Delhi"] * 20),
            "category": (["Ice Cream"] * 60 + ["Dairy"] * 25 + ["Frozen Food"] * 15),
            "brand": (["Amul"] * 50 + ["Kwality Walls"] * 30 + ["Mother Dairy"] * 20),
            "raw_text": ["Product arrived melted. Very disappointed."] * 100,
            "rating": ([2] * 40 + [3] * 30 + [4] * 20 + [5] * 10),
        })

    df = normalize_dataframe(df)
    filter_opts = _extract_filter_options(df)

    set_session(session_id, {
        "df": df,
        "filename": "demo_dataset.csv",
        "mode": "demo",
        "state": None,
        "status": "pending",
        "progress": 0,
        "current_step": None,
        "error": None,
    })
    return session_id, df, filter_opts
