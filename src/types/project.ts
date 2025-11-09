// src/types/project.ts
export interface TaskStats {
  total: number;
  completed: number;
  incomplete: number;
}

export interface BaseProject {
  _id: string;
  name: string;
  status: 'planning' | 'in-progress' | 'completed';
  progress: number;
  description?: string;
  createdBy: string;
  taskStats?: TaskStats; // Make it optional for now
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  status?: 'planning' | 'in-progress' | 'completed';
  createdBy?: string;
}

export interface UpdateProjectData {
  name?: string;
  status?: 'planning' | 'in-progress' | 'completed';
  progress?: number;
  description?: string;
  createdBy?: string;
  taskStats?: TaskStats;
}