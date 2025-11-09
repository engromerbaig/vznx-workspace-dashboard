// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDatabase } from '@/lib/mongodb';
import { AUTH_CONFIG } from '@/lib/auth-config';
import { pusherServer } from '@/lib/pusher-server';
import { getCurrentUser } from '@/lib/server/auth-utils';
import { ActivityLogger } from '@/lib/server/activity-logger';

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

      // Real-time updates
      try {
        const counts = {
          totalUsers: await users.countDocuments(),
          totalSuperadmins: await users.countDocuments({ role: 'superadmin' }),
          totalManagers: await users.countDocuments({ role: 'manager' }),
          totalOnline: await users.countDocuments({ sessionExpiresAt: { $gt: new Date() } })
        };

        await pusherServer.trigger('user-counts', 'counts-updated', counts);
        await pusherServer.trigger('user-updates', 'user-logged-out', {
          userId: user._id.toString(),
          user: { _id: user._id.toString(), name: user.name, username: user.username, email: user.email, role: user.role },
          timestamp: new Date().toISOString(),
          action: 'LOGOUT'
        });
      } catch (pusherError) {
        console.error('Pusher error:', pusherError);
      }

      // Log activity (triggers real-time update automatically)
      await ActivityLogger.logLogout(user, request);
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