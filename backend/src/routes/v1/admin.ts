import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { requireAuth, requireRole } from '../../middleware/auth';
import { ApiError } from '../../middleware/error';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('ADMIN'));

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

const updateUserSchema = z.object({
  role: z.enum(['USER', 'ADMIN']).optional(),
  name: z.string().trim().min(1).max(80).nullable().optional(),
});

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [admin]
 *     summary: List every user (admin only)
 *     responses:
 *       200: { description: ok }
 *       403: { description: forbidden }
 */
adminRouter.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, pageSize } = paginationSchema.parse(req.query);
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: { select: { trades: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count(),
    ]);
    res.json({ items, total, page, pageSize });
  } catch (e) {
    next(e);
  }
});

/**
 * @openapi
 * /admin/users/{id}:
 *   patch:
 *     tags: [admin]
 *     summary: Update a user's role or profile (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: updated }
 */
adminRouter.patch('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateUserSchema.parse(req.body);
    // don't let an admin lock themselves out by demoting their own account
    if (input.role && input.role !== 'ADMIN' && req.params.id === req.user!.sub) {
      throw new ApiError(400, 'cannot demote your own account');
    }
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: input,
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

/**
 * @openapi
 * /admin/users/{id}:
 *   delete:
 *     tags: [admin]
 *     summary: Delete a user (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: deleted }
 */
adminRouter.delete('/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.params.id === req.user!.sub) {
      throw new ApiError(400, 'cannot delete your own account from admin api');
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

/**
 * @openapi
 * /admin/trades:
 *   get:
 *     tags: [admin]
 *     summary: List every trade across all users (admin only)
 *     responses:
 *       200: { description: ok }
 */
adminRouter.get('/trades', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, pageSize } = paginationSchema.parse(req.query);
    const [items, total] = await Promise.all([
      prisma.trade.findMany({
        include: { user: { select: { id: true, email: true, name: true } } },
        orderBy: { openedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.trade.count(),
    ]);
    res.json({ items, total, page, pageSize });
  } catch (e) {
    next(e);
  }
});

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     tags: [admin]
 *     summary: Quick aggregate stats for the dashboard
 *     responses:
 *       200: { description: ok }
 */
adminRouter.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [users, trades, openTrades] = await Promise.all([
      prisma.user.count(),
      prisma.trade.count(),
      prisma.trade.count({ where: { status: 'OPEN' } }),
    ]);
    res.json({ users, trades, openTrades });
  } catch (e) {
    next(e);
  }
});
