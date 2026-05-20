import { Router, type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { requireAuth } from '../../middleware/auth';
import { ApiError } from '../../middleware/error';
import {
  createTradeSchema,
  listTradesQuerySchema,
  updateTradeSchema,
} from '../../schemas/trade';
import { toTradeCreate, toTradeUpdate } from '../../services/trade';

export const tradesRouter = Router();

// all trade routes require a logged-in user
tradesRouter.use(requireAuth);

/**
 * @openapi
 * /trades:
 *   get:
 *     tags: [trades]
 *     summary: List the caller's trades
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [OPEN, CLOSED] }
 *       - in: query
 *         name: symbol
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: ok }
 */
tradesRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = listTradesQuerySchema.parse(req.query);
    const where = {
      userId: req.user!.sub,
      ...(q.status ? { status: q.status } : {}),
      ...(q.symbol ? { symbol: q.symbol.toUpperCase() } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.trade.findMany({
        where,
        orderBy: { openedAt: 'desc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      prisma.trade.count({ where }),
    ]);
    res.json({ items, total, page: q.page, pageSize: q.pageSize });
  } catch (e) {
    next(e);
  }
});

/**
 * @openapi
 * /trades:
 *   post:
 *     tags: [trades]
 *     summary: Create a trade
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [symbol, side, entryPrice, quantity]
 *             properties:
 *               symbol: { type: string, example: BTCUSDT }
 *               side: { type: string, enum: [LONG, SHORT] }
 *               entryPrice: { type: string, example: "65000.5" }
 *               exitPrice: { type: string }
 *               quantity: { type: string, example: "0.1" }
 *               notes: { type: string }
 *               tags: { type: array, items: { type: string } }
 *     responses:
 *       201: { description: created }
 */
tradesRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = createTradeSchema.parse(req.body);
    const trade = await prisma.trade.create({ data: toTradeCreate(input, req.user!.sub) });
    res.status(201).json(trade);
  } catch (e) {
    next(e);
  }
});

/**
 * @openapi
 * /trades/{id}:
 *   get:
 *     tags: [trades]
 *     summary: Get one trade
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: ok }
 *       404: { description: not found }
 */
tradesRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trade = await prisma.trade.findFirst({
      where: { id: req.params.id, userId: req.user!.sub },
    });
    if (!trade) throw new ApiError(404, 'trade not found');
    res.json(trade);
  } catch (e) {
    next(e);
  }
});

/**
 * @openapi
 * /trades/{id}:
 *   patch:
 *     tags: [trades]
 *     summary: Update a trade (partial)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: updated }
 *       404: { description: not found }
 */
tradesRouter.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = updateTradeSchema.parse(req.body);
    const existing = await prisma.trade.findFirst({
      where: { id: req.params.id, userId: req.user!.sub },
    });
    if (!existing) throw new ApiError(404, 'trade not found');
    const updated = await prisma.trade.update({
      where: { id: existing.id },
      data: toTradeUpdate(input, existing),
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

/**
 * @openapi
 * /trades/{id}:
 *   delete:
 *     tags: [trades]
 *     summary: Delete a trade
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: deleted }
 *       404: { description: not found }
 */
tradesRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.trade.findFirst({
      where: { id: req.params.id, userId: req.user!.sub },
    });
    if (!existing) throw new ApiError(404, 'trade not found');
    await prisma.trade.delete({ where: { id: existing.id } });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});
