// src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { pusherServer } from '@/lib/pusher-server';
import { validatePassword } from '@/lib/passwordValidation';
import { verifySuperAdmin } from '@/lib/server/auth-utils';
import { ActivityLogger } from '@/lib/server/activity-logger';

export async function GET() {
  try {
    // Use the new auth utility
    const currentUser = await verifySuperAdmin();
    if (!currentUser) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized - SuperAdmin access required' },
        { status: 403 }
      );
    }

    const db = await getDatabase();
    const users = db.collection('users');

    // Get all users first
    const allUsers = await users.find(
      {},
      { 
        projection: { 
          passwordHash: 0,
          sessionToken: 0,
          sessionCreatedAt: 0,
          sessionExpiresAt: 0
        }
      }
    ).sort({ createdAt: -1 }).toArray();

    console.log('🔍 First user raw data:', JSON.stringify(allUsers[0], null, 2));

    // Create a map of creator IDs to names
    const creatorIds = allUsers
      .map(user => user.createdBy)
      .filter(createdBy => createdBy && createdBy !== 'system');
    
    const creators = await users.find(
      { _id: { $in: creatorIds } },
      { projection: { _id: 1, name: 1, email: 1 } }
    ).toArray();

    const creatorMap = new Map();
    creators.forEach(creator => {
      creatorMap.set(creator._id.toString(), creator.name);
    });

    // Format user data with creator names
    const formattedUsers = allUsers.map(user => {
      let createdByName = 'System';
      
      if (user.createdBy && user.createdBy !== 'system') {
        createdByName = creatorMap.get(user.createdBy.toString()) || 'Unknown User';
      }

      return {
        _id: user._id.toString(),
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role || 'user',
        createdBy: createdByName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLogin: user.lastLogin,
        lastActivity: user.lastActivity,
        isActive: user.isActive || !!(user.sessionToken && user.sessionExpiresAt && new Date(user.sessionExpiresAt) > new Date())
      };
    });

    console.log('🔍 First user formatted:', formattedUsers[0]);

    return NextResponse.json({
      status: 'success',
      users: formattedUsers
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Use the new auth utility
    const currentUser = await verifySuperAdmin();
    if (!currentUser) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized - SuperAdmin access required' },
        { status: 403 }
      );
    }

    const { email, username, name, password, role } = await request.json();

    // Validation
    if (!email || !username || !name || !password) {
      return NextResponse.json(
        { status: 'error', message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Use the existing validatePassword function
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { status: 'error', message: passwordValidation.message },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const users = db.collection('users');

    // Check if user already exists
    const existingUser = await users.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { username: username.toLowerCase().trim() }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { status: 'error', message: 'User with this email or username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with createdBy field
    const now = new Date();
    const result = await users.insertOne({
      email: email.toLowerCase().trim(),
      username: username.toLowerCase().trim(),
      name: name.trim(),
      passwordHash,
      role: role || 'user',
      createdBy: currentUser._id,
      createdAt: now,
      updatedAt: now,
      isActive: false,
      lastLogin: null,
      lastActivity: null
    });

    const newUser = {
      _id: result.insertedId,
      email: email.toLowerCase().trim(),
      username: username.toLowerCase().trim(),
      name: name.trim(),
      role: role || 'user'
    };

    // ✅ Use centralized ActivityLogger (triggers real-time automatically)
    await ActivityLogger.logUserCreation(currentUser, newUser, request);

    // 🔥 REAL-TIME UPDATES - Trigger Pusher events
    try {
      // Trigger user creation event
      await pusherServer.trigger('user-updates', 'user-created', {
        userId: result.insertedId.toString(),
        user: {
          _id: result.insertedId.toString(),
          email: email.toLowerCase().trim(),
          username: username.toLowerCase().trim(),
          name: name.trim(),
          role: role || 'user',
          createdBy: currentUser.name,
          createdAt: now.toISOString(),
          isActive: false
        },
        timestamp: now.toISOString(),
        action: 'CREATE_USER',
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

      console.log('✅ Real-time events triggered for user creation');

    } catch (pusherError) {
      console.error('Pusher error (non-critical):', pusherError);
    }

    return NextResponse.json({
      status: 'success',
      message: 'User created successfully',
      userId: result.insertedId
    });

  } catch (error) {
    console.error('Create user error:', error);
    await ActivityLogger.logError('CREATE_USER', error as Error, request);
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}