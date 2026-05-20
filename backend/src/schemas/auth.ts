import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email().max(254),
  password: z
    .string()
    .min(8, 'password must be at least 8 chars')
    .max(128, 'password too long'),
  name: z.string().trim().min(1).max(80).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
