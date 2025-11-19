// src/app/projects/[slug]/page-client.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BaseProject } from '@/types/project';
import { BaseTask } from '@/types/task';
import AddTaskModal from '@/components/AddTaskModal';
import EditProjectModal from '@/components/EditProjectModal';
import ProgressCard from '@/components/ProgressCard';
import PrimaryButton from '@/components/PrimaryButton';
import {
  FaPlus,
  FaArrowLeft,
  FaSync,
  FaTasks,
  FaCheck,
  FaClock,
  FaChartLine,
  FaCalendar,
} from 'react-icons/fa';
import { MdOutlineEdit } from 'react-icons/md';
import { createTask } from '@/lib/actions/taskActions';
import { formatDateTime, formatTime } from '@/utils/dateFormatter';
import { getStatusColors, formatStatusText } from '@/utils/projectStatus';
import { getProgressColor, getProgressMessage } from '@/utils/projectProgress';
import { getProjectStats } from '@/utils/projectStats';
import { toast } from '@/components/ToastProvider';
import SkeletonLoader from '@/components/SkeletonLoader';
import TaskList from '@/components/TaskList';
import { useTeam } from '@/context/TeamContext';

interface ProjectDetailsPageClientProps {
  slug: string;
}

export default function ProjectDetailsPageClient({ slug }: ProjectDetailsPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [project, setProject] = useState<BaseProject | null>(null);
  const [tasks, setTasks] = useState<BaseTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  const { refresh: refreshTeam } = useTeam();

  const fetchProjectData = async () => {
    try {
      setIsRefreshing(true);
      setError(null);

      const projectRes = await fetch(`/api/projects/${slug}?t=${Date.now()}`);
      if (!projectRes.ok) throw new Error('Failed to fetch project');
      const projectData = await projectRes.json();

      if (projectData.status !== 'success') throw new Error(projectData.message || 'Project not found');

      setProject(projectData.project);

      const tasksRes = await fetch(`/api/projects/${slug}/tasks?t=${Date.now()}`);
      if (!tasksRes.ok) throw new Error('Failed to fetch tasks');
      const tasksData = await tasksRes.json();

      if (tasksData.status === 'success') {
        setTasks(tasksData.tasks);
      }

      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (slug) fetchProjectData();
  }, [slug]);

  // ADD TASK
  const handleAddTask = async (taskData: { name: string; assignedTo: string }) => {
    if (!project) return;
    try {
      const result = await createTask(project._id, taskData);
      if (result.success) {
        toast.success('Task added');
        setShowAddTaskModal(false);
        await fetchProjectData();
        await refreshTeam();
      } else throw new Error(result.error);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add task');
    }
  };

  // REFRESH
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchProjectData();
    await refreshTeam();
    setIsRefreshing(false);
  };

  const handleTaskUpdate = () => fetchProjectData();

  // EDIT PROJECT → opens modal
  const handleEditProject = () => setShowEditProjectModal(true);

  // UPDATE PROJECT → handles slug change + redirect
  const handleUpdateProject = async (projectData: {
    projectId: string;
    name: string;
    description?: string;
  }) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      const data = await res.json();

      if (data.status === 'success') {
        const updatedProject = data.project;

        // If slug changed → redirect to new URL
        if (updatedProject.slug !== slug) {
          const newUrl = `/projects/${updatedProject.slug}`;
          router.replace(newUrl); // seamless redirect without full reload
          toast.success(`Project updated! Redirecting...`);
        } else {
          await fetchProjectData();
          toast.success(`Project "${updatedProject.name}" updated`);
        }

        setShowEditProjectModal(false);
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Failed to update project');
    }
  };

  // Smart timestamp
  const isUpdated =
    project?.updatedAt && new Date(project.updatedAt) > new Date(project.createdAt);
  const timestamp = isUpdated ? project?.updatedAt : project?.createdAt;
  const timestampLabel = isUpdated ? 'Updated' : 'Created';

  const projectStats = project ? getProjectStats(project) : null;
  const statusColors = project ? getStatusColors(project.status) : { background: '', text: '' };

  // ORIGINAL SKELETON LOADER (100% preserved)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <SkeletonLoader width="w-32" height="h-6" className="mb-4" />
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                <div className="flex-1 space-y-3">
                  <SkeletonLoader width="w-3/4 sm:w-1/2" height="h-8" />
                  <SkeletonLoader width="w-full sm:w-3/4" height="h-5" />
                  <div className="flex items-center gap-4">
                    <SkeletonLoader width="w-32" height="h-4" />
                    <SkeletonLoader width="w-32" height="h-4" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <SkeletonLoader width="w-24" height="h-6" className="rounded-full" />
                  <SkeletonLoader width="w-20" height="h-6" className="rounded-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                    <SkeletonLoader width="w-12" height="h-8" className="mb-2" />
                    <SkeletonLoader width="w-20" height="h-4" />
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <SkeletonLoader width="w-32" height="h-4" />
                  <SkeletonLoader width="w-12" height="h-4" />
                </div>
                <SkeletonLoader width="w-full" height="h-3" className="rounded-full" />
                <SkeletonLoader width="w-48" height="h-3" className="mx-auto" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <SkeletonLoader width="w-40" height="h-7" />
            <div className="flex gap-3 self-end sm:self-auto">
              <SkeletonLoader width="w-24" height="h-10" />
              <SkeletonLoader width="w-32" height="h-10" />
            </div>
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <SkeletonLoader width="w-3/4" height="h-5" />
                    <SkeletonLoader width="w-1/2" height="h-4" />
                  </div>
                  <div className="flex gap-2">
                    <SkeletonLoader width="w-20" height="h-6" className="rounded-full" />
                    <SkeletonLoader width="w-8" height="h-8" variant="circle" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Project Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'This project may have been deleted.'}</p>
            <PrimaryButton onClick={() => router.push('/projects')} bgColor="bg-primary/10">
              Back to Projects
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <button
            onClick={() => router.push('/projects')}
            className="flex items-center gap-2 cursor-pointer text-primary hover:text-blue-800 transition-colors font-medium self-start"
          >
            <FaArrowLeft className='text-sm' />
            Back to Projects
          </button>

          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-500 hidden sm:block">
              Last synced: {formatTime(lastUpdated)}
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              <FaSync className={`text-sm ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
          </div>
        </div>

        {/* Project Info Card */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
            <div className="flex-1">
              {/* Name + Edit Icon */}
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-2xl uppercase sm:text-3xl font-bold text-gray-800 break-words flex-1">
                  {project.name}
                </h1>
                <button
                  onClick={handleEditProject}
                  className="p-2 text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-all flex-shrink-0"
                  title="Edit project"
                >
                  <MdOutlineEdit className="text-lg" />
                </button>
              </div>

              {/* Description + Edit Icon (perfectly aligned) */}
              {project.description && (
                <div className="flex items-start gap-3 mb-4">
                  <p className="text-gray-600 text-base sm:text-lg break-words flex-1 leading-relaxed">
                    {project.description}
                  </p>
                  <button
                    onClick={handleEditProject}
                    className="p-2 text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-all flex-shrink-0 mt-1"
                    title="Edit description"
                  >
                    <MdOutlineEdit className="text-base" />
                  </button>
                </div>
              )}

              {/* Smart Timestamp */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FaCalendar className="text-xs" />
                <span>
                  {timestampLabel}: {formatDateTime(timestamp)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors.background} ${statusColors.text}`}>
                {formatStatusText(project.status).toUpperCase()}
              </span>
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                {project.slug}
              </span>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center mb-6">
            <ProgressCard title="Total Tasks" value={projectStats!.totalTasks} icon={<FaTasks />} color="gray" />
            <ProgressCard title="Completed" value={projectStats!.completedTasks} icon={<FaCheck />} color="green" />
            <ProgressCard title="Pending" value={projectStats!.pendingTasks} icon={<FaClock />} color="blue" />
            <ProgressCard title="Progress" value={`${projectStats!.progress}%`} icon={<FaChartLine />} color="orange" />
          </div>

          {/* Progress Bar */}
          {projectStats!.totalTasks > 0 && (
            <div className="mt-4 sm:mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-bold text-gray-800">{projectStats!.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${projectStats!.progress}%`,
                    backgroundColor: getProgressColor(projectStats!.progress),
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 text-center mt-2 font-medium">
                {getProgressMessage(projectStats!.progress)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tasks */}
      <TaskList
        tasks={tasks}
        totalTasks={projectStats!.totalTasks}
        completedTasks={projectStats!.completedTasks}
        pendingTasks={projectStats!.pendingTasks}
        onTaskUpdate={handleTaskUpdate}
        onAddTask={() => setShowAddTaskModal(true)}
        error={error}
        pageSize={10}
      />

      {/* Modals */}
      <AddTaskModal
        isOpen={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onSubmit={handleAddTask}
      />

      <EditProjectModal
        isOpen={showEditProjectModal}
        onClose={() => setShowEditProjectModal(false)}
        onSubmit={handleUpdateProject}
        project={project}
      />
    </>
  );
}