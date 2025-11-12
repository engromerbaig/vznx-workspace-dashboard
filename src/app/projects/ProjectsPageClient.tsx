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
import FilterBar, { FilterOptions } from '@/components/FilterBar';
import { usePagination } from '@/hooks/usePagination';
import { FaPlus, FaProjectDiagram, FaCheckCircle, FaClock, FaTasks } from 'react-icons/fa';
import { toast } from '@/components/ToastProvider';
import { ProjectsEmptyState } from '@/components/empty-states/ProjectsEmptyState';
import Header from '@/components/Header';
import { MdAssignment } from 'react-icons/md';


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
  
  // Filter state
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    sortBy: 'recent',
    status: 'all',
    dateRange: {
      start: '',
      end: ''
    }
  });

  const [isFilterChange, setIsFilterChange] = useState(false);

  const pagination = usePagination({
    totalItems: totalProjectsCount,
    pageSize: 6,
    initialPage: 1,
    maxVisiblePages: 5
  });

  // Build query params from filters
  const buildQueryParams = (page: number = 1) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', '6');
    
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.status !== 'all') params.append('status', filters.status);
    if (filters.dateRange.start) params.append('startDate', filters.dateRange.start);
    if (filters.dateRange.end) params.append('endDate', filters.dateRange.end);
    
    return params.toString();
  };

  // Fetch projects with pagination and filters
  const fetchProjects = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const queryParams = buildQueryParams(page);
      const res = await fetch(`/api/projects?${queryParams}`);
      const data = await res.json();
      
      if (data.status === 'success') {
        setProjects(data.projects);
        setTotalProjectsCount(data.pagination.totalProjects);
        
        // Also fetch stats with same filters
        await fetchAllProjectsStats();
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats for filtered projects
  const fetchAllProjectsStats = async () => {
    try {
      const params = new URLSearchParams();
      
      // Add all active filters to stats query
      if (filters.search) params.append('search', filters.search);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.dateRange.start) params.append('startDate', filters.dateRange.start);
      if (filters.dateRange.end) params.append('endDate', filters.dateRange.end);
      
      console.log('🔍 Fetching stats with params:', params.toString());
      
      const res = await fetch(`/api/projects/stats?${params.toString()}`);
      const data = await res.json();
      
      console.log('📊 Stats response:', data);
      
      if (data.status === 'success') {
        setAllProjectsStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch project stats:', error);
    }
  };

  // Handle filter changes
 const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setIsFilterChange(true);
  };

  // Reset to page 1 when filters change, then fetch
  useEffect(() => {
    if (isFilterChange) {
      pagination.goToPage(1);
      setIsFilterChange(false);
    }
  }, [filters]);

  // Fetch projects when page changes OR filters change
  useEffect(() => {
    fetchProjects(pagination.currentPage);
  }, [pagination.currentPage, filters]);

  // Reset to page 1 when filters change, then fetch
  useEffect(() => {
    if (isFilterChange) {
      pagination.goToPage(1);
      setIsFilterChange(false);
    }
  }, [filters]);

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
        toast.success('Project deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  return (
    <>

    <Header
    text = "Projects Overview"
    icon = {<MdAssignment  />}
    />

        
        <div className="flex justify-between items-center mb-6">
          <div>
         
            {totalProjectsCount > 0 && (
              <p className="text-gray-700 font-medium border rounded-full px-2 py-1 text-xs mt-1">
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

        {/* Filter Bar */}
        <FilterBar
          onFilterChange={handleFilterChange}
          showStatusFilter={true}
          placeholder="Search projects by name or description..."
        />

        {/* Projects Grid */}
        {isLoading ? (
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
        ) : totalProjectsCount === 0 ? (
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
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                visiblePages={pagination.visiblePages}
                onPageChange={(page) => {
                  pagination.goToPage(page);
                }}
                onPrev={() => {
                  pagination.prevPage();
                }}
                onNext={() => {
                  pagination.nextPage();
                }}
                canPrev={pagination.canPrevPage}
                canNext={pagination.canNextPage}
                className="mt-8"
              />
            )}
          </>
        )}

        {/* Add Project Modal */}
        <AddProjectModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddProject}
        />

      </>

  );
}