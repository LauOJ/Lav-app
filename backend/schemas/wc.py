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


class WCRead(WCBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
