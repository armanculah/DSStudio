from datetime import datetime

from sqlalchemy import JSON, Column, Enum
from sqlmodel import Field, Relationship, SQLModel


class User(SQLModel, table=True):
    """users table mapping."""

    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    name: str | None = Field(default=None, max_length=100)
    surname: str | None = Field(default=None, max_length=100)
    email: str = Field(index=True, unique=True, max_length=255)
    profile_picture: str | None = Field(default=None, max_length=512)
    hashed_password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    saved_visualizations: list["SavedVisualization"] = Relationship(
        back_populates="user"
    )


class SavedVisualization(SQLModel, table=True):
    """saved_visualizations table mapping."""

    __tablename__ = "saved_visualizations"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(index=True, foreign_key="users.id")
    kind: str = Field(
        sa_column=Column(
            Enum(
                "array",
                "stack",
                "queue",
                "linkedlist",
                "bst",
                "graph",
                "hash",
                name="sv_kind",
            )
        )
    )
    name: str = Field(max_length=100)
    payload: dict = Field(sa_column=Column(JSON))  # MySQL JSON
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(default=datetime.utcnow, onupdate=datetime.utcnow),
    )
    user: User | None = Relationship(back_populates="saved_visualizations")


class AuditLog(SQLModel, table=True):
    """audit_log table mapping."""

    __tablename__ = "audit_log"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, foreign_key="users.id", index=True)
    action: str = Field(max_length=64)
    detail: str | None = Field(default=None, max_length=512)
    created_at: datetime | None = None
