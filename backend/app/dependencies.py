from fastapi import Depends, HTTPException, Request
from sqlmodel import Session

from .core.constants import AUTH_COOKIE_NAME
from .core.security import decode_token
from .db import get_session
from .models import User


def get_current_user(
    request: Request, session: Session = Depends(get_session)
) -> User:
    token = request.cookies.get(AUTH_COOKIE_NAME)
    data = decode_token(token) if token else None
    if not data or "sub" not in data:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = session.get(User, int(data["sub"]))
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user
