// src/app/api/auth/extend-session/route.ts
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/server/auth-utils'; // Import the new util
import { getInactivityTimeoutMs } from '@/lib/auth-config'; // Import timeout helper
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Use the new auth utility to get current user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'No active session' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const users = db.collection('users');
    
    // Check if remember me is enabled
    const cookieStore = await cookies();
    const rememberMeCookie = cookieStore.get('remember_me')?.value;
    const rememberMe = rememberMeCookie === 'true';
    
    // Calculate new expiration based on remember me setting
    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + getInactivityTimeoutMs(rememberMe));
    
    // Extend session by updating lastActivity and sessionExpiresAt
    const result = await users.updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastActivity: now,
          sessionExpiresAt: newExpiresAt
        } 
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Session not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Session extended for user: ${user.email}, expires at: ${newExpiresAt}, remember me: ${rememberMe}`);

    return NextResponse.json({
      status: 'success',
      message: 'Session extended',
      expiresAt: newExpiresAt.toISOString(),
      rememberMe
    });

  } catch (error) {
    console.error('Session extension error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}