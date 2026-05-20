import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export type JwtPayload = {
  sub: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  // jwt.verify throws on bad/expired tokens — caller maps to 401
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
