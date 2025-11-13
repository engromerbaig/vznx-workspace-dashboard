// src/types/team.ts
export enum TeamMemberRole {
  PRINCIPAL_ARCHITECT = 'Principal Architect',
  LEAD_DESIGNER = 'Lead Designer',
  SENIOR_ARCHITECT = 'Senior Architect',
  ARCHITECT = 'Architect',
  INTERIOR_DESIGNER = 'Interior Designer',
  LANDSCAPE_ARCHITECT = 'Landscape Architect',
  URBAN_PLANNER = 'Urban Planner',
  BIM_SPECIALIST = 'BIM Specialist',
  VISUALIZATION_ARTIST = '3D Visualization Artist',
  SUSTAINABILITY_CONSULTANT = 'Sustainability Consultant',
  PROJECT_ARCHITECT = 'Project Architect',
  DRAFTSPERSON = 'Draftsperson',
  DESIGN_TECHNOLOGIST = 'Design Technologist',
}

// For dropdowns, superadmin UI, and schema validation
export const DEFAULT_ROLES = Object.values(TeamMemberRole);

// Mongoose document shape
export type TeamMemberDocument = {
  _id: string;
  name: string;
  email: string;
  role: TeamMemberRole;
  maxCapacity?: number;
  createdAt: Date;
  updatedAt: Date;
};

// Client-facing DTO
export type TeamMember = Omit<TeamMemberDocument, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  capacity: number;
};

/* -------------------------------------------------
   Workload & Stats (already here — keep them)
   ------------------------------------------------- */
export interface TeamMemberWithWorkload
  extends Omit<TeamMemberDocument, '_id' | 'createdAt' | 'updatedAt' | 'role'> {
  _id: string;
  createdAt: string;
  updatedAt: string;
  role: TeamMemberRole;
  taskCount: number;
  capacity: number;
  maxCapacity: number;
}

export interface TeamWorkloadStats {
  totalMembers: number;
  totalTasks: number;
  comfortableLoad: number;
  heavyLoad: number;
  averageCapacity: number;
  totalMaxCapacity: number;
}