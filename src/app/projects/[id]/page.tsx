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

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<BaseProject | null>(null);
  const [tasks, setTasks] = useState<BaseTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Fetch project and tasks
  const fetchProjectData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch project
      const projectRes = await fetch(`/api/projects/${projectId}`);
      const projectData = await projectRes.json();

      if (projectData.status === 'success') {
        setProject(projectData.project);
      }

      // Fetch tasks
      const tasksRes = await fetch(`/api/projects/${projectId}/tasks`);
      const tasksData = await tasksRes.json();

      if (tasksData.status === 'success') {
        setTasks(tasksData.tasks);
      }
    } catch (error) {
      console.error('Failed to fetch project data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  // Add new task
  const handleAddTask = async (taskData: { name: string; assignedTo: string }) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });

      const data = await res.json();

      if (data.status === 'success') {
        setTasks(prev => [data.task, ...prev]);
        setShowAddTaskModal(false);
        // Refresh project to update progress
        fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  // Update task status
  const handleUpdateTask = async (taskId: string, updates: Partial<BaseTask>) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await res.json();

      if (data.status === 'success') {
        setTasks(prev => prev.map(task => 
          task._id === taskId ? data.task : task
        ));
        // Refresh project to update progress
        fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.status === 'success') {
        setTasks(prev => prev.filter(task => task._id !== taskId));
        // Refresh project to update progress
        fetchProjectData();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
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
          <PrimaryButton onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </PrimaryButton>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.status === 'complete').length;
  const totalTasks = tasks.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <FaArrowLeft />
            Back to Projects
          </button>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
                {project.description && (
                  <p className="text-gray-600 mt-2">{project.description}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                project.status === 'completed' ? 'bg-green-100 text-green-800' :
                project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {project.status.replace('-', ' ')}
              </span>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-800">{totalTasks}</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{project.progress}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tasks</h2>
          <PrimaryButton
            onClick={() => setShowAddTaskModal(true)}
            showIcon={true}
            icon={FaPlus}
          >
            Add Task
          </PrimaryButton>
        </div>

        {/* Tasks List */}
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-gray-500 text-lg mb-4">No tasks yet</div>
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
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}

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