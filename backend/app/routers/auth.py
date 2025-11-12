from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlmodel import Session, select

from ..core.security import (
    create_access_token,
    decode_token,
    hash_password,
    verify_password,
)
from ..db import get_session
from ..models import User
from ..schemas import UserCreate, UserLogin, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])
COOKIE_NAME = "access_token"


@router.post("/register", response_model=UserOut, status_code=201)
def register(payload: UserCreate, session: Session = Depends(get_session)):
    exists = session.exec(select(User).where(User.email == payload.email)).first()
    if exists:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(email=payload.email, hashed_password=hash_password(payload.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/login")
def login(
    payload: UserLogin,
    response: Response,
    session: Session = Depends(get_session),
):
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user.id)})
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=3600,
        path="/",
    )
    return {"message": "logged in"}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"message": "logged out"}


@router.get("/me", response_model=UserOut)
def me(request: Request, session: Session = Depends(get_session)):
    token = request.cookies.get(COOKIE_NAME)
    data = decode_token(token) if token else None
    if not data or "sub" not in data:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user = session.get(User, int(data["sub"]))
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    return user
