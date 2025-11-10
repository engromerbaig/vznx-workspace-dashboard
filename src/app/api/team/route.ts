import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/server/auth-utils';

export async function GET() {
  try {
    const db = await getDatabase();

    const membersWithTaskCount = await db.collection('teammembers').aggregate([
      {
        $lookup: {
          from: 'tasks',
          localField: 'name',
          foreignField: 'assignedTo',
          as: 'tasks'
        }
      },
      {
        $addFields: {
          taskCount: { $size: '$tasks' }
        }
      },
      {
        $project: {
          tasks: 0 // remove tasks array, we only need count
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    const formattedMembers = membersWithTaskCount.map(member => ({
      _id: member._id.toString(),
      name: member.name,
      email: member.email,
      role: member.role,
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.updatedAt.toISOString(),
      taskCount: member.taskCount
    }));

    return NextResponse.json({ status: 'success', teamMembers: formattedMembers });

  } catch (error) {
    console.error('Failed to fetch team members:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, email, role }: { 
      name: string; 
      email: string;
      role: string;
    } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ status: 'error', message: 'Name is required' }, { status: 400 });
    }

    if (!email || email.trim() === '') {
      return NextResponse.json({ status: 'error', message: 'Email is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const now = new Date();

    // Check if email already exists
    const existingMember = await db.collection('teammembers').findOne({ 
      email: email.toLowerCase().trim() 
    });

    if (existingMember) {
      return NextResponse.json({ status: 'error', message: 'Team member with this email already exists' }, { status: 400 });
    }

    const member = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role?.trim() || 'Team Member',
      createdAt: now,
      updatedAt: now
    };

    const result = await db.collection('teammembers').insertOne(member);
    
    const newMember = await db.collection('teammembers').findOne({ _id: result.insertedId });

    if (!newMember) throw new Error('Failed to create team member');

    const formattedMember = {
      _id: newMember._id.toString(),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      createdAt: newMember.createdAt.toISOString(),
      updatedAt: newMember.updatedAt.toISOString(),
      taskCount: 0 // New member has zero tasks
    };

    return NextResponse.json({ status: 'success', teamMember: formattedMember }, { status: 201 });

  } catch (error) {
    console.error('Failed to create team member:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to create team member' }, { status: 500 });
  }
}
