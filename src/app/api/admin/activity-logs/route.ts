// src/app/api/admin/activity-logs/route.ts
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser, verifySuperAdmin } from '@/lib/server/auth-utils'; // Import the new utils
import { isSuperAdmin } from '@/lib/server/role-utils'; // Import role utils

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username'); // Specific user filter
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const page = parseInt(searchParams.get('page') || '1');

    console.log('🔍 Fetching activity logs with params:', { username, limit, page });

    // Get current user using the new auth utility
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.log('❌ No authenticated user');
      return NextResponse.json(
        { status: 'error', message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user has access (superadmin OR user accessing own logs)
    const hasAccess = isSuperAdmin(currentUser.role) || 
                     (username && currentUser.username === username);
    
    if (!hasAccess) {
      console.log('❌ Unauthorized access attempt by:', currentUser.email);
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const db = await getDatabase();
    const activityLogs = db.collection('activity_logs');

    // Build query filter
    const filter: any = {};
    
    if (username) {
      if (!isSuperAdmin(currentUser.role)) {
        // Regular users can only see their own logs
        filter.userId = currentUser._id.toString();
        console.log('👤 User filtering for own logs:', currentUser._id.toString());
      } else {
        // Superadmin filtering for specific user
        const targetUser = await db.collection('users').findOne({ 
          username: username.toLowerCase() 
        });
        if (targetUser) {
          filter.userId = targetUser._id.toString();
          console.log('🛡️ SuperAdmin filtering for user:', targetUser._id.toString());
        } else {
          console.log('❌ Target user not found:', username);
          return NextResponse.json(
            { status: 'error', message: 'User not found' },
            { status: 404 }
          );
        }
      }
    }
    // If no username filter and user is superadmin, returns all logs

    console.log('📊 Activity logs filter:', filter);

    // Get activity logs with pagination
    const logs = await activityLogs
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .toArray();

    console.log('📄 Found logs:', logs.length);

    // Get total count for pagination
    const totalLogs = await activityLogs.countDocuments(filter);

    // Format logs for frontend
    const formattedLogs = logs.map(log => ({
      _id: log._id.toString(),
      userId: log.userId,
      userName: log.userName,
      username: log.username,
      action: log.action,
      description: log.description,
      timestamp: log.timestamp.toISOString(),
      ipAddress: log.ipAddress,
      metadata: log.metadata || {}
    }));

    return NextResponse.json({
      status: 'success',
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total: totalLogs,
        pages: Math.ceil(totalLogs / limit)
      },
      // Add context about what's being shown
      context: {
        isSuperAdmin: isSuperAdmin(currentUser.role),
        filteredUser: username || null
      }
    });

  } catch (error) {
    console.error('❌ Get activity logs error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}