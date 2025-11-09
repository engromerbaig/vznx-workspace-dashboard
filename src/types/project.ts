// src/types/project.ts
export interface BaseProject {
  _id: string;
  name: string;
  status: 'planning' | 'in-progress' | 'completed';
  progress: number;
  description?: string;
  createdBy: string;
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
}