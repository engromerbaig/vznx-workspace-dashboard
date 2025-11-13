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
import SkeletonLoader from '@/components/SkeletonLoader';
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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [totalProjectsCount, setTotalProjectsCount] = useState(0);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  
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
  const fetchProjects = async (page: number = 1, isInitial: boolean = false) => {
    try {
      // Only show initial loading on first load
      if (isInitial) {
        setIsInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const queryParams = buildQueryParams(page);
      const res = await fetch(`/api/projects?${queryParams}`);
      const data = await res.json();
      
      if (data.status === 'success') {
        setProjects(data.projects);
        setTotalProjectsCount(data.pagination.totalProjects);
        setHasLoadedOnce(true);
        
        // Also fetch stats with same filters
        await fetchAllProjectsStats();
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
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
      
      const res = await fetch(`/api/projects/stats?${params.toString()}`);
      const data = await res.json();
      
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

  // Reset to page 1 when filters change
  useEffect(() => {
    if (isFilterChange) {
      pagination.goToPage(1);
      setIsFilterChange(false);
    }
  }, [filters]);

  // Initial load
  useEffect(() => {
    if (!hasLoadedOnce) {
      fetchProjects(1, true);
    }
  }, []);

  // Fetch projects when page changes or filters change (but not on initial load)
  useEffect(() => {
    if (hasLoadedOnce) {
      fetchProjects(pagination.currentPage, false);
    }
  }, [pagination.currentPage, filters]);

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
        await fetchProjects(pagination.currentPage, false);
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
        await fetchProjects(pagination.currentPage, false);
        toast.success('Project deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  // Show skeleton loader only on initial load
  if (isInitialLoading && !hasLoadedOnce) {
    return (
      <>
        <Header text="Projects Overview" icon={<MdAssignment />} />
        
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <SkeletonLoader width="w-48" height="h-4" />
          </div>
          <SkeletonLoader width="w-32" height="h-10" />
        </div>

        {/* Progress cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <SkeletonLoader width="w-24" height="h-4" />
                <SkeletonLoader width="w-10" height="h-10" variant="circle" />
              </div>
              <SkeletonLoader width="w-16" height="h-8" />
            </div>
          ))}
        </div>

        {/* Filter bar skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <SkeletonLoader width="w-full md:w-1/2" height="h-10" />
            <SkeletonLoader width="w-full md:w-32" height="h-10" />
            <SkeletonLoader width="w-full md:w-32" height="h-10" />
          </div>
        </div>

        {/* Projects grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <SkeletonLoader width="w-3/4" height="h-6" />
                <SkeletonLoader width="w-20" height="h-6" className="rounded-full" />
              </div>
              <SkeletonLoader width="w-full" height="h-4" className="mb-2" />
              <SkeletonLoader width="w-5/6" height="h-4" className="mb-6" />
              
              {/* Progress bar skeleton */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <SkeletonLoader width="w-20" height="h-3" />
                  <SkeletonLoader width="w-12" height="h-3" />
                </div>
                <SkeletonLoader width="w-full" height="h-2" className="rounded-full" />
              </div>
              
              {/* Stats skeleton */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center">
                  <SkeletonLoader width="w-8" height="h-6" className="mx-auto mb-1" />
                  <SkeletonLoader width="w-12" height="h-3" className="mx-auto" />
                </div>
                <div className="text-center">
                  <SkeletonLoader width="w-8" height="h-6" className="mx-auto mb-1" />
                  <SkeletonLoader width="w-12" height="h-3" className="mx-auto" />
                </div>
                <div className="text-center">
                  <SkeletonLoader width="w-8" height="h-6" className="mx-auto mb-1" />
                  <SkeletonLoader width="w-12" height="h-3" className="mx-auto" />
                </div>
              </div>
              
              {/* Action buttons skeleton */}
              <div className="flex gap-2 mt-4">
                <SkeletonLoader width="w-full" height="h-9" />
                <SkeletonLoader width="w-20" height="h-9" />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <Header text="Projects Overview" icon={<MdAssignment />} />
        
      <div className="flex justify-between items-center mb-6">
        <div>
          {totalProjectsCount > 0 && (
            <p className="text-gray-700 text-sm mt-1">
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

      {/* Progress Cards for Project Stats - Only show when we have data */}
      {hasLoadedOnce && totalProjectsCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ProgressCard
            title="Total Projects"
            value={allProjectsStats.totalProjects}
            icon={<FaProjectDiagram />}
            color="blue"
          />
          
          <ProgressCard
            title="Completed"
            value={allProjectsStats.completedProjects}
            icon={<FaCheckCircle />}
            color="green"
          />
          
          <ProgressCard
            title="In Progress"
            value={allProjectsStats.incompleteProjects}
            icon={<FaClock />}
            color="orange"
          />
          
          <ProgressCard
            title="Total Tasks"
            value={allProjectsStats.totalTasks}
            icon={<FaTasks />}
            color="purple"
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
      {totalProjectsCount === 0 && hasLoadedOnce ? (
        <ProjectsEmptyState onAddProject={() => setShowAddModal(true)} />
      ) : (
        <>
          {/* Subtle loading indicator during refresh */}
          {isRefreshing && (
            <div className="fixed top-20 right-6 z-50">
              <div className="bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
                <span className="text-sm text-gray-600">Updating...</span>
              </div>
            </div>
          )}
          
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