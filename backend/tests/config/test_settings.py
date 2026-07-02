import pytest
from pydantic import ValidationError

from app.config.settings import Settings


def test_settings_reads_repo_root_env_file():
    env_files = Settings.model_config["env_file"]

    assert any(
        str(path).endswith("Lazo\\.env") or str(path).endswith("Lazo/.env") for path in env_files
    )


def test_settings_require_supabase_database_url():
    with pytest.raises(ValidationError):
        Settings(PII_ENCRYPTION_KEY="x", _env_file=None)


def test_settings_reject_negative_due_soon_window():
    with pytest.raises(ValidationError):
        Settings(
            SUPABASE_DATABASE_URL="postgresql+asyncpg://user:pass@example:5432/postgres",
            PII_ENCRYPTION_KEY="x",
            DUE_SOON_WINDOW_DAYS=-1,
        )


def test_settings_accept_required_values():
    settings = Settings(
        SUPABASE_DATABASE_URL="postgresql+asyncpg://user:pass@example:5432/postgres",
        PII_ENCRYPTION_KEY="test-key",
    )

    assert settings.supabase_database_url.unicode_string().startswith("postgresql+asyncpg://")
    assert settings.due_soon_window_days == 30
