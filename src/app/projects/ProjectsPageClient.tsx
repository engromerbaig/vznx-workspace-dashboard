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
import { ProjectsEmptyState } from '@/components/empty-states/ProjectsEmptyState';
export default function ProjectsPageClient() {
  const { user } = useUser();
  const [projects, setProjects] = useState<BaseProject[]>([]);
  const [allProjectsStats, setAllProjectsStats] = useState<{
    totalProjects: number;
    completedProjects: number;
    incompleteProjects: number;
    totalTasks: number;
  }>({
    totalProjects: 0,
    completedProjects: 0,
    incompleteProjects: 0,
    totalTasks: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [totalProjectsCount, setTotalProjectsCount] = useState(0);

  const pagination = usePagination({
    totalItems: totalProjectsCount, // Use server-side total count
    pageSize: 6,
    initialPage: 1,
    maxVisiblePages: 5
  });

  // Fetch projects with pagination
  const fetchProjects = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/projects?page=${page}&limit=6`);
      const data = await res.json();
      
      if (data.status === 'success') {
        setProjects(data.projects);
        setTotalProjectsCount(data.pagination.totalProjects);
        
        // If we're on the first page, also fetch stats for all projects
        if (page === 1) {
          await fetchAllProjectsStats();
        }
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats for all projects (separate call for accurate stats)
  const fetchAllProjectsStats = async () => {
    try {
      const res = await fetch('/api/projects/stats'); // We'll create this endpoint
      const data = await res.json();
      
      if (data.status === 'success') {
        setAllProjectsStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch project stats:', error);
      // Fallback: calculate from current page if stats endpoint fails
      calculateStatsFromCurrent();
    }
  };

  // Fallback: calculate stats from current page data (less accurate)
  const calculateStatsFromCurrent = () => {
    // This is a fallback - not as accurate but better than nothing
    const completed = projects.filter(p => p.status === 'completed').length;
    const incomplete = projects.filter(p => p.status !== 'completed').length;
    const totalTasks = projects.reduce((sum, project) => sum + (project.taskStats?.total || 0), 0);
    
    setAllProjectsStats({
      totalProjects: totalProjectsCount,
      completedProjects: completed,
      incompleteProjects: incomplete,
      totalTasks: totalTasks
    });
  };

  // Fetch projects when page changes
  useEffect(() => {
    fetchProjects(pagination.currentPage);
  }, [pagination.currentPage]);

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
        // Refresh the current page and stats
        await fetchProjects(pagination.currentPage);
        await fetchAllProjectsStats();
        setShowAddModal(false);
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
        // Refresh current page and stats after deletion
        await fetchProjects(pagination.currentPage);
        await fetchAllProjectsStats();
        toast.success('Project deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
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
            {totalProjectsCount > 0 && (
              <p className="text-gray-600 text-sm mt-1">
                Showing {((pagination.currentPage - 1) * 6) + 1}-{Math.min(pagination.currentPage * 6, totalProjectsCount)} of {totalProjectsCount} projects
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
        {totalProjectsCount > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ProgressCard
              title="Total Projects"
              value={allProjectsStats.totalProjects}
              icon={<FaProjectDiagram />}
              color="blue"
              size="md"
            />
            
            <ProgressCard
              title="Completed"
              value={allProjectsStats.completedProjects}
              icon={<FaCheckCircle />}
              color="green"
              size="md"
            />
            
            <ProgressCard
              title="In Progress"
              value={allProjectsStats.incompleteProjects}
              icon={<FaClock />}
              color="orange"
              size="md"
            />
            
            <ProgressCard
              title="Total Tasks"
              value={allProjectsStats.totalTasks}
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
            {totalProjectsCount > 0 && (
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
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          </>
        ) : totalProjectsCount === 0 ? (
          // ✅ Centered No Projects UI
               <ProjectsEmptyState onAddProject={() => setShowAddModal(true)} />

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
              onPageChange={(page) => {
                pagination.goToPage(page);
                // The useEffect will handle the fetch
              }}
              onPrev={() => {
                pagination.prevPage();
                // The useEffect will handle the fetch
              }}
              onNext={() => {
                pagination.nextPage();
                // The useEffect will handle the fetch
              }}
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