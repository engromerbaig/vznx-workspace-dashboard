// app/team/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { TeamMemberWithWorkload, TeamWorkloadStats } from '@/types/team';
import TeamMemberCard from '@/components/TeamMemberCard';
import AddTeamMemberModal from '@/components/AddTeamMemberModal';
import TeamSettings from '@/components/TeamSettings';
import ProgressCard from '@/components/ProgressCard';
import CapacityLegend from '@/components/CapacityLegend';
import PrimaryButton from '@/components/PrimaryButton';
import Pagination from '@/components/Pagination';
import SkeletonLoader from '@/components/SkeletonLoader';
import { usePagination } from '@/hooks/usePagination';
import { FaPlus, FaUsers, FaTasks, FaCheckCircle, FaExclamationTriangle, FaCog } from 'react-icons/fa';
import { toast } from '@/components/ToastProvider';
import { TeamEmptyState } from '@/components/empty-states/TeamEmptyState';
import Header from '@/components/Header';
import { IoPeople } from 'react-icons/io5';

export default function TeamPageClient() {
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithWorkload[]>([]);
  const [teamStats, setTeamStats] = useState<TeamWorkloadStats>({
    totalMembers: 0,
    totalTasks: 0,
    comfortableLoad: 0,
    heavyLoad: 0,
    averageCapacity: 0,
    totalMaxCapacity: 0
  });
  const [globalMaxCapacity, setGlobalMaxCapacity] = useState(8);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [totalTeamMembersCount, setTotalTeamMembersCount] = useState(0);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const pagination = usePagination({
    totalItems: totalTeamMembersCount,
    pageSize: 6, 
    initialPage: 1,
    maxVisiblePages: 5
  });

  // Fetch team members with pagination
  const fetchTeamMembers = async (page: number = 1, isInitial: boolean = false) => {
    try {
      if (isInitial) {
        setIsInitialLoading(true);
      } else {
        setIsRefreshing(true);
      }

      const response = await fetch(`/api/team?page=${page}&limit=6`);
      const data = await response.json();

      if (data.status === 'success') {
        setTeamMembers(data.teamMembers);
        setTotalTeamMembersCount(data.pagination.totalMembers);
        setTeamStats(data.teamStats || calculateTeamStats(data.teamMembers));
        setHasLoadedOnce(true);
        
        // Set global max capacity from the first member (all should be same)
        if (data.teamMembers.length > 0) {
          setGlobalMaxCapacity(data.teamMembers[0].maxCapacity);
        }
      } else {
        setTeamMembers([]);
        setTeamStats({
          totalMembers: 0,
          totalTasks: 0,
          comfortableLoad: 0,
          heavyLoad: 0,
          averageCapacity: 0,
          totalMaxCapacity: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      setTeamMembers([]);
      setTeamStats({
        totalMembers: 0,
        totalTasks: 0,
        comfortableLoad: 0,
        heavyLoad: 0,
        averageCapacity: 0,
        totalMaxCapacity: 0
      });
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fallback team stats calculation (client-side, in case server doesn't provide)
  const calculateTeamStats = (members: TeamMemberWithWorkload[]): TeamWorkloadStats => {
    const totalMembers = members.length;
    const totalTasks = members.reduce((sum, member) => sum + member.taskCount, 0);
    const totalMaxCapacity = members.reduce((sum, member) => sum + member.maxCapacity, 0);
    const averageCapacity = totalMembers > 0 
      ? Math.round(members.reduce((sum, member) => sum + member.capacity, 0) / totalMembers)
      : 0;
    
    const comfortableLoad = members.filter(member => member.capacity < 60).length;
    const heavyLoad = members.filter(member => member.capacity >= 80).length;

    return {
      totalMembers,
      totalTasks,
      comfortableLoad,
      heavyLoad,
      averageCapacity,
      totalMaxCapacity
    };
  };

  // Initial load
  useEffect(() => {
    if (!hasLoadedOnce) {
      fetchTeamMembers(1, true);
    }
  }, []);

  // Fetch team members when page changes (but not on initial load)
  useEffect(() => {
    if (hasLoadedOnce) {
      fetchTeamMembers(pagination.currentPage, false);
    }
  }, [pagination.currentPage]);

  // Update global max capacity
  const handleMaxCapacityChange = async (newCapacity: number) => {
    try {
      const response = await fetch('/api/team/capacity', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ maxCapacity: newCapacity }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        setGlobalMaxCapacity(newCapacity);
        // Refresh team members to get updated capacities
        await fetchTeamMembers(pagination.currentPage, false);
        toast.success(`Max capacity updated to ${newCapacity} tasks per member`);
      } else {
        toast.error(data.message || 'Failed to update max capacity');
      }
    } catch (error) {
      console.error('Failed to update max capacity:', error);
      toast.error('Failed to update max capacity');
    }
  };

  // Add new team member
  const handleAddTeamMember = async (memberData: { name: string; email: string; role: string; maxCapacity?: number }) => {
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...memberData,
          maxCapacity: memberData.maxCapacity || globalMaxCapacity
        }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        // Refresh with server-side calculations
        await fetchTeamMembers(pagination.currentPage, false);
        setShowAddModal(false);
        toast.success(`Team member "${data.teamMember.name}" added successfully!`);
      } else {
        toast.error(data.message || 'Failed to add team member');
      }
    } catch (error) {
      console.error('Failed to create team member:', error);
      toast.error('Failed to add team member');
    }
  };

  // Delete team member
  const handleDeleteTeamMember = async (memberId: string) => {
    try {
      const res = await fetch(`/api/team/${memberId}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.status === 'success') {
        // Refresh current page after deletion
        await fetchTeamMembers(pagination.currentPage, false);
        toast.success('Team member deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete team member');
      }
    } catch (error) {
      console.error('Failed to delete team member:', error);
      toast.error('Failed to delete team member');
    }
  };

  // Show skeleton loader only on initial load
  if (isInitialLoading && !hasLoadedOnce) {
    return (
      <>
        <Header text="Teams Overview" icon={<IoPeople />} />

        {/* Header Section Skeleton */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex-1">
            <SkeletonLoader width="w-64" height="h-5" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <SkeletonLoader width="w-full sm:w-32" height="h-12" />
            <SkeletonLoader width="w-full sm:w-40" height="h-12" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <SkeletonLoader width="w-24" height="h-4" />
                <SkeletonLoader width="w-10" height="h-10" variant="circle" />
              </div>
              <SkeletonLoader width="w-16" height="h-8" />
            </div>
          ))}
        </div>

        {/* Team Stats Summary Skeleton */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-4">
                <SkeletonLoader width="w-20" height="h-8" className="mx-auto mb-2" />
                <SkeletonLoader width="w-32" height="h-4" className="mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Capacity Legend Skeleton */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-4 justify-center">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-2">
                <SkeletonLoader width="w-4" height="h-4" variant="circle" />
                <SkeletonLoader width="w-24" height="h-4" />
              </div>
            ))}
          </div>
        </div>

        {/* Team Members Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-md p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <SkeletonLoader width="w-3/4" height="h-6" className="mb-2" />
                  <SkeletonLoader width="w-1/2" height="h-4" />
                </div>
                <SkeletonLoader width="w-8" height="h-8" variant="circle" />
              </div>

              {/* Capacity Info */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <SkeletonLoader width="w-20" height="h-4" />
                  <SkeletonLoader width="w-16" height="h-4" />
                </div>
                <SkeletonLoader width="w-full" height="h-2" className="rounded-full" />
              </div>

              {/* Tasks Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <SkeletonLoader width="w-12" height="h-6" className="mx-auto mb-1" />
                    <SkeletonLoader width="w-20" height="h-3" className="mx-auto" />
                  </div>
                  <div>
                    <SkeletonLoader width="w-12" height="h-6" className="mx-auto mb-1" />
                    <SkeletonLoader width="w-20" height="h-3" className="mx-auto" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <SkeletonLoader width="w-full" height="h-9" />
                <SkeletonLoader width="w-20" height="h-9" />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <Header text="Teams Overview" icon={<IoPeople />} />

      {/* Subtle loading indicator during refresh */}
      {isRefreshing && (
        <div className="fixed top-20 right-6 z-50">
          <div className="bg-white rounded-full shadow-lg px-4 py-2 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent"></div>
            <span className="text-sm text-gray-600">Updating...</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div className="flex-1">
          <p className="text-gray-600 mt-2">
            {teamStats.totalMaxCapacity} total capacity available
            {totalTeamMembersCount > 0 && (
              <span className="text-gray-500 text-sm ml-2">
                • Showing {((pagination.currentPage - 1) * 6) + 1}-{Math.min(pagination.currentPage * 6, totalTeamMembersCount)} of {totalTeamMembersCount} members
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <TeamSettings 
            maxCapacity={globalMaxCapacity}
            onMaxCapacityChange={handleMaxCapacityChange}
          />
          <PrimaryButton 
            onClick={() => setShowAddModal(true)} 
            showIcon 
            icon={FaPlus}
            className="whitespace-nowrap"
          >
            Add Team Member
          </PrimaryButton>
        </div>
      </div>

      {/* Stats Cards */}
      {hasLoadedOnce && totalTeamMembersCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ProgressCard 
            title="Team Members" 
            value={teamStats.totalMembers} 
            icon={<FaUsers />} 
            color="blue" 
          />
          <ProgressCard 
            title="Total Tasks" 
            value={`${teamStats.totalTasks}/${teamStats.totalMaxCapacity}`} 
            icon={<FaTasks />} 
            color="purple" 
          />
          <ProgressCard 
            title="Comfortable Load" 
            value={teamStats.comfortableLoad} 
            icon={<FaCheckCircle />} 
            color="green" 
          />
          <ProgressCard 
            title="Heavy Load" 
            value={teamStats.heavyLoad} 
            icon={<FaExclamationTriangle />} 
            color="red" 
          />
        </div>
      )}

      {/* Team Stats Summary */}
      {hasLoadedOnce && totalTeamMembersCount > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4">
              <div className="text-2xl font-bold text-blue-600">{teamStats.averageCapacity}%</div>
              <div className="text-sm text-gray-600">Average Capacity</div>
            </div>
            <div className="p-4 border-l border-r border-gray-200">
              <div className="text-2xl font-bold text-green-600">
                {teamStats.totalMaxCapacity - teamStats.totalTasks}
              </div>
              <div className="text-sm text-gray-600">Available Capacity</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((teamStats.totalTasks / teamStats.totalMaxCapacity) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Team Utilization</div>
            </div>
          </div>
        </div>
      )}

      <CapacityLegend />

      {/* Team Members Grid */}
      {totalTeamMembersCount === 0 && hasLoadedOnce ? (
        <TeamEmptyState onAddMember={() => setShowAddModal(true)} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8">
            {teamMembers.map(member => (
              <TeamMemberCard 
                key={member._id} 
                member={member} 
                onDelete={handleDeleteTeamMember} 
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              visiblePages={pagination.visiblePages}
              onPageChange={(page) => {
                pagination.goToPage(page);
              }}
              onPrev={() => {
                pagination.prevPage();
              }}
              onNext={() => {
                pagination.nextPage();
              }}
              canPrev={pagination.canPrevPage}
              canNext={pagination.canNextPage}
              className="mt-8"
            />
          )}
        </>
      )}

      {/* Add Team Member Modal */}
      <AddTeamMemberModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSubmit={handleAddTeamMember}
        defaultMaxCapacity={globalMaxCapacity}
      />
    </>
  );
}