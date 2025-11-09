// src/app/user/[username]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from '@/components/ToastProvider';
import { FaUser, FaTachometerAlt } from 'react-icons/fa';
import PasswordUpdaterModal from '@/components/PasswordUpdaterModal';
import PageContainer from '@/components/ui/PageContainer';
import PrimaryButton from '@/components/PrimaryButton';
import { UserActivityLogs } from '@/components/user/UserActivityLogs';
import AccountInfo from '@/components/user/AccountInfo';
import { BaseUser } from '@/types/user';

export default function UserDetailsPage() {
  const [user, setUser] = useState<BaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const username = params.username as string;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          method: 'GET',
          cache: 'no-store',
        });
        const data = await res.json();

        if (data.status === 'success') {
          if (data.user.username !== username) {
            toast.error('Unauthorized access');
            router.push('/dashboard');
            return;
          }
          setUser(data.user);
        } else {
          toast.error(data.message || 'Failed to fetch user details');
          router.push('/dashboard');
        }
      } catch (err) {
        console.error('Error fetching user details:', err);
        toast.error('Something went wrong. Please try again.');
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchUserDetails();
    }
  }, [username, router]);

  const handleOpenPasswordModal = () => {
    toast.custom(
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-lg max-w-sm">
        <p className="text-gray-800 font-medium mb-3">Are you sure you want to change your password?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsModalOpen(true);
              toast.dismiss();
            }}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            Yes, Change
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        duration: Infinity, // Keep it open until user interacts
      }
    );
  };

 // In your UserDetailsPage component, update the handlePasswordChange function:
const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });
    const data = await res.json();

    if (data.status === 'success') {
      toast.success('Password updated successfully. Logging you out...');
      // Force logout by clearing the session and redirecting
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/');
    } else {
      throw new Error(data.message || 'Failed to update password');
    }
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Failed to update password');
  }
};

  if (!user) {
    return null;
  }

  return (
    <>
      <PageContainer
        title="User Profile"
        description={`Profile details for ${user.name}`}
        headerIcon={FaUser}
        headerAction={
          <PrimaryButton
            onClick={() => router.push('/dashboard')}
            showIcon={true}
            bgColor='bg-white'
            textColor='text-primary'
            hoverColor='bg-gray-100'
            icon={FaTachometerAlt}
          >
            Dashboard
          </PrimaryButton>
        }
        maxWidth="7xl"
        contentScrollable={false}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Details */}
          <div className="lg:col-span-1">
            <AccountInfo 
              user={user} 
              onPasswordChange={handleOpenPasswordModal}
            />
          </div>

          {/* Right Column - Activity Logs */}
          <div className="lg:col-span-2">
            <UserActivityLogs username={user.username} />
          </div>
        </div>
      </PageContainer>

      <PasswordUpdaterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPasswordChange={handlePasswordChange}
      />
    </>
  );
}