// src/utils/taskStatus.ts
export type TaskStatus = 'complete' | 'incomplete';

export interface TaskStatusColors {
  container: string;
  containerHover: string;
  border: string;
  icon: string;
  checkbox: string;
  checkboxHover: string;
  text: string;
}

export const getTaskStatusColors = (status: TaskStatus): TaskStatusColors => {
  switch (status) {
    case 'complete':
      return {
        container: 'bg-green-50',
        containerHover: 'hover:bg-green-100',
        border: 'border-green-200',
        icon: 'text-green-500',
        checkbox: 'bg-green-500 border-green-500',
        checkboxHover: 'hover:bg-green-600 hover:border-green-600',
        text: 'text-gray-500 line-through'
      };
    case 'incomplete':
      return {
        container: 'bg-blue-50',
        containerHover: 'hover:bg-blue-100',
        border: 'border-blue-200',
        icon: 'text-blue-500',
        checkbox: 'bg-blue-50 border-blue-400',
        checkboxHover: 'hover:bg-blue-100 hover:border-blue-500',
        text: 'text-gray-800'
      };
    default:
      return {
        container: 'bg-gray-50',
        containerHover: 'hover:bg-gray-100',
        border: 'border-gray-200',
        icon: 'text-gray-500',
        checkbox: 'bg-gray-50 border-gray-300',
        checkboxHover: 'hover:bg-gray-100 hover:border-gray-400',
        text: 'text-gray-800'
      };
  }
};

export const formatTaskStatusText = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Default export for the entire module
export default {
  getTaskStatusColors,
  formatTaskStatusText
};