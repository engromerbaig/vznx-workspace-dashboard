// src/lib/server/auth-utils.ts (Server-side only)
import { cookies } from 'next/headers';
import { AUTH_CONFIG } from '@/lib/auth-config';
import { getDatabase } from '@/lib/mongodb';

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(AUTH_CONFIG.SESSION.COOKIE_NAME)?.value;

  if (!sessionToken) return null;

  const db = await getDatabase();
  const user = await db.collection('users').findOne({
    sessionToken,
    sessionExpiresAt: { $gt: new Date() }
  });

  return user;
}

