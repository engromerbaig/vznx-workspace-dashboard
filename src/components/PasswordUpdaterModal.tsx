'use client';

import { useState, FormEvent } from 'react';
import { FaLock } from 'react-icons/fa';
import { toast } from '@/components/ToastProvider';
import Modal from './Modal';
import { validatePassword } from '@/lib/passwordValidation';
import PrimaryButton from '@/components/PrimaryButton';
import InputField from '@/components/InputField';

interface PasswordUpdaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordChange: (currentPassword: string, newPassword: string) => Promise<void>;
}

export default function PasswordUpdaterModal({ isOpen, onClose, onPasswordChange }: PasswordUpdaterModalProps) {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate new password
    const validation = validatePassword(passwordData.newPassword);
    if (!validation.isValid) {
      toast.error(validation.message || 'Invalid password');
      return;
    }

    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setIsPasswordLoading(true);
    try {
      await onPasswordChange(passwordData.currentPassword, passwordData.newPassword);
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      onClose();
    } catch (err) {
      console.error('Error updating password:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Change Password</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <InputField
          label="Current Password"
          name="currentPassword"
          type="password"
          value={passwordData.currentPassword}
          onChange={handleInputChange}
          placeholder="Enter your current password"
          required={true}
          isPassword={true}
        />

        {/* New Password */}
        <InputField
          label="New Password"
          name="newPassword"
          type="password"
          value={passwordData.newPassword}
          onChange={handleInputChange}
          placeholder="Enter your new password"
          required={true}
          isPassword={true}
        />

        {/* Confirm New Password */}
        <InputField
          label="Confirm New Password"
          name="confirmNewPassword"
          type="password"
          value={passwordData.confirmNewPassword}
          onChange={handleInputChange}
          placeholder="Confirm your new password"
          required={true}
          isPassword={true}
        />

        {/* Submit Button */}
        <PrimaryButton
          type="submit"
          disabled={isPasswordLoading}
          isLoading={isPasswordLoading}
          loadingText="Updating Password..."
          showIcon={true}
          icon={FaLock}
          iconPosition="left"
          bgColor="bg-primary"
          hoverColor="bg-primary/90"
          textColor="text-white"
          rounded="rounded-lg"
          shadow={true}
          className="w-full py-3"
        >
          Change Password
        </PrimaryButton>
      </form>
    </Modal>
  );
}