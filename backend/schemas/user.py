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
    name: str | None
    is_admin: bool
    language_preference: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# -------- Profile update (input) --------
class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None


# -------- Password change (input) --------
class UserPasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


# -------- Language update (input) --------
class UserLanguageUpdate(BaseModel):
    language_preference: str
