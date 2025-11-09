// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDatabase } from '@/lib/mongodb';
import { AUTH_CONFIG } from '@/lib/auth-config';
import { getCurrentUser } from '@/lib/server/auth-utils';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (user) {
      const db = await getDatabase();
      const users = db.collection('users');
      
      await users.updateOne(
        { _id: user._id },
        { $unset: { sessionToken: "", sessionCreatedAt: "", sessionExpiresAt: "", lastActivity: "" } }
      );
    }

    // Clear cookies
    const cookieStore = await cookies();
    cookieStore.set({ name: AUTH_CONFIG.SESSION.COOKIE_NAME, value: '', maxAge: 0 });
    cookieStore.set({ name: AUTH_CONFIG.REMEMBER_ME.COOKIE_NAME, value: '', maxAge: 0 });

    return NextResponse.json({ status: 'success', message: 'Logged out successfully' });
    
  } catch (error) {
    console.error('Logout error:', error);
    
    // Still clear cookies on error
    const cookieStore = await cookies();
    cookieStore.set({ name: AUTH_CONFIG.SESSION.COOKIE_NAME, value: '', maxAge: 0 });
    cookieStore.set({ name: AUTH_CONFIG.REMEMBER_ME.COOKIE_NAME, value: '', maxAge: 0 });

    return NextResponse.json({ status: 'success', message: 'Logged out successfully' }, { status: 200 });
  }
}