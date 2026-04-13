from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field

# -------- Base --------
class UserBase(BaseModel):
    email: EmailStr


# -------- Create (input) --------
class UserCreate(UserBase):
    password: str = Field(min_length=8)


# -------- Read (output) --------
class UserRead(UserBase):
    id: int
    is_admin: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
