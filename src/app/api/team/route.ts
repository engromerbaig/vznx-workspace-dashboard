// src/app/api/team/route.ts
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/server/auth-utils';
import { calculateCapacity, calculateTeamStats } from '@/lib/server/capacity-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '6');
    const skip = (page - 1) * limit;

    const db = await getDatabase();

    // === 1. PAGINATED MEMBERS (for UI list) ===
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
          maxCapacity: { $ifNull: ['$maxCapacity', 8] }
        }
      },
      { $project: { tasks: 0 } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]).toArray();

    const formattedMembers = membersWithTaskCount.map(member => {
      const capacity = calculateCapacity(member.taskCount, member.maxCapacity);
      const isAvailable = capacity < 100; // < 100% = can accept more tasks

      return {
        _id: member._id.toString(),
        name: member.name,
        email: member.email,
        role: member.role,
        maxCapacity: member.maxCapacity,
        createdAt: member.createdAt.toISOString(),
        updatedAt: member.updatedAt.toISOString(),
        taskCount: member.taskCount,
        capacity,
        isAvailable // ← CRITICAL: for dropdown filtering
      };
    });

    // === 2. TOTAL COUNT (for pagination) ===
    const totalMembers = await db.collection('teammembers').countDocuments();

    // === 3. ALL MEMBERS (for team stats) ===
    const allMembersWithTaskCount = await db.collection('teammembers').aggregate([
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
          maxCapacity: { $ifNull: ['$maxCapacity', 8] }
        }
      },
      { $project: { tasks: 0 } }
    ]).toArray();

    const allFormattedMembers = allMembersWithTaskCount.map(member => {
      const capacity = calculateCapacity(member.taskCount, member.maxCapacity);
      const isAvailable = capacity < 100;

      return {
        _id: member._id.toString(),
        name: member.name,
        email: member.email,
        role: member.role,
        maxCapacity: member.maxCapacity,
        createdAt: member.createdAt.toISOString(),
        updatedAt: member.updatedAt.toISOString(),
        taskCount: member.taskCount,
        capacity,
        isAvailable // ← Also include here for consistency
      };
    });

    const teamStats = calculateTeamStats(allFormattedMembers);

    return NextResponse.json({
      status: 'success',
      teamMembers: formattedMembers,
      teamStats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMembers / limit),
        totalMembers,
        hasNext: skip + limit < totalMembers,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Failed to fetch team members:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

// POST remains unchanged (already correct)
export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, email, role, maxCapacity } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ status: 'error', message: 'Name is required' }, { status: 400 });
    }
    if (!email?.trim()) {
      return NextResponse.json({ status: 'error', message: 'Email is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const now = new Date();

    const existingMember = await db.collection('teammembers').findOne({
      email: email.toLowerCase().trim()
    });
    if (existingMember) {
      return NextResponse.json(
        { status: 'error', message: 'Team member with this email already exists' },
        { status: 400 }
      );
    }

    // Determine global default
    const existingMembers = await db.collection('teammembers').find({}).toArray();
    let globalDefault = 8;
    if (existingMembers.length > 0) {
      const counts: Record<number, number> = {};
      existingMembers.forEach(m => {
        const cap = m.maxCapacity || 8;
        counts[cap] = (counts[cap] || 0) + 1;
      });
      globalDefault = parseInt(
        Object.keys(counts).reduce((a, b) => counts[+a] > counts[+b] ? a : b)
      );
    }

    const member = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role?.trim() || 'Team Member',
      maxCapacity: maxCapacity ?? globalDefault,
      createdAt: now,
      updatedAt: now
    };

    const result = await db.collection('teammembers').insertOne(member);
    const newMember = await db.collection('teammembers').findOne({ _id: result.insertedId });

    if (!newMember) throw new Error('Failed to create team member');

    const capacity = calculateCapacity(0, newMember.maxCapacity || globalDefault);

    const formattedMember = {
      _id: newMember._id.toString(),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      maxCapacity: newMember.maxCapacity || globalDefault,
      createdAt: newMember.createdAt.toISOString(),
      updatedAt: newMember.updatedAt.toISOString(),
      taskCount: 0,
      capacity,
      isAvailable: capacity < 100
    };

    return NextResponse.json(
      { status: 'success', teamMember: formattedMember },
      { status: 201 }
    );

  } catch (error) {
    console.error('Failed to create team member:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create team member' },
      { status: 500 }
    );
  }
}