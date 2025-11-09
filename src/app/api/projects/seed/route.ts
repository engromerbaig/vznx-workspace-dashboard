// src/app/api/projects/seed/route.ts
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST() {
  try {
    const db = await getDatabase();
    const now = new Date();

    const sampleProjects = [
      {
        name: 'Office Building Renovation',
        status: 'in-progress',
        progress: 65,
        description: 'Complete renovation of downtown office space',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Residential Complex Design',
        status: 'planning',
        progress: 20,
        description: 'New residential complex with 50 units',
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'Museum Extension',
        status: 'completed',
        progress: 100,
        description: 'Modern extension to existing museum',
        createdAt: now,
        updatedAt: now
      }
    ];

    // Clear existing projects and tasks
    await db.collection('projects').deleteMany({});
    await db.collection('tasks').deleteMany({});

    const result = await db.collection('projects').insertMany(sampleProjects);

    return NextResponse.json({ 
      status: 'success', 
      message: 'Sample data added successfully',
      count: result.insertedCount
    });
  } catch (error) {
    console.error('Failed to seed data:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to seed data' },
      { status: 500 }
    );
  }
}