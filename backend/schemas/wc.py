from datetime import datetime
from pydantic import BaseModel, ConfigDict


class WCBase(BaseModel):
    name: str
    latitude: str
    longitude: str
    accessible: bool = False
    gender_neutral: bool = False
    has_changing_table: bool = False
    description: str | None = None


class WCCreate(WCBase):
    pass


class WCRead(WCBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
