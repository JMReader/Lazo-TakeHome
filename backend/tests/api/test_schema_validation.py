import pytest
from pydantic import ValidationError

from app.api.schemas import ObligationCreateRequest, ObligationUpdateRequest


def valid_create_payload():
    return {
        "type": "annual_report",
        "title": "Annual report",
        "description": "File annual report",
        "dueDate": "2026-08-01",
        "owner": "Ops",
        "requiresDocument": True,
        "companyTaxId": "12-3456789",
    }


def test_create_schema_rejects_status():
    payload = valid_create_payload() | {"status": "done"}

    with pytest.raises(ValidationError):
        ObligationCreateRequest.model_validate(payload)


def test_update_schema_rejects_status():
    with pytest.raises(ValidationError):
        ObligationUpdateRequest.model_validate({"status": "done", "expectedVersion": 1})


def test_update_schema_requires_expected_version():
    with pytest.raises(ValidationError):
        ObligationUpdateRequest.model_validate({"title": "Updated"})
