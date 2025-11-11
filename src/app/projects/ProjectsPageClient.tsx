// app/projects/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { BaseProject } from '@/types/project';
import ProjectCard from '@/components/ProjectCard';
import ProgressCard from '@/components/ProgressCard';
import AddProjectModal from '@/components/AddProjectModal';
import PrimaryButton from '@/components/PrimaryButton';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';
import { FaPlus, FaProjectDiagram, FaCheckCircle, FaClock, FaTasks } from 'react-icons/fa';
import { toast } from '@/components/ToastProvider';

export default function ProjectsPageClient() {
  const { user } = useUser();
  const [projects, setProjects] = useState<BaseProject[]>([]);
  const [allProjects, setAllProjects] = useState<BaseProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const pagination = usePagination({
    totalItems: allProjects.length,
    pageSize: 6, // Show 6 projects per page
    initialPage: 1,
    maxVisiblePages: 5
  });

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      
      if (data.status === 'success') {
        setAllProjects(data.projects);
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

  // Update visible projects when pagination changes
  useEffect(() => {
    const startIndex = pagination.startIndex;
    const endIndex = pagination.endIndex + 1; // endIndex is inclusive
    setProjects(allProjects.slice(startIndex, endIndex));
  }, [allProjects, pagination.startIndex, pagination.endIndex]);

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
        const updatedProjects = [data.project, ...allProjects];
        setAllProjects(updatedProjects);
        setShowAddModal(false);
        pagination.goToPage(1); // Go to first page to see the new project
        toast.success(`Project "${data.project.name}" added successfully!`);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to add project');
    }
  };

  // Delete project
  const handleDeleteProject = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.status === 'success') {
        const updatedProjects = allProjects.filter(project => project._id !== projectId);
        setAllProjects(updatedProjects);
        
        // If current page becomes empty after deletion, go to previous page
        if (projects.length === 1 && pagination.currentPage > 1) {
          pagination.prevPage();
        }
        
        toast.success('Project deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  // Calculate project statistics from ALL projects
  const projectStats = {
    totalProjects: allProjects.length,
    completedProjects: allProjects.filter(project => project.status === 'completed').length,
    incompleteProjects: allProjects.filter(project => project.status !== 'completed').length,
    totalTasks: allProjects.reduce((sum, project) => sum + (project.taskStats?.total || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Projects Header with count */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Projects
            </h2>
            {allProjects.length > 0 && (
              <p className="text-gray-600 text-sm mt-1">
                Showing {pagination.startIndex + 1}-{Math.min(pagination.endIndex + 1, allProjects.length)} of {allProjects.length} projects
              </p>
            )}
          </div>
          <PrimaryButton
            onClick={() => setShowAddModal(true)}
            showIcon={true}
            icon={FaPlus}
          >
            Add Project
          </PrimaryButton>
        </div>

        {/* Progress Cards for Project Stats */}
        {allProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ProgressCard
              title="Total Projects"
              value={projectStats.totalProjects}
              icon={<FaProjectDiagram />}
              color="blue"
              size="md"
            />
            
            <ProgressCard
              title="Completed"
              value={projectStats.completedProjects}
              icon={<FaCheckCircle />}
              color="green"
              size="md"
            />
            
            <ProgressCard
              title="In Progress"
              value={projectStats.incompleteProjects}
              icon={<FaClock />}
              color="orange"
              size="md"
            />
            
            <ProgressCard
              title="Total Tasks"
              value={projectStats.totalTasks}
              icon={<FaTasks />}
              color="purple"
              size="md"
            />
          </div>
        )}

        {/* Projects Grid */}
        {isLoading ? (
          <>
            {/* Loading state for progress cards */}
            {allProjects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 animate-pulse min-h-[120px]">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Loading state for project cards */}
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
          </>
        ) : allProjects.length === 0 ? (
          // ✅ Centered No Projects UI
          <div className="text-center py-12 sm:py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-gray-400 text-5xl sm:text-6xl mb-3 sm:mb-4">📂</div>
            <div className="text-gray-500 text-lg mb-3 sm:mb-4">No projects yet</div>
            <p className="text-gray-400 text-sm mb-4 sm:mb-6 max-w-md mx-auto px-4">
              Get started by creating your first project. Projects help you organize your tasks and track progress efficiently.
            </p>
            <div className="flex justify-center">
              <PrimaryButton
                onClick={() => setShowAddModal(true)}
                showIcon={true}
                icon={FaPlus}
              >
                Create Your First Project
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {projects.map(project => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              visiblePages={pagination.visiblePages}
              onPageChange={pagination.goToPage}
              onPrev={pagination.prevPage}
              onNext={pagination.nextPage}
              canPrev={pagination.canPrevPage}
              canNext={pagination.canNextPage}
              className="mt-8"
            />
          </>
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