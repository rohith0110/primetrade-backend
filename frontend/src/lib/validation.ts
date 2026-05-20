import { z } from 'zod';

// keep these in sync with backend/src/schemas/*.ts — the api re-validates everything,
// but a matching client schema gives instant feedback and lets us block bad submits.

// shared bits ----------------------------------------------------------------

const decimalRe = /^\d+(\.\d+)?$/; // non-negative decimal string (we refine > 0 below)

const positiveDecimal = z
  .string()
  .trim()
  .min(1, 'required')
  .refine((v) => decimalRe.test(v), 'must be a positive number')
  .refine((v) => Number(v) > 0, 'must be greater than 0')
  .refine((v) => Number(v) < 1e15, 'too large');

const optionalPositiveDecimal = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v === '' ? undefined : v))
  .refine((v) => v === undefined || decimalRe.test(v), 'must be a positive number')
  .refine((v) => v === undefined || Number(v) > 0, 'must be greater than 0');

// auth -----------------------------------------------------------------------

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'email is required')
  .email('enter a valid email')
  .max(254, 'email is too long');

export const passwordSchema = z
  .string()
  .min(8, 'at least 8 characters')
  .max(128, 'password is too long');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'password is required'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .max(80, 'name is too long')
    .optional()
    .transform((v) => (v === '' ? undefined : v)),
  email: emailSchema,
  password: passwordSchema,
});

// trades ---------------------------------------------------------------------

export const symbolSchema = z
  .string()
  .trim()
  .min(1, 'symbol is required')
  .max(20, 'symbol is too long')
  .regex(/^[A-Z0-9._/-]+$/i, 'use letters, numbers, . _ / - only')
  .transform((s) => s.toUpperCase());

export const tagSchema = z
  .string()
  .trim()
  .min(1, 'tag cannot be empty')
  .max(40, 'tag is too long')
  .regex(/^[A-Za-z0-9 _-]+$/, 'tag can only use letters, numbers, space, _ or -');

export const notesSchema = z
  .string()
  .max(2000, 'notes are too long (max 2000 chars)')
  .optional()
  .transform((v) => (v === '' ? undefined : v));

export const createTradeSchema = z
  .object({
    symbol: symbolSchema,
    side: z.enum(['LONG', 'SHORT'], { errorMap: () => ({ message: 'pick a side' }) }),
    entryPrice: positiveDecimal,
    quantity: positiveDecimal,
    exitPrice: optionalPositiveDecimal,
    notes: notesSchema,
    tags: z.array(tagSchema).max(10, 'at most 10 tags').optional(),
  })
  .refine(
    (v) => v.exitPrice === undefined || Number(v.exitPrice) !== Number(v.entryPrice),
    {
      message: 'exit must differ from entry (otherwise p&l is zero)',
      path: ['exitPrice'],
    },
  );

export const updateTradeSchema = z.object({
  symbol: symbolSchema,
  side: z.enum(['LONG', 'SHORT']),
  entryPrice: positiveDecimal,
  quantity: positiveDecimal,
  exitPrice: optionalPositiveDecimal,
  notes: notesSchema,
});

// input sanitizers -----------------------------------------------------------

// strips anything that isn't a digit or '.', and collapses extra dots so we
// keep at most one. used on onChange for price/quantity inputs — handles
// typing, paste, drop, and IME the same way.
export function sanitizeDecimalInput(raw: string): string {
  const digitsOnly = raw.replace(/[^\d.]/g, '');
  const firstDot = digitsOnly.indexOf('.');
  if (firstDot === -1) return digitsOnly;
  return (
    digitsOnly.slice(0, firstDot + 1) +
    digitsOnly.slice(firstDot + 1).replace(/\./g, '')
  );
}

// helpers --------------------------------------------------------------------

export type FieldErrors<T extends z.ZodTypeAny> = Partial<
  Record<keyof z.infer<T>, string>
> & { _form?: string };

export function fieldErrorsFrom<T extends z.ZodTypeAny>(error: z.ZodError): FieldErrors<T> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = (issue.path[0] as string) ?? '_form';
    if (!out[key]) out[key] = issue.message; // first error per field wins
  }
  return out as FieldErrors<T>;
}
