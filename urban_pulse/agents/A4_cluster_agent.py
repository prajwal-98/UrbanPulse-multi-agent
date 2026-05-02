import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from core.schema import UrbanPulseState
from utils.llm_client import generate_response
from agents.A4_cluster_helpers import _extract_keywords, _fallback_name, _calculate_trend


def cluster_agent_node(state: UrbanPulseState) -> UrbanPulseState:
    """
    Step 4 — Pattern Detection (A4)

    Fully dynamic:
    - Clustering (TF-IDF + KMeans)
    - LLM-based cluster naming
    - LLM-based characteristics
    - Trend calculation (if date exists)
    """

    df = state.get("filtered_df")
    reasoning_steps = []

    # -------------------------------
    # 1. SAFETY CHECK
    # -------------------------------
    if df is None or df.empty:
        state["A4_output"] = {
        "summary": "Not enough data for clustering",
        "clusters": [],
        "meta_insight": "Insufficient data"
    }
        state["A4_reasoning"] = "No data available"
        return state

    reviews = df["raw_text"].fillna("").astype(str).tolist()
    print("reviews: ", reviews)
    if len(reviews) < 5:
        state["A4_output"] = {
        "summary": "Not enough data for clustering",
        "clusters": [],
        "meta_insight": "Insufficient data"
    }
        state["A4_reasoning"] = "Not enough data"
        return state

    try:
        # -------------------------------
        # 2. TF-IDF
        # -------------------------------
        tfidf = TfidfVectorizer(
            stop_words="english",
            max_features=1000,
            sublinear_tf=True,
            ngram_range=(1, 2)
        )

        X = tfidf.fit_transform(reviews)

        # -------------------------------
        # 3. KMEANS
        # -------------------------------
        k = 3
        kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = kmeans.fit_predict(X)

        df_clustered = df.copy()
        df_clustered["cluster"] = labels

        total = len(df_clustered)
        cluster_ids = sorted(df_clustered["cluster"].unique())

        # Pre-compute per-cluster data
        cluster_data = []
        for cluster_id in cluster_ids:
            cluster_df = df_clustered[df_clustered["cluster"] == cluster_id]
            texts = cluster_df["raw_text"].astype(str).tolist()
            cluster_data.append({
                "cluster_id": int(cluster_id),
                "texts": texts,
                "size": int((len(cluster_df) / total) * 100),
                "signals": _extract_keywords(texts),
                "trend": _calculate_trend(cluster_df),
                "cluster_df": cluster_df,
            })

        # -------------------------------
        # 4. SINGLE BATCH LLM CALL FOR ALL CLUSTER NAMES
        # -------------------------------
        batch_prompt = f"""You are a Q-Commerce analyst. Label {len(cluster_data)} customer review clusters.

Clusters (sample reviews):
{[{"cluster": i+1, "reviews": cd["texts"][:5]} for i, cd in enumerate(cluster_data)]}

Return a JSON array of {len(cluster_data)} objects only:
[{{"name": "2-3 word name", "description": "1 line summary"}}]"""

        try:
            batch_output = generate_response(batch_prompt, state)
            if not isinstance(batch_output, list) or len(batch_output) != len(cluster_data):
                batch_output = [{}] * len(cluster_data)
        except:
            batch_output = [{}] * len(cluster_data)

        clusters_output = []
        for i, cd in enumerate(cluster_data):
            llm_out = batch_output[i] if isinstance(batch_output[i], dict) else {}
            name = llm_out.get("name") or _fallback_name(cd["signals"])
            description = llm_out.get("description") or "Customer issues grouped by similarity"
            clusters_output.append({
                "cluster_id": cd["cluster_id"],
                "name": name,
                "size": cd["size"],
                "description": description,
                "signals": cd["signals"],
                "examples": cd["texts"][:5],
                "trend": cd["trend"],
            })

        # -------------------------------
        # META INSIGHT (LLM)
        # -------------------------------
        meta_prompt = f"""
        Given these cluster summaries:
        {clusters_output}

        Provide one short business insight (1 line).
        """

        try:
            meta_insight = generate_response(meta_prompt, state)
            if not isinstance(meta_insight, str):
                meta_insight = str(meta_insight)
        except:
            meta_insight = "Key operational issues dominate customer complaints"

        # -------------------------------
        # FINAL OUTPUT
        # -------------------------------
        state["A4_output"] = {
            "summary": f"{len(clusters_output)} major issue clusters identified",
            "clusters": clusters_output,
            "meta_insight": meta_insight.strip()
        }
        print("A4_output: ", state["A4_output"])
        print("A4_reasoning: ", state["A4_reasoning"])
        reasoning_steps.append("Dynamic clustering + LLM enrichment complete")

    except Exception as e:
        state["A4_output"] = {
        "summary": "Not enough data for clustering",
        "clusters": [],
        "meta_insight": "Insufficient data"
    }
        reasoning_steps.append(f"Error: {str(e)}")

    # -------------------------------
    # STATE UPDATE
    # -------------------------------
    state["A4_reasoning"] = "\n".join(reasoning_steps)

    steps = state.get("completed_steps", [])
    if 4 not in steps:
        steps.append(4)

    state["completed_steps"] = steps
    state["current_step"] = 5

    return state

