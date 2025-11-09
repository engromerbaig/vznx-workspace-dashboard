// src/app/api/tasks/[id]/route.ts
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { BaseTask } from '@/types/task';

// Helper function to calculate project progress
async function updateProjectProgress(projectId: string) {
  const db = await getDatabase();
  
  const tasks = await db.collection('tasks')
    .find({ projectId })
    .toArray();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'complete').length;
  
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Update project progress
  await db.collection('projects').updateOne(
    { _id: new ObjectId(projectId) },
    { 
      $set: { 
        progress,
        status: progress === 100 ? 'completed' : 'in-progress',
        updatedAt: new Date()
      }
    }
  );

  return { progress, totalTasks, completedTasks };
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const task = await db.collection('tasks').findOne({
      _id: new ObjectId(params.id)
    });

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
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json();
    const db = await getDatabase();
    
    // Get current task to know the projectId
    const currentTask = await db.collection('tasks').findOne({
      _id: new ObjectId(params.id)
    });

    if (!currentTask) {
      return NextResponse.json(
        { status: 'error', message: 'Task not found' },
        { status: 404 }
      );
    }

    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    const result = await db.collection('tasks').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Task not found' },
        { status: 404 }
      );
    }

    // If task status changed, update project progress
    if (updates.status) {
      await updateProjectProgress(currentTask.projectId);
    }

    // Return updated task
    const updatedTask = await db.collection('tasks').findOne({
      _id: new ObjectId(params.id)
    });

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
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    
    // Get task first to know projectId for progress update
    const task = await db.collection('tasks').findOne({
      _id: new ObjectId(params.id)
    });

    if (!task) {
      return NextResponse.json(
        { status: 'error', message: 'Task not found' },
        { status: 404 }
      );
    }

    const projectId = task.projectId;

    const result = await db.collection('tasks').deleteOne({
      _id: new ObjectId(params.id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Task not found' },
        { status: 404 }
      );
    }

    // Update project progress after deletion
    await updateProjectProgress(projectId);

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