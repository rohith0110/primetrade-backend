# backend

Express + TypeScript + Prisma + Postgres.

## setup

```bash
pnpm install
cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
pnpm prisma migrate dev
pnpm dev
```

Server listens on `:4000`. Swagger UI is mounted at `/api/docs`.

## scripts

- `pnpm dev` — tsx watch mode
- `pnpm build` — typecheck + emit to `dist/`
- `pnpm start` — run built js
- `pnpm prisma:migrate` — apply migrations
- `pnpm prisma:studio` — browse db
