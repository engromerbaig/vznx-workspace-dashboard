// src/app/api/auth/verify-session/route.ts
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server/auth-utils';

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({ 
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}