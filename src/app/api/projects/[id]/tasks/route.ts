// src/app/api/projects/[id]/tasks/route.ts
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';
import { BaseTask } from '@/types/task';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = await getDatabase();
    const tasks = await db.collection('tasks')
      .find({ projectId: params.id })
      .sort({ createdAt: -1 })
      .toArray();

    const formattedTasks: BaseTask[] = tasks.map(task => ({
      _id: task._id.toString(),
      projectId: task.projectId,
      name: task.name,
      status: task.status as 'incomplete' | 'complete', // Add type assertion
      assignedTo: task.assignedTo,
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

    // Verify project exists
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
      status: 'incomplete' as const, // Add 'as const' to fix the type
      createdAt: now,
      updatedAt: now
    };

    const result = await db.collection('tasks').insertOne(task);
    
    const newTask: BaseTask = {
      _id: result.insertedId.toString(),
      projectId: task.projectId,
      name: task.name,
      status: task.status,
      assignedTo: task.assignedTo,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
    };

    return NextResponse.json({ 
      status: 'success', 
      task: newTask 
    }, { status: 201 });

  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create task' },
      { status: 500 }
    );
  }
}