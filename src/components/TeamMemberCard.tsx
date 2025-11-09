// src/components/TeamMemberCard.tsx
'use client';

interface TeamMemberCardProps {
  member: {
    id: string;
    name: string;
    email: string;
    role: string;
    taskCount: number;
    capacity: number;
  };
  capacityColor: string;
  capacityTextColor: string;
  capacityStatus: string;
}

export default function TeamMemberCard({ 
  member, 
  capacityColor, 
  capacityTextColor, 
  capacityStatus 
}: TeamMemberCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Member Info */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
        <p className="text-sm text-gray-600">{member.role}</p>
        <p className="text-xs text-gray-500 mt-1">{member.email}</p>
      </div>

      {/* Task Count */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Assigned Tasks</span>
          <span className="font-medium">{member.taskCount} tasks</span>
        </div>
      </div>

      {/* Capacity Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Workload</span>
          <span className={`font-medium ${capacityTextColor}`}>
            {capacityStatus} ({member.capacity}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${capacityColor} transition-all duration-300`}
            style={{ width: `${member.capacity}%` }}
          ></div>
        </div>
      </div>

      {/* Capacity Status */}
      <div className="text-xs text-gray-500">
        {member.capacity === 0 && 'No tasks assigned'}
        {member.capacity > 0 && member.capacity < 60 && 'Comfortable workload'}
        {member.capacity >= 60 && member.capacity < 80 && 'Moderate workload - monitor'}
        {member.capacity >= 80 && 'Heavy workload - consider redistributing'}
      </div>
    </div>
  );
}