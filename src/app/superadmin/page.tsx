'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useRealTimeUserCounts } from '@/hooks/useRealTimeUserCounts';
import PrimaryButton from '@/components/PrimaryButton';
import PageContainer from '@/components/ui/PageContainer';
import { FaUserShield, FaTachometerAlt, FaUsers, FaUserCog, FaUserTie, FaCircle } from 'react-icons/fa';
import ActivityTab from '@/components/admin/ActivityTab';
import CreateUserTab from '@/components/admin/CreateUserTab';
import UsersTab from '@/components/admin/UsersTab';
import SummaryBox, { UserSummaryBox, OnlineSummaryBox } from '@/components/ui/SummaryBox';
import UserInfo from '@/components/admin/UserInfo';
import SkeletonLoader from '@/components/SkeletonLoader';
import toast from 'react-hot-toast';
import { superAdminTabs } from '@/data/superadmin-data';
import { BaseUser, CreateUserData } from '@/types/user';
import { UserRole } from '@/lib/roles';

export default function SuperAdminPage() {
  const { user } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'activity' | 'create'>('users');
  const [users, setUsers] = useState<BaseUser[]>([]);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const { counts, isLoading: countsLoading } = useRealTimeUserCounts();

  const [newUser, setNewUser] = useState<CreateUserData>({
    email: '',
    username: '',
    name: '',
    password: '',
    role: 'user' as UserRole
  });

  useEffect(() => {
    if (user) {
      if (user.role !== 'superadmin') {
        router.replace('/dashboard');
      } else {
        fetchUsers();
      }
    }
  }, [user, router]);

  const fetchUsers = async () => {
    try {
      setIsUsersLoading(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.status === 'success') {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (data.status === 'success') {
        toast.success('User created successfully');
        setNewUser({
          email: '',
          username: '',
          name: '',
          password: '',
          role: 'user' as UserRole
        });
        setActiveTab('users');
      } else {
        toast.error(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Failed to create user');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.status === 'success') {
        toast.success('User deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
    }
  };

  // Skeleton loader for summary boxes
  const SummarySkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <SkeletonLoader width="w-24" height="h-4" />
            <SkeletonLoader width="w-8" height="h-8" variant="circle" />
          </div>
          <SkeletonLoader width="w-12" height="h-8" className="mb-2" />
          <SkeletonLoader width="w-32" height="h-3" />
        </div>
      ))}
    </div>
  );

  // Skeleton loader for user info
  const UserInfoSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index}>
          <SkeletonLoader width="w-20" height="h-3" className="mb-2" />
          <SkeletonLoader width="w-32" height="h-4" />
        </div>
      ))}
    </div>
  );

  // Skeleton loader for tabs
  const TabsSkeleton = () => (
    <div className="flex -mb-px">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center px-8 py-4">
          <SkeletonLoader width="w-4" height="h-4" className="mr-2" />
          <SkeletonLoader width="w-16" height="h-4" />
        </div>
      ))}
    </div>
  );

  const renderTabContent = () => {
    if (isUsersLoading && activeTab === 'users') {
      return (
        <div className="min-h-[400px] space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <SkeletonLoader width="w-10" height="h-10" variant="circle" />
                  <div className="space-y-2">
                    <SkeletonLoader width="w-32" height="h-4" />
                    <SkeletonLoader width="w-24" height="h-3" />
                  </div>
                </div>
                <SkeletonLoader width="w-20" height="h-8" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="min-h-[400px]">
        {activeTab === 'users' && <UsersTab users={users} onDeleteUser={handleDeleteUser} />}
        {activeTab === 'activity' && <ActivityTab />}
        {activeTab === 'create' && (
          <CreateUserTab 
            newUser={newUser} 
            setNewUser={setNewUser}
            isCreatingUser={isCreatingUser}
            onCreateUser={handleCreateUser}
          />
        )}
      </div>
    );
  };

  if (!user || user.role !== 'superadmin') {
    return null;
  }

  return (
     <PageContainer
      title="SuperAdmin Control Panel"
      description="Full system administration and monitoring"
      headerIcon={FaUserShield}
      contentMaxHeight="max-h-[calc(100vh-200px)]"
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
      userInfo={
        countsLoading ? <UserInfoSkeleton /> : <UserInfo user={user as unknown as BaseUser} />
      }
      userInfoLoading={countsLoading} // Use this instead of tabsSkeleton
      summarySection={{
        title: "System Overview",
        loading: countsLoading,
        content: countsLoading ? (
          <SummarySkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <UserSummaryBox
              title="Total Users"
              value={counts.totalUsers}
              description="All system users"
              icon={<FaUsers className="text-xl" />}
            />
            <SummaryBox
              title="Super Admins"
              value={counts.totalSuperadmins}
              description="Administrative users"
              icon={<FaUserShield className="text-xl" />}
              variant="error"
            />
            <SummaryBox
              title="Managers"
              value={counts.totalManagers}
              description="Management team"
              icon={<FaUserTie className="text-xl" />}
              variant="warning"
            />
            <OnlineSummaryBox
              title="Online Now"
              value={counts.totalOnline}
              description="Active users"
              icon={<FaCircle className="text-xl" />}
            />
          </div>
        )
      }}
      tabs={countsLoading ? 
        // Show empty tabs array when loading to trigger tabsLoading
        [] : 
        superAdminTabs.map(tab => ({
          ...tab,
          badge: tab.id === 'users' ? users.length : undefined
        }))
      }
      tabsLoading={countsLoading} // Use this prop
      tabsCount={3} // Number of skeleton tabs to show
      activeTab={activeTab}
      onTabChange={(tabId) => setActiveTab(tabId as 'users' | 'activity' | 'create')}
    >
      {renderTabContent()}
    </PageContainer>
  );
}