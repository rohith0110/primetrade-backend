# frontend

Next.js (App Router) + TypeScript + Tailwind. Pure black-and-white styling, no design framework.

## setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

The dev server runs on `:3000`. Point `NEXT_PUBLIC_API_BASE_URL` at the backend (defaults to `http://localhost:4000/api/v1`).

## pages

- `/` — landing
- `/login`, `/register`
- `/dashboard` — authed home, quick stats
- `/trades` — list + create
- `/trades/[id]` — detail / edit
- `/admin` — admin-only, users + all trades
