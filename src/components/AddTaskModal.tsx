'use client';

import { useState, useEffect } from 'react';
import Modal from './Modal';
import PrimaryButton from '@/components/PrimaryButton';
import InputField from '@/components/InputField';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: { name: string; assignedTo: string }) => void;
}

export default function AddTaskModal({ isOpen, onClose, onSubmit }: AddTaskModalProps) {
  const [name, setName] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Fetch team members when modal opens
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (isOpen) {
        setIsLoadingMembers(true);
        try {
          const res = await fetch('/api/team');
          const data = await res.json();
          
          if (data.status === 'success') {
            setTeamMembers(data.teamMembers);
          } else {
            console.error('Failed to fetch team members:', data.message);
            setTeamMembers([]);
          }
        } catch (error) {
          console.error('Failed to fetch team members:', error);
          setTeamMembers([]);
        } finally {
          setIsLoadingMembers(false);
        }
      }
    };

    fetchTeamMembers();
  }, [isOpen]);

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
            disabled={isSubmitting || isLoadingMembers}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-neutral-900 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            <option value="">Select team member</option>
            {isLoadingMembers ? (
              <option value="" disabled>Loading team members...</option>
            ) : teamMembers.length === 0 ? (
              <option value="" disabled>No team members available</option>
            ) : (
              teamMembers.map((member) => (
                <option key={member._id} value={member.name}>
                  {member.name} - {member.role}
                </option>
              ))
            )}
          </select>
          {teamMembers.length === 0 && !isLoadingMembers && (
            <p className="text-sm text-yellow-500 mt-1">
              No team members found. Add team members first.
            </p>
          )}
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
            disabled={!name.trim() || !assignedTo || isSubmitting || teamMembers.length === 0}
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