# API Review Notes

## Postman collection

Use `backend/docs/postman_collection.json` and run requests sequentially.

Default collection variable:

```txt
baseUrl=http://127.0.0.1:8001
```

The collection stores `obligationId`, `version`, and `staleVersion` as collection
variables while it runs.

## Response shape review

Responses are now split by use case:

- `GET /api/obligations` returns compact list items without `document` or
  `auditHistory`.
- Detail and mutation responses return the full obligation, document metadata,
  audit history, derived flags, available transitions, and version.
- `version` is kept on list and detail because any frontend mutation must send
  `expectedVersion`.
- `companyTaxIdMasked` is kept on list and detail; raw `companyTaxId` is never
  returned.

## OpenAPI mismatch to fix

FastAPI route decorators now document normalized `ErrorResponse` models for
known `404`, `409`, and `422` responses. Runtime validation errors still use the
same payload shape:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed.",
  "details": {}
}
```

The versioned snapshot at `backend/docs/openapi.json` was regenerated from the
current app.

## Code readability review

Readable parts:

- Domain rules are isolated in small modules.
- The state machine and date-derived flags are easy to test.
- PII logic is isolated in `TaxIdProtector`.
- API routes mostly delegate to application use cases.

Main simplification target:

- `ObligationService` currently centralizes many use cases in one class. That is
  acceptable for the challenge, but splitting commands and queries would make the
  application layer easier to scan:
  - `CreateObligation`
  - `UpdateObligation`
  - `ChangeObligationStatus`
  - `AttachObligationDocument`
  - `GetObligationDetail`
  - `ListObligations`

Implemented simplification:

- `ObligationListItemResponse` and `ObligationDetailItemResponse` are separate
  schemas.
- Presenters are split into compact list and full detail functions.
