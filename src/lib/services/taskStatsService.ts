// src/lib/services/taskStatsService.ts
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export interface TaskStats {
  total: number;
  completed: number;
  incomplete: number;
  progress: number;
  status: 'planning' | 'in-progress' | 'completed';
}

export class TaskStatsService {
  static async getProjectStats(projectId: string): Promise<TaskStats> {
    const db = await getDatabase();
    
    const tasks = await db.collection('tasks')
      .find({ projectId })
      .toArray();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'complete').length;
    const incompleteTasks = totalTasks - completedTasks;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Determine project status based on progress
    let status: 'planning' | 'in-progress' | 'completed' = 'planning';
    if (progress === 100) status = 'completed';
    else if (progress > 0) status = 'in-progress';

    return {
      total: totalTasks,
      completed: completedTasks,
      incomplete: incompleteTasks,
      progress,
      status
    };
  }

  static async updateProjectStats(projectId: string): Promise<void> {
    const db = await getDatabase();
    const stats = await this.getProjectStats(projectId);

    await db.collection('projects').updateOne(
      { _id: new ObjectId(projectId) },
      { 
        $set: { 
          progress: stats.progress,
          status: stats.status,
          taskStats: {
            total: stats.total,
            completed: stats.completed,
            incomplete: stats.incomplete
          },
          updatedAt: new Date()
        }
      }
    );
  }
}