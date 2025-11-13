// src/components/AddTaskModal.tsx
'use client';

import { useState } from 'react';
import Modal from './Modal';
import PrimaryButton from '@/components/PrimaryButton';
import InputField from '@/components/InputField';
import { useTeam } from '@/context/TeamContext';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: { name: string; assignedTo: string }) => Promise<void>;
}

export default function AddTaskModal({ isOpen, onClose, onSubmit }: AddTaskModalProps) {
  const [name, setName] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { availableMembers, loading: loadingMembers, refresh } = useTeam();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !assignedTo.trim()) return;

    setIsSubmitting(true);
    try {
      // 1. Submit task
      await onSubmit({
        name: name.trim(),
        assignedTo,
      });

      // 2. REFRESH TEAM DATA IMMEDIATELY
      await refresh();

      // 3. Reset form & close
      setName('');
      setAssignedTo('');
      onClose();
    } catch (error) {
      console.error('Failed to add task:', error);
      // Optionally show toast
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
          disabled={isSubmitting || loadingMembers}
        />

        <div>
          <label className="block text-sm font-medium mb-2">Assign To</label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            required
            disabled={isSubmitting || loadingMembers}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-neutral-900 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            <option value="">Select team member</option>
            {loadingMembers ? (
              <option value="" disabled>Refreshing members...</option>
            ) : availableMembers.length === 0 ? (
              <option value="" disabled>No available members (all at capacity)</option>
            ) : (
              availableMembers.map((member) => (
                <option key={member._id} value={member.name}>
                  {member.name} - {member.role} ({member.taskCount}/{member.maxCapacity})
                </option>
              ))
            )}
          </select>

          {availableMembers.length === 0 && !loadingMembers && (
            <p className="text-sm text-yellow-500 mt-1">
              All team members are at full capacity.
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <PrimaryButton
            type="button"
            onClick={handleClose}
            disabled={isSubmitting || loadingMembers}
            className="flex-1"
          >
            Cancel
          </PrimaryButton>

          <PrimaryButton
            type="submit"
            disabled={
              !name.trim() ||
              !assignedTo ||
              isSubmitting ||
              loadingMembers ||
              availableMembers.length === 0
            }
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