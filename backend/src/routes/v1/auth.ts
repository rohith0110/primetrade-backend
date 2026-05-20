import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { hashPassword, verifyPassword } from '../../lib/password';
import { signToken } from '../../lib/jwt';
import { ApiError } from '../../middleware/error';
import { loginSchema, registerSchema } from '../../schemas/auth';

export const authRouter = Router();

function publicUser(u: { id: string; email: string; name: string | null; role: 'USER' | 'ADMIN'; createdAt: Date }) {
  return { id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt };
}

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [auth]
 *     summary: Create a new user account
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               name: { type: string }
 *     responses:
 *       201: { description: account created }
 *       409: { description: email already in use }
 */
authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ApiError(409, 'email already registered');

    const user = await prisma.user.create({
      data: { email, name, passwordHash: await hashPassword(password) },
    });
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.status(201).json({ token, user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [auth]
 *     summary: Exchange credentials for a JWT
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200: { description: signed in }
 *       401: { description: invalid credentials }
 */
authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    // same error for "user not found" and "bad password" — don't leak which it was
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new ApiError(401, 'invalid credentials');
    }
    const token = signToken({ sub: user.id, email: user.email, role: user.role });
    res.json({ token, user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});
