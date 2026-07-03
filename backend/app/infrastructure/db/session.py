from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config.settings import Settings
from app.infrastructure.db.models import Base


def create_sessionmaker(database_url: str) -> async_sessionmaker[AsyncSession]:
    """Create the async session factory used by the application."""
    engine = create_async_engine(database_url, future=True)
    return async_sessionmaker(engine, expire_on_commit=False)


async def create_schema(session_factory: async_sessionmaker[AsyncSession]) -> None:
    """Create database tables for local/demo startup when they are missing."""
    engine = session_factory.kw["bind"]
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)


def create_sessionmaker_from_settings(settings: Settings) -> async_sessionmaker[AsyncSession]:
    """Create a session factory from validated application settings."""
    return create_sessionmaker(settings.supabase_database_url.unicode_string())


async def session_scope(
    session_factory: async_sessionmaker[AsyncSession],
) -> AsyncIterator[AsyncSession]:
    """Yield a database session for helper scripts or tests."""
    async with session_factory() as session:
        yield session
