// components/TaskList.tsx
'use client';

import { BaseTask } from '@/types/task';
import TaskItem from '@/components/TaskItem';
import { TasksEmptyState } from '@/components/empty-states/TasksEmptyState';
import PrimaryButton from '@/components/PrimaryButton';
import { FaPlus, FaCheck, FaCircle } from 'react-icons/fa';

interface TaskListProps {
  tasks: BaseTask[];
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  onTaskUpdate: () => void;
  onAddTask: () => void;
  error?: string | null;
}

export default function TaskList({
  tasks,
  totalTasks,
  completedTasks,
  pendingTasks,
  onTaskUpdate,
  onAddTask,
  error
}: TaskListProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 animate-fadeIn">
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
        
        {/* Add Task Button - This was missing */}
        <div className="flex items-center gap-2 sm:gap-3">
          <PrimaryButton
            onClick={onAddTask}
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
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-shake">
          <div className="flex items-center gap-2 text-red-800">
            <FaCircle className="text-xs" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <TasksEmptyState onAddTask={onAddTask} />
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <div 
              key={task._id} 
              className="animate-fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <TaskItem
                task={task}
                onTaskUpdate={onTaskUpdate}
              />
            </div>
          ))}
        </div>
      )}

      {/* Tasks Summary */}
      {tasks.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 animate-fadeIn">
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
  );
}