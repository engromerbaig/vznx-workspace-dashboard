// Update the seed route to include sample tasks
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

    // Clear existing data
    await db.collection('projects').deleteMany({});
    await db.collection('tasks').deleteMany({});

    // Insert projects and get their IDs
    const projectsResult = await db.collection('projects').insertMany(sampleProjects);
    const projectIds = Object.values(projectsResult.insertedIds);

    // Sample tasks for the first project
    const sampleTasks = [
      {
        projectId: projectIds[0].toString(),
        name: 'Site Survey and Analysis',
        status: 'complete',
        assignedTo: 'Sarah Chen',
        createdAt: now,
        updatedAt: now
      },
      {
        projectId: projectIds[0].toString(),
        name: 'Structural Design',
        status: 'complete',
        assignedTo: 'Mike Rodriguez',
        createdAt: now,
        updatedAt: now
      },
      {
        projectId: projectIds[0].toString(),
        name: 'Interior Layout Planning',
        status: 'incomplete',
        assignedTo: 'Emma Wilson',
        createdAt: now,
        updatedAt: now
      },
      {
        projectId: projectIds[1].toString(),
        name: 'Initial Client Meeting',
        status: 'complete',
        assignedTo: 'Sarah Chen',
        createdAt: now,
        updatedAt: now
      },
      {
        projectId: projectIds[1].toString(),
        name: 'Site Analysis Report',
        status: 'incomplete',
        assignedTo: 'Mike Rodriguez',
        createdAt: now,
        updatedAt: now
      }
    ];

    await db.collection('tasks').insertMany(sampleTasks);

    return NextResponse.json({ 
      status: 'success', 
      message: 'Sample data added successfully',
      projects: projectsResult.insertedCount,
      tasks: sampleTasks.length
    });
  } catch (error) {
    console.error('Failed to seed data:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to seed data' },
      { status: 500 }
    );
  }
}