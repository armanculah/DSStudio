import pymysql
from sqlmodel import Session, create_engine
from sqlmodel import SQLModel
from .core.config import settings

# Ensure mysqlclient/MySQLdb imports resolve to PyMySQL when used implicitly.
pymysql.install_as_MySQLdb()

try:
    _DATABASE_URI = settings.SQLALCHEMY_DATABASE_URI
except ValueError as exc:  # configuration error
    raise RuntimeError(str(exc)) from exc

# Connection only; no DDL.
engine = create_engine(
    _DATABASE_URI,
    pool_pre_ping=True,
    future=True,
)


def init_db() -> None:
    """Ping database at startup and ensure required enum values exist."""
    with engine.connect() as conn:
        conn.exec_driver_sql("SELECT 1")
    
    SQLModel.metadata.create_all(engine)
    
    with engine.connect() as conn:
        try:
            conn.exec_driver_sql(
                "ALTER TABLE saved_visualizations MODIFY kind "
                "ENUM('array','stack','queue','linkedlist','bst','binaryheap') NOT NULL"
            )
        except Exception:
            # Fail silently; not fatal for app startup.
            pass


def get_session():
    """FastAPI dependency that yields a DB session."""
    with Session(engine) as session:
        yield session
