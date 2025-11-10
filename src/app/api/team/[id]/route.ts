import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/server/auth-utils';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const result = await db.collection('teammembers').deleteOne({
      _id: new ObjectId(params.id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Team member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      status: 'success', 
      message: 'Team member deleted successfully' 
    });
  } catch (error) {
    console.error('Failed to delete team member:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete team member' },
      { status: 500 }
    );
  }
}