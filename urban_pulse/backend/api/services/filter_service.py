import pandas as pd
from typing import Optional
from datetime import date


def apply_filters(
    df: pd.DataFrame,
    date_from: Optional[date],
    date_to: Optional[date],
    cities: list,
    platforms: list,
    categories: list,
) -> pd.DataFrame:
    filtered = df.copy()

    date_col = None
    for c in ["date", "review_date", "created_at", "timestamp"]:
        if c in filtered.columns:
            date_col = c
            break

    if date_col and date_from:
        filtered = filtered[pd.to_datetime(filtered[date_col], errors="coerce") >= pd.Timestamp(date_from)]
    if date_col and date_to:
        filtered = filtered[pd.to_datetime(filtered[date_col], errors="coerce") <= pd.Timestamp(date_to)]

    for col_candidates, values in [
        (["city", "cities", "location"], cities),
        (["platform", "platforms", "source", "channel"], platforms),
        (["category", "categories", "product_category", "type"], categories),
    ]:
        if not values:
            continue
        for col in col_candidates:
            if col in filtered.columns:
                filtered = filtered[filtered[col].isin(values)]
                break

    return filtered
