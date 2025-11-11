// src/app/api/team/capacity/route.ts
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/server/auth-utils';

export async function PUT(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { maxCapacity }: { maxCapacity: number } = await request.json();

    if (!maxCapacity || maxCapacity < 1 || maxCapacity > 20) {
      return NextResponse.json(
        { status: 'error', message: 'Max capacity must be between 1 and 20' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Update max capacity for all team members
    const result = await db.collection('teammembers').updateMany(
      {},
      { 
        $set: { 
          maxCapacity,
          updatedAt: new Date()
        } 
      }
    );

    return NextResponse.json({
      status: 'success',
      message: `Max capacity updated to ${maxCapacity} for all team members`,
      updatedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Failed to update max capacity:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update max capacity' },
      { status: 500 }
    );
  }
}