from fastapi import APIRouter, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .core.config import settings
from .db import init_db
from .routers import auth

API_VERSION = "v1"

app = FastAPI(
    title=settings.APP_NAME,
    docs_url=f"/api/{API_VERSION}/docs",
    openapi_url=f"/api/{API_VERSION}/openapi.json",
)

# CORS: explicit methods/headers; origins from .env
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.on_event("startup")
def on_startup() -> None:
    # Connectivity check only; tables managed outside code.
    init_db()


api = APIRouter(prefix=f"/api/{API_VERSION}")


@api.get("/health", tags=["health"])
def health() -> dict:
    return {"status": "ok"}


@api.get("/health/db", tags=["health"])
def health_db() -> dict:
    return {"db": "ok"}


# JSON error shape
@app.exception_handler(HTTPException)
def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail, "status_code": exc.status_code},
    )


@app.exception_handler(Exception)
def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"error": "Internal Server Error"})


# Routers under /api/v1
api.include_router(auth.router)

app.include_router(api)
