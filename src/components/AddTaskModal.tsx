'use client';

import { useState } from 'react';
import Modal from './Modal';
import PrimaryButton from '@/components/PrimaryButton';
import InputField from '@/components/InputField';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: { name: string; assignedTo: string }) => void;
}

export default function AddTaskModal({ isOpen, onClose, onSubmit }: AddTaskModalProps) {
  const [name, setName] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const teamMembers = ['Sarah Chen', 'Mike Rodriguez', 'Emma Wilson', 'Alex Thompson'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !assignedTo.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        assignedTo: assignedTo.trim(),
      });
      setName('');
      setAssignedTo('');
      onClose(); // Close after adding task
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setAssignedTo('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <h2 className="text-xl font-bold mb-4">Add New Task</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Task Name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter task name"
          disabled={isSubmitting}
        />

        <div>
          <label className="block text-sm font-medium mb-2">Assign To</label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-neutral-900 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            <option value="">Select team member</option>
            {teamMembers.map((member) => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <PrimaryButton
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </PrimaryButton>

          <PrimaryButton
            type="submit"
            disabled={!name.trim() || !assignedTo || isSubmitting}
            isLoading={isSubmitting}
            loadingText="Adding..."
            className="flex-1"
          >
            Add Task
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
