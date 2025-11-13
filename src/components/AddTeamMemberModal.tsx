// src/components/AddTeamMemberModal.tsx
'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import PrimaryButton from '@/components/PrimaryButton';
import InputField from '@/components/InputField';
import { TeamMemberRole, DEFAULT_ROLES } from '@/types/team'; // ← from types/team.ts

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (memberData: {
    name: string;
    email: string;
    role: TeamMemberRole;
    maxCapacity?: number;
  }) => void;
  defaultMaxCapacity?: number;
}

export default function AddTeamMemberModal({
  isOpen,
  onClose,
  onSubmit,
  defaultMaxCapacity = 8,
}: AddTeamMemberModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TeamMemberRole | ''>('');
  const [maxCapacity, setMaxCapacity] = useState(defaultMaxCapacity.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMaxCapacity(defaultMaxCapacity.toString());
  }, [defaultMaxCapacity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !role) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        role: role as TeamMemberRole,
        maxCapacity: parseInt(maxCapacity) || defaultMaxCapacity,
      });
      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setRole('');
    setMaxCapacity(defaultMaxCapacity.toString());
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      <h2 className="text-2xl font-bold mb-5 text-center">Add Team Member</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Full Name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter team member's name"
          disabled={isSubmitting}
        />

        <InputField
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter team member's email"
          disabled={isSubmitting}
        />

        <div>
          <label className="block text-sm font-medium mb-2">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as TeamMemberRole)}
            required
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-gray-600 rounded-md bg-neutral-900 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-700 disabled:cursor-not-allowed"
          >
            <option value="">Select a role</option>
            {DEFAULT_ROLES.map((roleName) => (
              <option key={roleName} value={roleName}>
                {roleName}
              </option>
            ))}
          </select>
        </div>

        <InputField
          label="Max Capacity (Tasks)"
          type="number"
          value={maxCapacity}
          onChange={(e) => setMaxCapacity(e.target.value)}
          placeholder="Enter maximum task capacity"
          disabled={isSubmitting}
          min="1"
          max="20"
        />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
          <div className="text-xs text-blue-800">
            Team Default: The current team capacity is set to {defaultMaxCapacity} tasks. 
            You can override this for individual members if needed.
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <PrimaryButton
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </PrimaryButton>

          <PrimaryButton
            type="submit"
            disabled={!name.trim() || !email.trim() || !role || isSubmitting}
            isLoading={isSubmitting}
            loadingText="Adding..."
            className="flex-1"
          >
            Add Team Member
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}