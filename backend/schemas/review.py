from datetime import datetime
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field

class ReviewBase(BaseModel):
    cleanliness_rating: Annotated[int, Field(ge=1, le=5)]
    safety_rating: Annotated[int, Field(ge=1, le=5)]
    comment: str | None = None


class ReviewCreate(ReviewBase):
    wc_id: int


class ReviewRead(ReviewBase):
    id: int
    user_id: int
    wc_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
