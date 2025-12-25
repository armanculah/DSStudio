from __future__ import annotations

from typing import Any

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
        serialize_saved_visualization(viz) for viz in visualizations
    ]
    return payload


def _extract_values(payload: Any) -> Any:
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        if isinstance(payload.get("values"), list):
            return payload.get("values")
        if isinstance(payload.get("tree"), dict):
            collected: list[Any] = []
            stack = [payload.get("tree")]
            while stack:
                node = stack.pop()
                if not isinstance(node, dict) or "value" not in node:
                    continue
                collected.append(node.get("value"))
                if node.get("right") is not None:
                    stack.append(node.get("right"))
                if node.get("left") is not None:
                    stack.append(node.get("left"))
            if collected:
                return collected
    return payload


def serialize_saved_visualization(viz: SavedVisualization) -> dict:
    data = viz.model_dump()
    data["payload"] = _extract_values(data.get("payload"))
    return data
