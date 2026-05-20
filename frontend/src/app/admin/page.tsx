'use client';

import { useEffect, useState } from 'react';
import { RequireAuth } from '@/components/require-auth';
import { adminApi, type AdminTrade, type AdminUser } from '@/lib/admin';
import { Alert, Badge, Button, Card } from '@/components/ui';
import { useAuth } from '@/lib/auth-context';

function AdminInner() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [trades, setTrades] = useState<AdminTrade[]>([]);
  const [stats, setStats] = useState<{ users: number; trades: number; openTrades: number } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const [u, t, s] = await Promise.all([
        adminApi.listUsers(),
        adminApi.listTrades(),
        adminApi.stats(),
      ]);
      setUsers(u.items);
      setTrades(t.items);
      setStats(s);
    } catch (e: unknown) {
      setErr((e as { message?: string }).message ?? 'failed to load admin data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function toggleRole(u: AdminUser) {
    setErr(null);
    try {
      await adminApi.updateUser(u.id, { role: u.role === 'ADMIN' ? 'USER' : 'ADMIN' });
      await refresh();
    } catch (e: unknown) {
      setErr((e as { message?: string }).message ?? 'role update failed');
    }
  }

  async function deleteUser(u: AdminUser) {
    if (!confirm(`delete user ${u.email}? this also deletes their trades.`)) return;
    setErr(null);
    try {
      await adminApi.deleteUser(u.id);
      await refresh();
    } catch (e: unknown) {
      setErr((e as { message?: string }).message ?? 'delete failed');
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-white/40">admin</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">control panel</h1>
      </div>

      {err && <Alert kind="error">{err}</Alert>}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wider text-white/40">users</p>
          <p className="mt-2 text-3xl font-semibold">{stats?.users ?? '—'}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wider text-white/40">total trades</p>
          <p className="mt-2 text-3xl font-semibold">{stats?.trades ?? '—'}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wider text-white/40">open trades</p>
          <p className="mt-2 text-3xl font-semibold">{stats?.openTrades ?? '—'}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">users</h2>
        {loading ? (
          <p className="mt-4 text-white/40">loading…</p>
        ) : (
          <>
            {/* desktop table */}
            <div className="mt-4 hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-white/40">
                  <tr>
                    <th className="py-2 pr-4">email</th>
                    <th className="py-2 pr-4">name</th>
                    <th className="py-2 pr-4">role</th>
                    <th className="py-2 pr-4">trades</th>
                    <th className="py-2 pr-4">joined</th>
                    <th className="py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((u) => {
                    const isSelf = u.id === me?.id;
                    return (
                      <tr key={u.id} className="hover:bg-white/5">
                        <td className="max-w-[220px] truncate py-3 pr-4 font-mono" title={u.email}>
                          {u.email}
                        </td>
                        <td className="py-3 pr-4">
                          {u.name ?? <span className="text-white/30">—</span>}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge tone={u.role === 'ADMIN' ? 'green' : 'neutral'}>{u.role}</Badge>
                        </td>
                        <td className="py-3 pr-4 font-mono">{u._count.trades}</td>
                        <td className="py-3 pr-4 text-white/60">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => toggleRole(u)}
                              disabled={isSelf}
                              title={isSelf ? "can't change your own role" : ''}
                            >
                              {u.role === 'ADMIN' ? 'demote' : 'promote'}
                            </Button>
                            <Button
                              type="button"
                              variant="danger"
                              onClick={() => deleteUser(u)}
                              disabled={isSelf}
                            >
                              delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* mobile card list */}
            <ul className="mt-4 space-y-3 md:hidden">
              {users.map((u) => {
                const isSelf = u.id === me?.id;
                return (
                  <li key={u.id} className="rounded-md border border-white/10 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-mono text-sm" title={u.email}>
                          {u.email}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-white/50">
                          {u.name ?? '—'}
                        </p>
                      </div>
                      <Badge tone={u.role === 'ADMIN' ? 'green' : 'neutral'}>{u.role}</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-white/50">
                      <span>{u._count.trades} trades</span>
                      <span>joined {new Date(u.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => toggleRole(u)}
                        disabled={isSelf}
                        className="flex-1"
                      >
                        {u.role === 'ADMIN' ? 'demote' : 'promote'}
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => deleteUser(u)}
                        disabled={isSelf}
                        className="flex-1"
                      >
                        delete
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">all trades</h2>
        {loading ? (
          <p className="mt-4 text-white/40">loading…</p>
        ) : trades.length === 0 ? (
          <p className="mt-4 text-white/40">no trades on the platform yet.</p>
        ) : (
          <>
            <div className="mt-4 hidden overflow-x-auto sm:block">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-white/40">
                  <tr>
                    <th className="py-2 pr-4">user</th>
                    <th className="py-2 pr-4">symbol</th>
                    <th className="py-2 pr-4">side</th>
                    <th className="py-2 pr-4">status</th>
                    <th className="py-2 pr-4 text-right">p&amp;l</th>
                    <th className="py-2 pr-4">opened</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {trades.map((t) => (
                    <tr key={t.id} className="hover:bg-white/5">
                      <td
                        className="max-w-[220px] truncate py-3 pr-4 font-mono"
                        title={t.user.email}
                      >
                        {t.user.email}
                      </td>
                      <td className="py-3 pr-4 font-mono">{t.symbol}</td>
                      <td className="py-3 pr-4">
                        <Badge tone={t.side === 'LONG' ? 'green' : 'red'}>{t.side}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge tone={t.status === 'OPEN' ? 'amber' : 'neutral'}>{t.status}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-right font-mono">
                        {t.pnl ? Number(t.pnl).toFixed(2) : '—'}
                      </td>
                      <td className="py-3 pr-4 text-white/60">
                        {new Date(t.openedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="mt-4 space-y-3 sm:hidden">
              {trades.map((t) => (
                <li key={t.id} className="rounded-md border border-white/10 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono">{t.symbol}</p>
                      <p
                        className="mt-0.5 truncate text-xs text-white/50"
                        title={t.user.email}
                      >
                        {t.user.email}
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-1">
                      <Badge tone={t.side === 'LONG' ? 'green' : 'red'}>{t.side}</Badge>
                      <Badge tone={t.status === 'OPEN' ? 'amber' : 'neutral'}>{t.status}</Badge>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-white/50">
                      {new Date(t.openedAt).toLocaleDateString()}
                    </span>
                    <span className="font-mono">
                      p&amp;l {t.pnl ? Number(t.pnl).toFixed(2) : '—'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireAuth role="ADMIN">
      <AdminInner />
    </RequireAuth>
  );
}
