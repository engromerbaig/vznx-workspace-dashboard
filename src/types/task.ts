// src/types/task.ts
export interface BaseTask {
  _id: string;
  projectId: string;
  name: string;
  status: 'incomplete' | 'complete';
  assignedTo: string;
  createdBy: string; // username
  lastModifiedBy?: string; // username
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
    projectName?: string; // Add this optional field
    projectSlug?: string;
}

export interface CreateTaskData {
  projectId: string;
  name: string;
  assignedTo: string;
  createdBy?: string;
}

export interface UpdateTaskData {
  name?: string;
  status?: 'incomplete' | 'complete';
  assignedTo?: string;
  lastModifiedBy?: string;
}