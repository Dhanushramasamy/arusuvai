import { SignJWT, jwtVerify } from 'jose';
import type { SessionUser } from '@/types';

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET ?? 'arusuvai-fallback-secret-change-in-production'
);

const ALGORITHM = 'HS256';
const EXPIRY = '7d';

export async function signToken(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(EXPIRY)
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      id:       payload.id as string,
      name:     payload.name as string,
      role:     payload.role as SessionUser['role'],
      location: payload.location as string,
    };
  } catch {
    return null;
  }
}
