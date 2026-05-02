from typing import Optional


def generate_report_placeholder(session_id: str) -> dict:
    """Placeholder — PDF export to be implemented."""
    return {
        "session_id": session_id,
        "message": "PDF export coming soon. Use the dashboard view to screenshot results.",
        "available_formats": ["pdf", "json"],
    }
