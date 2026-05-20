import { z } from 'zod';

const decimalString = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === 'number' ? v.toString() : v))
  .refine((v) => /^-?\d+(\.\d+)?$/.test(v), { message: 'must be a decimal number' });

const positiveDecimal = decimalString.refine((v) => Number(v) > 0, {
  message: 'must be greater than 0',
});

export const createTradeSchema = z.object({
  symbol: z.string().trim().min(1).max(20).transform((s) => s.toUpperCase()),
  side: z.enum(['LONG', 'SHORT']),
  entryPrice: positiveDecimal,
  quantity: positiveDecimal,
  exitPrice: positiveDecimal.optional(),
  notes: z.string().max(2000).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
  openedAt: z.string().datetime().optional(),
});

export const updateTradeSchema = createTradeSchema.partial().extend({
  closedAt: z.string().datetime().nullable().optional(),
});

export const listTradesQuerySchema = z.object({
  status: z.enum(['OPEN', 'CLOSED']).optional(),
  symbol: z.string().trim().min(1).max(20).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateTradeInput = z.infer<typeof createTradeSchema>;
export type UpdateTradeInput = z.infer<typeof updateTradeSchema>;
