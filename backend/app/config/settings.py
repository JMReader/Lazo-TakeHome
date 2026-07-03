from pathlib import Path

from pydantic import AliasChoices, Field, PostgresDsn
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]
REPO_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(REPO_ROOT / ".env", BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        populate_by_name=True,
    )

    supabase_database_url: PostgresDsn = Field(
        validation_alias=AliasChoices("SUPABASE_DATABASE_URL", "supabase_database_url")
    )
    pii_encryption_key: str = Field(
        min_length=1,
        validation_alias=AliasChoices("PII_ENCRYPTION_KEY", "pii_encryption_key"),
    )
    due_soon_window_days: int = Field(
        default=30,
        ge=0,
        validation_alias=AliasChoices("DUE_SOON_WINDOW_DAYS", "due_soon_window_days"),
    )
    app_env: str = Field(
        default="local",
        validation_alias=AliasChoices("APP_ENV", "app_env"),
    )
    log_level: str = Field(
        default="INFO",
        validation_alias=AliasChoices("LOG_LEVEL", "log_level"),
    )
