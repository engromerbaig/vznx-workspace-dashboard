// src/components/TaskItem.tsx
'use client';

import { BaseTask } from '@/types/task';
import { FaTrash, FaCheck, FaCircle } from 'react-icons/fa';

interface TaskItemProps {
  task: BaseTask;
  onUpdate: (taskId: string, updates: Partial<BaseTask>) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskItem({ task, onUpdate, onDelete }: TaskItemProps) {
  const toggleStatus = () => {
    const newStatus = task.status === 'complete' ? 'incomplete' : 'complete';
    onUpdate(task._id, { status: newStatus });
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 transition-all ${
      task.status === 'complete' ? 'opacity-75' : ''
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Status Toggle */}
          <button
            onClick={toggleStatus}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              task.status === 'complete' 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'border-gray-300 hover:border-green-500'
            }`}
          >
            {task.status === 'complete' && <FaCheck className="text-xs" />}
          </button>

          {/* Task Info */}
          <div className="flex-1">
            <div className={`font-medium ${
              task.status === 'complete' 
                ? 'text-gray-500 line-through' 
                : 'text-gray-800'
            }`}>
              {task.name}
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <FaCircle className="text-xs text-blue-500" />
              Assigned to: {task.assignedTo}
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <button
          onClick={() => onDelete(task._id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors ml-2"
          title="Delete task"
        >
          <FaTrash className="text-sm" />
        </button>
      </div>
    </div>
  );
}