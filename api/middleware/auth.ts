import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'voting-platform-secret-key-2024';

export interface AuthRequest extends Request {
  userId?: number;
}

export interface JwtPayload {
  userId: number;
  email: string;
}

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    res.status(401).json({ success: false, error: '请先登录' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ success: false, error: '无效的登录凭证' });
    return;
  }

  req.userId = payload.userId;
  next();
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      req.userId = payload.userId;
    }
  }

  next();
}
