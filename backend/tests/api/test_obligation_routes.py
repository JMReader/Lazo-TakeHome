from datetime import date

from cryptography.fernet import Fernet
from httpx import ASGITransport, AsyncClient

from app.main import create_app


def create_payload(**overrides):
    payload = {
        "type": "annual_report",
        "title": "Annual report",
        "description": "File annual report",
        "dueDate": "2026-08-01",
        "owner": "Ops",
        "requiresDocument": True,
        "companyTaxId": "12-3456789",
    }
    payload.update(overrides)
    return payload


async def test_create_and_read_masks_company_tax_id():
    app = create_app(
        database_url="sqlite+aiosqlite:///:memory:",
        pii_encryption_key=Fernet.generate_key().decode(),
        business_today=date(2026, 7, 2),
    )

    async with app.router.lifespan_context(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            created = await client.post("/api/obligations", json=create_payload())
            assert created.status_code == 201
            body = created.json()["obligation"]

            assert body["status"] == "pending"
            assert body["version"] == 1
            assert body["companyTaxIdMasked"] == "****6789"
            assert "companyTaxId" not in body

            detail = await client.get(f"/api/obligations/{body['id']}")
            assert detail.status_code == 200
            assert "12-3456789" not in detail.text


async def test_list_is_compact_and_detail_keeps_full_context():
    app = create_app(
        database_url="sqlite+aiosqlite:///:memory:",
        pii_encryption_key=Fernet.generate_key().decode(),
        business_today=date(2026, 7, 2),
    )

    async with app.router.lifespan_context(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            created = (await client.post("/api/obligations", json=create_payload())).json()[
                "obligation"
            ]

            list_response = await client.get("/api/obligations")
            assert list_response.status_code == 200
            list_item = list_response.json()["obligations"][0]

            assert list_item["id"] == created["id"]
            assert list_item["version"] == created["version"]
            assert list_item["isOverdue"] is False
            assert list_item["isDueSoon"] is True
            assert "document" not in list_item
            assert "auditHistory" not in list_item

            detail = (await client.get(f"/api/obligations/{created['id']}")).json()["obligation"]
            assert "document" in detail
            assert "auditHistory" in detail


async def test_status_change_requires_document_and_then_creates_audit_once():
    app = create_app(
        database_url="sqlite+aiosqlite:///:memory:",
        pii_encryption_key=Fernet.generate_key().decode(),
        business_today=date(2026, 7, 2),
    )

    async with app.router.lifespan_context(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            created = (await client.post("/api/obligations", json=create_payload())).json()[
                "obligation"
            ]
            started = (
                await client.patch(
                    f"/api/obligations/{created['id']}/status",
                    json={"targetStatus": "in_progress", "expectedVersion": created["version"]},
                )
            ).json()["obligation"]

            blocked = await client.patch(
                f"/api/obligations/{created['id']}/status",
                json={"targetStatus": "submitted", "expectedVersion": started["version"]},
            )
            assert blocked.status_code == 422
            assert blocked.json()["code"] == "DOCUMENT_REQUIRED_FOR_SUBMISSION"

            with_doc = (
                await client.put(
                    f"/api/obligations/{created['id']}/document",
                    json={
                        "fileName": "report.pdf",
                        "contentType": "application/pdf",
                        "sizeBytes": 123,
                        "expectedVersion": started["version"],
                    },
                )
            ).json()["obligation"]
            submitted = await client.patch(
                f"/api/obligations/{created['id']}/status",
                json={"targetStatus": "submitted", "expectedVersion": with_doc["version"]},
            )

            assert submitted.status_code == 200
            body = submitted.json()["obligation"]
            assert body["status"] == "submitted"
            assert len(body["auditHistory"]) == 2


async def test_generic_update_rejects_status_and_stale_status_change_creates_no_audit():
    app = create_app(
        database_url="sqlite+aiosqlite:///:memory:",
        pii_encryption_key=Fernet.generate_key().decode(),
        business_today=date(2026, 7, 2),
    )

    async with app.router.lifespan_context(app):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            created = (
                await client.post("/api/obligations", json=create_payload(requiresDocument=False))
            ).json()["obligation"]

            rejected = await client.patch(
                f"/api/obligations/{created['id']}",
                json={"status": "done", "expectedVersion": created["version"]},
            )
            assert rejected.status_code == 422

            ok = await client.patch(
                f"/api/obligations/{created['id']}/status",
                json={"targetStatus": "in_progress", "expectedVersion": created["version"]},
            )
            assert ok.status_code == 200

            stale = await client.patch(
                f"/api/obligations/{created['id']}/status",
                json={"targetStatus": "submitted", "expectedVersion": created["version"]},
            )
            assert stale.status_code == 409
            assert stale.json()["code"] == "OBLIGATION_VERSION_CONFLICT"

            detail = (await client.get(f"/api/obligations/{created['id']}")).json()["obligation"]
            assert len(detail["auditHistory"]) == 1
