import { FaTrash } from 'react-icons/fa';
import { TeamMemberWithWorkload } from '@/types/team';
import { getCapacityInfo } from '@/utils/capacity';

interface TeamMemberCardProps {
  member: TeamMemberWithWorkload;
  onDelete?: (id: string) => void;
}

export default function TeamMemberCard({ 
  member, 
  onDelete 
}: TeamMemberCardProps) {
  const handleDelete = () => {
    if (onDelete && confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
      onDelete(member._id);
    }
  };

  const capacityInfo = getCapacityInfo(member.capacity);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
          <p className="text-gray-600 text-sm">{member.role}</p>
        </div>
        {onDelete && (
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Remove team member"
          >
            <FaTrash size={14} />
          </button>
        )}
      </div>
      
      <p className="text-gray-500 text-sm mb-4">{member.email}</p>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Current Tasks</span>
          <span className="font-medium">{member.taskCount}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Workload</span>
          <span className={`font-medium ${capacityInfo.textColor}`}>
            {capacityInfo.status} ({member.capacity}%)
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${capacityInfo.color} transition-all duration-300`}
            style={{ width: `${member.capacity}%` }}
          ></div>
        </div>
        
        {/* Optional: Add description tooltip or badge */}
        {member.capacity >= 80 && (
          <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            {capacityInfo.description}
          </div>
        )}
      </div>
    </div>
  );
}