'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TeamMemberWithWorkload } from '@/types/team';
import { BaseTask } from '@/types/task';
import TaskItem from '@/components/TaskItem';
import ProgressCard from '@/components/ProgressCard';
import PrimaryButton from '@/components/PrimaryButton';
import { FaArrowLeft, FaSync, FaTasks, FaCheck, FaClock, FaUser, FaEnvelope, FaBriefcase, FaExclamationTriangle } from 'react-icons/fa';
import { getCapacityInfo, calculateCapacity, CAPACITY_THRESHOLDS } from '@/utils/capacity';
import { formatDateTime, formatTime } from '@/utils/dateFormatter';
import { toast } from '@/components/ToastProvider';

export default function TeamMemberDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const memberSlug = params.slug as string;

  const [teamMember, setTeamMember] = useState<TeamMemberWithWorkload | null>(null);
  const [assignedTasks, setAssignedTasks] = useState<BaseTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  // Fetch team member details and assigned tasks
  const fetchTeamMemberData = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      const memberRes = await fetch(`/api/team/${memberSlug}?t=${Date.now()}`);
      if (!memberRes.ok) {
        if (memberRes.status === 404) {
          throw new Error('Team member not found');
        }
        throw new Error('Failed to fetch team member');
      }
      
      const memberData = await memberRes.json();

      if (memberData.status === 'success') {
        setTeamMember(memberData.teamMember);
        
        const tasksRes = await fetch(`/api/tasks?assignedTo=${encodeURIComponent(memberData.teamMember.name)}&t=${Date.now()}`);
        if (!tasksRes.ok) {
          throw new Error('Failed to fetch assigned tasks');
        }
        
        const tasksData = await tasksRes.json();

        if (tasksData.status === 'success') {
          setAssignedTasks(tasksData.tasks);
        } else {
          throw new Error(tasksData.message || 'Failed to fetch tasks');
        }
      } else {
        throw new Error(memberData.message || 'Failed to fetch team member');
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch team member data:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (memberSlug) {
      fetchTeamMemberData();
    }
  }, [memberSlug]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await fetchTeamMemberData();
      toast.success('Team member data refreshed');
    } catch (err) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTaskUpdate = () => {
    fetchTeamMemberData();
  };

  const taskStats = {
    totalTasks: assignedTasks.length,
    completedTasks: assignedTasks.filter(task => task.status === 'complete').length,
    pendingTasks: assignedTasks.filter(task => task.status === 'incomplete').length,
    completionRate: assignedTasks.length > 0 
      ? Math.round((assignedTasks.filter(task => task.status === 'complete').length / assignedTasks.length) * 100)
      : 0
  };

  // ✅ Correct capacity calculation using taskCount
  const currentCapacity = teamMember ? calculateCapacity(teamMember.taskCount) : 0;
  const capacityInfo = getCapacityInfo(currentCapacity);

  const getCapacityGradient = (capacity: number) => {
    if (capacity < CAPACITY_THRESHOLDS.COMFORTABLE) return 'from-green-400 to-emerald-500';
    if (capacity < CAPACITY_THRESHOLDS.MODERATE) return 'from-yellow-400 to-amber-500';
    return 'from-red-400 to-rose-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-24 mb-6"></div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4">
                    <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center mb-6">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !teamMember) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Team Member Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <PrimaryButton className='cursor-pointer' bgColor='bg-primary/10' onClick={() => router.push('/team')}>
              Back to Team
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  if (!teamMember) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Team Member Not Found</h1>
            <p className="text-gray-600 mb-6">The team member you're looking for doesn't exist.</p>
            <PrimaryButton className='cursor-pointer' bgColor='bg-primary/10' onClick={() => router.push('/team')}>
              Back to Team
            </PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <button
              onClick={() => router.push('/team')}
              className="flex items-center gap-2 cursor-pointer text-primary hover:text-blue-800 transition-colors font-medium self-start"
            >
              <FaArrowLeft className='text-sm' />
              Back to Team
            </button>

            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-500 hidden sm:block">
                Last synced: {formatTime(lastUpdated)}
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <FaSync className={`text-sm ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </span>
              </button>
            </div>
          </div>

          {/* Team Member Info Card */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 break-words">
                  {teamMember.name}
                </h1>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaBriefcase className="text-sm" />
                    <span className="text-lg font-medium">{teamMember.role}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <FaEnvelope className="text-sm" />
                    <span className="text-sm">{teamMember.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Member since: {formatDateTime(teamMember.createdAt)}</span>
                  <span>Last updated: {formatDateTime(teamMember.updatedAt)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${capacityInfo.textColor} bg-white border ${capacityInfo.textColor.replace('text', 'border')}`}>
                  {capacityInfo.status} WORKLOAD
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                  {teamMember.taskCount} TASKS
                </span>
              </div>
            </div>

            {/* Workload Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center mb-6">
              <ProgressCard
                title="Total Tasks"
                value={taskStats.totalTasks}
                icon={<FaTasks />}
                color="gray"
                size="md"
              />
              <ProgressCard
                title="Completed"
                value={taskStats.completedTasks}
                icon={<FaCheck />}
                color="green"
                size="md"
              />
              <ProgressCard
                title="Pending"
                value={taskStats.pendingTasks}
                icon={<FaClock />}
                color="blue"
                size="md"
              />
              <ProgressCard
                title="Completion Rate"
                value={`${taskStats.completionRate}%`}
                icon={<FaUser />}
                color="orange"
                size="md"
              />
            </div>

            {/* Capacity Progress Bar */}
            <div className="mt-4 sm:mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Workload Capacity</span>
                <span className="text-sm font-bold text-gray-800">{currentCapacity}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                <div 
                  className={`h-2 sm:h-3 rounded-full transition-all duration-500 ease-out bg-gradient-to-r ${getCapacityGradient(currentCapacity)}`}
                  style={{ width: `${currentCapacity}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 text-center mt-2 font-medium">
                {capacityInfo.description}
                {currentCapacity >= CAPACITY_THRESHOLDS.HEAVY && (
                  <span className="text-red-600 ml-1">
                    <FaExclamationTriangle className="inline mr-1" />
                    Consider redistributing tasks
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Tasks Section */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Assigned Tasks</h2>
              <p className="text-gray-600 text-sm mt-1">
                {taskStats.totalTasks === 0 ? 'No tasks assigned' : `${taskStats.totalTasks} task${taskStats.totalTasks !== 1 ? 's' : ''} assigned`}
                {taskStats.totalTasks > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({taskStats.completedTasks} completed • {taskStats.pendingTasks} pending)
                  </span>
                )}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <FaExclamationTriangle className="text-xs" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}

          {assignedTasks.length === 0 ? (
            <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-gray-400 text-4xl sm:text-6xl mb-3 sm:mb-4">📋</div>
              <div className="text-gray-500 text-lg mb-3 sm:mb-4">No tasks assigned</div>
              <p className="text-gray-400 text-sm mb-4 sm:mb-6 max-w-md mx-auto px-4">
                {teamMember.name} doesn't have any tasks assigned yet. Assign tasks from project pages to see them here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignedTasks.map(task => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onTaskUpdate={handleTaskUpdate}
                  showProject={true}
                />
              ))}
            </div>
          )}

          {assignedTasks.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-sm text-gray-600">
                <span className="text-center sm:text-left">
                  Showing {assignedTasks.length} assigned task{assignedTasks.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center justify-center sm:justify-start gap-4">
                  <span className="flex items-center gap-1">
                    <FaCheck className="text-green-500 text-xs" />
                    {taskStats.completedTasks} completed
                  </span>
                  <span className="flex items-center gap-1">
                    <FaClock className="text-blue-500 text-xs" />
                    {taskStats.pendingTasks} pending
                  </span>
                  <span className="flex items-center gap-1">
                    <FaUser className="text-orange-500 text-xs" />
                    {taskStats.completionRate}% completion rate
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
