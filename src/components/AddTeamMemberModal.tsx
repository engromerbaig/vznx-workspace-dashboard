'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';
import PrimaryButton from '@/components/PrimaryButton';
import InputField from '@/components/InputField';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (memberData: { name: string; email: string; role: string; maxCapacity?: number }) => void;
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
  const [role, setRole] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(defaultMaxCapacity.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        email: email.trim(),
        role: role.trim() || 'Team Member',
        maxCapacity: parseInt(maxCapacity) || defaultMaxCapacity,
      });
      setName('');
      setEmail('');
      setRole('');
      setMaxCapacity(defaultMaxCapacity.toString());
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setEmail('');
    setRole('');
    setMaxCapacity(defaultMaxCapacity.toString());
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

        <InputField
          label="Role"
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g., Project Manager, Developer, Designer"
          disabled={isSubmitting}
        />

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
            💡 <strong>Capacity Note:</strong> This sets the maximum number of tasks this member can handle. 
            The team default is {defaultMaxCapacity} tasks.
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
            disabled={!name.trim() || !email.trim() || isSubmitting}
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