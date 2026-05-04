import pandas as pd
import json
from core.schema import UrbanPulseState
from core.constants import CITY_SLANG_MAP
from utils.llm_client import generate_response


def context_detector_node(state: UrbanPulseState) -> UrbanPulseState:
    """
    Step 2 — Context Detection (A2)
    """

    df = state.get("filtered_df")

    # -------------------------------
    # 1. SAFETY CHECK
    # -------------------------------
    if df is None or df.empty:
        state["A2_output"] = _empty_output("No data available")
        state["A2_reasoning"] = "No data available"
        state["current_step"] = 2
        return state

    # -------------------------------
    # 2. CITY CONTEXT
    # -------------------------------
    active_filters = state.get("active_filters", {})
    cities = active_filters.get("cities") or []
    city = cities[0] if cities else "Bangalore"

    slang_reference = CITY_SLANG_MAP.get(city, [])

    # -------------------------------
    # 3. SAMPLE REVIEWS
    # -------------------------------
    sample_reviews = (
        df.get("raw_text", pd.Series())
        .dropna()
        .astype(str)
        .head(30)
        .tolist()
    )

    # -------------------------------
    # 4. PROMPT
    # -------------------------------
    prompt = f"""
    You are a Local Market Analyst for Q-Commerce in {city}.

    Slang Reference: {slang_reference}

    Reviews (analyze all {len(sample_reviews)} reviews):
    {sample_reviews}

    Return STRICT JSON only, no explanation:

    {{
        "localized_sentiment": "2-3 sentence summary of overall customer mood",
        "sentiment_score": "positive or neutral or negative",
        "slang_detected": ["slang1", "slang2"],
        "operational_context": "1-2 sentences on what operational problem is happening",
        "top_themes": ["theme1", "theme2", "theme3", "theme4", "theme5"],
        "city_context": "1 sentence on what makes this city unique for Q-commerce",
        "urgency_level": "low or medium or high"
    }}
    """

    # -------------------------------
    # 5. LLM CALL
    # -------------------------------
    try:
        raw_response = generate_response(prompt, state)

    except Exception as e:
        state["A2_output"] = _empty_output("LLM failed")
        state["A2_reasoning"] = str(e)
        state["current_step"] = 2
        return state

    # -------------------------------
    # 6. SAFE PARSE (IMPORTANT FIX)
    # -------------------------------
    parsed = _safe_parse(raw_response)

    # -------------------------------
    # 7. BUILD TOP ENTITIES FROM DF
    # -------------------------------
    top_entities = {"cities": [], "platforms": [], "categories": []}
    try:
        top_entities["cities"] = df["city"].value_counts().head(3).index.tolist()
    except Exception:
        pass
    try:
        top_entities["platforms"] = df["platform"].value_counts().head(3).index.tolist()
    except Exception:
        pass
    try:
        top_entities["categories"] = df["category"].value_counts().head(3).index.tolist()
    except Exception:
        pass

    # Sample 3 real reviews
    sample_reviews = []
    try:
        sampled_df = df.sample(min(3, len(df)), random_state=42)
        sample_reviews = [
            {"text": row.get("raw_text", ""), "platform": row.get("platform", ""), "city": row.get("city", "")}
            for _, row in sampled_df.iterrows()
        ]
    except Exception:
        pass

    # -------------------------------
    # 8. STORE OUTPUT
    # -------------------------------
    state["A2_output"] = {
        "city": city,
        "review_count": len(df),
        "localized_sentiment": parsed.get("localized_sentiment", ""),
        "sentiment_score": parsed.get("sentiment_score", "neutral"),
        "slang_detected": parsed.get("slang_detected", []),
        "operational_context": parsed.get("operational_context", ""),
        "top_themes": parsed.get("top_themes", []),
        "city_context": parsed.get("city_context", ""),
        "urgency_level": parsed.get("urgency_level", "medium"),
        "top_entities": top_entities,
        "sample_reviews": sample_reviews,
    }

    state["A2_reasoning"] = "Success"

    # -------------------------------
    # 8. STEP UPDATE
    # -------------------------------
    steps = state.get("completed_steps", [])
    if 2 not in steps:
        steps.append(2)

    state["completed_steps"] = steps
    state["current_step"] = 3

    return state


# -------------------------------
# HELPERS
# -------------------------------

def _empty_output(msg):
    return {
        "city": "",
        "review_count": 0,
        "localized_sentiment": msg,
        "sentiment_score": "neutral",
        "slang_detected": [],
        "operational_context": msg,
        "top_themes": [],
        "city_context": "",
        "urgency_level": "medium",
        "top_entities": {"cities": [], "platforms": [], "categories": []},
        "sample_reviews": [],
    }


import json

def _safe_parse(raw):
    if isinstance(raw, dict):
        return raw

    if isinstance(raw, str):
        # 1. Clean whitespace and Markdown wrappers
        cleaned = raw.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:-3].strip()  # Remove ```json and trailing ```
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:-3].strip()  # Remove ``` and trailing ```
        
        try:
            return json.loads(cleaned)
        except Exception:
            # 2. If it still fails, it might be a partial string or badly formatted
            return {}

    return {}