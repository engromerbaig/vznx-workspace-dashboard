import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assignedTo = searchParams.get('assignedTo');
    
    const db = await getDatabase();
    
    let matchQuery = {};
    
    // Filter by assignedTo if provided
    if (assignedTo) {
      matchQuery = { assignedTo };
    }
    
    // Use aggregation to get tasks with project names
    const tasks = await db.collection('tasks').aggregate([
      {
        $match: matchQuery
      },
      {
        $addFields: {
          // Convert projectId string to ObjectId for lookup
          projectObjectId: { $toObjectId: '$projectId' }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectObjectId',  // Use the converted ObjectId
          foreignField: '_id',
          as: 'project'
        }
      },
      {
        $unwind: {
          path: '$project',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          assignedTo: 1,
          status: 1,
          completedAt: 1,
          createdAt: 1,
          updatedAt: 1,
          createdBy: 1,
          lastModifiedBy: 1,
          projectId: 1,
          projectName: '$project.name' // Add project name here
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray();

    const formattedTasks = tasks.map(task => ({
      _id: task._id.toString(),
      name: task.name,
      description: task.description,
      assignedTo: task.assignedTo,
      status: task.status,
      completedAt: task.completedAt?.toISOString() || null,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      createdBy: task.createdBy,
      lastModifiedBy: task.lastModifiedBy,
      projectId: task.projectId?.toString(),
      projectName: task.projectName || null // Include projectName
    }));

    return NextResponse.json({ 
      status: 'success', 
      tasks: formattedTasks 
    });
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}