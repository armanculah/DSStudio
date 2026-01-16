from pathlib import Path

from fastapi import APIRouter, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from .core.config import settings
from .db import init_db
from .routers import auth, profile

API_VERSION = "v1"

app = FastAPI(
    title=settings.APP_NAME,
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
    # Only pings DB; no DDL.
    init_db()


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

if STATIC_DIR.exists():
    assets_dir = STATIC_DIR / "assets"
    if assets_dir.exists():
        app.mount(
            "/assets",
            StaticFiles(directory=str(assets_dir), check_dir=False),
            name="assets",
        )
    app.mount(
        "/static",
        StaticFiles(directory=str(STATIC_DIR), check_dir=False),
        name="static",
    )


@app.get("/", include_in_schema=False)
def serve_index():
    if INDEX_FILE.exists():
        return FileResponse(str(INDEX_FILE))
    raise HTTPException(status_code=404, detail="Index not found")


@app.get("/{full_path:path}", include_in_schema=False)
def spa_fallback(full_path: str):
    # Do not intercept API or docs routes
    if full_path.startswith("api/") or full_path.startswith("api"):
        raise HTTPException(status_code=404)
    if full_path in {"docs", "redoc", "openapi.json"}:
        raise HTTPException(status_code=404)
    if INDEX_FILE.exists():
        return FileResponse(str(INDEX_FILE))
    raise HTTPException(status_code=404)
