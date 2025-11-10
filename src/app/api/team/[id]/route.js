// src/app/api/team/[id]/route.js
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/server/auth-utils';
import { ObjectId } from 'mongodb';

export async function GET(request, context) {
  try {
    const params = await context.params; // <-- await context.params directly
    const { id } = params;

    const db = await getDatabase();

    // Find team member by ID
    const teamMember = await db.collection('teammembers').findOne({ _id: new ObjectId(id) });
    if (!teamMember) {
      return NextResponse.json({ status: 'error', message: 'Team member not found' }, { status: 404 });
    }

    // Count tasks assigned
    const taskCount = await db.collection('tasks').countDocuments({ assignedTo: teamMember.name });

    const formattedMember = {
      _id: teamMember._id.toString(),
      name: teamMember.name,
      email: teamMember.email,
      role: teamMember.role,
      createdAt: teamMember.createdAt.toISOString(),
      updatedAt: teamMember.updatedAt.toISOString(),
      taskCount
    };

    return NextResponse.json({ status: 'success', teamMember: formattedMember });
  } catch (error) {
    console.error('Failed to fetch team member:', error);
    if (error.message && error.message.includes('ObjectId')) {
      return NextResponse.json({ status: 'error', message: 'Invalid team member ID' }, { status: 400 });
    }
    return NextResponse.json({ status: 'error', message: 'Failed to fetch team member' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const params = await context.params; // <-- await context.params directly
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const result = await db.collection('teammembers').deleteOne({ _id: new ObjectId(params.id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ status: 'error', message: 'Team member not found' }, { status: 404 });
    }

    return NextResponse.json({ status: 'success', message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Failed to delete team member:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to delete team member' }, { status: 500 });
  }
}