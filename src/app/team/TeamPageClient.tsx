'use client';

import { useState, useEffect } from 'react';
import { TeamMemberWithWorkload, TeamWorkloadStats } from '@/types/team';
import TeamMemberCard from '@/components/TeamMemberCard';
import AddTeamMemberModal from '@/components/AddTeamMemberModal';
import TeamSettings from '@/components/TeamSettings';
import ProgressCard from '@/components/ProgressCard';
import CapacityLegend from '@/components/CapacityLegend';
import PrimaryButton from '@/components/PrimaryButton';
import { FaPlus, FaUsers, FaTasks, FaCheckCircle, FaExclamationTriangle, FaCog } from 'react-icons/fa';
import { toast } from '@/components/ToastProvider';

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

  // Fetch team members with server-side capacity calculations
  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/team');
      const data = await response.json();

      if (data.status === 'success') {
        setTeamMembers(data.teamMembers);
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
        await fetchTeamMembers();
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
        await fetchTeamMembers(); // Refresh with server-side calculations
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
        // Optimistic update - remove from UI immediately
        setTeamMembers(prev => prev.filter(member => member._id !== memberId));
        // Refresh stats
        await fetchTeamMembers();
        toast.success('Team member deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete team member');
      }
    } catch (error) {
      console.error('Failed to delete team member:', error);
      toast.error('Failed to delete team member');
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 animate-pulse min-h-[120px]">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">Team Overview</h1>
            <p className="text-gray-600 mt-2">
              Monitor team workload and capacity • {teamStats.totalMaxCapacity} total capacity available
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

        {/* Stats Cards - Fixed: Removed subtitle prop */}
        {teamMembers.length > 0 && (
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
        {teamMembers.length > 0 && (
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
        {teamMembers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <FaUsers className="text-gray-400 text-2xl" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No team members yet</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start by adding team members to monitor their workload capacity and task distribution.
            </p>
            <div className="flex justify-center gap-3">
              <PrimaryButton 
                onClick={() => setShowAddModal(true)} 
                showIcon 
                icon={FaPlus}
              >
                Add Your First Team Member
              </PrimaryButton>
              <button
                onClick={() => handleMaxCapacityChange(8)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
              >
                <FaCog />
                Settings
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {teamMembers.map(member => (
              <TeamMemberCard 
                key={member._id} 
                member={member} 
                onDelete={handleDeleteTeamMember} 
              />
            ))}
          </div>
        )}

        {/* Add Team Member Modal */}
        <AddTeamMemberModal 
          isOpen={showAddModal} 
          onClose={() => setShowAddModal(false)} 
          onSubmit={handleAddTeamMember}
          defaultMaxCapacity={globalMaxCapacity}
        />
      </div>
    </div>
  );
}