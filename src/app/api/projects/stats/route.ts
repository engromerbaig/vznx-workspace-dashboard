// app/api/projects/stats/route.ts
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();

    // Get total projects count
    const totalProjects = await db.collection('projects').countDocuments();

    // Get completed projects count
    const completedProjects = await db.collection('projects').countDocuments({ 
      status: 'completed' 
    });

    // Get total tasks across all projects
    const projectsWithTasks = await db.collection('projects')
      .find({}, { projection: { taskStats: 1 } })
      .toArray();

    const totalTasks = projectsWithTasks.reduce((sum, project) => {
      return sum + (project.taskStats?.total || 0);
    }, 0);

    const stats = {
      totalProjects,
      completedProjects,
      incompleteProjects: totalProjects - completedProjects,
      totalTasks
    };

    return NextResponse.json({ 
      status: 'success', 
      stats 
    });
  } catch (error) {
    console.error('❌ Failed to fetch project stats:', error);
    return NextResponse.json({ status: 'error', message: 'Failed to fetch project stats' }, { status: 500 });
  }
}