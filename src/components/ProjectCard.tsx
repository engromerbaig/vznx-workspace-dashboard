// src/components/ProjectCard.tsx
'use client';

import { BaseProject } from '@/types/project';
import { FaTrash } from 'react-icons/fa';
import { FaRegEye } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

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
    if (progress === 100) return '#10B981'; // green-500
    if (progress >= 50) return '#3B82F6'; // blue-500
    return '#F59E0B'; // yellow-500
  };

  // Data for the circular progress chart
  const progressData = [
    { name: 'Completed', value: project.progress },
    { name: 'Remaining', value: 100 - project.progress }
  ];

  const progressColor = getProgressColor(project.progress);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative min-h-[280px]">
      
      {/* Circular Progress Background - Centered */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity duration-300">
        <div className="w-48 h-48"> {/* Increased size for better visibility */}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={progressData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={70}
                paddingAngle={0}
                dataKey="value"
                startAngle={90}
                endAngle={450}
              >
                <Cell key="completed" fill={progressColor} />
                <Cell key="remaining" fill="#E5E7EB" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 relative z-10 h-full flex flex-col">
        
        {/* Header with Status */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800 truncate flex-1 pr-3">{project.name}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)} whitespace-nowrap`}>
            {project.status.replace('-', ' ')}
          </span>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">
            {project.description}
          </p>
        )}

        {/* Progress Section */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-2xl font-bold text-gray-800">{project.progress}%</span>
          </div>
          
          {/* Main Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${project.progress}%`,
                backgroundColor: progressColor
              }}
            ></div>
          </div>
          
          {/* Progress Status Text */}
          <div className="text-xs text-gray-500 font-medium text-center">
            {project.progress === 100 ? '🎉 Project Completed!' : 
             project.progress >= 75 ? '🔥 Almost there!' :
             project.progress >= 50 ? '⚡ Good progress' :
             project.progress >= 25 ? '📈 Making progress' : '🚀 Getting started'}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-100">
          <button
            onClick={() => router.push(`/projects/${project._id}`)}
            className="flex items-center gap-2 cursor-pointer text-primary hover:text-primary/80 hover:bg-primary/10 px-2 py-2 rounded-md transition-colors font-semibold text-sm"
          >
            <FaRegEye className="text-base" />
            View Tasks
          </button>
          
          <button
            onClick={() => onDelete(project._id)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors hover:scale-110"
            title="Delete project"
          >
            <FaTrash className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}