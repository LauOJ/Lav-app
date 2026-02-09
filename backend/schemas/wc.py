from datetime import datetime
from pydantic import BaseModel, ConfigDict


class WCBase(BaseModel):
    name: str
    latitude: float
    longitude: float
    accessible: bool = False
    gender_neutral: bool = False
    has_changing_table: bool = False
    only_for_customers: bool = False
    has_intimate_hygiene_products: bool = False
    description: str | None = None


class WCCreate(WCBase):
    pass


class WCUpdate(BaseModel):
    name: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    accessible: bool | None = None
    gender_neutral: bool | None = None
    has_changing_table: bool | None = None
    only_for_customers: bool | None = None
    has_intimate_hygiene_products: bool | None = None
    description: str | None = None


class WCCreated(WCBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WCRead(WCBase):
    id: int
    created_at: datetime
    avg_cleanliness: float | None
    avg_safety: float | None
    reviews_count: int

    model_config = ConfigDict(from_attributes=True)
