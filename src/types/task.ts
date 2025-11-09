// src/types/task.ts
export interface BaseTask {
  _id: string;
  projectId: string;
  name: string;
  status: 'incomplete' | 'complete';
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  projectId: string;
  name: string;
  assignedTo: string;
}

export interface UpdateTaskData {
  name?: string;
  status?: 'incomplete' | 'complete';
  assignedTo?: string;
}