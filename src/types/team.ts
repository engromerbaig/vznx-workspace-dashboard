import { TeamMemberDocument } from '@/lib/models/TeamMember';

export interface TeamMemberWithWorkload extends Omit<TeamMemberDocument, '_id' | 'createdAt' | 'updatedAt'> {
  _id: string;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  capacity: number;
}

export interface TeamWorkloadStats {
  totalMembers: number;
  totalTasks: number;
  comfortableLoad: number;
  heavyLoad: number;
  averageCapacity: number;
}