// components/empty-states/TeamEmptyState.tsx
import { FaPlus, FaUsers } from 'react-icons/fa';
import EmptyState from '../EmptyState';

interface TeamEmptyStateProps {
  onAddMember: () => void;
}

export function TeamEmptyState({ onAddMember }: TeamEmptyStateProps) {
  return (
    <EmptyState
      icon={<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
        <FaUsers className="text-gray-400 text-2xl" />
      </div>}
      title="No team members yet"
      description="Start by adding team members to monitor their workload capacity and task distribution."
      primaryAction={{
        label: "Add Your First Team Member",
        onClick: onAddMember,
        icon: FaPlus,
        showIcon: true
      }}
 
      size="lg"
    />
  );
}