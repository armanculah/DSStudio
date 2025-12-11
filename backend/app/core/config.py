from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "DS Studio API"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    MEDIA_ROOT: str = "media"
    PROFILE_PICTURE_DIR: str = "profile_pictures"
    MEDIA_URL: str = "/media"

    # MySQL
    MYSQL_USER: str
    MYSQL_PASSWORD: str
    MYSQL_HOST: str = "127.0.0.1"
    MYSQL_PORT: int = 3306
    MYSQL_DB: str

    # CORS origins as a single comma-separated string in .env
    # Example: "http://localhost:5173,https://my-prod-site.com"
    CORS_ORIGINS_RAW: str = "http://localhost:5173"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        return (
            f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}"
            f"@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}"
        )

    @property
    def CORS_ORIGINS(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS_RAW.split(",") if o.strip()]

    @property
    def BASE_DIR(self) -> Path:
        return Path(__file__).resolve().parent.parent

    @property
    def MEDIA_ROOT_PATH(self) -> Path:
        return (self.BASE_DIR / self.MEDIA_ROOT).resolve()

    @property
    def PROFILE_PICTURE_PATH(self) -> Path:
        return (self.MEDIA_ROOT_PATH / self.PROFILE_PICTURE_DIR).resolve()

    @property
    def PROFILE_PICTURE_URL(self) -> str:
        base = self.MEDIA_URL.rstrip("/")
        return f"{base}/{self.PROFILE_PICTURE_DIR}".rstrip("/")

    class Config:
        env_file = ".env"


settings = Settings()
