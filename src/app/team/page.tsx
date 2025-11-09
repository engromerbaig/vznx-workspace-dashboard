// src/app/team/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { BaseTask } from '@/types/task';
import TeamMemberCard from '@/components/TeamMemberCard';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  taskCount: number;
  capacity: number; // 0-100 percentage
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate team workload
  const calculateTeamWorkload = async () => {
    try {
      // Fetch all tasks
      const projectsRes = await fetch('/api/projects');
      const projectsData = await projectsRes.json();

      if (projectsData.status !== 'success') return;

      // Get tasks for all projects
      const allTasks: BaseTask[] = [];
      
      for (const project of projectsData.projects) {
        const tasksRes = await fetch(`/api/projects/${project._id}/tasks`);
        const tasksData = await tasksRes.json();
        
        if (tasksData.status === 'success') {
          allTasks.push(...tasksData.tasks);
        }
      }

      // Define team members (hardcoded for now, can be from database later)
      const members = [
        { id: '1', name: 'Sarah Chen', email: 'sarah@vznx.com', role: 'Lead Architect' },
        { id: '2', name: 'Mike Rodriguez', email: 'mike@vznx.com', role: 'Structural Engineer' },
        { id: '3', name: 'Emma Wilson', email: 'emma@vznx.com', role: 'Interior Designer' },
        { id: '4', name: 'Alex Thompson', email: 'alex@vznx.com', role: 'Project Manager' },
      ];

      // Calculate task counts and capacity for each member
      const MAX_TASKS_PER_MEMBER = 8; // 8 tasks = 100% capacity
      
      const membersWithWorkload = members.map(member => {
        const taskCount = allTasks.filter(task => task.assignedTo === member.name).length;
        const capacity = Math.min(Math.round((taskCount / MAX_TASKS_PER_MEMBER) * 100), 100);
        
        return {
          ...member,
          taskCount,
          capacity
        };
      });

      setTeamMembers(membersWithWorkload);
    } catch (error) {
      console.error('Failed to calculate team workload:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    calculateTeamWorkload();
  }, []);

  const getCapacityColor = (capacity: number) => {
    if (capacity < 60) return 'bg-green-500';
    if (capacity < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCapacityTextColor = (capacity: number) => {
    if (capacity < 60) return 'text-green-700';
    if (capacity < 80) return 'text-yellow-700';
    return 'text-red-700';
  };

  const getCapacityStatus = (capacity: number) => {
    if (capacity < 60) return 'Comfortable';
    if (capacity < 80) return 'Moderate';
    return 'Heavy';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Team Overview</h1>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Team Overview</h1>
          <p className="text-gray-600 mt-2">Monitor team workload and capacity</p>
        </div>

        {/* Capacity Legend */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Workload Status</h3>
          <div className="flex gap-6 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Comfortable (&lt;60%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-600">Moderate (60-80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-600">Heavy (&gt;80%)</span>
            </div>
          </div>
        </div>

        {/* Team Grid */}
        {teamMembers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-gray-500 text-lg mb-4">No team data available</div>
            <p className="text-gray-400">Add some tasks to see team workload distribution</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map(member => (
              <TeamMemberCard
                key={member.id}
                member={member}
                capacityColor={getCapacityColor(member.capacity)}
                capacityTextColor={getCapacityTextColor(member.capacity)}
                capacityStatus={getCapacityStatus(member.capacity)}
              />
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {teamMembers.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Team Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-800">{teamMembers.length}</div>
                <div className="text-sm text-gray-600">Team Members</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {teamMembers.reduce((sum, member) => sum + member.taskCount, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {teamMembers.filter(member => member.capacity < 60).length}
                </div>
                <div className="text-sm text-gray-600">Comfortable Load</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {teamMembers.filter(member => member.capacity >= 80).length}
                </div>
                <div className="text-sm text-gray-600">Heavy Load</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}