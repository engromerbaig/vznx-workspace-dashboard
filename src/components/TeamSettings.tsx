// src/components/TeamSettings.tsx
'use client';

import { useState } from 'react';
import { FaCog, FaUsers, FaSave, FaTimes } from 'react-icons/fa';
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
      {/* Settings Button using PrimaryButton */}
      <PrimaryButton
        onClick={() => setIsOpen(true)}
        bgColor="bg-primary/10"
        textColor="text-primary/70"
        hoverColor="bg-primary/40"
        hoverTextColor="text-primary"
        border={true}
        borderColor="border-blue-200"
        hoverBorderColor="border-blue-300"
        rounded="rounded-xl"
        shadow={true}
        showIcon={true}
        icon={FaCog}
        iconPosition="left"
        className="px-4 py-3 gap-3"
      >
        <div className="text-left">
          <div className="text-sm font-semibold">Team Settings</div>
          <div className="text-xs">Max Capacity: {maxCapacity} tasks</div>
        </div>
      </PrimaryButton>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={handleClose}>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/40 rounded-xl">
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
            {/* Cancel Button using PrimaryButton */}
            <PrimaryButton
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              bgColor="bg-gray-600"
              textColor="text-white"
              hoverColor="bg-gray-700"
              border={true}
              borderColor="border-gray-500"
              rounded="rounded-lg"
              showIcon={true}
              icon={FaTimes}
              iconPosition="left"
              className="flex-1"
            >
              Cancel
            </PrimaryButton>

            {/* Save Button using PrimaryButton */}
            <PrimaryButton
              type="button"
              onClick={handleSave}
              disabled={!tempCapacity || parseInt(tempCapacity) < 1 || parseInt(tempCapacity) > 20 || isSubmitting}
              isLoading={isSubmitting}
              loadingText="Saving..."
              bgColor="bg-primary"
              textColor="text-white"
              hoverColor="bg-primary/90"
              border={true}
              borderColor="border-primary"
              rounded="rounded-lg"
              showIcon={true}
              icon={FaSave}
              iconPosition="left"
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