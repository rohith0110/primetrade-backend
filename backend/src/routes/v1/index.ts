import { Router } from 'express';
import { authRouter } from './auth';
import { tradesRouter } from './trades';
import { adminRouter } from './admin';
import { meRouter } from './me';

export const router = Router();

router.use('/auth', authRouter);
router.use('/me', meRouter);
router.use('/trades', tradesRouter);
router.use('/admin', adminRouter);
