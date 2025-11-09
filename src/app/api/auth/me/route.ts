// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/server/auth-utils'; // Import the new util

export async function GET() {
  try {
    // Use the new auth utility to get current user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const users = db.collection('users');

    // Only update lastActivity every 30 minutes to reduce DB writes
    const now = new Date();
    const lastActivity = user.lastActivity ? new Date(user.lastActivity) : now;
    const timeSinceLastActivity = now.getTime() - lastActivity.getTime();
    
    // Increase to 30 minutes to reduce DB writes
    if (timeSinceLastActivity > 30 * 60 * 1000) {
      await users.updateOne(
        { _id: user._id },
        { $set: { lastActivity: now } }
      );
    }

    // Add caching headers to reduce API calls
    const response = NextResponse.json({
      status: 'success',
      user: {
        _id: user._id.toString(),
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role || 'user',
        lastLogin: user.lastLogin?.toISOString(),
        lastActivity: user.lastActivity?.toISOString(),  
        createdAt: user.createdAt?.toISOString(),
        isActive: user.isActive !== undefined ? user.isActive : true
      }
    });

    // Cache the response for 2 minutes
    response.headers.set('Cache-Control', 'private, max-age=120');
    
    return response;

  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}