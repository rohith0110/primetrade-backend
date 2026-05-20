# Scalability notes

This is a short, practical take on how I'd grow this past a single-server demo. Nothing here is implemented — the assignment hits the basics; this is what I'd do next.

## Today

- Single Express process, JWT auth, Postgres (Neon) with Prisma.
- Stateless API (JWT in the `Authorization` header, no server sessions), so the process is horizontally scalable as-is.
- `helmet`, CORS allowlist, bcrypt for passwords, zod validation on every input.

## Easy wins (low effort, high impact)

1. **Run multiple API instances behind a load balancer.** Because the API is stateless, this is almost free. Neon's connection pooler handles the DB side.
2. **Use Neon's pooled connection string in production** to avoid the per-request connection churn that kills serverless-style Postgres setups.
3. **Add a small response cache for read-heavy admin endpoints.** Redis with a 30s TTL on `/admin/stats` would absorb most of the dashboard refresh traffic.
4. **Rate limit `/auth/*`.** A sliding window of ~10 requests/min per IP on the login/register endpoints kills credential-stuffing bots cheaply. `express-rate-limit` backed by Redis when scaled out.
5. **Move secrets to a real secret manager** (Doppler, 1Password, AWS Secrets Manager) — `.env` files are fine for local dev but a footgun anywhere else.

## When traffic starts to hurt

- **Read replicas.** Trades are append-mostly per user. Send `/trades` GETs to a replica; keep writes on the primary.
- **Background queue for derived data.** P&L is computed inline today. If we add features like daily summaries, win-rate analytics, or notifications, push them to BullMQ/SQS workers so the request path stays fast.
- **Pagination by cursor.** Offset-based pagination (what we have) starts to suck once a user has thousands of trades. Switch `/trades` to keyset pagination on `(openedAt, id)`.
- **CDN in front of the frontend.** Next.js + Vercel/Cloudflare gives this nearly for free, and most pages here are either static or client-rendered.

## When the team grows

- **Split the API into modules with clear boundaries** (`auth`, `trades`, `admin`) and only carve out a microservice when one of them actually has independent scaling/deploy needs. Distributed monoliths are worse than monoliths.
- **OpenTelemetry** for traces + metrics, pumped to Grafana/Datadog. The `morgan` logging today is fine for now; trace IDs make it useful at scale.
- **Migrations are gated through CI.** Prisma migrate is already declarative; the missing piece is a review step + automatic backup before each prod migration.

## Deployment shape I'd reach for

```
[ Cloudflare ]
       │
[ Vercel ] ── frontend (Next.js)
       │
[ Fly.io / Render / ECS ] ── api (Express) × N instances
       │
[ Redis ] ── rate limits, short-lived cache
       │
[ Neon Postgres ] ── primary + read replica
```

Nothing exotic — this stack scales a long way before you need anything more complex.

## What I'd skip on purpose

- Microservices for an app this size. They'd add ops cost with no real benefit.
- Custom auth. JWT + bcrypt is fine; if SSO becomes a need, drop in Auth0/Clerk rather than rolling more.
- A separate caching tier in front of Postgres for the trade reads — Neon is fast enough that Redis is overkill until profiling says otherwise.
