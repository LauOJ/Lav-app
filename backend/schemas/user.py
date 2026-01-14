from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr

# -------- Base --------
class UserBase(BaseModel):
    email: EmailStr


# -------- Create (input) --------
class UserCreate(UserBase):
    password: str


# -------- Read (output) --------
class UserRead(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
