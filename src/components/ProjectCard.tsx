// src/components/ProjectCard.tsx
'use client';

import { BaseProject } from '@/types/project';
import { FaTrash, FaCalendar, FaCheck, FaCircle, FaArrowRight } from 'react-icons/fa';
import { MdOutlineEdit } from "react-icons/md";
import { FaRegEye } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { formatDateTime } from '@/utils/dateFormatter';
import { getStatusColors, formatStatusText } from '@/utils/projectStatus';
import { getProgressColor, getProgressStatusText } from '@/utils/projectProgress';
import { getTaskStats } from '@/utils/taskStats';
import ProgressPieChart from '@/components/charts/ProgressPieChart';
import { useEffect, useState } from 'react';
import { toast } from '@/components/ToastProvider';

interface ProjectCardProps {
  project: BaseProject;
  onDelete: (projectId: string) => void;
  onEdit: (project: BaseProject) => void;
}

export default function ProjectCard({ project, onDelete, onEdit }: ProjectCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const statusColors = getStatusColors(project.status);
  const progressColor = getProgressColor(project.progress);
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

  // Decide whether to show "Created" or "Updated"
  const isUpdated = project.updatedAt && new Date(project.updatedAt) > new Date(project.createdAt);
  const timestamp = isUpdated ? project.updatedAt : project.createdAt;
  const timestampLabel = isUpdated ? 'Updated' : 'Created';

  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative min-h-[320px] cursor-pointer transform border border-gray-100
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

      {/* Background pie chart */}
      <div className="absolute inset-0 flex items-center justify-center opacity-25 group-hover:opacity-10 transition-opacity duration-500">
        <ProgressPieChart progress={project.progress} size="xl" />
      </div>

      <div className="p-6 relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-3">
            {/* Project Name + Edit */}
            <div className="flex items-center gap-2">
              <h3 className="text-xl uppercase font-bold text-gray-800 flex-1 line-clamp-2 leading-tight">
                {project.name}
              </h3>
              <button
                data-edit
                onClick={handleEdit}
                disabled={isDeleting}
                  className="p-1.5 text-primary  cursor-pointer rounded-full hover:bg-primary/10 transition-colors flex-shrink-0 mt-0.5"
                title="Edit project"
              >
                <MdOutlineEdit className="text-base" />
              </button>
            </div>

            {/* Description + Edit */}
            {project.description && (
              <div className="flex items-start gap-2 mt-2">
                <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed flex-1">
                  {project.description}
                </p>
                <button
                  data-edit
                  onClick={handleEdit}
                  disabled={isDeleting}
                  className="p-1.5 text-primary  cursor-pointer rounded-full hover:bg-primary/10 transition-colors flex-shrink-0 mt-0.5"
                  title="Edit description"
                >
                  <MdOutlineEdit className="text-base" />
                </button>
              </div>
            )}
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors.background} ${statusColors.text} whitespace-nowrap border ${statusColors.text.replace('text', 'border')} opacity-80`}>
            {formatStatusText(project.status)}
          </span>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-800">{project.progress}%</span>
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getProgressGradient(project.progress)} animate-pulse`} />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${getProgressGradient(project.progress)} shadow-sm`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 font-medium text-center">{progressStatusText}</div>
        </div>

        {/* Task Stats */}
        <div className="mb-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 group-hover:border-gray-300 transition-colors">
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{total}</div>
              <div className="text-xs text-gray-600 font-medium">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
                <FaCheck className="text-sm" />
                {completed}
              </div>
              <div className="text-xs text-green-700 font-medium">Done</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 flex items-center gap-1">
                <FaCircle className="text-sm" />
                {incomplete}
              </div>
              <div className="text-xs text-blue-700 font-medium">Pending</div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          {/* Timestamp (single line) */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <div className="flex items-center justify-center w-5 h-5 bg-gray-100 rounded-full">
              <FaCalendar className="text-gray-500 text-xs" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">{timestampLabel}</span>
              <span className="text-xs font-medium text-gray-700">
                {formatDateTime(timestamp)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            {/* View Tasks – dashed border */}
            <div className="flex items-center gap-2 text-primary font-semibold text-sm border border-dashed border-primary rounded-lg px-3 py-2 hover:bg-primary/5 transition-colors">
              <FaRegEye className="text-base" />
              <span>View Tasks ({total})</span>
              <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Delete button */}
            <button
              data-delete
              onClick={handleDelete}
              disabled={isDeleting}
              className={`p-2 rounded-lg transition-all duration-200
                ${isDeleting
                  ? 'text-red-300 cursor-not-allowed'
                  : 'text-red-400 hover:text-red-600 hover:bg-red-50 hover:scale-110'
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