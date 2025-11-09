// src/app/api/projects/[id]/tasks/route.ts
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { BaseTask } from '@/types/task';
import { getCurrentUser } from '@/lib/server/auth-utils';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    
    // Use aggregation to get tasks with populated user info
    const tasks = await db.collection('tasks').aggregate([
      {
        $match: { projectId: params.id }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creator'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'lastModifiedBy',
          foreignField: '_id',
          as: 'modifier'
        }
      },
      {
        $unwind: {
          path: '$creator',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$modifier',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          projectId: 1,
          name: 1,
          status: 1,
          assignedTo: 1,
          createdAt: 1,
          updatedAt: 1,
          completedAt: 1,
          createdBy: '$creator.username',
          lastModifiedBy: '$modifier.username'
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray();

    const formattedTasks: BaseTask[] = tasks.map(task => ({
      _id: task._id.toString(),
      projectId: task.projectId,
      name: task.name,
      status: task.status,
      assignedTo: task.assignedTo,
      createdBy: task.createdBy || 'system',
      lastModifiedBy: task.lastModifiedBy || task.createdBy || 'system',
      completedAt: task.completedAt?.toISOString(),
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
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

export async function POST(
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

    const { name, assignedTo }: { 
      name: string; 
      assignedTo: string; 
    } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { status: 'error', message: 'Task name is required' },
        { status: 400 }
      );
    }

    if (!assignedTo || assignedTo.trim() === '') {
      return NextResponse.json(
        { status: 'error', message: 'Assigned team member is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(params.id)
    });

    if (!project) {
      return NextResponse.json(
        { status: 'error', message: 'Project not found' },
        { status: 404 }
      );
    }

    const now = new Date();
    
    const task = {
      projectId: params.id,
      name: name.trim(),
      assignedTo: assignedTo.trim(),
      status: 'incomplete' as const,
      createdBy: new ObjectId(currentUser._id),
      lastModifiedBy: new ObjectId(currentUser._id),
      createdAt: now,
      updatedAt: now
    };

    const result = await db.collection('tasks').insertOne(task);
    
    // Update project task stats
    await updateProjectTaskStats(params.id);

    // Get the created task with populated user info
    const newTask = await db.collection('tasks').aggregate([
      {
        $match: { _id: result.insertedId }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'createdBy',
          foreignField: '_id',
          as: 'creator'
        }
      },
      {
        $unwind: {
          path: '$creator',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          projectId: 1,
          name: 1,
          status: 1,
          assignedTo: 1,
          createdAt: 1,
          updatedAt: 1,
          completedAt: 1,
          createdBy: '$creator.username',
          lastModifiedBy: '$creator.username'
        }
      }
    ]).next();

    if (!newTask) {
      throw new Error('Failed to create task');
    }

    const formattedTask: BaseTask = {
      _id: newTask._id.toString(),
      projectId: newTask.projectId,
      name: newTask.name,
      status: newTask.status,
      assignedTo: newTask.assignedTo,
      createdBy: newTask.createdBy,
      lastModifiedBy: newTask.lastModifiedBy,
      completedAt: newTask.completedAt?.toISOString(),
      createdAt: newTask.createdAt.toISOString(),
      updatedAt: newTask.updatedAt.toISOString()
    };

    return NextResponse.json({ 
      status: 'success', 
      task: formattedTask 
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// Helper function to update project task statistics
async function updateProjectTaskStats(projectId: string) {
  const db = await getDatabase();
  
  const tasks = await db.collection('tasks')
    .find({ projectId })
    .toArray();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'complete').length;
  const incompleteTasks = totalTasks - completedTasks;
  
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Update project progress and task stats
  await db.collection('projects').updateOne(
    { _id: new ObjectId(projectId) },
    { 
      $set: { 
        progress,
        status: progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'planning',
        taskStats: {
          total: totalTasks,
          completed: completedTasks,
          incomplete: incompleteTasks
        },
        updatedAt: new Date()
      }
    }
  );
}