// components/EditProjectModal.tsx
'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import PrimaryButton from '@/components/PrimaryButton';
import InputField from '@/components/InputField';
import TextAreaField from '@/components/TextAreaField';
import { BaseProject } from '@/types/project';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: { projectId: string; name: string; description?: string }) => void;
  project: BaseProject | null;
}

export default function EditProjectModal({
  isOpen,
  onClose,
  onSubmit,
  project,
}: EditProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when project changes or modal opens
  useEffect(() => {
    if (project && isOpen) {
      setName(project.name || '');
      setDescription(project.description || '');
    }
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !project) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        projectId: project._id,
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form fields
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
    }
    onClose();
  };

  const hasChanges = () => {
    if (!project) return false;
    return name !== project.name || description !== project.description;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel}>
      <h2 className="text-2xl font-bold mb-5 text-center">Edit Project</h2>

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
          label="Description"
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
            disabled={!name.trim() || isSubmitting || !hasChanges()}
            isLoading={isSubmitting}
            loadingText="Updating..."
            className="flex-1"
          >
            Update Project
          </PrimaryButton>
        </div>
      </form>
    </Modal>
  );
}