import 'dotenv/config';
import jwt from 'jsonwebtoken';

export interface AuthTokenPayload {
  userId: string;
  role: 'STUDENT' | 'ADMIN';
}

function secret(): string {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 16) {
    throw new Error('JWT_SECRET must be set (at least 16 characters).');
  }
  return value;
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, secret(), { expiresIn: '8h' });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, secret());
    if (typeof decoded === 'string') return null;
    return {
      userId: String(decoded.userId),
      role: decoded.role === 'ADMIN' ? 'ADMIN' : 'STUDENT',
    };
  } catch {
    return null;
  }
}