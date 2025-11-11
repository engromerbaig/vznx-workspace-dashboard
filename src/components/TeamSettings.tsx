// src/components/TeamSettings.tsx
'use client';

import { useState } from 'react';
import { FaCog, FaUsers } from 'react-icons/fa';
import InputField from './InputField';
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';

interface TeamSettingsProps {
  maxCapacity: number;
  onMaxCapacityChange: (newCapacity: number) => void;
}

export default function TeamSettings({ maxCapacity, onMaxCapacityChange }: TeamSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempCapacity, setTempCapacity] = useState(maxCapacity.toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    const newCapacity = parseInt(tempCapacity);
    if (newCapacity >= 1 && newCapacity <= 20) {
      setIsSubmitting(true);
      try {
        await onMaxCapacityChange(newCapacity);
        setIsOpen(false);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setTempCapacity(maxCapacity.toString());
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Settings Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all duration-200 hover:shadow-md group"
      >
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
          <FaCog className="text-primary text-lg" />
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold text-primary/70">Team Settings</div>
          <div className="text-xs text-primary">Max Capacity: {maxCapacity} tasks</div>
        </div>
      </button>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={handleClose}>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
            <FaUsers className="text-primary text-xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Team Capacity Settings</h2>
            <p className="text-sm text-gray-200">Set maximum tasks per team member</p>
          </div>
        </div>

        <div className="space-y-4">
          <InputField
            label="Maximum Tasks Per Member"
            type="number"
            value={tempCapacity}
            onChange={(e) => setTempCapacity(e.target.value)}
            placeholder="Enter max capacity"
            min="1"
            max="20"
            required
            disabled={isSubmitting}
          />
          
          <div className="bg-primary/50 border border-primary/80 rounded-lg p-3">
            <div className="text-xs text-white font-medium">
              💡 Recommendation: Set between 5-12 tasks based on your team's capacity
            </div>
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
              type="button"
              onClick={handleSave}
              disabled={!tempCapacity || parseInt(tempCapacity) < 1 || parseInt(tempCapacity) > 20 || isSubmitting}
              isLoading={isSubmitting}
              loadingText="Saving..."
              className="flex-1"
            >
              Save Changes
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}