from cryptography.fernet import Fernet
from httpx import ASGITransport, AsyncClient

from app.main import create_app


async def test_health_returns_ok():
    app = create_app(
        database_url="sqlite+aiosqlite:///:memory:",
        pii_encryption_key=Fernet.generate_key().decode(),
    )

    async with app.router.lifespan_context(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


async def test_root_returns_api_metadata():
    app = create_app(
        database_url="sqlite+aiosqlite:///:memory:",
        pii_encryption_key=Fernet.generate_key().decode(),
    )

    async with app.router.lifespan_context(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/")

    assert response.status_code == 200
    assert response.json()["health"] == "/health"
