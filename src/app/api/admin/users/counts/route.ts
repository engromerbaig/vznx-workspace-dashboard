// src/app/api/admin/users/counts/route.ts
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifySuperAdmin } from '@/lib/server/auth-utils'; // Import the new util

export async function GET() {
  try {
    // Use the new auth utility to verify superadmin access
    const currentUser = await verifySuperAdmin();
    if (!currentUser) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized - SuperAdmin access required' },
        { status: 403 }
      );
    }

    const db = await getDatabase();
    const users = db.collection('users');

    // Get real counts from database (scalable approach)
    const [
      totalUsers,
      totalSuperadmins,
      totalManagers,
      onlineUsers
    ] = await Promise.all([
      users.countDocuments(),
      users.countDocuments({ role: 'superadmin' }),
      users.countDocuments({ role: 'manager' }),
      users.countDocuments({ 
        sessionExpiresAt: { $gt: new Date() } 
      })
    ]);

    const counts = {
      totalUsers,
      totalSuperadmins,
      totalManagers,
      totalOnline: onlineUsers
    };

    console.log(`📊 User counts retrieved by superadmin: ${currentUser.email}`, counts);

    return NextResponse.json({
      status: 'success',
      counts
    });

  } catch (error) {
    console.error('Get user counts error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}