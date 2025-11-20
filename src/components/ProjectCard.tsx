// src/components/ProjectCard.tsx
'use client';

import { BaseProject } from '@/types/project';
import { FaTrash, FaCheck, FaCircle, FaArrowRight } from 'react-icons/fa';
import { MdOutlineEdit } from "react-icons/md";
import { FaRegEye } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { formatDateTime } from '@/utils/dateFormatter';
import { getStatusColors, formatStatusText } from '@/utils/projectStatus';
import { getProgressStatusText } from '@/utils/projectProgress';
import { getTaskStats } from '@/utils/taskStats';
import { useState } from 'react';
import { toast } from '@/components/ToastProvider';

interface ProjectCardProps {
  project: BaseProject;
  onDelete: (projectId: string) => void;
  onEdit: (project: BaseProject) => void;
}

const TITLE_MAX_LENGTH = 25;
const DESC_MAX_LENGTH = 45;

const truncateText = (text: string | undefined, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export default function ProjectCard({ project, onDelete, onEdit }: ProjectCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const statusColors = getStatusColors(project.status);
  const progressStatusText = getProgressStatusText(project.progress);
  const { total, completed, incomplete } = getTaskStats(project.taskStats);

  const handleCardClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest('button[data-delete]') ||
      (e.target as HTMLElement).closest('button[data-edit]') ||
      isDeleting
    ) {
      return;
    }
    router.push(`/projects/${project.slug}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.customConfirm(
      `Are you sure you want to delete "${project.name}"? This will also delete all associated tasks.`,
      async () => {
        try {
          setIsDeleting(true);
          await new Promise(resolve => setTimeout(resolve, 400));
          await onDelete(project._id);
          toast.success(`"${project.name}" deleted successfully`);
        } catch (err) {
          setIsDeleting(false);
          toast.error('Failed to delete project. Please try again.');
        }
      }
    );
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(project);
  };

  const getProgressGradient = (progress: number) => {
    if (progress === 100) return 'from-green-500 to-green-600';
    if (progress >= 50) return 'from-blue-500 to-blue-600';
    return 'from-yellow-500 to-orange-500';
  };

  const getBarWidth = (value: number, max: number) => {
    if (max === 0) return 0;
    return (value / max) * 100;
  };

  const isUpdated = project.updatedAt && new Date(project.updatedAt) > new Date(project.createdAt);
  const timestamp = isUpdated ? project.updatedAt : project.createdAt;
  const timestampLabel = isUpdated ? 'Updated' : 'Created';

  const truncatedTitle = truncateText(project.name, TITLE_MAX_LENGTH);
  const truncatedDesc = truncateText(project.description, DESC_MAX_LENGTH);

  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative min-h-[380px] cursor-pointer transform border border-gray-100
        ${isDeleting ? 'animate-fadeOut scale-95 opacity-0' : 'animate-fadeInUp hover:-translate-y-1'}
        ${isHovered && !isDeleting ? 'ring-2 ring-blue-200 ring-opacity-50' : ''}
      `}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" />

      {/* Deleting overlay */}
      {isDeleting && (
        <div className="absolute inset-0 bg-red-50 bg-opacity-80 flex items-center justify-center z-20 rounded-xl">
          <div className="flex items-center gap-3 text-red-600">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-red-600 border-t-transparent"></div>
            <span className="font-semibold">Deleting...</span>
          </div>
        </div>
      )}

      <div className="p-6 relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4 gap-3">
          <div className="flex-1 ">
            {/* Project Name */}
            <h3 className="text-xl uppercase font-bold text-gray-800 leading-tight h-[70px] overflow-visible" title={project.name}>
              {truncatedTitle}
            </h3>

            {/* Description - fixed height container */}
            <div className="h-[30px] mt-2 mb-4">
              <p className="text-gray-500 text-sm leading-normal" title={project.description || ''}>
                {truncatedDesc || <span className="text-gray-300 italic">No description</span>}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors.background} ${statusColors.text} whitespace-nowrap border ${statusColors.text.replace('text', 'border')} opacity-80`}>
              {formatStatusText(project.status)}
            </span>
            
            {/* Edit button - visible on hover only */}
            <button
              data-edit
              onClick={handleEdit}
              disabled={isDeleting}
              className={`p-2 text-primary cursor-pointer rounded-full bg-white shadow-md hover:bg-primary/10 hover:shadow-lg transition-all duration-200 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}
              title="Edit project"
            >
              <MdOutlineEdit className="text-lg" />
            </button>
          </div>
        </div>

        {/* Border line below header */}
        <div className="border-t border-gray-200 mb-4" />

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-800">{project.progress}%</span>
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getProgressGradient(project.progress)} animate-pulse`} />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3.5 mb-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${getProgressGradient(project.progress)} shadow-sm animate-bar-grow`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 font-medium text-center">{progressStatusText}</div>
        </div>

        {/* Task Stats with Bars */}
        <div className="mb-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 group-hover:border-gray-300 transition-colors">
          <div className="space-y-3">
            {/* Total */}
            <div className="flex items-center gap-3">
              <div className="w-16 text-xs font-medium text-gray-600">Total</div>
              <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-gray-500 to-gray-600 rounded-full animate-bar-grow"
                  style={{ width: `${total > 0 ? 100 : 0}%` }}
                />
              </div>
              <div className="w-8 text-right text-sm font-bold text-gray-800">{total}</div>
            </div>
            
            {/* Done */}
            <div className="flex items-center gap-3">
              <div className="w-16 text-xs font-medium text-green-700 flex items-center gap-1">
                <FaCheck className="text-[10px]" /> Done
              </div>
              <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full animate-bar-grow"
                  style={{ width: `${getBarWidth(completed, total)}%` }}
                />
              </div>
              <div className="w-8 text-right text-sm font-bold text-green-600">{completed}</div>
            </div>
            
            {/* Pending */}
            <div className="flex items-center gap-3">
              <div className="w-16 text-xs font-medium text-blue-700 flex items-center gap-1">
                <FaCircle className="text-[8px]" /> Pending
              </div>
              <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-bar-grow"
                  style={{ width: `${getBarWidth(incomplete, total)}%` }}
                />
              </div>
              <div className="w-8 text-right text-sm font-bold text-blue-600">{incomplete}</div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          {/* Timestamp - improved UI */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${isUpdated ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
              {timestampLabel}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {formatDateTime(timestamp)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            {/* View Tasks */}
            <div className="flex items-center gap-2 text-primary font-semibold text-sm border border-dashed border-primary rounded-lg px-3 py-2 hover:bg-primary/5 transition-colors">
              <FaRegEye className="text-base" />
              <span>View Tasks ({total})</span>
              <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Delete button - visible on hover only */}
            <button
              data-delete
              onClick={handleDelete}
              disabled={isDeleting}
              className={`p-2 rounded-full bg-white shadow-md cursor-pointer transition-all duration-200
                ${isDeleting
                  ? 'text-red-300 cursor-not-allowed opacity-100'
                  : `text-red-400 hover:text-red-600 hover:bg-red-50 hover:shadow-lg hover:scale-110 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`
                }`}
              title={isDeleting ? 'Deleting...' : 'Delete project'}
            >
              <FaTrash className={`text-sm ${isDeleting ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Hover border effect */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-200 transition-all duration-300 pointer-events-none" />
    </div>
  );
}