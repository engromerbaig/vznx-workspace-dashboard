// src/app/projects/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { BaseProject } from '@/types/project';
import { BaseTask } from '@/types/task';
import TaskItem from '@/components/TaskItem';
import AddTaskModal from '@/components/AddTaskModal';
import PrimaryButton from '@/components/PrimaryButton';
import { FaPlus, FaArrowLeft } from 'react-icons/fa';
import { FaSync } from 'react-icons/fa';
import { createTask } from '@/lib/actions/taskActions';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<BaseProject | null>(null);
  const [tasks, setTasks] = useState<BaseTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch project and tasks
  const fetchProjectData = async () => {
    try {
      setIsRefreshing(true);
      
      // Fetch project with real-time stats (cache bust with timestamp)
      const projectRes = await fetch(`/api/projects/${projectId}?t=${Date.now()}`);
      if (!projectRes.ok) {
        throw new Error('Failed to fetch project');
      }
      const projectData = await projectRes.json();

      if (projectData.status === 'success') {
        setProject(projectData.project);
      } else {
        throw new Error(projectData.message || 'Failed to fetch project');
      }

      // Fetch tasks (cache bust with timestamp)
      const tasksRes = await fetch(`/api/projects/${projectId}/tasks?t=${Date.now()}`);
      if (!tasksRes.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const tasksData = await tasksRes.json();

      if (tasksData.status === 'success') {
        setTasks(tasksData.tasks);
      } else {
        throw new Error(tasksData.message || 'Failed to fetch tasks');
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch project data:', error);
      // You might want to show an error toast here
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  // Add new task using server action
  const handleAddTask = async (taskData: { name: string; assignedTo: string }) => {
    try {
      const result = await createTask(projectId, taskData);
      
      if (result.success) {
        setShowAddTaskModal(false);
        // Refresh data to get updated stats
        await fetchProjectData();
      } else {
        throw new Error(result.error || 'Failed to create task');
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      // You might want to show an error toast here
    }
  };

  // Manual refresh
  const handleRefresh = async () => {
    await fetchProjectData();
  };

  // Handle task updates (for TaskItem callback)
  const handleTaskUpdate = () => {
    // Refresh project data to get updated stats
    fetchProjectData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
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

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
          <PrimaryButton onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </PrimaryButton>
        </div>
      </div>
    );
  }

  const completedTasks = project.taskStats?.completed ?? 0;
  const totalTasks = project.taskStats?.total ?? 0;
  const pendingTasks = project.taskStats?.incomplete ?? 0;
  const progress = project.progress ?? 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
            >
              <FaArrowLeft className="text-sm" />
              Back to Projects
            </button>
            
            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-500">
                Last updated: {formatLastUpdated(lastUpdated)}
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <FaSync className={`text-sm ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
          
          {/* Project Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{project.name}</h1>
                {project.description && (
                  <p className="text-gray-600 text-lg">{project.description}</p>
                )}
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(project.status)} whitespace-nowrap`}>
                {project.status.replace('-', ' ').toUpperCase()}
              </span>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-gray-800">{totalTasks}</div>
                <div className="text-sm text-gray-600 font-medium">Total Tasks</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                <div className="text-sm text-green-700 font-medium">Completed</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{pendingTasks}</div>
                <div className="text-sm text-blue-700 font-medium">Pending</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">{progress}%</div>
                <div className="text-sm text-orange-700 font-medium">Progress</div>
              </div>
            </div>

            {/* Progress Bar */}
            {totalTasks > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm font-bold text-gray-800">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: 
                        progress === 100 ? '#10B981' : 
                        progress >= 50 ? '#3B82F6' : 
                        '#F59E0B'
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 text-center mt-2 font-medium">
                  {progress === 100 ? '🎉 Project Completed!' : 
                   progress >= 75 ? '🔥 Almost there!' :
                   progress >= 50 ? '⚡ Good progress' :
                   progress >= 25 ? '📈 Making progress' : '🚀 Getting started'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Tasks Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Tasks</h2>
              <p className="text-gray-600 text-sm mt-1">
                {totalTasks === 0 ? 'No tasks yet' : `${totalTasks} task${totalTasks !== 1 ? 's' : ''} in total`}
              </p>
            </div>
            <div className="flex items-center gap-3">
             
              <PrimaryButton
                onClick={() => setShowAddTaskModal(true)}
                showIcon={true}
                icon={FaPlus}
              >
                Add Task
              </PrimaryButton>
            </div>
          </div>

          {/* Tasks List */}
          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <div className="text-gray-500 text-lg mb-4">No tasks yet</div>
              <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                Get started by adding your first task to this project. Tasks help you track progress and assign work to team members.
              </p>
              <PrimaryButton
                onClick={() => setShowAddTaskModal(true)}
                showIcon={true}
                icon={FaPlus}
              >
                Add First Task
              </PrimaryButton>
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
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>
                  Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {completedTasks} completed
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
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