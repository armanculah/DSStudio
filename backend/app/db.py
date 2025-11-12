from contextlib import contextmanager

from sqlmodel import Session, create_engine

from .core.config import settings

# Connection only; no DDL.
engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True,
    future=True,
)


def init_db() -> None:
    """Ping database at startup; never runs DDL."""
    with engine.connect() as conn:
        conn.exec_driver_sql("SELECT 1")


@contextmanager
def get_session():
    with Session(engine) as session:
        yield session
