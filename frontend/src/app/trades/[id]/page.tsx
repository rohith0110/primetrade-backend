'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RequireAuth } from '@/components/require-auth';
import { tradesApi, type Trade } from '@/lib/trades';
import {
  Alert,
  Badge,
  Button,
  Card,
  FieldError,
  Input,
  Label,
  Select,
  Textarea,
} from '@/components/ui';
import { fieldErrorsFrom, sanitizeDecimalInput, updateTradeSchema } from '@/lib/validation';

type Field = 'symbol' | 'side' | 'entryPrice' | 'quantity' | 'exitPrice' | 'notes';

function TradeDetailInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [okMsg, setOk] = useState<string | null>(null);

  const [symbol, setSymbol] = useState('');
  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

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
        setFormErr((e as { message?: string }).message ?? 'could not load trade');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  function validate(showAll = false) {
    const result = updateTradeSchema.safeParse({
      symbol,
      side,
      entryPrice,
      quantity,
      exitPrice,
      notes,
    });
    if (!result.success) {
      setErrors(fieldErrorsFrom<typeof updateTradeSchema>(result.error));
      if (showAll) {
        setTouched({
          symbol: true,
          side: true,
          entryPrice: true,
          quantity: true,
          exitPrice: true,
          notes: true,
        });
      }
      return null;
    }
    setErrors({});
    return result.data;
  }

  function blur(field: Field) {
    setTouched((t) => ({ ...t, [field]: true }));
    validate();
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(null);
    setOk(null);
    const parsed = validate(true);
    if (!parsed) return;

    setBusy(true);
    try {
      const updated = await tradesApi.update(id, {
        symbol: parsed.symbol,
        side: parsed.side,
        entryPrice: parsed.entryPrice,
        quantity: parsed.quantity,
        // explicit null clears exit price on the backend
        exitPrice: parsed.exitPrice ?? null,
        notes: parsed.notes,
      });
      setTrade(updated);
      setOk('saved');
    } catch (e: unknown) {
      setFormErr((e as { message?: string }).message ?? 'save failed');
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
      setFormErr((e as { message?: string }).message ?? 'delete failed');
      setBusy(false);
    }
  }

  const showError = (f: Field) => (touched[f] ? errors[f] : undefined);

  if (loading) return <p className="py-12 text-white/40">loading…</p>;
  if (!trade) return <Alert kind="error">{formErr ?? 'trade not found'}</Alert>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/trades" className="text-sm text-white/60 hover:text-white">
          ← back to trades
        </Link>
        <div className="flex gap-2">
          <Badge tone={trade.side === 'LONG' ? 'green' : 'red'}>{trade.side}</Badge>
          <Badge tone={trade.status === 'OPEN' ? 'amber' : 'neutral'}>{trade.status}</Badge>
        </div>
      </div>

      <Card>
        <h1 className="break-all font-mono text-xl sm:text-2xl">{trade.symbol}</h1>
        <p className="mt-1 text-xs text-white/40 sm:text-sm">
          opened {new Date(trade.openedAt).toLocaleString()}
          {trade.closedAt ? ` · closed ${new Date(trade.closedAt).toLocaleString()}` : ''}
        </p>

        <form onSubmit={onSave} noValidate className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="symbol">symbol</Label>
            <Input
              id="symbol"
              name="symbol"
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onBlur={() => blur('symbol')}
              invalid={!!showError('symbol')}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              maxLength={20}
              required
            />
            <FieldError>{showError('symbol')}</FieldError>
          </div>

          <div>
            <Label htmlFor="side">side</Label>
            <Select
              id="side"
              name="side"
              value={side}
              onChange={(e) => setSide(e.target.value as 'LONG' | 'SHORT')}
              onBlur={() => blur('side')}
              invalid={!!showError('side')}
            >
              <option value="LONG">long</option>
              <option value="SHORT">short</option>
            </Select>
            <FieldError>{showError('side')}</FieldError>
          </div>

          <div>
            <Label htmlFor="entry">entry price</Label>
            <Input
              id="entry"
              name="entryPrice"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              value={entryPrice}
              onChange={(e) => setEntryPrice(sanitizeDecimalInput(e.target.value))}
              onBlur={() => blur('entryPrice')}
              invalid={!!showError('entryPrice')}
              maxLength={24}
              required
            />
            <FieldError>{showError('entryPrice')}</FieldError>
          </div>

          <div>
            <Label htmlFor="qty">quantity</Label>
            <Input
              id="qty"
              name="quantity"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              value={quantity}
              onChange={(e) => setQuantity(sanitizeDecimalInput(e.target.value))}
              onBlur={() => blur('quantity')}
              invalid={!!showError('quantity')}
              maxLength={24}
              required
            />
            <FieldError>{showError('quantity')}</FieldError>
          </div>

          <div>
            <Label htmlFor="exit">exit price</Label>
            <Input
              id="exit"
              name="exitPrice"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              value={exitPrice}
              onChange={(e) => setExitPrice(sanitizeDecimalInput(e.target.value))}
              onBlur={() => blur('exitPrice')}
              invalid={!!showError('exitPrice')}
              maxLength={24}
              placeholder="leave blank for open"
            />
            <FieldError>{showError('exitPrice')}</FieldError>
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
              name="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => blur('notes')}
              invalid={!!showError('notes')}
              rows={4}
              maxLength={2000}
            />
            <div className="mt-1 flex items-center justify-between">
              <FieldError>{showError('notes')}</FieldError>
              <span className="text-xs text-white/30">{notes.length} / 2000</span>
            </div>
          </div>

          {formErr && (
            <div className="sm:col-span-2">
              <Alert kind="error">{formErr}</Alert>
            </div>
          )}
          {okMsg && (
            <div className="sm:col-span-2">
              <Alert kind="success">{okMsg}</Alert>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="danger" onClick={onDelete} disabled={busy}>
              delete
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'saving…' : 'save changes'}
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
