import { Prisma } from '@prisma/client';
import type { CreateTradeInput, UpdateTradeInput } from '../schemas/trade';

// pnl = (exit - entry) * qty for LONG, (entry - exit) * qty for SHORT
export function computePnL(
  side: 'LONG' | 'SHORT',
  entry: Prisma.Decimal | string,
  exit: Prisma.Decimal | string | null | undefined,
  qty: Prisma.Decimal | string,
): Prisma.Decimal | null {
  if (exit == null) return null;
  const e = new Prisma.Decimal(entry);
  const x = new Prisma.Decimal(exit);
  const q = new Prisma.Decimal(qty);
  const diff = side === 'LONG' ? x.minus(e) : e.minus(x);
  return diff.times(q);
}

export function toTradeCreate(input: CreateTradeInput, userId: string): Prisma.TradeUncheckedCreateInput {
  const status = input.exitPrice !== undefined ? 'CLOSED' : 'OPEN';
  return {
    userId,
    symbol: input.symbol,
    side: input.side,
    status,
    entryPrice: new Prisma.Decimal(input.entryPrice),
    exitPrice: input.exitPrice !== undefined ? new Prisma.Decimal(input.exitPrice) : null,
    quantity: new Prisma.Decimal(input.quantity),
    pnl: computePnL(input.side, input.entryPrice, input.exitPrice, input.quantity),
    notes: input.notes ?? null,
    tags: input.tags ?? [],
    openedAt: input.openedAt ? new Date(input.openedAt) : new Date(),
    closedAt: input.exitPrice !== undefined ? new Date() : null,
  };
}

export function toTradeUpdate(
  input: UpdateTradeInput,
  existing: {
    side: 'LONG' | 'SHORT';
    entryPrice: Prisma.Decimal;
    exitPrice: Prisma.Decimal | null;
    quantity: Prisma.Decimal;
    closedAt: Date | null;
  },
): Prisma.TradeUncheckedUpdateInput {
  const side = input.side ?? existing.side;
  const entry = input.entryPrice !== undefined ? new Prisma.Decimal(input.entryPrice) : existing.entryPrice;
  const qty = input.quantity !== undefined ? new Prisma.Decimal(input.quantity) : existing.quantity;
  const exit =
    input.exitPrice === undefined
      ? existing.exitPrice
      : input.exitPrice === null
      ? null
      : new Prisma.Decimal(input.exitPrice);

  // only update closedAt when the close-state actually changes (or caller passes one explicitly).
  // otherwise editing notes on a closed trade would silently bump closedAt forward.
  const wasClosed = existing.exitPrice !== null;
  const willBeClosed = exit !== null;
  let closedAt: Date | null | undefined;
  if (input.closedAt !== undefined) {
    closedAt = input.closedAt === null ? null : new Date(input.closedAt);
  } else if (!wasClosed && willBeClosed) {
    closedAt = new Date();
  } else if (wasClosed && !willBeClosed) {
    closedAt = null;
  } else {
    closedAt = existing.closedAt;
  }

  return {
    ...(input.symbol !== undefined ? { symbol: input.symbol } : {}),
    side,
    entryPrice: entry,
    quantity: qty,
    exitPrice: exit,
    status: willBeClosed ? 'CLOSED' : 'OPEN',
    pnl: computePnL(side, entry, exit, qty),
    ...(input.notes !== undefined ? { notes: input.notes } : {}),
    ...(input.tags !== undefined ? { tags: input.tags } : {}),
    ...(input.openedAt !== undefined ? { openedAt: new Date(input.openedAt) } : {}),
    closedAt,
  };
}
