'use client';

import { useState } from 'react';
import Modal from '@/components/Modal';
import PrimaryButton from '@/components/PrimaryButton';
import InputField from '@/components/InputField';
import TextAreaField from '@/components/TextAreaField';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: { name: string; description?: string }) => void;
}

export default function AddProjectModal({
  isOpen,
  onClose,
  onSubmit,
}: AddProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName('');
      setDescription('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      <h2 className="text-2xl font-bold mb-5 text-center">Create New Project</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Project Name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter project name"
          disabled={isSubmitting}
        />

        <TextAreaField
          label="Description (Optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter project description"
          disabled={isSubmitting}
          rows={3}
        />

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
            disabled={!name.trim() || isSubmitting}
            isLoading={isSubmitting}
            loadingText="Creating..."
            className="flex-1"
          >
            Create Project
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}
