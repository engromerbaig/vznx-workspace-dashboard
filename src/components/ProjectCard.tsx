// src/components/ProjectCard.tsx
'use client';

import { BaseProject } from '@/types/project';
import { FaTrash, FaEdit, FaTasks } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface ProjectCardProps {
  project: BaseProject;
  onDelete: (projectId: string) => void;
}

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{project.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
          {project.status.replace('-', ' ')}
        </span>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getProgressColor(project.progress)} transition-all duration-300`}
            style={{ width: `${project.progress}%` }}
          ></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.push(`/projects/${project._id}`)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <FaTasks className="text-xs" />
          View Tasks
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={() => onDelete(project._id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete project"
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}