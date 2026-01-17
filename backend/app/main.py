from fastapi import APIRouter, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import logging

from .core.config import settings
from .db import init_db
from .routers import auth, profile

logger = logging.getLogger(__name__)

API_VERSION = "v1"

app = FastAPI(
    title=settings.APP_NAME,
    description="API for Data Structures Studio (authentication, profile, and saved visualizations).",
    version="1.0.0",
    docs_url=f"/api/{API_VERSION}/docs",
    openapi_url=f"/api/{API_VERSION}/openapi.json",
)

# CORS only in dev (local Vite)
if settings.ENV.lower() == "dev":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
    )


@app.on_event("startup")
def on_startup() -> None:
    if settings.ENV.lower() == "test":
        return
    # Only pings DB; no DDL.
    init_db()
    settings.MEDIA_ROOT_PATH.mkdir(parents=True, exist_ok=True)
    settings.PROFILE_PICTURE_PATH.mkdir(parents=True, exist_ok=True)
    static_dir = settings.STATIC_ROOT_PATH
    index_file = static_dir / "index.html"
    logger.info(
        "Static dir: %s exists=%s index_exists=%s",
        static_dir,
        static_dir.exists(),
        index_file.exists(),
    )


# All API endpoints live under /api/v1
api = APIRouter(prefix=f"/api/{API_VERSION}")


@api.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok"}


@api.get("/health/db", tags=["health"])
def health_db() -> dict:
    return {"db": "ok"}


# Auth routes: /api/v1/auth/...
api.include_router(auth.router)
api.include_router(profile.router)


@app.exception_handler(HTTPException)
def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code},
    )


@app.exception_handler(Exception)
def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error"},
    )


app.include_router(api)

app.mount(
    settings.MEDIA_URL,
    StaticFiles(directory=str(settings.MEDIA_ROOT_PATH), check_dir=False),
    name="media",
)

STATIC_DIR = settings.STATIC_ROOT_PATH
INDEX_FILE = STATIC_DIR / "index.html"

if STATIC_DIR.exists() and INDEX_FILE.exists():
    # Mount Vite build (serves index.html and assets)
    app.mount(
        "/",
        StaticFiles(directory=str(STATIC_DIR), html=True, check_dir=False),
        name="frontend",
    )
