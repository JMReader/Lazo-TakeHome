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
