// src/lib/actions/taskActions.ts
'use server';

import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { TaskStatsService } from '@/lib/services/taskStatsService';

export async function updateTaskStatus(taskId: string, status: 'incomplete' | 'complete') {
  try {
    const db = await getDatabase();
    
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'complete') {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null;
    }

    const task = await db.collection('tasks').findOneAndUpdate(
      { _id: new ObjectId(taskId) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!task) {
      throw new Error('Task not found');
    }

    // Update project stats
    await TaskStatsService.updateProjectStats(task.projectId);

    // Revalidate paths to trigger UI updates
    revalidatePath('/dashboard');
    revalidatePath(`/projects/${task.projectId}`);
    revalidatePath('/api/projects');

    return { success: true, task };
  } catch (error) {
    console.error('Failed to update task:', error);
    return { success: false, error: 'Failed to update task' };
  }
}

export async function createTask(projectId: string, taskData: { name: string; assignedTo: string }) {
  try {
    const db = await getDatabase();
    
    const task = {
      projectId,
      name: taskData.name.trim(),
      assignedTo: taskData.assignedTo.trim(),
      status: 'incomplete' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('tasks').insertOne(task);
    
    // Update project stats
    await TaskStatsService.updateProjectStats(projectId);

    // Revalidate paths
    revalidatePath('/dashboard');
    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/api/projects');

    return { success: true, taskId: result.insertedId.toString() };
  } catch (error) {
    console.error('Failed to create task:', error);
    return { success: false, error: 'Failed to create task' };
  }
}

export async function deleteTask(taskId: string) {
  try {
    const db = await getDatabase();
    
    const task = await db.collection('tasks').findOne({ _id: new ObjectId(taskId) });
    if (!task) {
      throw new Error('Task not found');
    }

    await db.collection('tasks').deleteOne({ _id: new ObjectId(taskId) });

    // Update project stats
    await TaskStatsService.updateProjectStats(task.projectId);

    // Revalidate paths
    revalidatePath('/dashboard');
    revalidatePath(`/projects/${task.projectId}`);
    revalidatePath('/api/projects');

    return { success: true };
  } catch (error) {
    console.error('Failed to delete task:', error);
    return { success: false, error: 'Failed to delete task' };
  }
}