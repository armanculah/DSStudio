import os
import sys
from pathlib import Path

# Set test env before importing app/settings
os.environ.setdefault("ENV", "test")
os.environ.setdefault("SECRET_KEY", "testing-secret")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")

# Ensure backend package is importable when not installed
BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
  sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402


client = TestClient(app)


def test_health_ok():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_me_requires_auth():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
