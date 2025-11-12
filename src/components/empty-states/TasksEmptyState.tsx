// components/empty-states/TasksEmptyState.tsx
import { FaPlus } from 'react-icons/fa';
import EmptyState from '../EmptyState';

interface TasksEmptyStateProps {
  onAddTask: () => void;
}

export function TasksEmptyState({ onAddTask }: TasksEmptyStateProps) {
  return (
    <EmptyState
      icon="📝"
      title="No tasks yet"
      description="Get started by adding your first task to this project. Tasks help you track progress and assign work to team members."
      primaryAction={{
        label: "Add First Task",
        onClick: onAddTask,
        icon: FaPlus,
        showIcon: true
      }}
      size="md"
    />
  );
}