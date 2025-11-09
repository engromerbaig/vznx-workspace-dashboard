// src/utils/projectStatus.ts
export type ProjectStatus = 'planning' | 'in-progress' | 'completed';

export interface StatusColors {
  background: string;
  text: string;
}

export const getStatusColors = (status: string): StatusColors => {
  switch (status) {
    case 'completed':
      return {
        background: 'bg-green-100',
        text: 'text-green-800'
      };
    case 'in-progress':
      return {
        background: 'bg-blue-100',
        text: 'text-blue-800'
      };
    case 'planning':
      return {
        background: 'bg-yellow-100',
        text: 'text-yellow-800'
      };
    default:
      return {
        background: 'bg-gray-100',
        text: 'text-gray-800'
      };
  }
};

export const formatStatusText = (status: string): string => {
  return status.replace('-', ' ');
};

// Default export for the entire module
export default {
  getStatusColors,
  formatStatusText
};