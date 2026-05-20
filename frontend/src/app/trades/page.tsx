'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RequireAuth } from '@/components/require-auth';
import { tradesApi, type Trade, type TradeInput } from '@/lib/trades';
import {
  Alert,
  Badge,
  Button,
  Card,
  FieldError,
  FieldHint,
  Input,
  Label,
  Select,
  Textarea,
} from '@/components/ui';
import {
  createTradeSchema,
  fieldErrorsFrom,
  sanitizeDecimalInput,
  tagSchema,
} from '@/lib/validation';

function pnlClass(pnl: string | null) {
  if (!pnl) return 'text-white/40';
  const n = Number(pnl);
  if (n > 0) return 'text-accent-green';
  if (n < 0) return 'text-accent-red';
  return 'text-white/60';
}

type FormState = {
  symbol: string;
  side: 'LONG' | 'SHORT';
  entryPrice: string;
  quantity: string;
  exitPrice: string;
  notes: string;
  tags: string[];
};

const empty: FormState = {
  symbol: '',
  side: 'LONG',
  entryPrice: '',
  quantity: '',
  exitPrice: '',
  notes: '',
  tags: [],
};

type FieldKey = keyof Omit<FormState, 'tags' | 'side'> | 'tags' | 'side';

function TradesInner() {
  const [items, setItems] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'' | 'OPEN' | 'CLOSED'>('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [tagInput, setTagInput] = useState('');
  const [tagError, setTagError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [formErr, setFormErr] = useState<string | null>(null);
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

  function validate(showAll = false) {
    const result = createTradeSchema.safeParse({
      symbol: form.symbol,
      side: form.side,
      entryPrice: form.entryPrice,
      quantity: form.quantity,
      exitPrice: form.exitPrice,
      notes: form.notes,
      tags: form.tags.length ? form.tags : undefined,
    });
    if (!result.success) {
      setErrors(fieldErrorsFrom<typeof createTradeSchema>(result.error));
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

  function blur(field: FieldKey) {
    setTouched((t) => ({ ...t, [field]: true }));
    validate();
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormErr(null);
    setOk(null);
    const parsed = validate(true);
    if (!parsed) return;

    setCreating(true);
    try {
      const payload: TradeInput = {
        symbol: parsed.symbol,
        side: parsed.side,
        entryPrice: parsed.entryPrice,
        quantity: parsed.quantity,
        exitPrice: parsed.exitPrice,
        notes: parsed.notes,
        tags: parsed.tags && parsed.tags.length > 0 ? parsed.tags : undefined,
      };
      await tradesApi.create(payload);
      setForm(empty);
      setTagInput('');
      setTouched({});
      setOk('trade saved');
      await load();
    } catch (e: unknown) {
      setFormErr((e as { message?: string }).message ?? 'could not save trade');
    } finally {
      setCreating(false);
    }
  }

  function addTag() {
    const raw = tagInput;
    const result = tagSchema.safeParse(raw);
    if (!result.success) {
      setTagError(result.error.issues[0]?.message ?? 'invalid tag');
      return;
    }
    const t = result.data;
    if (form.tags.includes(t)) {
      setTagError('already added');
      return;
    }
    if (form.tags.length >= 10) {
      setTagError('at most 10 tags');
      return;
    }
    setForm({ ...form, tags: [...form.tags, t] });
    setTagInput('');
    setTagError(null);
  }

  function removeTag(t: string) {
    setForm({ ...form, tags: form.tags.filter((x) => x !== t) });
  }

  const showError = (f: FieldKey) => (touched[f] ? errors[f] : undefined);

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
        <form onSubmit={onCreate} noValidate className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="symbol">symbol</Label>
            <Input
              id="symbol"
              name="symbol"
              type="text"
              value={form.symbol}
              onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
              onBlur={() => blur('symbol')}
              invalid={!!showError('symbol')}
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              maxLength={20}
              placeholder="BTCUSDT"
              required
            />
            <FieldError>{showError('symbol')}</FieldError>
          </div>

          <div>
            <Label htmlFor="side">side</Label>
            <Select
              id="side"
              name="side"
              value={form.side}
              onChange={(e) => setForm({ ...form, side: e.target.value as 'LONG' | 'SHORT' })}
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
              value={form.entryPrice}
              onChange={(e) =>
                setForm({ ...form, entryPrice: sanitizeDecimalInput(e.target.value) })
              }
              onBlur={() => blur('entryPrice')}
              invalid={!!showError('entryPrice')}
              maxLength={24}
              placeholder="65000.50"
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
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: sanitizeDecimalInput(e.target.value) })
              }
              onBlur={() => blur('quantity')}
              invalid={!!showError('quantity')}
              maxLength={24}
              placeholder="0.1"
              required
            />
            <FieldError>{showError('quantity')}</FieldError>
          </div>

          <div>
            <Label htmlFor="exit">exit price (optional)</Label>
            <Input
              id="exit"
              name="exitPrice"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              value={form.exitPrice}
              onChange={(e) =>
                setForm({ ...form, exitPrice: sanitizeDecimalInput(e.target.value) })
              }
              onBlur={() => blur('exitPrice')}
              invalid={!!showError('exitPrice')}
              maxLength={24}
              placeholder="leave blank if still open"
            />
            <FieldError>{showError('exitPrice')}</FieldError>
          </div>

          <div>
            <Label htmlFor="tag">tags</Label>
            <div className="flex gap-2">
              <Input
                id="tag"
                name="tag"
                type="text"
                value={tagInput}
                onChange={(e) => {
                  setTagInput(e.target.value);
                  if (tagError) setTagError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                maxLength={40}
                invalid={!!tagError}
                placeholder="press enter to add"
              />
              <Button type="button" variant="outline" onClick={addTag}>
                add
              </Button>
            </div>
            {tagError ? (
              <FieldError>{tagError}</FieldError>
            ) : (
              <FieldHint>up to 10 tags, letters/numbers/space/_/-</FieldHint>
            )}
            {form.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {form.tags.map((t) => (
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
              name="notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              onBlur={() => blur('notes')}
              invalid={!!showError('notes')}
              rows={3}
              maxLength={2000}
              placeholder="what was the setup?"
            />
            <div className="mt-1 flex items-center justify-between">
              <FieldError>{showError('notes')}</FieldError>
              <span className="text-xs text-white/30">{form.notes.length} / 2000</span>
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
