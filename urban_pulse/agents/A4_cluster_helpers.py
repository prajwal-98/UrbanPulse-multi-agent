import pandas as pd


def _extract_keywords(texts):
    words = " ".join(texts).lower().split()
    freq = {}

    for w in words:
        if len(w) < 4:
            continue
        freq[w] = freq.get(w, 0) + 1

    return sorted(freq, key=freq.get, reverse=True)[:5]


def _fallback_name(signals):
    text = " ".join(signals)

    if any(w in text for w in ["delivery", "delay"]):
        return "Delivery Issues"

    if any(w in text for w in ["missing", "wrong", "damaged"]):
        return "Product Issues"

    return "Service Experience"


def _calculate_trend(cluster_df):
    """
    Simple trend:
    compares recent vs older data if 'date' column exists
    """

    if "date" not in cluster_df.columns:
        return "Stable"

    df = cluster_df.copy()
    df["date"] = pd.to_datetime(df["date"], errors="coerce")

    df = df.dropna(subset=["date"])

    if df.empty:
        return "Stable"

    recent = df[df["date"] >= df["date"].max() - pd.Timedelta(days=7)]
    previous = df[df["date"] < df["date"].max() - pd.Timedelta(days=7)]

    if len(previous) == 0:
        return "Stable"

    if len(recent) > len(previous):
        return "Increasing"

    if len(recent) < len(previous):
        return "Decreasing"

    return "Stable"
