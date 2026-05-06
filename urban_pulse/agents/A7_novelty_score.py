import re
import json
import pandas as pd
from collections import Counter
from core.schema import UrbanPulseState
from core.constants import CITY_SLANG_MAP
from utils.llm_client import generate_response

STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "is", "was", "are", "were", "be", "been", "have", "has",
    "had", "do", "did", "will", "would", "could", "should", "may", "might",
    "i", "my", "me", "we", "our", "you", "your", "it", "its", "this", "that",
    "they", "their", "them", "he", "she", "his", "her", "not", "no", "so",
    "very", "just", "also", "from", "by", "as", "if", "then", "than", "into",
    "more", "very", "too", "order", "delivery", "app", "time", "product",
    "items", "item", "good", "bad", "ok", "okay", "got", "get", "did", "even",
    "like", "really", "would", "still", "always", "never", "every", "all",
    "when", "what", "how", "why", "which", "who", "there", "here", "about",
}


def _get_known_slang_flat() -> dict[str, str]:
    """Returns {slang_lower: city} for all known slang."""
    mapping = {}
    for city, terms in CITY_SLANG_MAP.items():
        for term in terms:
            mapping[term.lower()] = city
    return mapping


def _detect_known_slang(df: pd.DataFrame) -> dict[str, int]:
    """Count occurrences of known slang across all reviews."""
    usage = {}
    for terms in CITY_SLANG_MAP.values():
        for term in terms:
            count = int(df["raw_text"].str.lower().str.contains(
                term.lower(), regex=False
            ).sum())
            if count > 0:
                usage[term] = usage.get(term, 0) + count
    return usage


def _detect_unknown_slang(df: pd.DataFrame, known_slang: dict, min_freq: int = 3) -> list[str]:
    """Find high-frequency non-stopword tokens not in known slang list."""
    known_lower = {k.lower() for k in known_slang}
    all_tokens = []
    for text in df["raw_text"]:
        tokens = re.findall(r"\b[a-zA-Z]{3,}\b", str(text).lower())
        all_tokens.extend(tokens)

    freq = Counter(all_tokens)
    candidates = []
    for token, count in freq.items():
        if (
            count >= min_freq
            and token not in STOPWORDS
            and token not in known_lower
        ):
            candidates.append(token)

    return candidates[:20]  # cap at 20 to keep LLM prompt tight


def _call_llm_for_intelligence(
    state: UrbanPulseState,
    known_usage: dict,
    unknown_candidates: list,
    city_slang_raw: list,
) -> dict:
    """Single LLM call to enrich all slang with meaning, sentiment, narrative."""

    known_list = [
        {"slang": slang, "total_usage": count}
        for slang, count in known_usage.items()
    ]

    prompt = f"""
You are a Q-Commerce language analyst for Indian cities.

You are given:
1. KNOWN SLANG — city-specific terms detected in customer reviews with usage counts
2. UNKNOWN CANDIDATES — high-frequency words from reviews that may be new slang or colloquial expressions

KNOWN SLANG:
{json.dumps(known_list, indent=2)}

UNKNOWN CANDIDATES (high-frequency words, may or may not be slang):
{unknown_candidates}

CITY-WISE SLANG SIGNALS:
{json.dumps(city_slang_raw, indent=2)}

Your tasks:
1. For each KNOWN slang term: provide its meaning in Q-commerce context and dominant sentiment (positive/negative/neutral)
2. For UNKNOWN candidates: identify which ones are genuine slang/colloquial (not standard English), explain them, and classify sentiment
3. Write a 2-3 sentence narrative that tells the story of what the language patterns reveal about customer experience
4. Identify the top city by slang density

Return STRICT JSON only, no explanation, no markdown:
{{
  "narrative": "2-3 sentence story of what language patterns reveal",
  "top_city": "city name with highest slang density",
  "slang_intelligence": [
    {{
      "slang": "term",
      "meaning": "what it means in Q-commerce context",
      "total_usage": <number>,
      "dominant_sentiment": "positive or negative or neutral",
      "is_known": true or false
    }}
  ],
  "new_slang_detected": [
    {{
      "slang": "term",
      "meaning": "inferred meaning",
      "usage": <number>,
      "dominant_sentiment": "positive or negative or neutral"
    }}
  ]
}}

Rules:
- Only include unknown candidates that are genuinely slang or colloquial
- If no unknown candidates qualify, return empty array for new_slang_detected
- Keep meanings concise (under 8 words)
- narrative must be insightful, not generic
"""

    try:
        raw = generate_response(prompt, state)
        raw = raw.strip()
        if raw.startswith("```"):
            raw = re.sub(r"```(?:json)?", "", raw).strip().rstrip("```").strip()
        return json.loads(raw)
    except Exception as e:
        return {
            "narrative": "Language patterns analyzed but interpretation unavailable.",
            "top_city": "",
            "slang_intelligence": [
                {
                    "slang": slang,
                    "meaning": "",
                    "total_usage": count,
                    "dominant_sentiment": "neutral",
                    "is_known": True,
                }
                for slang, count in known_usage.items()
            ],
            "new_slang_detected": [],
        }


