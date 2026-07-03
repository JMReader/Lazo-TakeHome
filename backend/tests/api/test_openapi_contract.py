from datetime import date

from cryptography.fernet import Fernet

from app.main import create_app


def test_openapi_documents_normalized_error_response():
    app = create_app(
        database_url="sqlite+aiosqlite:///:memory:",
        pii_encryption_key=Fernet.generate_key().decode(),
        business_today=date(2026, 7, 2),
    )

    schema = app.openapi()

    validation_response = schema["paths"]["/api/obligations"]["post"]["responses"]["422"]
    assert validation_response["content"]["application/json"]["schema"] == {
        "$ref": "#/components/schemas/ErrorResponse"
    }

    conflict_response = schema["paths"]["/api/obligations/{obligation_id}/status"]["patch"][
        "responses"
    ]["409"]
    assert conflict_response["content"]["application/json"]["schema"] == {
        "$ref": "#/components/schemas/ErrorResponse"
    }
