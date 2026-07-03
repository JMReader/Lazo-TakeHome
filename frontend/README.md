# Compliance Obligations Tracker Frontend

Next.js App Router frontend for the Lazo compliance obligations technical test.

## Environment

Create `frontend/.env.local` when you want to override the default local backend:

```bash
BACKEND_API_BASE_URL=http://127.0.0.1:8001
NEXT_PUBLIC_APP_DEFAULT_LOCALE=en
```

`BACKEND_API_BASE_URL` is read server-side. Browser components do not call the backend directly.

## Run Locally

Start the backend first, then run:

```bash
npm run dev
```

Open [http://localhost:3000/en](http://localhost:3000/en) or [http://localhost:3000/es](http://localhost:3000/es).

## Quality Gates

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Architecture Notes

- Routes are locale based: `/en`, `/es`, `/[locale]/obligations/new`, `/[locale]/obligations/[id]`, and `/[locale]/obligations/[id]/edit`.
- Server Components fetch obligation data by default.
- Client Components are limited to filters, forms, dialogs, theme toggle, and pending action states.
- Server Actions perform create, edit, status transition, document metadata, and delete mutations.
- The frontend does not calculate overdue, due soon, valid transitions, document-gated submission, audit history, or tax ID masking. Those values come from the backend response.
- UI colors use semantic Obsidian & Copper Ledger tokens in `src/app/globals.css`.

## Browser Smoke

The latest local smoke used backend `http://127.0.0.1:8001` and frontend `http://127.0.0.1:3000`, then verified dashboard, Spanish dashboard, detail, create, edit, dark mode, and a real status mutation.
