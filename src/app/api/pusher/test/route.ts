// app/api/pusher/test/route.ts
import { pusherServer } from '@/lib/pusher-server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Test Pusher connection by triggering a test event
    await pusherServer.trigger('test-channel', 'connection-test', {
      message: 'Pusher is connected!',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Pusher connection successful!' 
    });
  } catch (error) {
    console.error('Pusher connection failed:', error);
    return NextResponse.json(
      { success: false, error: 'Pusher connection failed' },
      { status: 500 }
    );
  }
}