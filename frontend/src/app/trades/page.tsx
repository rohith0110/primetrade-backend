'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RequireAuth } from '@/components/require-auth';
import { tradesApi, type Trade, type TradeInput } from '@/lib/trades';
import { Alert, Badge, Button, Card, Input, Label, Select, Textarea } from '@/components/ui';

function pnlClass(pnl: string | null) {
  if (!pnl) return 'text-white/40';
  const n = Number(pnl);
  if (n > 0) return 'text-accent-green';
  if (n < 0) return 'text-accent-red';
  return 'text-white/60';
}

const empty: TradeInput = {
  symbol: '',
  side: 'LONG',
  entryPrice: '',
  quantity: '',
  exitPrice: '',
  notes: '',
  tags: [],
};

function TradesInner() {
  const [items, setItems] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'' | 'OPEN' | 'CLOSED'>('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<TradeInput>(empty);
  const [tagInput, setTagInput] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOk] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await tradesApi.list({
        status: statusFilter || undefined,
        pageSize: 50,
      });
      setItems(res.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setCreating(true);
    try {
      const payload: TradeInput = {
        ...form,
        exitPrice: form.exitPrice ? form.exitPrice : undefined,
        notes: form.notes || undefined,
        tags: form.tags && form.tags.length > 0 ? form.tags : undefined,
      };
      await tradesApi.create(payload);
      setForm(empty);
      setTagInput('');
      setOk('trade saved');
      await load();
    } catch (e: unknown) {
      setErr((e as { message?: string }).message ?? 'could not save trade');
    } finally {
      setCreating(false);
    }
  }

  function addTag() {
    const t = tagInput.trim();
    if (!t) return;
    if ((form.tags ?? []).includes(t)) return;
    setForm({ ...form, tags: [...(form.tags ?? []), t] });
    setTagInput('');
  }

  function removeTag(t: string) {
    setForm({ ...form, tags: (form.tags ?? []).filter((x) => x !== t) });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-white/40">trades</p>
          <h1 className="mt-1 text-3xl font-semibold">your trade journal</h1>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="filter">filter</Label>
          <select
            id="filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as '' | 'OPEN' | 'CLOSED')}
            className="rounded-md border border-white/20 bg-black px-3 py-2 text-sm"
          >
            <option value="">all</option>
            <option value="OPEN">open</option>
            <option value="CLOSED">closed</option>
          </select>
        </div>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">log a trade</h2>
        <form onSubmit={onCreate} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="symbol">symbol</Label>
            <Input
              id="symbol"
              value={form.symbol}
              onChange={(e) => setForm({ ...form, symbol: e.target.value })}
              placeholder="BTCUSDT"
              required
            />
          </div>
          <div>
            <Label htmlFor="side">side</Label>
            <Select
              id="side"
              value={form.side}
              onChange={(e) => setForm({ ...form, side: e.target.value as 'LONG' | 'SHORT' })}
            >
              <option value="LONG">long</option>
              <option value="SHORT">short</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="entry">entry price</Label>
            <Input
              id="entry"
              value={form.entryPrice}
              onChange={(e) => setForm({ ...form, entryPrice: e.target.value })}
              inputMode="decimal"
              placeholder="65000.50"
              required
            />
          </div>
          <div>
            <Label htmlFor="qty">quantity</Label>
            <Input
              id="qty"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              inputMode="decimal"
              placeholder="0.1"
              required
            />
          </div>
          <div>
            <Label htmlFor="exit">exit price (optional)</Label>
            <Input
              id="exit"
              value={form.exitPrice ?? ''}
              onChange={(e) => setForm({ ...form, exitPrice: e.target.value })}
              inputMode="decimal"
              placeholder="leave blank if still open"
            />
          </div>
          <div>
            <Label htmlFor="tag">tags</Label>
            <div className="flex gap-2">
              <Input
                id="tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="press enter to add"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                add
              </Button>
            </div>
            {(form.tags ?? []).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {(form.tags ?? []).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => removeTag(t)}
                    className="rounded border border-white/30 px-2 py-0.5 text-xs hover:border-accent-red hover:text-accent-red"
                  >
                    {t} ✕
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="notes">notes</Label>
            <Textarea
              id="notes"
              value={form.notes ?? ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="what was the setup?"
            />
          </div>

          {err && (
            <div className="sm:col-span-2">
              <Alert kind="error">{err}</Alert>
            </div>
          )}
          {okMsg && (
            <div className="sm:col-span-2">
              <Alert kind="success">{okMsg}</Alert>
            </div>
          )}

          <div className="sm:col-span-2">
            <Button type="submit" disabled={creating}>
              {creating ? 'saving…' : 'save trade'}
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">all trades</h2>
        {loading ? (
          <p className="mt-6 text-white/40">loading…</p>
        ) : items.length === 0 ? (
          <p className="mt-6 text-white/40">no trades yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wider text-white/40">
                <tr>
                  <th className="py-2 pr-4">symbol</th>
                  <th className="py-2 pr-4">side</th>
                  <th className="py-2 pr-4">status</th>
                  <th className="py-2 pr-4">entry</th>
                  <th className="py-2 pr-4">exit</th>
                  <th className="py-2 pr-4">qty</th>
                  <th className="py-2 pr-4 text-right">p&amp;l</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {items.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5">
                    <td className="py-3 pr-4 font-mono">{t.symbol}</td>
                    <td className="py-3 pr-4">
                      <Badge tone={t.side === 'LONG' ? 'green' : 'red'}>{t.side}</Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge tone={t.status === 'OPEN' ? 'amber' : 'neutral'}>{t.status}</Badge>
                    </td>
                    <td className="py-3 pr-4 font-mono">{Number(t.entryPrice).toFixed(2)}</td>
                    <td className="py-3 pr-4 font-mono">
                      {t.exitPrice ? Number(t.exitPrice).toFixed(2) : '—'}
                    </td>
                    <td className="py-3 pr-4 font-mono">{t.quantity}</td>
                    <td className={`py-3 pr-4 text-right font-mono ${pnlClass(t.pnl)}`}>
                      {t.pnl ? Number(t.pnl).toFixed(2) : '—'}
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/trades/${t.id}`}
                        className="rounded border border-white/20 px-2 py-1 text-xs hover:border-white hover:bg-white hover:text-black"
                      >
                        edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function TradesPage() {
  return (
    <RequireAuth>
      <TradesInner />
    </RequireAuth>
  );
}
