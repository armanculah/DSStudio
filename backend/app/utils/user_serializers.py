from __future__ import annotations

from ..core.config import settings
from ..models import SavedVisualization, User


def build_profile_picture_url(user: User) -> str | None:
    if not user.profile_picture:
        return None
    relative_path = user.profile_picture.lstrip("/")
    return f"{settings.MEDIA_URL.rstrip('/')}/{relative_path}"


def serialize_user(user: User) -> dict:
    payload = user.model_dump()
    payload["profile_picture_url"] = build_profile_picture_url(user)
    return payload


def serialize_user_with_saved_visualizations(
    user: User, visualizations: list[SavedVisualization]
) -> dict:
    payload = serialize_user(user)
    payload["saved_visualizations"] = [
        viz.model_dump() for viz in visualizations
    ]
    return payload
