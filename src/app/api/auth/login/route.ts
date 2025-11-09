// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { getDatabase } from '@/lib/mongodb';
import { AUTH_CONFIG, getInactivityTimeoutMs } from '@/lib/auth-config';
import { getCurrentUser } from '@/lib/server/auth-utils';

function generateSessionToken(): string {
  return crypto.randomUUID();
}

export async function POST(request: Request) {
  try {
    const { email, password, rememberMe = false } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json({ status: 'error', message: 'Email and password required' }, { status: 400 });
    }

    const db = await getDatabase();
    const users = db.collection('users');

    // Find user
    const user = await users.findOne({ 
      $or: [{ email: email.toLowerCase().trim() }, { username: email.toLowerCase().trim() }]
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ status: 'error', message: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ status: 'error', message: 'Invalid credentials' }, { status: 401 });
    }

    const now = new Date();

    // Check for existing session
    const existingSessionUser = await getCurrentUser();
    const isSessionTakeover = existingSessionUser?._id?.toString() === user._id.toString();

    // If user already has an active session (from database), handle takeover
    const userHasActiveSession = user.sessionToken && user.sessionExpiresAt > now;

    // Create new session token
    const newSessionToken = generateSessionToken();
    const expiresAt = new Date(now.getTime() + getInactivityTimeoutMs(rememberMe));

    // Update user with new session (this automatically invalidates the old one)
    const result = await users.updateOne(
      { _id: user._id },
      { 
        $set: { 
          sessionToken: newSessionToken,
          sessionCreatedAt: now,
          sessionExpiresAt: expiresAt,
          lastActivity: now,
          lastLogin: now
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ status: 'error', message: 'Failed to create session' }, { status: 500 });
    }

    // Set cookies with new session token
    const cookieStore = await cookies();
    cookieStore.set({
      name: AUTH_CONFIG.SESSION.COOKIE_NAME,
      value: newSessionToken,
      httpOnly: AUTH_CONFIG.SESSION.HTTP_ONLY,
      secure: AUTH_CONFIG.SESSION.SECURE,
      sameSite: AUTH_CONFIG.SESSION.SAME_SITE,
      path: '/',
      maxAge: rememberMe ? AUTH_CONFIG.REMEMBER_ME.EXTENDED_TIMEOUT * 60 : undefined,
    });

    cookieStore.set({
      name: AUTH_CONFIG.REMEMBER_ME.COOKIE_NAME,
      value: rememberMe ? 'true' : 'false',
      secure: AUTH_CONFIG.SESSION.SECURE,
      sameSite: AUTH_CONFIG.SESSION.SAME_SITE,
      path: '/',
      maxAge: rememberMe ? 365 * 24 * 60 * 60 : 0,
    });

    return NextResponse.json({ 
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
      },
      sessionTakeover: userHasActiveSession
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ status: 'error', message: 'Internal server error' }, { status: 500 });
  }
}