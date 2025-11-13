// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { BaseProject } from '@/types/project';
import { TeamMemberWithWorkload } from '@/types/team';
import ProjectCard from '@/components/ProjectCard';
import TeamMemberCard from '@/components/TeamMemberCard';
import ProgressCard from '@/components/ProgressCard';
import AddProjectModal from '@/components/AddProjectModal';
import PrimaryButton from '@/components/PrimaryButton';
import SkeletonLoader from '@/components/SkeletonLoader';
import { FaPlus, FaProjectDiagram, FaTasks, FaUsers, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { toast } from '@/components/ToastProvider';
import { ProjectsEmptyState } from '@/components/empty-states/ProjectsEmptyState';
import { TeamEmptyState } from '@/components/empty-states/TeamEmptyState';
import Header from '@/components/Header';
import { MdOutlineSpaceDashboard } from "react-icons/md";
import UserCard from '@/components/UserCard';
import SectionHeader from '@/components/SectionHeader';
import { MdAssignment } from 'react-icons/md';
import { IoPeople } from 'react-icons/io5';


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

  // Fetch all data for dashboard - FIXED TEAM MEMBERS COUNT
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch projects with pagination (first page only for recent projects)
      const projectsRes = await fetch('/api/projects?page=1&limit=6');
      const projectsData = await projectsRes.json();
      
      if (projectsData.status === 'success') {
        setProjects(projectsData.projects);
      }

      // ✅ FETCH TEAM MEMBERS WITH PAGINATION TO GET ACCURATE COUNT
      const teamRes = await fetch('/api/team?page=1&limit=6'); // Only need first page for display
      const teamData = await teamRes.json();

      if (teamData.status === 'success') {
        setTeamMembers(teamData.teamMembers);
      }

      // ✅ FETCH ACCURATE STATS USING THE NEW STATS API
      const statsRes = await fetch('/api/projects/stats');
      const statsData = await statsRes.json();

      if (statsData.status === 'success' && teamData.status === 'success') {
        setDashboardStats({
          totalProjects: statsData.stats.totalProjects,
          completedProjects: statsData.stats.completedProjects,
          totalTasks: statsData.stats.totalTasks,
          totalTeamMembers: teamData.pagination?.totalMembers || teamData.teamMembers?.length || 0 // ✅ Use pagination total
        });
      } else {
        // Fallback to calculated stats if stats API fails
        setDashboardStats({
          totalProjects: projectsData.pagination?.totalProjects || projectsData.projects.length,
          completedProjects: projectsData.projects.filter((project: BaseProject) => 
            project.status === 'completed'
          ).length,
          totalTasks: projectsData.projects.reduce((sum: number, project: BaseProject) => 
            sum + (project.taskStats?.total || 0), 0
          ),
          totalTeamMembers: teamData.pagination?.totalMembers || teamData.teamMembers?.length || 0 // ✅ Use pagination total
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

  // Get recent projects (first 3 from the fetched page)
  const recentProjects = projects.slice(0, 3);

  // Get team members to display (3 members)
  const displayTeamMembers = teamMembers.slice(0, 3);

  return (
    <>
        
        {/* Header */}
   <Header 
  text="Dashboard Overview"
  icon={<MdOutlineSpaceDashboard  />}

/>
        {/* Welcome Message */}
{user && <UserCard user={user} />}


        {/* Dashboard Stats using ProgressCard - NOW USING ACCURATE STATS */}
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
    size="lg"
    href="/projects"
  />
  
  <ProgressCard
    title="Completed Projects"
    value={dashboardStats.completedProjects}
    icon={<FaCheckCircle />}
    color="green"
    size="lg"
  />
  
  <ProgressCard
    title="Total Tasks"
    value={dashboardStats.totalTasks}
    icon={<FaTasks />}
    color="purple"
    size="lg"
  />
  
  {/* ✅ Now shows correct total */}
  <ProgressCard
    title="Team Members"
    value={dashboardStats.totalTeamMembers}
    icon={<FaUsers />}
    color="orange"
    size="lg"
    href="/team"
  />
</>
          )}
        </div>

        {/* Recent Projects Section */}
        <div className="py-8 lg:py-12">
         <SectionHeader
    title="Recent Projects"
    viewAllHref="/projects"
    showAdd
    icon ={<MdAssignment />}
    onAdd={() => setShowAddModal(true)}
  />

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

            <ProjectsEmptyState onAddProject={() => setShowAddModal(true)} />
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
        <div className="py-8 lg:py-12">
         <SectionHeader
    title="Team Members"
    viewAllHref="/team"
        icon ={<IoPeople />}

  />

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
          <TeamEmptyState onAddMember={() => router.push('/team')} />
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
    </>
  );
}