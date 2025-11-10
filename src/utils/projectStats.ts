// src/utils/projectStats.ts
import { BaseProject } from '@/types/project';

export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  progress: number;
}

export const getProjectStats = (project: BaseProject): ProjectStats => {
  const totalTasks = project.taskStats?.total ?? 0;
  const completedTasks = project.taskStats?.completed ?? 0;
  const pendingTasks = project.taskStats?.incomplete ?? 0;
  const progress = project.progress ?? 0;

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    progress
  };
};