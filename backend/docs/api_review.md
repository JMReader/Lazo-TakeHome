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

Current responses are correct for demonstrating the backend rules, but they are
heavier than needed for all endpoints.

Keep as-is for the take-home if speed matters:

- Detail responses include the full obligation, document metadata, audit history,
  derived flags, available transitions, and version.
- Mutation responses return the fresh detail, which makes optimistic locking and
  frontend refresh straightforward.
- Error responses are stable at runtime: `{ "code", "message", "details" }`.

Recommended simplification before polishing the final API:

- Split list and detail response models.
- `GET /api/obligations` should return a compact list item without
  `auditHistory` and likely without full `document` metadata.
- Keep `auditHistory` only in `GET /api/obligations/{id}`.
- Consider keeping `availableTransitions` only on detail unless the dashboard
  truly renders actions inline.
- Keep `version` everywhere a mutation can originate from.
- Keep `companyTaxIdMasked` in both list and detail; never expose raw
  `companyTaxId`.

## OpenAPI mismatch to fix

FastAPI currently exposes validation errors in OpenAPI as `HTTPValidationError`,
while runtime validation errors are normalized by the exception handler to:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed.",
  "details": {}
}
```

For final polish, route decorators should explicitly document `ErrorResponse`
for `404`, `409`, and `422` cases so OpenAPI matches runtime behavior.

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

Second simplification target:

- Separate `ObligationListItemResponse` from `ObligationDetailResponse` to reduce
  payload size and make API intent clearer.
