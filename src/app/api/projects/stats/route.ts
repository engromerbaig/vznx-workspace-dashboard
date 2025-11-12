// app/api/projects/stats/route.ts
import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    const db = await getDatabase();

    // Build filter query - SAME as main projects endpoint
    let filterQuery: any = {};
    
    // Status filter
    if (status !== 'all') {
      filterQuery.status = status;
    }
    
    // Search filter
    if (search) {
      filterQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Date range filter
    if (startDate || endDate) {
      filterQuery.createdAt = {};
      if (startDate) {
        filterQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filterQuery.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }

    console.log('📊 Stats filter query:', JSON.stringify(filterQuery));

    // Get all projects matching the filter
    const projects = await db
      .collection('projects')
      .find(filterQuery, {
        projection: {
          status: 1,
          taskStats: 1
        }
      })
      .toArray();

    // Calculate stats
    const totalProjects = projects.length;
    const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
    const incompleteProjects = totalProjects - completedProjects;
    const totalTasks = projects.reduce((sum: number, project: any) => 
      sum + (project.taskStats?.total || 0), 0
    );

    const stats = {
      totalProjects,
      completedProjects,
      incompleteProjects,
      totalTasks
    };

    console.log('📊 Calculated stats:', stats);

    return NextResponse.json({
      status: 'success',
      stats
    });
  } catch (error) {
    console.error('❌ Failed to fetch project stats:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to fetch project stats' 
    }, { status: 500 });
  }
}