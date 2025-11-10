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