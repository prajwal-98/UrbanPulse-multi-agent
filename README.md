# UrbanPulse

**Multi-agent intelligence platform for analysing quick-commerce customer reviews across Indian cities.**

![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js&logoColor=white)
![LangGraph](https://img.shields.io/badge/LangGraph-orchestrated-6366f1)
![Gemini](https://img.shields.io/badge/Gemini-Flash_Lite-4285F4?logo=google&logoColor=white)

---

## What is UrbanPulse

UrbanPulse is a pipeline-driven intelligence system that turns raw customer review CSVs into structured business intelligence — cluster patterns, escalation actions, platform signals, and a final predictive story — without any manual analysis.

It is built for product, ops, and growth teams at quick-commerce platforms (Zepto, Blinkit, Swiggy Instamart, BigBasket Now) who need to understand city-level sentiment, slang-encoded feedback, and delivery pain points at scale. Each uploaded dataset flows through eight specialised AI agents in sequence, with every intermediate output surfaced step-by-step in the UI.

The platform runs fully locally or deploys to Vercel + Railway with no infrastructure changes. It supports three entry modes — a pre-loaded demo, a cached last-run, or a fresh upload — so teams can explore results without re-running the full pipeline every time.

---

## System Architecture

The pipeline is a sequential LangGraph graph: A1 → A2 → ... → A8. A1 acts as a gatekeeper; if the dataset fails validation the graph terminates early. All intermediate state is shared via `UrbanPulseState` (TypedDict).

| Agent | Name | What it does |
|-------|------|--------------|
| **A1** | Gatekeeper | Validates schema, null rates, required columns. Halts pipeline on failure. Produces quality metrics and distribution charts. |
| **A2** | Context Detector | Detects city/platform operational context. Maps regional slang (`sakkath`, `kirak`, `hau`). Scores overall sentiment via Gemini LLM. |
| **A3** | Semantic Shaper | Builds TF-IDF vectors, finds the anchor review via cosine similarity, surfaces the top semantic cluster theme. |
| **A4** | Cluster Agent | K-means clustering on review text. LLM enriches each cluster with a name, description, and trend direction. |
| **A5** | Category Escalation | Converts clusters into prioritised business actions with impacted cities, platforms, and escalation teams. |
| **A6** | Platform Signal | Aggregates platform share, top brands, category mentions, city volumes, and peak activity hour. |
| **A7** | Novelty Score | Scores language novelty. Builds slang intelligence index — known vs emerging terms, city-level usage, dominant sentiment per term. |
| **A8** | Insight Dashboard | Synthesises all agent outputs into a final story, confidence score, revenue risk estimate, churn probability, and ranked action plan. |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.11+, Uvicorn |
| Orchestration | LangGraph (StateGraph) |
| LLM | Google Gemini (`gemini-3.1-flash-lite`) via `google-genai` |
| ML / NLP | scikit-learn (TF-IDF, K-means), scipy, numpy |
| Data | pandas |
| Session | In-memory (server-side), polling-based progress |

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend (Vercel) | `https://urban-pulse-multi-agent.vercel.app` |
| Backend (Railway) | _add your Railway URL here_ |

---

## Project Structure

```
UrbanPulse-multi-agent/
├── urban_pulse/
│   ├── agents/               # A1–A8 agent implementations
│   │   ├── A1_gatekeeper.py
│   │   ├── A2_context_detector.py
│   │   ├── A3_semantic_shaper.py
│   │   ├── A4_cluster_agent.py
│   │   ├── A5_category_escalation.py
│   │   ├── A6_platform_signal.py
│   │   ├── A7_novelty_score.py
│   │   └── A8_insight_dashboard.py
│   ├── backend/
│   │   └── api/
│   │       ├── main.py       # FastAPI app, CORS, router registration
│   │       ├── config.py     # Paths, CORS origins, model list, limits
│   │       └── routes/       # upload, analysis, steps, dashboard, export
│   ├── core/
│   │   ├── orchestrator.py   # LangGraph graph builder
│   │   └── schema.py         # UrbanPulseState TypedDict
│   ├── data/
│   │   ├── demo/
│   │   │   └── demo_source.csv
│   │   ├── sample_demo/
│   │   │   ├── sample_dataset.csv
│   │   │   └── sample_state.json
│   │   └── state_snapshot.json
│   ├── scripts/
│   │   └── clean_snapshots.py
│   ├── frontend/
│   │   ├── app/              # Next.js App Router pages
│   │   │   ├── page.tsx      # Landing / hero
│   │   │   └── (app)/
│   │   │       ├── landing/  # Mode selector + pipeline control
│   │   │       ├── step-1/ … step-7/
│   │   │       ├── dashboard/  # A8 final dashboard
│   │   │       └── pipeline/   # Pipeline overview
│   │   └── components/
│   │       ├── landing/
│   │       └── pipeline/
│   └── utils/
│       └── llm_client.py     # Gemini API wrapper
└── venv_urbanpulse/          # Python virtual environment (not committed)
```

---

## Local Setup

### 1. Clone

```bash
git clone https://github.com/prajwal-98/UrbanPulse-multi-agent.git
cd UrbanPulse-multi-agent
```

### 2. Backend

```bash
# Create and activate virtual environment
python -m venv venv_urbanpulse
venv_urbanpulse\Scripts\activate        # Windows
# source venv_urbanpulse/bin/activate   # macOS / Linux

# Install dependencies
pip install fastapi uvicorn langgraph google-genai pandas scikit-learn scipy numpy python-multipart python-dotenv

# Set environment variables (see table below)
# Then start the API server from the project root
uvicorn urban_pulse.backend.api.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`.

### 3. Frontend

```bash
cd urban_pulse/frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

---

## Environment Variables

Create a `.env` file at the repo root (or set these in your deployment dashboard):

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key — used by A2, A3, A4, A5, A7, A8 |
| `NEXT_PUBLIC_API_URL` | Yes | Full URL of the FastAPI backend, e.g. `http://localhost:8000` |

> Never commit `GEMINI_API_KEY` to git. Run `python scripts/clean_snapshots.py` before every push to strip any keys that leaked into snapshot files.

---

## How to Use

Navigate to `http://localhost:3000` and choose a mode from the landing page:

| Mode | Description |
|------|-------------|
| **Try Demo** | Loads `data/demo/demo_source.csv` — 200 pre-loaded Indian quick-commerce reviews. No upload needed. |
| **Last Run** | Restores the most recent completed pipeline run from `data/state_snapshot.json`. Instantly shows all A1–A8 outputs without re-running agents. |
| **My Data** | Upload your own CSV (max 50 MB). Must contain: `review_id`, `date`, `city`, `platform`, `category`, `brand`, `raw_text`, `star_rating`. Pipeline runs end-to-end. |

After starting a run, each step page (`/step-1` through `/step-7`) shows the live output of its agent. Step 7 links to `/dashboard` for the A8 final intelligence report.

---

## Data Files

| File | Purpose |
|------|---------|
| `data/demo/demo_source.csv` | Curated 200-row demo dataset with Indian city/platform/brand reviews. Used by "Try Demo" mode. |
| `data/sample_demo/sample_dataset.csv` | Alternate sample dataset for testing alternate pipeline paths. |
| `data/sample_demo/sample_state.json` | Pre-computed pipeline state for the sample dataset. Loaded by "Last Run" when no live snapshot exists. |
| `data/state_snapshot.json` | Auto-saved state from the most recent full pipeline run. Powers "Last Run" mode. |

---

## Pre-Push Checklist

Before every `git push`, run from the repo root:

```bash
python urban_pulse/scripts/clean_snapshots.py
```

This script:
- Replaces `NaN` / `Infinity` float values with `null` in both snapshot files
- Strips sensitive keys (`api_key`, `model`, `raw_df`, `filtered_df`) from all nested objects
- Prints a per-file summary and exits with code `1` if any file is missing

Then stage the cleaned files:

```bash
git add urban_pulse/data/state_snapshot.json
git add urban_pulse/data/sample_demo/sample_state.json
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Service health check |
| `POST` | `/upload` | Upload a CSV dataset |
| `POST` | `/analysis/run` | Trigger the A1–A8 pipeline |
| `GET` | `/steps/{step}` | Fetch output for a specific agent step |
| `GET` | `/dashboard` | Fetch A8 final dashboard output |
| `GET` | `/export` | Export pipeline results |

Full interactive docs: `http://localhost:8000/docs`

---

## License

MIT
