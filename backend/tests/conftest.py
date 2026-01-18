import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, delete

# Ensure env is set before importing the app/settings
os.environ.setdefault("ENV", "test")
os.environ.setdefault("SECRET_KEY", "testing-secret")
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")

BACKEND_DIR = Path(__file__).resolve().parents[1]
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.db import engine  # noqa: E402
from app.main import app  # noqa: E402
from app.models import SavedVisualization, User  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def create_db(tmp_path_factory):
    # Use an isolated media directory per test session
    media_root = tmp_path_factory.mktemp("media")
    os.environ["MEDIA_ROOT"] = str(media_root)
    SQLModel.metadata.create_all(engine)
    return media_root


@pytest.fixture(autouse=True)
def clean_db():
    with Session(engine) as session:
        session.exec(delete(SavedVisualization))
        session.exec(delete(User))
        session.commit()
    yield


@pytest.fixture()
def client():
    return TestClient(app)
