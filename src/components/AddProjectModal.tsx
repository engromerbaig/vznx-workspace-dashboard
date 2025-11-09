// src/components/AddProjectModal.tsx
'use client';

import { useState } from 'react';
import PrimaryButton from '@/components/PrimaryButton';
import InputField from '@/components/InputField';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: { name: string; description?: string }) => void;
}

export default function AddProjectModal({ isOpen, onClose, onSubmit }: AddProjectModalProps) {
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
        description: description.trim() || undefined
      });
      setName('');
      setDescription('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-black rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-bold  mb-4">Create New Project</h2>
          
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
            
            <div>
              <label className="block text-sm font-medium  mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter project description"
                disabled={isSubmitting}
                rows={3}
                className="w-full px-3 py-2 border border-secondary rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              
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
        </div>
      </div>
    </div>
  );
}