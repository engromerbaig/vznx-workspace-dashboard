'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { BaseProject } from '@/types/project';
import { BaseTask } from '@/types/task';
import { TeamMemberWithWorkload } from '@/types/team';
import ProjectCard from '@/components/ProjectCard';
import TeamMemberCard from '@/components/TeamMemberCard';
import ProgressCard from '@/components/ProgressCard';
import AddProjectModal from '@/components/AddProjectModal';
import PrimaryButton from '@/components/PrimaryButton';
import SkeletonLoader from '@/components/SkeletonLoader';
import { FaPlus, FaProjectDiagram, FaTasks, FaUsers, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { calculateCapacity } from '@/utils/capacity';
import { toast } from '@/components/ToastProvider';

interface DashboardStats {
  totalProjects: number;
  completedProjects: number;
  totalTasks: number;
  totalTeamMembers: number;
}

export default function DashboardPageClient() {
  const { user } = useUser();
  const router = useRouter();
  const [projects, setProjects] = useState<BaseProject[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithWorkload[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    totalTeamMembers: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Calculate team workload - SAME METHOD AS TEAM PAGE
  const calculateTeamWorkload = async (members: any[], allTasks: BaseTask[]) => {
    return members.map((member: any) => {
      const taskCount = allTasks.filter(task => task.assignedTo === member.name).length;
      const capacity = calculateCapacity(taskCount);
      
      return {
        ...member,
        taskCount,
        capacity
      };
    });
  };

  // Fetch all data for dashboard - UPDATED WITH PROPER WORKLOAD CALCULATION
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch projects and tasks first
      const projectsRes = await fetch('/api/projects');
      const projectsData = await projectsRes.json();
      
      let allTasks: BaseTask[] = [];
      
      if (projectsData.status === 'success') {
        setProjects(projectsData.projects);

        // Get tasks for all projects - SAME AS TEAM PAGE
        for (const project of projectsData.projects) {
          const tasksRes = await fetch(`/api/projects/${project.slug}/tasks`);
          const tasksData = await tasksRes.json();
          
          if (tasksData.status === 'success') {
            allTasks.push(...tasksData.tasks);
          }
        }
      }

      // Fetch team members and calculate workload
      const teamRes = await fetch('/api/team');
      const teamData = await teamRes.json();

      if (teamData.status === 'success') {
        // Calculate workload for team members - SAME AS TEAM PAGE
        const membersWithWorkload = await calculateTeamWorkload(teamData.teamMembers, allTasks);
        setTeamMembers(membersWithWorkload);
      }

      // Calculate dashboard stats
      if (projectsData.status === 'success' && teamData.status === 'success') {
        const totalProjects = projectsData.projects.length;
        const completedProjects = projectsData.projects.filter((project: BaseProject) => 
          project.status === 'completed'
        ).length;
        
        const totalTasks = projectsData.projects.reduce((sum: number, project: BaseProject) => 
          sum + (project.taskStats?.total || 0), 0
        );
        
        const totalTeamMembers = teamData.teamMembers.length;

        setDashboardStats({
          totalProjects,
          completedProjects,
          totalTasks,
          totalTeamMembers
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Add new project
  const handleAddProject = async (projectData: { name: string; description?: string }) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      const data = await res.json();

      if (data.status === 'success') {
        // Refresh all data to get updated stats
        await fetchDashboardData();
        setShowAddModal(false);
        toast.success(`Project "${data.project.name}" added successfully!`);
      }
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to add project');
    }
  };

  // Delete project
  const handleDeleteProject = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.status === 'success') {
        // Refresh all data to get updated stats
        await fetchDashboardData();
        toast.success('Project deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
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
        // Refresh all data to get updated stats
        await fetchDashboardData();
        toast.success('Team member deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete team member:', error);
      toast.error('Failed to delete team member');
    }
  };

  // Get recent projects (3 most recent)
  const recentProjects = projects.slice(0, 3);

  // Get team members to display (3 members)
  const displayTeamMembers = teamMembers.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">{process.env.NEXT_PUBLIC_APP_NAME}</h1>
          <p className="text-gray-600 mt-2">Dashboard Overview</p>
        </div>

        {/* Welcome Message */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-2 text-black">Welcome back, {user?.username}!</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Email: {user?.email}</span>
          </div>
        </div>

        {/* Dashboard Stats using ProgressCard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <SkeletonLoader width="w-12" height="h-12" variant="circle" />
                  </div>
                  <SkeletonLoader width="w-3/4" height="h-5" className="mb-2" />
                  <SkeletonLoader width="w-1/2" height="h-8" />
                </div>
              ))}
            </>
          ) : (
            <>
              <ProgressCard
                title="Total Projects"
                value={dashboardStats.totalProjects}
                icon={<FaProjectDiagram />}
                color="blue"
                size="md"
              />
              
              <ProgressCard
                title="Completed Projects"
                value={dashboardStats.completedProjects}
                icon={<FaCheckCircle />}
                color="green"
                size="md"
              />
              
              <ProgressCard
                title="Total Tasks"
                value={dashboardStats.totalTasks}
                icon={<FaTasks />}
                color="purple"
                size="md"
              />
              
              <ProgressCard
                title="Team Members"
                value={dashboardStats.totalTeamMembers}
                icon={<FaUsers />}
                color="orange"
                size="md"
              />
            </>
          )}
        </div>

        {/* Recent Projects Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recent Projects</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/projects')}
                className="flex cursor-pointer items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
              >
                View All
                <FaArrowRight className="text-sm transform group-hover:translate-x-1 transition-transform" />
              </button>
              <PrimaryButton
                onClick={() => setShowAddModal(true)}
                showIcon={true}
                icon={FaPlus}
              >
                Add Project
              </PrimaryButton>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <SkeletonLoader width="w-3/4" height="h-6" className="mb-4" />
                  <SkeletonLoader width="w-1/2" height="h-4" className="mb-6" />
                  <SkeletonLoader width="w-full" height="h-3" className="mb-2" />
                  <SkeletonLoader width="w-5/6" height="h-3" className="mb-4" />
                  <div className="flex gap-2 mt-4">
                    <SkeletonLoader width="w-20" height="h-6" />
                    <SkeletonLoader width="w-24" height="h-6" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <div className="text-gray-500 text-lg mb-4">No projects yet</div>
              <p className="text-gray-400 mb-6">Get started by creating your first project</p>
              <div className="flex justify-center">
                <PrimaryButton
                  onClick={() => setShowAddModal(true)}
                  showIcon={true}
                  icon={FaPlus}
                >
                  Create Your First Project
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentProjects.map(project => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  onDelete={handleDeleteProject}
                />
              ))}
            </div>
          )}
        </div>

        {/* Team Members Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Team Members</h2>
            <button
              onClick={() => router.push('/team')}
              className="flex cursor-pointer items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
            >
              View All
              <FaArrowRight className="text-sm transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6 min-h-[320px]">
                  <div className="flex items-center gap-4 mb-6">
                    <SkeletonLoader width="w-16" height="h-16" variant="circle" />
                    <div className="flex-1">
                      <SkeletonLoader width="w-3/4" height="h-6" className="mb-2" />
                      <SkeletonLoader width="w-1/2" height="h-4" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <SkeletonLoader width="w-full" height="h-4" />
                    <SkeletonLoader width="w-5/6" height="h-4" />
                    <SkeletonLoader width="w-full" height="h-20" className="mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : displayTeamMembers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <div className="text-gray-500 text-lg mb-4">No team members yet</div>
              <p className="text-gray-400">Add team members to see them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayTeamMembers.map(member => (
                <TeamMemberCard
                  key={member._id}
                  member={member}
                  onDelete={handleDeleteTeamMember}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Project Modal */}
        <AddProjectModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddProject}
        />
      </div>
    </div>
  );
}