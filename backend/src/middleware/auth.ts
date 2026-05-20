import type { NextFunction, Request, Response } from 'express';
import { verifyToken, type JwtPayload } from '../lib/jwt';
import { ApiError } from './error';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'missing or malformed authorization header'));
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new ApiError(401, 'invalid or expired token'));
  }
}

export function requireRole(...roles: Array<JwtPayload['role']>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, 'not authenticated'));
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'forbidden'));
    }
    next();
  };
}
