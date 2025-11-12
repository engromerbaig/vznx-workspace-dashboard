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
import { usePagination } from '@/hooks/usePagination';
import { FaPlus, FaUsers, FaTasks, FaCheckCircle, FaExclamationTriangle, FaCog } from 'react-icons/fa';
import { toast } from '@/components/ToastProvider';
import { TeamEmptyState } from '@/components/empty-states/TeamEmptyState';

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
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [totalTeamMembersCount, setTotalTeamMembersCount] = useState(0);

  const pagination = usePagination({
    totalItems: totalTeamMembersCount, // Use server-side total count
    pageSize: 6, 
    initialPage: 1,
    maxVisiblePages: 5
  });

  // Fetch team members with pagination
  const fetchTeamMembers = async (page: number = 1) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/team?page=${page}&limit=6`);
      const data = await response.json();

      if (data.status === 'success') {
        setTeamMembers(data.teamMembers);
        setTotalTeamMembersCount(data.pagination.totalMembers);
        setTeamStats(data.teamStats || calculateTeamStats(data.teamMembers));
        
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
      setIsLoading(false);
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

  // Fetch team members when page changes
  useEffect(() => {
    fetchTeamMembers(pagination.currentPage);
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
        await fetchTeamMembers(pagination.currentPage);
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
        await fetchTeamMembers(pagination.currentPage);
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
        await fetchTeamMembers(pagination.currentPage);
        toast.success('Team member deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete team member');
      }
    } catch (error) {
      console.error('Failed to delete team member:', error);
      toast.error('Failed to delete team member');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Team Overview</h1>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            </div>
            <div className="flex gap-4">
              <div className="h-12 bg-gray-200 rounded-lg w-40 animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded-lg w-40 animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 animate-pulse min-h-[120px]">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse min-h-[320px]">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-5/6 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
       <>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">Team Overview</h1>
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
        {totalTeamMembersCount > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ProgressCard 
              title="Team Members" 
              value={teamStats.totalMembers} 
              icon={<FaUsers />} 
              color="blue" 
              size="md" 
            />
            <ProgressCard 
              title="Total Tasks" 
              value={`${teamStats.totalTasks}/${teamStats.totalMaxCapacity}`} 
              icon={<FaTasks />} 
              color="purple" 
              size="md" 
            />
            <ProgressCard 
              title="Comfortable Load" 
              value={teamStats.comfortableLoad} 
              icon={<FaCheckCircle />} 
              color="green" 
              size="md" 
            />
            <ProgressCard 
              title="Heavy Load" 
              value={teamStats.heavyLoad} 
              icon={<FaExclamationTriangle />} 
              color="red" 
              size="md" 
            />
          </div>
        )}

        {/* Team Stats Summary */}
        {totalTeamMembersCount > 0 && (
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
        {totalTeamMembersCount === 0 ? (
           <TeamEmptyState 
            onAddMember={() => setShowAddModal(true)}
          />
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
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              visiblePages={pagination.visiblePages}
              onPageChange={(page) => {
                pagination.goToPage(page);
                // The useEffect will handle the fetch
              }}
              onPrev={() => {
                pagination.prevPage();
                // The useEffect will handle the fetch
              }}
              onNext={() => {
                pagination.nextPage();
                // The useEffect will handle the fetch
              }}
              canPrev={pagination.canPrevPage}
              canNext={pagination.canNextPage}
              className="mt-8"
            />
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