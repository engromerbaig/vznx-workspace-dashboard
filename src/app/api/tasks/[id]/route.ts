// src/app/api/tasks/[id]/route.ts
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { BaseTask } from '@/types/task';
import { getCurrentUser } from '@/lib/server/auth-utils';

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await params first
    const db = await getDatabase();
    
    // Use aggregation to get task with populated user info
    const task = await db.collection('tasks').aggregate([
      {
        $match: { _id: new ObjectId(id) }
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
      }
    ]).next();

    if (!task) {
      return NextResponse.json(
        { status: 'error', message: 'Task not found' },
        { status: 404 }
      );
    }

    const formattedTask: BaseTask = {
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
    };

    return NextResponse.json({ 
      status: 'success', 
      task: formattedTask 
    });
  } catch (error) {
    console.error('Failed to fetch task:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await params first
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await request.json();
    const db = await getDatabase();
    
    const currentTask = await db.collection('tasks').findOne({
      _id: new ObjectId(id)
    });

    if (!currentTask) {
      return NextResponse.json(
        { status: 'error', message: 'Task not found' },
        { status: 404 }
      );
    }

    const updateData = {
      ...updates,
      lastModifiedBy: new ObjectId(currentUser._id),
      updatedAt: new Date()
    };

    // If status is being changed to complete, set completedAt
    if (updates.status === 'complete' && currentTask.status !== 'complete') {
      updateData.completedAt = new Date();
    }
    // If status is being changed to incomplete, clear completedAt
    else if (updates.status === 'incomplete' && currentTask.status === 'complete') {
      updateData.completedAt = null;
    }

    const result = await db.collection('tasks').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Task not found' },
        { status: 404 }
      );
    }

    // Update project progress and task stats
    await updateProjectTaskStats(currentTask.projectId);

    // Return updated task with populated user info
    const updatedTask = await db.collection('tasks').aggregate([
      {
        $match: { _id: new ObjectId(id) }
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
      }
    ]).next();

    if (!updatedTask) {
      return NextResponse.json(
        { status: 'error', message: 'Task not found after update' },
        { status: 404 }
      );
    }

    const formattedTask: BaseTask = {
      _id: updatedTask._id.toString(),
      projectId: updatedTask.projectId,
      name: updatedTask.name,
      status: updatedTask.status,
      assignedTo: updatedTask.assignedTo,
      createdBy: updatedTask.createdBy,
      lastModifiedBy: updatedTask.lastModifiedBy,
      completedAt: updatedTask.completedAt?.toISOString(),
      createdAt: updatedTask.createdAt.toISOString(),
      updatedAt: updatedTask.updatedAt.toISOString()
    };

    return NextResponse.json({ 
      status: 'success', 
      task: formattedTask 
    });
  } catch (error) {
    console.error('Failed to update task:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Await params first
    const db = await getDatabase();
    
    // Get task first to know projectId for progress update
    const task = await db.collection('tasks').findOne({
      _id: new ObjectId(id)
    });

    if (!task) {
      return NextResponse.json(
        { status: 'error', message: 'Task not found' },
        { status: 404 }
      );
    }

    const projectId = task.projectId;

    const result = await db.collection('tasks').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Task not found' },
        { status: 404 }
      );
    }

    // Update project progress after deletion
    await updateProjectTaskStats(projectId);

    return NextResponse.json({ 
      status: 'success', 
      message: 'Task deleted successfully' 
    });
  } catch (error) {
    console.error('Failed to delete task:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to delete task' },
      { status: 500 }
    );
  }
}