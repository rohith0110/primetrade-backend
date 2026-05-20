'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RequireAuth } from '@/components/require-auth';
import { tradesApi, type Trade } from '@/lib/trades';
import { Alert, Badge, Button, Card, Input, Label, Select, Textarea } from '@/components/ui';

function TradeDetailInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOk] = useState<string | null>(null);

  const [symbol, setSymbol] = useState('');
  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const t = await tradesApi.get(id);
        if (!alive) return;
        setTrade(t);
        setSymbol(t.symbol);
        setSide(t.side);
        setEntryPrice(t.entryPrice);
        setExitPrice(t.exitPrice ?? '');
        setQuantity(t.quantity);
        setNotes(t.notes ?? '');
      } catch (e: unknown) {
        setErr((e as { message?: string }).message ?? 'could not load trade');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setBusy(true);
    try {
      const updated = await tradesApi.update(id, {
        symbol,
        side,
        entryPrice,
        quantity,
        exitPrice: exitPrice ? exitPrice : null,
        notes: notes || undefined,
      });
      setTrade(updated);
      setOk('saved');
    } catch (e: unknown) {
      setErr((e as { message?: string }).message ?? 'save failed');
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!confirm('delete this trade? this cannot be undone.')) return;
    setBusy(true);
    try {
      await tradesApi.remove(id);
      router.push('/trades');
    } catch (e: unknown) {
      setErr((e as { message?: string }).message ?? 'delete failed');
      setBusy(false);
    }
  }

  if (loading) return <p className="py-12 text-white/40">loading…</p>;
  if (!trade) return <Alert kind="error">{err ?? 'trade not found'}</Alert>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/trades" className="text-sm text-white/60 hover:text-white">
          ← back to trades
        </Link>
        <div className="flex gap-2">
          <Badge tone={trade.side === 'LONG' ? 'green' : 'red'}>{trade.side}</Badge>
          <Badge tone={trade.status === 'OPEN' ? 'amber' : 'neutral'}>{trade.status}</Badge>
        </div>
      </div>

      <Card>
        <h1 className="font-mono text-2xl">{trade.symbol}</h1>
        <p className="mt-1 text-sm text-white/40">
          opened {new Date(trade.openedAt).toLocaleString()}
          {trade.closedAt ? ` · closed ${new Date(trade.closedAt).toLocaleString()}` : ''}
        </p>

        <form onSubmit={onSave} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="symbol">symbol</Label>
            <Input id="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="side">side</Label>
            <Select
              id="side"
              value={side}
              onChange={(e) => setSide(e.target.value as 'LONG' | 'SHORT')}
            >
              <option value="LONG">long</option>
              <option value="SHORT">short</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="entry">entry price</Label>
            <Input
              id="entry"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              inputMode="decimal"
            />
          </div>
          <div>
            <Label htmlFor="qty">quantity</Label>
            <Input
              id="qty"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              inputMode="decimal"
            />
          </div>
          <div>
            <Label htmlFor="exit">exit price</Label>
            <Input
              id="exit"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              inputMode="decimal"
              placeholder="leave blank for open"
            />
          </div>
          <div>
            <Label>p&amp;l</Label>
            <div className="rounded-md border border-white/10 bg-black px-3 py-2 font-mono text-sm">
              {trade.pnl ? Number(trade.pnl).toFixed(2) : '—'}
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="notes">notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
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

          <div className="flex items-center justify-between sm:col-span-2">
            <Button type="submit" disabled={busy}>
              {busy ? 'saving…' : 'save changes'}
            </Button>
            <Button type="button" variant="danger" onClick={onDelete} disabled={busy}>
              delete
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default function TradeDetailPage() {
  return (
    <RequireAuth>
      <TradeDetailInner />
    </RequireAuth>
  );
}
