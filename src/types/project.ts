// src/types/project.ts
export interface TaskStats {
  total: number;
  completed: number;
  incomplete: number;
}

export interface BaseProject {
  _id: string;
  name: string;
  slug: string; // Add slug field
  status: 'planning' | 'in-progress' | 'completed';
  progress: number;
  description?: string;
  createdBy: string;
  taskStats?: TaskStats;
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
  slug?: string; // Allow slug updates if needed
  status?: 'planning' | 'in-progress' | 'completed';
  progress?: number;
  description?: string;
  createdBy?: string;
  taskStats?: TaskStats;
}