# Compliance Obligations Tracker

Fullstack implementation for the Lazo technical challenge. The app tracks compliance obligations with backend-owned workflow rules, document metadata, due-risk flags, masked tax IDs, optimistic locking, and audit history.

## Stack

- Backend: FastAPI, Pydantic v2, async SQLAlchemy, Alembic, Supabase/PostgreSQL, pytest, ruff.
- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS, shadcn-style primitives, Vitest, Testing Library.
- Docs: versioned specs under `specs/`, generated OpenAPI at `backend/docs/openapi.json`, Postman collection at `backend/docs/postman_collection.json`.

## Run Locally

Create `.env` from `.env.example` and fill real values:

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

Start the backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\python.exe -m pip install -e ".[dev]"
.venv\Scripts\python.exe -m alembic upgrade head
.venv\Scripts\python.exe -m uvicorn app.main:create_app --factory --reload --port 8001
```

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000/en` or `http://localhost:3000/es`.

## Environment Notes

The backend reads `.env` from the repo root or `backend/.env`. Never commit real Supabase credentials or encryption keys.

For this workspace, the Supabase schema was applied to project `LazoProject` (`jiutwbpoqomfjyussmmj`). The direct database host is IPv6-only here:

```txt
db.jiutwbpoqomfjyussmmj.supabase.co
```

This local machine uses the Supabase Session Pooler over IPv4:

```txt
aws-1-us-west-2.pooler.supabase.com
```

Use the database password from Supabase Dashboard to complete `SUPABASE_DATABASE_URL` with user `postgres.jiutwbpoqomfjyussmmj`.

## Quality Gates

Backend:

```bash
cd backend
.venv\Scripts\python.exe -m ruff check .
.venv\Scripts\python.exe -m ruff format --check .
.venv\Scripts\python.exe -m pytest
```

Frontend:

```bash
cd frontend
npm run lint
npm run typecheck
npm test
npm run build
```

## API Surface

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Health check. |
| `GET` | `/api/obligations` | Compact dashboard list. |
| `POST` | `/api/obligations` | Create an obligation as `pending`, `version=1`. |
| `GET` | `/api/obligations/{id}` | Full detail with document metadata and audit history. |
| `PATCH` | `/api/obligations/{id}` | Non-status update with optimistic locking. |
| `DELETE` | `/api/obligations/{id}` | Delete an obligation and owned rows. |
| `PATCH` | `/api/obligations/{id}/status` | Change workflow status and write one audit event on success. |
| `PUT` | `/api/obligations/{id}/document` | Attach or replace mock document metadata. |
| `DELETE` | `/api/obligations/{id}/document?expectedVersion=...` | Remove mock document metadata when domain invariants allow it. |

When the backend is running, API docs are available at:

```txt
http://127.0.0.1:8001/docs
http://127.0.0.1:8001/redoc
http://127.0.0.1:8001/openapi.json
```

## Key Decisions

- Backend is the source of truth for workflow transitions, overdue/due-soon flags, document-gated submission, and tax ID masking.
- Frontend renders status actions only from `availableTransitions`; the displayed `pending -> in_progress -> submitted -> done` order is visual guidance only.
- Obligations are created as `pending`, `version=1`; status cannot be set on create or generic update.
- Status changes use optimistic locking with `expectedVersion` and create exactly one audit event on success.
- Generic updates and document metadata mutations also require `expectedVersion`.
- A required document cannot be removed from `submitted` or `done` obligations while `requiresDocument=true`.
- `companyTaxId` is accepted on write, encrypted at rest, normalized for last-four masking, and never returned raw.
- Document handling is metadata-only; no binary upload is included in this scope.

## Deployment Notes

The Vercel backend deployment uses `backend/app` as the Vercel Root Directory. FastAPI is loaded through `backend/app/api/index.py`, dependencies are declared in `backend/app/requirements.txt`, and `backend/app/vercel.json` routes requests to the Python app.

Required Vercel variables:

```txt
SUPABASE_DATABASE_URL
PII_ENCRYPTION_KEY
```

Optional variables with defaults:

```txt
DUE_SOON_WINDOW_DAYS
APP_ENV
LOG_LEVEL
```
