import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { requireAuth } from '../../middleware/auth';
import { ApiError } from '../../middleware/error';

export const meRouter = Router();

/**
 * @openapi
 * /me:
 *   get:
 *     tags: [me]
 *     summary: Return the currently authenticated user
 *     responses:
 *       200: { description: ok }
 *       401: { description: not authenticated }
 */
meRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const u = await prisma.user.findUnique({ where: { id: req.user!.sub } });
    if (!u) throw new ApiError(404, 'user not found');
    res.json({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
    });
  } catch (e) {
    next(e);
  }
});
