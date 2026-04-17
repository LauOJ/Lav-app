import re
from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


def _validate_password_complexity(v: str) -> str:
    if not re.search(r'[A-Za-z]', v):
        raise ValueError('Password must contain at least one letter')
    if not re.search(r'\d', v):
        raise ValueError('Password must contain at least one number')
    return v


# -------- Base --------
class UserBase(BaseModel):
    email: EmailStr


# -------- Create (input) --------
class UserCreate(UserBase):
    password: str = Field(min_length=8)

    @field_validator('password')
    @classmethod
    def password_complexity(cls, v: str) -> str:
        return _validate_password_complexity(v)


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

    @field_validator('new_password')
    @classmethod
    def new_password_complexity(cls, v: str) -> str:
        return _validate_password_complexity(v)


# -------- Language update (input) --------
class UserLanguageUpdate(BaseModel):
    language_preference: str
