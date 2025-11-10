// src/app/projects/[slug]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BaseProject } from '@/types/project';
import { BaseTask } from '@/types/task';
import TaskItem from '@/components/TaskItem';
import AddTaskModal from '@/components/AddTaskModal';
import PrimaryButton from '@/components/PrimaryButton';
import { FaPlus, FaArrowLeft, FaCheck, FaCircle } from 'react-icons/fa';
import { FaSync } from 'react-icons/fa';
import { createTask } from '@/lib/actions/taskActions';
import { formatDateTime, formatTime } from '@/utils/dateFormatter';
import { getStatusColors } from '@/utils/projectStatus';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectSlug = params.slug as string;

  const [project, setProject] = useState<BaseProject | null>(null);
  const [tasks, setTasks] = useState<BaseTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  // Fetch project and tasks
  const fetchProjectData = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      // Fetch project by slug
      const projectRes = await fetch(`/api/projects/${projectSlug}?t=${Date.now()}`);
      if (!projectRes.ok) {
        if (projectRes.status === 404) {
          throw new Error('Project not found');
        }
        throw new Error('Failed to fetch project');
      }
      
      const projectData = await projectRes.json();

      if (projectData.status === 'success') {
        setProject(projectData.project);
        
        // ✅ FIXED: Use the slug-based tasks endpoint
        const tasksRes = await fetch(`/api/projects/${projectSlug}/tasks?t=${Date.now()}`);
        if (!tasksRes.ok) {
          throw new Error('Failed to fetch tasks');
        }
        
        const tasksData = await tasksRes.json();

        if (tasksData.status === 'success') {
          setTasks(tasksData.tasks);
        } else {
          throw new Error(tasksData.message || 'Failed to fetch tasks');
        }
      } else {
        throw new Error(projectData.message || 'Failed to fetch project');
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch project data:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (projectSlug) {
      fetchProjectData();
    }
  }, [projectSlug]);

  // Add new task using server action
  const handleAddTask = async (taskData: { name: string; assignedTo: string }) => {
    try {
      if (!project) return;
      
      const result = await createTask(project._id, taskData);
      
      if (result.success) {
        setShowAddTaskModal(false);
        await fetchProjectData();
      } else {
        throw new Error(result.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      setError(error instanceof Error ? error.message : 'Failed to create task');
    }
  };

  // Manual refresh
  const handleRefresh = async () => {
    await fetchProjectData();
  };

  // Handle task updates (for TaskItem callback)
  const handleTaskUpdate = () => {
    fetchProjectData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            {/* Back button skeleton */}
            <div className="h-6 bg-gray-200 rounded w-24 mb-6"></div>
            
            {/* Project header skeleton */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              
              {/* Progress stats skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4">
                    <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks header skeleton */}
            <div className="flex justify-between items-center mb-6">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="flex gap-3">
                <div className="h-10 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded w-24"></div>
              </div>
            </div>

            {/* Tasks list skeleton */}
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Project Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <PrimaryButton onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Project Not Found</h1>
            <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
            <PrimaryButton onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  const completedTasks = project.taskStats?.completed ?? 0;
  const totalTasks = project.taskStats?.total ?? 0;
  const pendingTasks = project.taskStats?.incomplete ?? 0;
  const progress = project.progress ?? 0;

  const statusColors = getStatusColors(project.status);

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 50) return 'bg-primary/80';
    return 'bg-yellow-500';
  };

  const getProgressMessage = (progress: number) => {
    if (progress === 100) return '🎉 Project Completed!';
    if (progress >= 75) return '🔥 Almost there!';
    if (progress >= 50) return '⚡ Good progress';
    if (progress >= 25) return '📈 Making progress';
    return '🚀 Getting started';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-primary hover:text-blue-800 transition-colors font-medium self-start"
            >
              <FaArrowLeft className="text-sm" />
              Back to Projects
            </button>
            
            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-500 hidden sm:block">
                Last updated: {formatTime(lastUpdated)}
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                title="Refresh data"
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
                <h1 className="text-2xl uppercase sm:text-3xl font-bold text-gray-800 mb-2 break-words">
                  {project.name}
                </h1>
                {project.description && (
                  <p className="text-gray-600 text-base sm:text-lg break-words">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span>Created: {formatDateTime(project.createdAt)}</span>
                  <span>Updated: {formatDateTime(project.updatedAt)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors.background} ${statusColors.text} whitespace-nowrap`}>
                  {project.status.replace('-', ' ').toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 whitespace-nowrap">
                  {project.slug}
                </span>
              </div>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center mb-6">
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                <div className="text-xl sm:text-2xl font-bold text-gray-800">{totalTasks}</div>
                <div className="text-xs sm:text-sm text-gray-600 font-medium">Total Tasks</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
                <div className="text-xl sm:text-2xl font-bold text-green-600">{completedTasks}</div>
                <div className="text-xs sm:text-sm text-green-700 font-medium">Completed</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                <div className="text-xl sm:text-2xl font-bold text-primary">{pendingTasks}</div>
                <div className="text-xs sm:text-sm text-primary/90 font-medium">Pending</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 sm:p-4 border border-orange-200">
                <div className="text-xl sm:text-2xl font-bold text-orange-600">{progress}%</div>
                <div className="text-xs sm:text-sm text-orange-700 font-medium">Progress</div>
              </div>
            </div>

            {/* Progress Bar */}
            {totalTasks > 0 && (
              <div className="mt-4 sm:mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm font-bold text-gray-800">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                  <div 
                    className={`h-2 sm:h-3 rounded-full transition-all duration-500 ease-out ${getProgressColor(progress)}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-center mt-2 font-medium">
                  {getProgressMessage(progress)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          {/* Tasks Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Tasks</h2>
              <p className="text-gray-600 text-sm mt-1">
                {totalTasks === 0 ? 'No tasks yet' : `${totalTasks} task${totalTasks !== 1 ? 's' : ''} in total`}
                {totalTasks > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({completedTasks} completed • {pendingTasks} pending)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
       
              <PrimaryButton
                onClick={() => setShowAddTaskModal(true)}
                showIcon={true}
                icon={FaPlus}
              >
                <span className="hidden sm:inline">Add Task</span>
                <span className="sm:hidden">Add</span>
              </PrimaryButton>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <FaCircle className="text-xs" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Tasks List */}
          {tasks.length === 0 ? (
           <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
  <div className="text-gray-400 text-4xl sm:text-6xl mb-3 sm:mb-4">📝</div>
  <div className="text-gray-500 text-lg mb-3 sm:mb-4">No tasks yet</div>
  <p className="text-gray-400 text-sm mb-4 sm:mb-6 max-w-md mx-auto px-4">
    Get started by adding your first task to this project. Tasks help you track progress and assign work to team members.
  </p>
  
  {/* ✅ Center button horizontally */}
  <div className="flex justify-center">
    <PrimaryButton
      onClick={() => setShowAddTaskModal(true)}
      showIcon={true}
      icon={FaPlus}
    >
      Add First Task
    </PrimaryButton>
  </div>
</div>

          ) : (
            <div className="space-y-3">
              {tasks.map(task => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onTaskUpdate={handleTaskUpdate}
                />
              ))}
            </div>
          )}

          {/* Tasks Summary */}
          {tasks.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-gray-600">
                <span className="text-center sm:text-left">
                  Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center justify-center sm:justify-start gap-4">
                  <span className="flex items-center gap-1">
                    <FaCheck className="text-green-500 text-xs" />
                    {completedTasks} completed
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCircle className="text-primary/80 text-xs" />
                    {pendingTasks} pending
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Task Modal */}
        <AddTaskModal
          isOpen={showAddTaskModal}
          onClose={() => setShowAddTaskModal(false)}
          onSubmit={handleAddTask}
        />
      </div>
    </div>
  );
}