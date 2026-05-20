# Primetrade Backend Assignment

Small full-stack project: a trade journal where users can log their trades, with auth and role-based access. Built for the Primetrade.ai backend intern assignment.

## Stack

- **Backend** — Express + TypeScript, Prisma ORM, Postgres (Neon), JWT auth, Zod for validation, Swagger for docs
- **Frontend** — Next.js (App Router) + TypeScript + Tailwind
- **Package manager** — pnpm

Folders:

```
backend/   express api
frontend/  next.js ui
```

Each has its own README with setup steps.

## Quick start

```bash
# backend
cd backend
cp .env.example .env   # fill in DATABASE_URL + JWT_SECRET
pnpm install
pnpm prisma migrate dev
pnpm dev

# frontend (in another terminal)
cd frontend
cp .env.example .env.local
pnpm install
pnpm dev
```

Backend runs on `:4000`, frontend on `:3000`. Swagger docs at `http://localhost:4000/api/docs`.

## Entity choice

The "secondary entity" is a **Trade** — symbol, side (LONG/SHORT), entry/exit price, quantity, P&L, notes, tags. Felt more relevant to Primetrade's domain than the usual todo list.

## Roles

- `USER` — can CRUD their own trades
- `ADMIN` — same as user + can list/manage all users and view everyone's trades

See [SCALABILITY.md](./SCALABILITY.md) for notes on scaling this further.
