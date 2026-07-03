# Compliance Obligations Tracker

Backend-first implementation for the Lazo technical challenge.

## Backend

The backend lives in `backend/` and uses FastAPI, Pydantic v2, async SQLAlchemy, Alembic, and Supabase hosted PostgreSQL.

### Environment

Copy `.env.example` to `.env` and fill real values:

```txt
SUPABASE_DATABASE_URL=postgresql+asyncpg://...
PII_ENCRYPTION_KEY=...
DUE_SOON_WINDOW_DAYS=30
APP_ENV=local
LOG_LEVEL=INFO
```

Generate a local Fernet key:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Never commit real Supabase credentials or encryption keys.

For this workspace, the Supabase schema was applied to project `LazoProject`
(`jiutwbpoqomfjyussmmj`). The direct database host is IPv6-only here:

```txt
db.jiutwbpoqomfjyussmmj.supabase.co
```

This local machine is using Supabase Session Pooler over IPv4:

```txt
aws-1-us-west-2.pooler.supabase.com
```

Use the database password from Supabase Dashboard to complete `SUPABASE_DATABASE_URL`
in local `.env` with user `postgres.jiutwbpoqomfjyussmmj`.

### Run

```bash
cd backend
python -m venv .venv
.venv\Scripts\python.exe -m pip install -e ".[dev]"
.venv\Scripts\python.exe -m uvicorn app.main:create_app --factory --reload
```

### API Documentation

When the backend is running, FastAPI exposes the API contract at:

```txt
http://127.0.0.1:8000/docs
http://127.0.0.1:8000/redoc
http://127.0.0.1:8000/openapi.json
```

If port `8000` is busy, use the port passed to Uvicorn. In this local setup the
backend was verified on:

```txt
http://127.0.0.1:8001/docs
http://127.0.0.1:8001/openapi.json
```

A generated OpenAPI snapshot is also versioned at:

```txt
backend/docs/openapi.json
```

Import the Postman collection from:

```txt
backend/docs/postman_collection.json
```

Run it sequentially. It assumes `baseUrl=http://127.0.0.1:8001` by default and
stores `obligationId`, `version`, and `staleVersion` while it runs.

### API Surface

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Health check for local/server verification. |
| `GET` | `/api/obligations` | Compact dashboard list of obligations. |
| `POST` | `/api/obligations` | Create an obligation as `pending`, `version=1`. |
| `GET` | `/api/obligations/{id}` | Full obligation detail with document metadata and audit history. |
| `PATCH` | `/api/obligations/{id}` | Generic non-status update with optimistic locking. |
| `DELETE` | `/api/obligations/{id}` | Delete an obligation and related document/audit rows. |
| `PATCH` | `/api/obligations/{id}/status` | Change workflow status and write one audit event on success. |
| `PUT` | `/api/obligations/{id}/document` | Attach or replace mock document metadata. |
| `DELETE` | `/api/obligations/{id}/document?expectedVersion=...` | Remove mock document metadata. |

### Response Shape

`GET /api/obligations` returns list items optimized for a dashboard:

- identity and descriptive fields: `id`, `type`, `title`, `description`, `owner`
- workflow fields: `status`, `availableTransitions`, `submitBlockedReason`
- due fields computed by the backend: `dueDate`, `isOverdue`, `isDueSoon`
- document summary fields: `requiresDocument`, `hasDocument`
- sync/security fields: `version`, `companyTaxIdMasked`

The list intentionally does not return `document` or `auditHistory`. Use
`GET /api/obligations/{id}` or mutation responses when the frontend needs the
full detail.

Errors are normalized as:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed.",
  "details": {}
}
```

Domain errors use stable codes such as `OBLIGATION_NOT_FOUND`,
`OBLIGATION_VERSION_CONFLICT`, and `DOCUMENT_REQUIRED_FOR_SUBMISSION`.

### Migrations

```bash
cd backend
.venv\Scripts\python.exe -m alembic upgrade head
```

### Tests

```bash
cd backend
.venv\Scripts\python.exe -m pytest
.venv\Scripts\python.exe -m ruff check .
.venv\Scripts\python.exe -m ruff format --check .
```

## Key Decisions

- Obligations are created as `pending`, `version=1`; status cannot be set on create.
- Workflow status changes only through `PATCH /api/obligations/{id}/status`.
- `isOverdue` and `isDueSoon` are derived in the backend from business date and config.
- `DUE_SOON_WINDOW_DAYS` defaults to 30.
- `companyTaxId` is accepted on write, encrypted at rest, normalized for last4 masking, and never returned raw.
- Status changes use optimistic locking with `expectedVersion` and create exactly one audit event on success.
- Generic updates and document metadata mutations also require `expectedVersion`.
- Document metadata is mock-only; no binary upload is included in this scope.
