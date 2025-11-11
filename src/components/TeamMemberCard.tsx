'use client';

import { FaTrash, FaUser, FaEnvelope, FaBriefcase, FaTasks, FaExclamationTriangle, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { TeamMemberWithWorkload } from '@/types/team';
import { getCapacityInfo, CAPACITY_THRESHOLDS } from '@/utils/capacity';
import { formatDateTime } from '@/utils/dateFormatter';
import { useState } from 'react';
import { toast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';

interface TeamMemberCardProps {
  member: TeamMemberWithWorkload;
  onDelete?: (id: string) => void;
}

export default function TeamMemberCard({ 
  member, 
  onDelete 
}: TeamMemberCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const capacityInfo = getCapacityInfo(member.capacity);

  const getCapacityGradient = (capacity: number) => {
    if (capacity < CAPACITY_THRESHOLDS.COMFORTABLE) return 'from-green-400 to-emerald-500';
    if (capacity < CAPACITY_THRESHOLDS.MODERATE) return 'from-yellow-400 to-amber-500';
    return 'from-red-400 to-rose-500';
  };

  const getCapacityIcon = (capacity: number) => {
    if (capacity < CAPACITY_THRESHOLDS.COMFORTABLE) return <FaCheckCircle className="text-green-500" />;
    if (capacity < CAPACITY_THRESHOLDS.MODERATE) return <FaBriefcase className="text-yellow-500" />;
    return <FaExclamationTriangle className="text-red-500" />;
  };

  // Calculate available tasks based on member's maxCapacity
  const availableTasks = Math.max(0, member.maxCapacity - member.taskCount);

  // Handle card click to navigate to team member details
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || isDeleting) {
      return;
    }
    router.push(`/team/${member._id}`);
  };

  // Handle delete with proper animation and confirmation
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    toast.customConfirm(
      `Are you sure you want to remove "${member.name}" from the team?`,
      async () => {
        try {
          setIsDeleting(true);
          await new Promise(resolve => setTimeout(resolve, 400));
          
          if (onDelete) {
            await onDelete(member._id);
          }
          toast.success(`"${member.name}" removed from team successfully`);
        } catch (err) {
          setIsDeleting(false);
          toast.error('Failed to remove team member. Please try again.');
        }
      }
    );
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative min-h-[320px] cursor-pointer transform border border-gray-100
        ${isDeleting 
          ? 'animate-fadeOut scale-95 opacity-0' 
          : 'animate-fadeInUp hover:-translate-y-1'
        }
        ${isHovered && !isDeleting ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}
      `}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />
      
      {/* Deleting Overlay */}
      {isDeleting && (
        <div className="absolute inset-0 bg-red-50 bg-opacity-80 flex items-center justify-center z-20 rounded-xl">
          <div className="flex items-center gap-3 text-red-600">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-red-600 border-t-transparent"></div>
            <span className="font-semibold">Removing...</span>
          </div>
        </div>
      )}
      
      {/* Capacity Background Pattern */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-10 transition-opacity duration-500">
        <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${getCapacityGradient(member.capacity)} blur-2xl`} />
      </div>

      {/* Content */}
      <div className="p-6 relative z-10 h-full flex flex-col">
        
        {/* Header with Role */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-3">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors line-clamp-2 leading-tight animate-popIn">
              {member.name}
            </h3>
            <div className="flex items-center gap-2 mt-2 animate-fadeIn">
              <FaBriefcase className="text-gray-400 text-sm" />
              <p className="text-gray-600 text-sm font-medium line-clamp-1">
                {member.role}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${capacityInfo.textColor} bg-white border ${capacityInfo.textColor.replace('text', 'border')} opacity-90 animate-popIn shadow-sm`}>
            {capacityInfo.status}
          </span>
        </div>

        {/* Email */}
        <div className="flex items-center gap-2 mb-4 text-gray-500 animate-fadeIn">
          <FaEnvelope className="text-sm" />
          <p className="text-sm truncate" title={member.email}>
            {member.email}
          </p>
        </div>

        {/* Workload Progress Section */}
        <div className="mb-4 animate-fadeInUp">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Workload Capacity</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-800">{member.capacity}%</span>
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getCapacityGradient(member.capacity)} animate-pulse`} />
            </div>
          </div>
          
          {/* Main Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden">
            <div 
              className={`h-2.5 rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${getCapacityGradient(member.capacity)} shadow-sm animate-growWidth`}
              style={{ width: `${member.capacity}%` }}
            ></div>
          </div>
          
          {/* Capacity Status Text */}
          <div className="text-xs text-gray-500 font-medium text-center">
            {capacityInfo.description}
          </div>
        </div>

        {/* Task Stats */}
        <div className="mb-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 group-hover:border-gray-300 transition-colors animate-fadeInUp">
          <div className="flex justify-between items-center">
            <div className="text-center animate-popIn">
              <div className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-1">
                <FaTasks className="text-sm" />
                {member.taskCount}
              </div>
              <div className="text-xs text-gray-600 font-medium">Tasks</div>
            </div>
            <div className="text-center animate-popIn" style={{ animationDelay: '0.1s' }}>
              <div className="text-2xl font-bold text-blue-600 flex items-center justify-center">
                {getCapacityIcon(member.capacity)}
              </div>
              <div className="text-xs text-blue-700 font-medium">Status</div>
            </div>
            <div className="text-center animate-popIn" style={{ animationDelay: '0.2s' }}>
              <div className="text-2xl font-bold text-purple-600 flex items-center justify-center">
                {availableTasks}
              </div>
              <div className="text-xs text-purple-700 font-medium">Available</div>
            </div>
          </div>
        </div>

        {/* Member Metadata - Bottom Section */}
        <div className="mt-auto pt-4 border-t border-gray-200 group-hover:border-gray-300 transition-colors">
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 mb-4">
            {/* Member Since */}
            <div className="flex items-center gap-2 col-span-2 animate-fadeIn">
              <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
                <FaUser className="text-blue-600 text-xs" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Member since</span>
                <span className="text-xs font-medium text-gray-700" title={formatDateTime(member.createdAt, { includeTime: true })}>
                  {formatDateTime(member.createdAt)}
                </span>
              </div>
            </div>

            {/* Capacity Level */}
            <div className="flex items-center gap-2 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className={`flex items-center justify-center w-5 h-5 ${capacityInfo.textColor.replace('text', 'bg')} bg-opacity-20 rounded-full`}>
                {getCapacityIcon(member.capacity)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Workload</span>
                <span className={`text-xs font-medium ${capacityInfo.textColor}`}>
                  {capacityInfo.status}
                </span>
              </div>
            </div>

            {/* Task Load - UPDATED: Uses member.maxCapacity */}
            <div className="flex items-center gap-2 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-center w-5 h-5 bg-purple-100 rounded-full">
                <FaTasks className="text-purple-500 text-xs" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Task Load</span>
                <span className="text-xs font-medium text-purple-700">
                  {member.taskCount}/{member.maxCapacity}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-primary group-hover:text-primary/80 transition-colors animate-fadeIn">
              <FaUser className="text-base" />
              <span className="font-semibold text-sm">
                View Profile
              </span>
              <FaArrowRight className="text-xs transform group-hover:translate-x-1 transition-transform" />
            </div>
            
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className={`p-2 cursor-pointer rounded-lg transition-all duration-200 group/delete animate-popIn
                ${isDeleting 
                  ? 'text-red-300 cursor-not-allowed' 
                  : 'text-red-400 hover:text-red-600 hover:bg-red-50 hover:scale-110'
                }
              `}
              title={isDeleting ? 'Removing...' : 'Remove team member'}
            >
              <FaTrash className={`text-sm transition-transform ${isDeleting ? 'animate-pulse' : 'group-hover/delete:scale-110'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Hover border effect */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-200 group-hover:shadow-lg transition-all duration-300 pointer-events-none" />
    </div>
  );
}