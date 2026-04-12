from datetime import datetime
from typing import Annotated
from pydantic import BaseModel, ConfigDict, Field

class ReviewBase(BaseModel):
    cleanliness_rating: Annotated[int, Field(ge=1, le=5)]
    felt_safe: bool | None = None
    accessible: bool | None = None
    has_toilet_paper: bool | None = None
    hygiene_products_available: bool | None = None
    could_enter_without_buying: bool | None = None
    has_gender_mixed_option: bool | None = None
    has_changing_table: bool | None = None
    comment: str | None = None


class ReviewCreate(ReviewBase):
    wc_id: int


class ReviewUpdate(ReviewBase):
    pass


class ReviewRead(ReviewBase):
    id: int
    user_id: int
    wc_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
