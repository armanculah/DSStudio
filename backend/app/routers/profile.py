from __future__ import annotations

import secrets
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile
from sqlmodel import Session, select

from ..core.constants import (
    PROFILE_PICTURE_ALLOWED_TYPES,
    PROFILE_PICTURE_MAX_BYTES,
)
from ..core.config import settings
from ..core.security import hash_password, verify_password
from ..db import get_session
from ..dependencies import get_current_user
from ..models import SavedVisualization, User
from ..schemas import (
    PasswordUpdate,
    SavedVisualizationCreate,
    SavedVisualizationOut,
    UserProfileOut,
    UserUpdate,
)
from ..utils.user_serializers import serialize_user_with_saved_visualizations

router = APIRouter(prefix="/profile", tags=["profile"])


def _refresh_saved_visualizations(
    session: Session, user_id: int
) -> list[SavedVisualization]:
    return session.exec(
        select(SavedVisualization)
        .where(SavedVisualization.user_id == user_id)
        .order_by(SavedVisualization.created_at.desc())
    ).all()


def _persist_user(session: Session, user: User) -> None:
    session.add(user)
    session.commit()
    session.refresh(user)


@router.get("/me", response_model=UserProfileOut)
def read_profile(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    visualizations = _refresh_saved_visualizations(session, current_user.id)
    return serialize_user_with_saved_visualizations(current_user, visualizations)


@router.put("/me", response_model=UserProfileOut)
def update_profile(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if payload.email and payload.email != current_user.email:
        exists = session.exec(
            select(User).where(User.email == payload.email)
        ).first()
        if exists:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = payload.email

    if payload.name is not None:
        current_user.name = payload.name
    if payload.surname is not None:
        current_user.surname = payload.surname

    _persist_user(session, current_user)
    visualizations = _refresh_saved_visualizations(session, current_user.id)
    return serialize_user_with_saved_visualizations(current_user, visualizations)


@router.put("/password")
def update_password(
    payload: PasswordUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = hash_password(payload.new_password)
    _persist_user(session, current_user)
    return {"message": "Password updated"}


def _profile_picture_path(filename: str) -> Path:
    return settings.PROFILE_PICTURE_PATH / filename


def _delete_profile_picture(path_value: str | None) -> None:
    if not path_value:
        return
    target = (settings.MEDIA_ROOT_PATH / path_value).resolve()
    try:
        if target.is_file():
            target.unlink()
    except OSError:
        pass


@router.put("/profile-picture", response_model=UserProfileOut)
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if file.content_type not in PROFILE_PICTURE_ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload a PNG or JPEG image.",
        )

    contents = await file.read()
    if len(contents) > PROFILE_PICTURE_MAX_BYTES:
        raise HTTPException(status_code=400, detail="File is too large (max 5MB).")

    settings.PROFILE_PICTURE_PATH.mkdir(parents=True, exist_ok=True)
    ext = Path(file.filename or "").suffix.lower() or ".png"
    filename = f"{secrets.token_hex(16)}{ext}"
    target_path = _profile_picture_path(filename)

    target_path.write_bytes(contents)
    _delete_profile_picture(current_user.profile_picture)
    relative_path = f"{settings.PROFILE_PICTURE_DIR}/{filename}"
    current_user.profile_picture = relative_path
    _persist_user(session, current_user)

    visualizations = _refresh_saved_visualizations(session, current_user.id)
    return serialize_user_with_saved_visualizations(current_user, visualizations)


@router.delete("/me", status_code=204)
def delete_account(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    _delete_profile_picture(current_user.profile_picture)
    visualizations = _refresh_saved_visualizations(session, current_user.id)
    for viz in visualizations:
        session.delete(viz)
    session.delete(current_user)
    session.commit()
    return Response(status_code=204)


@router.get(
    "/me/saved-visualizations", response_model=list[SavedVisualizationOut]
)
def list_saved_visualizations(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    return _refresh_saved_visualizations(session, current_user.id)


@router.post(
    "/me/saved-visualizations",
    response_model=SavedVisualizationOut,
    status_code=201,
)
def create_saved_visualization(
    payload: SavedVisualizationCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    visualization = SavedVisualization(
        user_id=current_user.id, **payload.model_dump()
    )
    session.add(visualization)
    session.commit()
    session.refresh(visualization)
    return visualization


@router.get(
    "/me/saved-visualizations/{viz_id}",
    response_model=SavedVisualizationOut,
)
def retrieve_saved_visualization(
    viz_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    visualization = session.get(SavedVisualization, viz_id)
    if not visualization or visualization.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Saved visualization not found")
    return visualization


@router.delete("/me/saved-visualizations/{viz_id}", status_code=204)
def delete_saved_visualization(
    viz_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    visualization = session.get(SavedVisualization, viz_id)
    if not visualization or visualization.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Saved visualization not found")
    session.delete(visualization)
    session.commit()
    return Response(status_code=204)
