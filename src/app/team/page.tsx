'use client';

import { useState, useEffect } from 'react';
import { BaseTask } from '@/types/task';
import { TeamMemberWithWorkload, TeamWorkloadStats } from '@/types/team';
import TeamMemberCard from '@/components/TeamMemberCard';
import AddTeamMemberModal from '@/components/AddTeamMemberModal';
import ProgressCard from '@/components/ProgressCard';
import CapacityLegend from '@/components/CapacityLegend';
import PrimaryButton from '@/components/PrimaryButton';
import { getCapacityInfo, calculateCapacity } from '@/utils/capacity';
import { FaPlus, FaUsers, FaTasks, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from '@/components/ToastProvider';

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithWorkload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Calculate team workload statistics
  const getTeamStats = (members: TeamMemberWithWorkload[]): TeamWorkloadStats => {
    return {
      totalMembers: members.length,
      totalTasks: members.reduce((sum, member) => sum + member.taskCount, 0),
      comfortableLoad: members.filter(member => member.capacity < 60).length,
      heavyLoad: members.filter(member => member.capacity >= 80).length,
      averageCapacity: members.length > 0 
        ? Math.round(members.reduce((sum, member) => sum + member.capacity, 0) / members.length)
        : 0
    };
  };

  // Fetch team members and calculate workload
  const calculateTeamWorkload = async () => {
    try {
      // Fetch team members from API
      const membersRes = await fetch('/api/team');
      const membersData = await membersRes.json();

      if (membersData.status !== 'success') {
        setTeamMembers([]);
        return;
      }

      // Fetch all tasks for workload calculation
      const projectsRes = await fetch('/api/projects');
      const projectsData = await projectsRes.json();

      if (projectsData.status !== 'success') {
        setTeamMembers(membersData.teamMembers.map((member: any) => ({
          ...member,
          taskCount: 0,
          capacity: 0
        })));
        return;
      }

      // Get tasks for all projects
      const allTasks: BaseTask[] = [];
      
      for (const project of projectsData.projects) {
        const tasksRes = await fetch(`/api/projects/${project.slug}/tasks`);
        const tasksData = await tasksRes.json();
        
        if (tasksData.status === 'success') {
          allTasks.push(...tasksData.tasks);
        }
      }

      // Calculate task counts and capacity for each member
      const membersWithWorkload = membersData.teamMembers.map((member: any) => {
        const taskCount = allTasks.filter(task => task.assignedTo === member.name).length;
        const capacity = calculateCapacity(taskCount);
        
        return {
          ...member,
          taskCount,
          capacity
        };
      });

      setTeamMembers(membersWithWorkload);
    } catch (error) {
      console.error('Failed to calculate team workload:', error);
      setTeamMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    calculateTeamWorkload();
  }, []);

  // Add new team member
  const handleAddTeamMember = async (memberData: { name: string; email: string; role: string }) => {
    try {
      const res = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });

      const data = await res.json();

      if (data.status === 'success') {
        // Recalculate workload to include the new member
        await calculateTeamWorkload();
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
      const res = await fetch(`/api/team/${memberId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.status === 'success') {
        setTeamMembers(prev => prev.filter(member => member._id !== memberId));
        toast.success('Team member deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete team member');
      }
    } catch (error) {
      console.error('Failed to delete team member:', error);
      toast.error('Failed to delete team member');
    }
  };

  // Get team statistics
  const teamStats = getTeamStats(teamMembers);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Team Overview</h1>
          
          {/* Loading state for summary stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-200 animate-pulse min-h-[120px]">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-5/6"></div>
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
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Team Overview</h1>
            <p className="text-gray-600 mt-2">Monitor team workload and capacity</p>
          </div>
          <PrimaryButton
            onClick={() => setShowAddModal(true)}
            showIcon={true}
            icon={FaPlus}
          >
            Add Team Member
          </PrimaryButton>
        </div>

        {/* Summary Stats at the top using ProgressCard */}
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
              value={teamStats.totalTasks}
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

        {/* Capacity Legend */}
        <CapacityLegend />

        {/* Team Grid */}
        {teamMembers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-gray-500 text-lg mb-4">No team members yet</div>
            <p className="text-gray-400 mb-6">Add team members to see workload distribution</p>
                        <div className="flex justify-center">
 <PrimaryButton
              onClick={() => setShowAddModal(true)}
              showIcon={true}
              icon={FaPlus}
            >
              Add Your First Team Member
            </PrimaryButton>

</div>
           
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        />
      </div>
    </div>
  );
}