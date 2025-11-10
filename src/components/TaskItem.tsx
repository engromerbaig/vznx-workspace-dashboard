'use client';

import { BaseTask } from '@/types/task';
import { FaTrash, FaCheck, FaCircle, FaUser, FaClock, FaEdit } from 'react-icons/fa';
import { FaCalendar } from 'react-icons/fa';
import { formatDateTime } from '@/utils/dateFormatter';
import { useState } from 'react';
import { updateTaskStatus, deleteTask } from '@/lib/actions/taskActions';
import { toast } from '@/components/ToastProvider';

interface TaskItemProps {
  task: BaseTask;
  onTaskUpdate?: () => void; // Optional callback for parent component
}

export default function TaskItem({ task, onTaskUpdate }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleStatus = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const newStatus = task.status === 'complete' ? 'incomplete' : 'complete';
      const result = await updateTaskStatus(task._id, newStatus);

      if (result.success) {
        toast.success(`Task marked as ${newStatus}`); // Toast for status update
        onTaskUpdate?.(); // Trigger parent refresh if needed
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task status');
    } finally {
      setIsUpdating(false);
    }
  };

const handleDelete = async () => {
  // Show a confirmation toast
  toast.custom((t) => (
    <div
      className={`bg-white border border-gray-200 rounded-lg p-4 shadow-md flex flex-col sm:flex-row items-center gap-4 ${
        t.visible ? 'animate-enter' : 'animate-leave'
      }`}
    >
      <span className="text-gray-800">Are you sure you want to delete this task?</span>
      <div className="flex gap-2 mt-2 sm:mt-0">
        <button
          onClick={async () => {
            try {
              const result = await deleteTask(task._id);
              if (result.success) {
                toast.success('Task deleted successfully'); // success toast
                onTaskUpdate?.(); // refresh parent
              }
            } catch (error) {
              console.error('Failed to delete task:', error);
              toast.error('Failed to delete task'); // failure toast
            }
          }}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
        >
          Yes
        </button>
        <button
          className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300 transition"
        >
          No
        </button>
      </div>
    </div>
  ));
};


  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border transition-all duration-300 ${
      task.status === 'complete' ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:border-blue-300'
    } ${isUpdating ? 'opacity-50' : ''}`}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {/* Checkbox Toggle */}
            <button
              onClick={toggleStatus}
              disabled={isUpdating}
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                task.status === 'complete' 
                  ? 'bg-green-500 border-green-500 text-white shadow-sm' 
                  : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
              } ${isUpdating ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {task.status === 'complete' && <FaCheck className="text-xs" />}
            </button>

            {/* Task Info */}
            <div className="flex-1 cursor-pointer" onClick={toggleExpand}>
              <div className={`font-medium transition-colors ${
                task.status === 'complete' 
                  ? 'text-gray-500 line-through' 
                  : 'text-gray-800 hover:text-gray-900'
              }`}>
                {task.name}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                <FaCircle className={`text-xs ${task.status === 'complete' ? 'text-green-500' : 'text-blue-500'}`} />
                <span>Assigned to: <span className="font-medium">{task.assignedTo}</span></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleExpand}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="View details"
            >
              <FaEdit className="text-sm" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-red-400 cursor-pointer hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete task"
            >
              <FaTrash className="text-sm" />
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              {/* Created Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-400 text-xs" />
                  <span className="font-medium">Created by:</span>
                  <span>{task.createdBy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendar className="text-gray-400 text-xs" />
                  <span className="font-medium">Created:</span>
                  <span title={formatDateTime(task.createdAt, { includeTime: true })}>
                    {formatDateTime(task.createdAt)}
                  </span>
                </div>
              </div>

              {/* Updated Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-400 text-xs" />
                  <span className="font-medium">Last updated by:</span>
                  <span>{task.lastModifiedBy || task.createdBy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaClock className="text-gray-400 text-xs" />
                  <span className="font-medium">Last updated:</span>
                  <span title={formatDateTime(task.updatedAt, { includeTime: true })}>
                    {formatDateTime(task.updatedAt)}
                  </span>
                </div>
              </div>

              {/* Completion Info */}
              {task.completedAt && (
                <div className="col-span-2 flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                  <FaCheck className="text-green-500 text-xs" />
                  <span className="font-medium text-green-800">Completed on:</span>
                  <span className="text-green-700" title={formatDateTime(task.completedAt, { includeTime: true })}>
                    {formatDateTime(task.completedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
