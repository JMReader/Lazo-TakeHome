from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from datetime import date

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError

from app.api.errors import domain_error_handler, validation_error_handler
from app.api.obligations import router as obligations_router
from app.api.obligations import today_provider
from app.config.settings import Settings
from app.domain.exceptions import DomainError
from app.infrastructure.db.session import create_schema, create_sessionmaker


def create_app(
    *,
    database_url: str | None = None,
    pii_encryption_key: str | None = None,
    due_soon_window_days: int | None = None,
    business_today: date | None = None,
) -> FastAPI:
    if database_url is None or pii_encryption_key is None:
        settings = Settings()
        database_url = database_url or settings.supabase_database_url.unicode_string()
        pii_encryption_key = pii_encryption_key or settings.pii_encryption_key
        due_soon_window_days = due_soon_window_days or settings.due_soon_window_days
    due_soon_window_days = 30 if due_soon_window_days is None else due_soon_window_days
    session_factory = create_sessionmaker(database_url)

    @asynccontextmanager
    async def lifespan(app: FastAPI) -> AsyncIterator[None]:
        await create_schema(session_factory)
        yield

    app = FastAPI(title="Compliance Obligations Tracker", lifespan=lifespan)
    app.state.session_factory = session_factory
    app.state.pii_encryption_key = pii_encryption_key
    app.state.due_soon_window_days = due_soon_window_days
    app.state.business_today = today_provider(business_today)

    @app.get("/health")
    async def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(obligations_router)
    app.add_exception_handler(DomainError, domain_error_handler)
    app.add_exception_handler(RequestValidationError, validation_error_handler)
    return app
