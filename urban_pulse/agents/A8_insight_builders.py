import pandas as pd


def build_metrics(df):
    total_reviews = len(df)

    negative_count = df["raw_text"].str.contains(
        "late|delay|bad|missing|slow|rude", case=False, regex=True
    ).sum()

    negative_pct = round((negative_count / total_reviews) * 100, 1) if total_reviews else 0

    top_brand = None
    if "brand" in df.columns:
        top_brand = df["brand"].value_counts().idxmax()

    return {
        "total_reviews": total_reviews,
        "negative_count": negative_count,
        "negative_pct": negative_pct,
        "top_brand": top_brand,
    }


def build_story(issue, peak_time, df):
    city = df["city"].mode()[0] if "city" in df.columns else "selected region"
    category = df["category"].mode()[0] if "category" in df.columns else "key categories"
    return f"During {peak_time} in {city}, {issue.lower()} are impacting {category.lower()} products."


def build_confidence(size, total_reviews, negative_pct, issue, peak_time):
    confidence = min(95, max(60, int((size / total_reviews) * 100)))

    drivers = [
        f"{negative_pct}% negative sentiment",
        f"{issue} is dominant pattern",
        f"Peak load during {peak_time}",
    ]

    return confidence, drivers


def build_impact(size, negative_pct):
    return {
        "revenue_risk": f"₹{size * 150}K approx",
        "affected_reviews": size,
        "churn_risk_percent": min(50, int(negative_pct * 0.6)),
    }


def build_root_cause(peak_time, issue):
    return f"High demand during {peak_time} combined with operational inefficiencies is driving {issue.lower()}."

def build_actions(a5):
    actions = []

    items = a5 if isinstance(a5, list) else a5.get("items", []) if isinstance(a5, dict) else []

    for item in items[:3]:
        actions.append({
            "title": f"{item.get('issue_category', 'Issue')} Fix",
            "description": item.get("reason", ""),
            "priority": item.get("priority", "Medium"),
        })

    if not actions:
        actions = [
            {
                "title": "Improve Operations",
                "description": "Optimize delivery and inventory handling",
                "priority": "High",
            }
        ]

    return actions

def build_language_highlights(a7):
    slang_data = a7.get("slang_intelligence", [])
    language_highlights = []
    for s in slang_data[:3]:
        sentiment_dict = s.get("sentiment", {})
        sentiment = max(sentiment_dict, key=sentiment_dict.get) if sentiment_dict else "neutral"
        language_highlights.append({
            "slang": s.get("slang"),
            "usage": s.get("total_usage"),
            "sentiment": sentiment,
        })
    return language_highlights

def build_evidence(df):
    return df["raw_text"].dropna().head(5).tolist()
