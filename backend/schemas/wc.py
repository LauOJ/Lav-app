from datetime import datetime
from pydantic import BaseModel, ConfigDict


class WCBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    is_public: bool = True
    has_changing_table: bool = False
    description: str | None = None


class WCCreate(WCBase):
    pass


class WCUpdate(BaseModel):
    name: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    is_public: bool | None = None
    has_changing_table: bool | None = None
    description: str | None = None


class WCCreated(WCBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WCRead(WCBase):
    id: int
    created_at: datetime
    avg_cleanliness: float | None
    reviews_count: int
    safety_score: float | None
    accessibility_score: float | None
    toilet_paper_score: float | None
    hygiene_products_score: float | None
    free_entry_score: float | None
    gender_mixed_score: float | None

    model_config = ConfigDict(from_attributes=True)
