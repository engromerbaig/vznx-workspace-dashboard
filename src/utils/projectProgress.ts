// src/utils/projectProgress.ts
export const getProgressColor = (progress: number): string => {
  if (progress === 100) return '#10B981'; // green-500
  if (progress >= 50) return '#3B82F6'; // blue-500
  return '#F59E0B'; // yellow-500
};

export const getProgressStatusText = (progress: number): string => {
  if (progress === 100) return '🎉 Project Completed!';
  if (progress >= 75) return '🔥 Almost there!';
  if (progress >= 50) return '⚡ Good progress';
  if (progress >= 25) return '📈 Making progress';
  return '🚀 Getting started';
};

export const generateProgressData = (progress: number): Array<{ name: string; value: number }> => {
  return [
    { name: 'Completed', value: progress },
    { name: 'Remaining', value: 100 - progress }
  ];
};

// New utility function for progress messages
export const getProgressMessage = (progress: number): string => {
  return getProgressStatusText(progress);
};