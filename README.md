# Primetrade Backend Assignment

A small full-stack app for the Primetrade.ai backend intern assignment: a trade journal where users can log their trades, with JWT auth and role-based access. Backend is the main focus; the frontend is there to exercise the API.

## Stack

- **Backend** — Express + TypeScript, Prisma ORM, Postgres (Neon), JWT auth, Zod for validation, Swagger (OpenAPI 3) for docs
- **Frontend** — Next.js (App Router) + TypeScript + Tailwind, plain black-and-white styling
- **Package manager** — pnpm

```
backend/      express api
frontend/     next.js ui
SCALABILITY.md   notes on scaling further
```

## Quick start

You'll need Node 20+, pnpm, and a Postgres database. I used [Neon](https://neon.tech) but anything Postgres works.

### 1. backend

```bash
cd backend
cp .env.example .env
# edit DATABASE_URL (Neon connection string) and JWT_SECRET
pnpm install
pnpm prisma migrate dev --name init
pnpm db:seed          # optional — creates admin@primetrade.local / admin12345
pnpm dev
```

Backend runs on `http://localhost:4000`.

- Swagger UI: `http://localhost:4000/api/docs`
- Raw OpenAPI JSON: `http://localhost:4000/api/docs.json`
- Postman collection: `backend/docs/postman_collection.json`

### 2. frontend

```bash
cd frontend
cp .env.example .env.local
pnpm install
pnpm dev
```

Frontend runs on `http://localhost:3000`.

## What's in here

### Auth
- `POST /api/v1/auth/register` — create account, returns JWT
- `POST /api/v1/auth/login` — exchange credentials for JWT
- `GET /api/v1/me` — who am I (requires JWT)

Passwords are bcrypt-hashed (10 rounds). Tokens are signed HS256 with a configurable expiry (default 7d).

### Trades (the "secondary entity")
- `GET /api/v1/trades` — list your trades (filterable by `status`, `symbol`; paginated)
- `POST /api/v1/trades` — log a new trade
- `GET /api/v1/trades/:id` — fetch one
- `PATCH /api/v1/trades/:id` — partial update
- `DELETE /api/v1/trades/:id`

Each trade has a symbol, side (`LONG`/`SHORT`), entry/exit price, quantity, status (`OPEN`/`CLOSED`), computed P&L, optional notes and tags. P&L is computed server-side whenever exit price changes.

### Admin (role-gated)
- `GET /api/v1/admin/users` — list everyone
- `PATCH /api/v1/admin/users/:id` — change role / name
- `DELETE /api/v1/admin/users/:id` — remove a user
- `GET /api/v1/admin/trades` — every trade on the platform
- `GET /api/v1/admin/stats` — counts for the dashboard

Admins can't demote or delete themselves — small but easy footgun to leave in.

### Frontend pages
- `/` — landing
- `/login`, `/register`
- `/dashboard` — authed home with quick stats
- `/trades`, `/trades/[id]` — full CRUD UI
- `/admin` — admin-only panel

The frontend uses a small `RequireAuth` wrapper to guard pages and an `AuthProvider` context that keeps the JWT in `localStorage` and re-validates it via `/me` on load.

## Why a trade journal?

The assignment lets you pick the secondary entity. A todo list felt boring and Primetrade is in crypto trading, so I built a trade journal — same CRUD shape, but the domain model (sides, P&L, tags) is more representative of what a real product here might look like.

## Project layout

```
backend/
  src/
    app.ts                 # express app composition
    index.ts               # entrypoint
    config/env.ts          # zod-validated env
    docs/swagger.ts        # OpenAPI mount
    lib/
      jwt.ts password.ts logger.ts prisma.ts
    middleware/
      auth.ts error.ts notFound.ts
    routes/v1/
      auth.ts me.ts trades.ts admin.ts
    schemas/               # zod request schemas
    services/              # business logic (e.g. P&L math)
  prisma/
    schema.prisma
    seed.ts
  docs/postman_collection.json

frontend/
  src/
    app/                   # next.js app router
    components/            # shared UI primitives
    lib/                   # api client, auth context
```

## Security notes

- All routes that touch user data require `Bearer <token>` in `Authorization`. Tokens come from `/auth/login` or `/auth/register`.
- Login uses the same error message for "no such user" and "wrong password" to avoid leaking which emails exist.
- Zod validates every request body / query and the central error handler converts validation failures into 400s with field-level messages.
- `helmet` sets sensible default response headers; CORS is locked to the configured frontend origin.

## Scalability

See [SCALABILITY.md](./SCALABILITY.md) — a short writeup of what I'd reach for next (load balancing, read replicas, Redis caching, cursor pagination) and what I'd avoid until the numbers justify it.

## Things I'd add given more time

- Refresh tokens + token rotation (right now it's a single long-lived JWT, which is fine for a demo but I wouldn't ship this to real users).
- A small integration test suite using supertest + a throwaway Postgres schema.
- Per-IP rate limiting on `/auth/*`.
- Better empty / error states on the frontend — they're functional but spare.
