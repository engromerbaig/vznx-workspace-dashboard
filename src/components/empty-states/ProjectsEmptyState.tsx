// components/empty-states/ProjectsEmptyState.tsx
import { FaPlus } from 'react-icons/fa';
import EmptyState from '../EmptyState';

interface ProjectsEmptyStateProps {
  onAddProject: () => void;
}

export function ProjectsEmptyState({ onAddProject }: ProjectsEmptyStateProps) {
  return (
    <EmptyState
      icon="📂"
      title="No projects yet"
      description="Get started by creating your first project. Projects help you organize your tasks and track progress efficiently."
      primaryAction={{
        label: "Create Your First Project",
        onClick: onAddProject,
        icon: FaPlus,
        showIcon: true
      }}
      size="lg"
    />
  );
}