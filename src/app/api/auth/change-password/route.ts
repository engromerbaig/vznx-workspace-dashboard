// src/app/api/auth/change-password/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDatabase } from '@/lib/mongodb';
import { validatePassword } from '@/lib/passwordValidation';
import { pusherServer } from '@/lib/pusher-server';
import { getCurrentUser } from '@/lib/server/auth-utils';
import { ActivityLogger } from '@/lib/server/activity-logger';

export async function POST(request: Request) {
  try {
    console.log('🔐 Password change attempt');
    
    // Use the new auth utility to get current user
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get request body
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { status: 'error', message: 'Current and new passwords are required' },
        { status: 400 }
      );
    }

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      return NextResponse.json(
        { status: 'error', message: validation.message },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const db = await getDatabase();
    const users = db.collection('users');

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      console.log('❌ Current password is incorrect for user:', user.email);
      return NextResponse.json(
        { status: 'error', message: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const now = new Date();

    // Update password in database
    const result = await users.updateOne(
      { _id: user._id },
      { 
        $set: { 
          passwordHash: hashedNewPassword,
          updatedAt: now
        } 
      }
    );

    if (result.matchedCount === 0) {
      console.error('❌ Failed to update password for user:', user.email);
      return NextResponse.json(
        { status: 'error', message: 'Failed to update password' },
        { status: 500 }
      );
    }

    // 🔥 REAL-TIME UPDATES - Trigger password change event
    try {
      await pusherServer.trigger('user-updates', 'password-changed', {
        userId: user._id.toString(),
        user: {
          _id: user._id.toString(),
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role
        },
        timestamp: now.toISOString(),
        action: 'PASSWORD_CHANGE'
      });
      console.log('✅ Real-time password change event triggered');
    } catch (pusherError) {
      console.error('Pusher error (non-critical):', pusherError);
    }

    // ✅ Use centralized ActivityLogger (triggers real-time automatically)
    await ActivityLogger.logPasswordChange(user, request);

    console.log(`✅ Password changed successfully for user: @${user.username} (${user.email})`);

    return NextResponse.json({ 
      status: 'success', 
      message: 'Password updated successfully' 
    });

  } catch (error) {
    console.error('❌ Password change API error:', error);
    
    // ✅ Use centralized ActivityLogger for errors too
    await ActivityLogger.logError('PASSWORD_CHANGE', error as Error, request);

    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}