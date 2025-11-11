// src/lib/server/capacity-utils.ts
export interface CapacityInfo {
  color: string;
  textColor: string;
  status: string;
  description: string;
}

export const getCapacityInfo = (capacity: number): CapacityInfo => {
  if (capacity < 60) {
    return {
      color: 'bg-green-500',
      textColor: 'text-green-700',
      status: 'Comfortable',
      description: 'Optimal workload'
    };
  }
  if (capacity < 80) {
    return {
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      status: 'Moderate',
      description: 'Manageable workload'
    };
  }
  return {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    status: 'Heavy',
    description: 'High workload - consider redistributing tasks'
  };
};

export const calculateCapacity = (taskCount: number, maxTasks: number = 8): number => {
  return Math.min(Math.round((taskCount / maxTasks) * 100), 100);
};

export const CAPACITY_THRESHOLDS = {
  COMFORTABLE: 60,
  MODERATE: 80,
  HEAVY: 80
} as const;

export function calculateTeamStats(teamMembers: Array<{ taskCount: number; capacity: number; maxCapacity: number }>): any {
  const totalMembers = teamMembers.length;
  const totalTasks = teamMembers.reduce((sum, member) => sum + member.taskCount, 0);
  const totalMaxCapacity = teamMembers.reduce((sum, member) => sum + member.maxCapacity, 0);
  const averageCapacity = totalMembers > 0 ? teamMembers.reduce((sum, member) => sum + member.capacity, 0) / totalMembers : 0;
  
  const comfortableLoad = teamMembers.filter(member => member.capacity < CAPACITY_THRESHOLDS.COMFORTABLE).length;
  const heavyLoad = teamMembers.filter(member => member.capacity >= CAPACITY_THRESHOLDS.MODERATE).length;

  return {
    totalMembers,
    totalTasks,
    comfortableLoad,
    heavyLoad,
    averageCapacity: Math.round(averageCapacity * 100) / 100,
    totalMaxCapacity
  };
}