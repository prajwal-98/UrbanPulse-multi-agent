from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date


class Filters(BaseModel):
    date_from: Optional[date] = None
    date_to: Optional[date] = None
    cities: List[str] = Field(default_factory=list)
    platforms: List[str] = Field(default_factory=list)
    categories: List[str] = Field(default_factory=list)


class RunAnalysisRequest(BaseModel):
    session_id: str
    api_key: str
    model: str
    filters: Filters = Field(default_factory=Filters)


class FilterPreviewRequest(BaseModel):
    session_id: str
    filters: Filters
