from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class SavedVisualizationBase(BaseModel):
    name: str = Field(max_length=100)
    kind: str = Field(max_length=32)
    payload: dict


class SavedVisualizationCreate(SavedVisualizationBase):
    pass


class SavedVisualizationOut(SavedVisualizationBase):
    id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    name: str | None = None
    surname: str | None = None
    email: EmailStr
    profile_picture: str | None = None
    profile_picture_url: str | None = None


class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    surname: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8)
    profile_picture: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=100)
    surname: str | None = Field(default=None, max_length=100)
    email: EmailStr | None = None


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


class UserProfileOut(UserOut):
    saved_visualizations: list[SavedVisualizationOut] = []
