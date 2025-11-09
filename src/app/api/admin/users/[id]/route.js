// src/app/api/admin/users/[id]/route.js
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { pusherServer } from '@/lib/pusher-server';
import { verifySuperAdmin } from '@/lib/server/auth-utils';
import { ActivityLogger } from '@/lib/server/activity-logger';

export async function DELETE(request, { params }) {
  try {
    // Use the new auth utility to verify superadmin access
    const currentUser = await verifySuperAdmin();
    if (!currentUser) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized - SuperAdmin access required' },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Validate ObjectId
    if (!ObjectId.isValid(userId)) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const users = db.collection('users');

    // Get user to be deleted
    const userToDelete = await users.findOne({ _id: new ObjectId(userId) });

    if (!userToDelete) {
      return NextResponse.json(
        { status: 'error', message: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting superadmin users
    if (userToDelete.role === 'superadmin') {
      return NextResponse.json(
        { status: 'error', message: 'Cannot delete superadmin users' },
        { status: 403 }
      );
    }

    // Prevent deleting yourself
    if (userToDelete._id.toString() === currentUser._id.toString()) {
      return NextResponse.json(
        { status: 'error', message: 'Cannot delete your own account' },
        { status: 403 }
      );
    }

    // Delete user
    await users.deleteOne({ _id: new ObjectId(userId) });

    // ✅ Use centralized ActivityLogger (triggers real-time automatically)
    await ActivityLogger.logUserDeletion(currentUser, userToDelete, request);

    // 🔥 REAL-TIME UPDATES - Trigger Pusher events
    try {
      // Trigger user deletion event
      await pusherServer.trigger('user-updates', 'user-deleted', {
        userId: userId,
        user: {
          _id: userId,
          name: userToDelete.name,
          email: userToDelete.email,
          username: userToDelete.username
        },
        timestamp: new Date().toISOString(),
        action: 'DELETE_USER',
        performedBy: {
          userId: currentUser._id.toString(),
          name: currentUser.name
        }
      });

      // Get updated counts and trigger counts update
      const counts = {
        totalUsers: await users.countDocuments(),
        totalSuperadmins: await users.countDocuments({ role: 'superadmin' }),
        totalManagers: await users.countDocuments({ role: 'manager' }),
        totalOnline: await users.countDocuments({ 
          sessionExpiresAt: { $gt: new Date() } 
        })
      };

      await pusherServer.trigger('user-counts', 'counts-updated', counts);

      console.log(`✅ User deleted by ${currentUser.email}: ${userToDelete.email}`);
      console.log('✅ Real-time events triggered for user deletion');

    } catch (pusherError) {
      console.error('Pusher error (non-critical):', pusherError);
    }

    return NextResponse.json({
      status: 'success',
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    await ActivityLogger.logError('DELETE_USER', error, request);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}