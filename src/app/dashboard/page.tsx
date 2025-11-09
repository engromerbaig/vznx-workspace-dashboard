'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { BaseProject } from '@/types/project';
import ProjectCard from '@/components/ProjectCard';
import AddProjectModal from '@/components/AddProjectModal';
import PrimaryButton from '@/components/PrimaryButton';
import { FaPlus } from 'react-icons/fa';

export default function DashboardPage() {
  const { user } = useUser();
  const [projects, setProjects] = useState<BaseProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      
      if (data.status === 'success') {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Add new project
  const handleAddProject = async (projectData: { name: string; description?: string }) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      const data = await res.json();

      if (data.status === 'success') {
        setProjects(prev => [data.project, ...prev]);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  // Delete project
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.status === 'success') {
        setProjects(prev => prev.filter(project => project._id !== projectId));
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{process.env.NEXT_PUBLIC_APP_NAME}</h1>
          <p className="text-gray-600 mt-2">Projects Dashboard</p>
        </div>

        {/* Welcome Message with User Info */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-2 text-black">Welcome back, {user?.username}!</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
      
            <span>Email: {user?.email}</span>
          </div>
        </div>

        {/* Projects Header with Add Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
          <PrimaryButton
            onClick={() => setShowAddModal(true)}
            showIcon={true}
            icon={FaPlus}
          >
            Add Project
          </PrimaryButton>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No projects yet</div>
            <PrimaryButton
              onClick={() => setShowAddModal(true)}
              showIcon={true}
              icon={FaPlus}
            >
              Create Your First Project
            </PrimaryButton>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard
                key={project._id}
                project={project}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>
        )}

        {/* Add Project Modal */}
        <AddProjectModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddProject}
        />
      </div>
    </div>
  );
}