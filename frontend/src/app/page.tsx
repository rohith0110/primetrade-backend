import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="grid gap-8 py-8 md:grid-cols-2 md:gap-20 md:py-20">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 sm:text-xs">
          primetrade.assignment
        </p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
          A small trade journal — built for a backend intern assignment.
        </h1>
        <p className="mt-5 max-w-prose text-sm text-white/70 sm:text-base">
          Log your trades, track open positions, watch your P&amp;L. JWT auth on the api,
          role-based access for admins, postgres behind a typed prisma layer. Everything
          runs locally in a couple of minutes.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-white/90"
          >
            create an account
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-white/30 px-5 py-2.5 text-sm font-medium hover:border-white hover:bg-white hover:text-black"
          >
            sign in
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-white/10 p-4 font-mono text-[11px] text-white/70 sm:p-6 sm:text-xs">
        <p className="text-white/40"># a glimpse of the api</p>
        <pre className="mt-3 whitespace-pre leading-6 sm:whitespace-pre-wrap">{`POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/me

GET    /api/v1/trades
POST   /api/v1/trades
PATCH  /api/v1/trades/:id
DELETE /api/v1/trades/:id

# admin-only
GET    /api/v1/admin/users
GET    /api/v1/admin/trades
GET    /api/v1/admin/stats`}</pre>
        <p className="mt-4 text-white/40">
          full openapi at <span className="text-white">/api/docs</span>
        </p>
      </div>
    </div>
  );
}
