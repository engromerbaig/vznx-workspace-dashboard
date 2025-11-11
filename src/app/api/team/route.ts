// src/app/api/team/route.ts
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/server/auth-utils';
import { calculateCapacity, calculateTeamStats } from '@/lib/server/capacity-utils';

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
          taskCount: { $size: '$tasks' },
          maxCapacity: { $ifNull: ['$maxCapacity', 8] } // Default to 8 if not present
        }
      },
      {
        $project: {
          tasks: 0
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    // Calculate capacity for each member on server side
    const formattedMembers = membersWithTaskCount.map(member => {
      const capacity = calculateCapacity(member.taskCount, member.maxCapacity);
      
      return {
        _id: member._id.toString(),
        name: member.name,
        email: member.email,
        role: member.role,
        maxCapacity: member.maxCapacity,
        createdAt: member.createdAt.toISOString(),
        updatedAt: member.updatedAt.toISOString(),
        taskCount: member.taskCount,
        capacity // Server-calculated capacity
      };
    });

    // Calculate team stats
    const teamStats = calculateTeamStats(formattedMembers);

    return NextResponse.json({ 
      status: 'success', 
      teamMembers: formattedMembers,
      teamStats 
    });

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

    const { name, email, role, maxCapacity }: { 
      name: string; 
      email: string;
      role: string;
      maxCapacity?: number;
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

    // Get current global default from existing members
    const existingMembers = await db.collection('teammembers').find({}).toArray();
    let globalDefault = 8;
    
    if (existingMembers.length > 0) {
      // Use the most common maxCapacity from existing members
      const capacityCounts: { [key: number]: number } = {};
      existingMembers.forEach(member => {
        const cap = member.maxCapacity || 8;
        capacityCounts[cap] = (capacityCounts[cap] || 0) + 1;
      });
      
      // Find the most common capacity
      globalDefault = parseInt(Object.keys(capacityCounts).reduce((a, b) => 
        capacityCounts[parseInt(a)] > capacityCounts[parseInt(b)] ? a : b
      ));
    }

    const member = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role?.trim() || 'Team Member',
      maxCapacity: maxCapacity || globalDefault, // Use provided or global default
      createdAt: now,
      updatedAt: now
    };

    const result = await db.collection('teammembers').insertOne(member);
    
    const newMember = await db.collection('teammembers').findOne({ _id: result.insertedId });

    if (!newMember) throw new Error('Failed to create team member');

    // Calculate capacity for the new member (0 tasks = 0% capacity)
    const capacity = calculateCapacity(0, newMember.maxCapacity || globalDefault);

    const formattedMember = {
      _id: newMember._id.toString(),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      maxCapacity: newMember.maxCapacity || globalDefault,
      createdAt: newMember.createdAt.toISOString(),
      updatedAt: newMember.updatedAt.toISOString(),
      taskCount: 0, // New member has zero tasks
      capacity: capacity // Include calculated capacity
    };

    return NextResponse.json({ status: 'success', teamMember: formattedMember }, { status: 201 });

  } catch (error) {
    console.error('Failed to create team member:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to create team member' }, { status: 500 });
  }
}