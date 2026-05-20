'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RequireAuth } from '@/components/require-auth';
import { useAuth } from '@/lib/auth-context';
import { tradesApi, type Trade } from '@/lib/trades';
import { Badge, Card } from '@/components/ui';

function pnlClass(pnl: string | null) {
  if (!pnl) return 'text-white/40';
  const n = Number(pnl);
  if (n > 0) return 'text-accent-green';
  if (n < 0) return 'text-accent-red';
  return 'text-white/60';
}

function DashboardInner() {
  const { user } = useAuth();
  const [recent, setRecent] = useState<Trade[]>([]);
  const [stats, setStats] = useState({ open: 0, closed: 0, totalPnL: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const all = await tradesApi.list({ pageSize: 100 });
        if (!alive) return;
        const open = all.items.filter((t) => t.status === 'OPEN').length;
        const closed = all.items.filter((t) => t.status === 'CLOSED').length;
        const totalPnL = all.items.reduce(
          (acc, t) => acc + (t.pnl ? Number(t.pnl) : 0),
          0,
        );
        setStats({ open, closed, totalPnL });
        setRecent(all.items.slice(0, 5));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-white/40">
          welcome back
        </p>
        <h1 className="mt-1 break-all text-2xl font-semibold sm:break-normal sm:text-3xl">
          {user?.name || user?.email}
        </h1>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wider text-white/40">open</p>
          <p className="mt-2 text-3xl font-semibold">{loading ? '—' : stats.open}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wider text-white/40">closed</p>
          <p className="mt-2 text-3xl font-semibold">{loading ? '—' : stats.closed}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wider text-white/40">realised p&amp;l</p>
          <p className={`mt-2 text-3xl font-semibold ${pnlClass(String(stats.totalPnL))}`}>
            {loading ? '—' : stats.totalPnL.toFixed(2)}
          </p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">recent trades</h2>
          <Link href="/trades" className="text-sm underline hover:text-white">
            view all
          </Link>
        </div>

        {loading ? (
          <p className="mt-6 text-white/40">loading…</p>
        ) : recent.length === 0 ? (
          <p className="mt-6 text-white/40">
            no trades yet —{' '}
            <Link href="/trades" className="underline hover:text-white">
              log your first one
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-white/10">
            {recent.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/trades/${t.id}`} className="font-mono hover:underline">
                    {t.symbol}
                  </Link>
                  <Badge tone={t.side === 'LONG' ? 'green' : 'red'}>{t.side}</Badge>
                  <Badge tone={t.status === 'OPEN' ? 'amber' : 'neutral'}>{t.status}</Badge>
                </div>
                <span className={`font-mono text-sm ${pnlClass(t.pnl)}`}>
                  {t.pnl ? Number(t.pnl).toFixed(2) : '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}
