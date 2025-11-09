// src/utils/taskStats.ts
export interface TaskStats {
  total: number;
  completed: number;
  incomplete: number;
}

export const getTaskStats = (taskStats?: { total?: number; completed?: number }): TaskStats => {
  const total = taskStats?.total ?? 0;
  const completed = taskStats?.completed ?? 0;
  const incomplete = total - completed;

  return {
    total,
    completed,
    incomplete
  };
};