def _build_city_slang_grouped(df: pd.DataFrame, known_usage: dict) -> list:
    """Group detected slang by city."""
    known_lower_to_original = {t.lower(): t for terms in CITY_SLANG_MAP.values() for t in terms}
    city_map: dict[str, list] = {}

    for city, terms in CITY_SLANG_MAP.items():
        for term in terms:
            if term not in known_usage:
                continue
            count = int(df[
                df["raw_text"].str.lower().str.contains(term.lower(), regex=False)
                & (df["city"].str.lower() == city.lower() if "city" in df.columns else pd.Series([True] * len(df)))
            ].shape[0])
            if count > 0:
                city_map.setdefault(city, []).append({"slang": term, "usage": count})

    return [{"city": city, "terms": terms} for city, terms in city_map.items()]


def _build_emerging_slang(known_usage: dict, new_slang: list) -> list:
    """Emerging = known terms seen only 1-3 times + new slang from LLM."""
    emerging = []
    for slang, count in known_usage.items():
        if 1 <= count <= 3:
            emerging.append({"slang": slang, "usage": count, "is_new": False})
    for item in new_slang:
        emerging.append({
            "slang": item.get("slang", ""),
            "usage": item.get("usage", 0),
            "meaning": item.get("meaning", ""),
            "dominant_sentiment": item.get("dominant_sentiment", "neutral"),
            "is_new": True,
        })
    return emerging


def novelty_score_node(state: UrbanPulseState) -> UrbanPulseState:
    df = state.get("filtered_df")

    if df is None or df.empty:
        state["A7_output"] = {
            "narrative": "No data available.",
            "top_city": "",
            "slang_intelligence": [],
            "city_slang": [],
            "emerging_slang": [],
        }
        state["A7_reasoning"] = "No data available"
        return state

    try:
        df = df.copy()
        df["raw_text"] = df["raw_text"].fillna("").astype(str)

        # 1. Heuristic detection
        known_usage = _detect_known_slang(df)
        unknown_candidates = _detect_unknown_slang(df, known_usage)

        # 2. City grouping (heuristic, no LLM needed)
        city_slang_raw = []
        for city, terms in CITY_SLANG_MAP.items():
            for term in terms:
                if term in known_usage:
                    city_slang_raw.append({"city": city, "slang": term, "usage": known_usage[term]})

        city_slang_grouped = _build_city_slang_grouped(df, known_usage)

        # 3. LLM enrichment (meanings + narrative + new slang classification)
        llm_result = _call_llm_for_intelligence(state, known_usage, unknown_candidates, city_slang_raw)

        # 4. Emerging slang
        emerging_slang = _build_emerging_slang(known_usage, llm_result.get("new_slang_detected", []))

        state["A7_output"] = {
            "narrative": llm_result.get("narrative", ""),
            "top_city": llm_result.get("top_city", ""),
            "slang_intelligence": llm_result.get("slang_intelligence", []),
            "city_slang": city_slang_grouped,
            "emerging_slang": emerging_slang,
        }
        state["A7_reasoning"] = "Slang detected heuristically; meanings and narrative generated by LLM."

    except Exception as e:
        state["A7_output"] = {
            "narrative": "",
            "top_city": "",
            "slang_intelligence": [],
            "city_slang": [],
            "emerging_slang": [],
        }
        state["A7_reasoning"] = f"Error: {str(e)}"

    steps = state.get("completed_steps", [])
    if 7 not in steps:
        steps.append(7)
    state["completed_steps"] = steps
    state["current_step"] = 8
    return state