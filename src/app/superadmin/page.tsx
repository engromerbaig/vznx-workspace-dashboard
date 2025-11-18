// src/app/superadmin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { ROLES, hasRole } from '@/lib/roles';
import Header from '@/components/Header';
import UserCard from '@/components/UserCard';
import ProgressCard from '@/components/ProgressCard';
import SkeletonLoader from '@/components/SkeletonLoader';
import Heading from '@/components/Heading';
import BodyText from '@/components/BodyText';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { FaUserShield, FaUsers, FaClipboardCheck, FaDatabase, FaShieldAlt, FaClock, FaChartLine, FaServer, FaExclamationTriangle } from 'react-icons/fa';

const pieData = [
  { name: 'Active Admins', value: 42 },
  { name: 'Inactive Admins', value: 8 },
  { name: 'Suspended', value: 3 },
];

const pieColors = ['#10B981', '#F59E0B', '#EF4444'];

const growthData = [
  { month: 'Jan', logins: 320, approvals: 45, newAdmins: 8 },
  { month: 'Feb', logins: 450, approvals: 68, newAdmins: 12 },
  { month: 'Mar', logins: 680, approvals: 92, newAdmins: 15 },
  { month: 'Apr', logins: 590, approvals: 78, newAdmins: 10 },
  { month: 'May', logins: 820, approvals: 110, newAdmins: 18 },
  { month: 'Jun', logins: 980, approvals: 145, newAdmins: 22 },
];

const activityData = [
  { day: 'Mon', actions: 120 },
  { day: 'Tue', actions: 180 },
  { day: 'Wed', actions: 210 },
  { day: 'Thu', actions: 165 },
  { day: 'Fri', actions: 240 },
  { day: 'Sat', actions: 90 },
  { day: 'Sun', actions: 70 },
];

const performanceData = [
  { metric: 'Security', value: 94 },
  { metric: 'Performance', value: 88 },
  { metric: 'Uptime', value: 99.9 },
  { metric: 'Compliance', value: 96 },
  { metric: 'Response Time', value: 82 },
  { metric: 'Backup Success', value: 100 },
];

interface SuperAdminStats {
  totalAdmins: number;
  pendingApprovals: number;
  databaseUsage: number;
  securityScore: number;
}

export default function SuperAdminPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  const [stats, setStats] = useState<SuperAdminStats>({
    totalAdmins: 53,
    pendingApprovals: 12,
    databaseUsage: 76,
    securityScore: 94,
  });

  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (!hasRole(user.role, ROLES.SUPERADMIN)) {
      router.replace('/dashboard');
      return;
    }

    // Simulate API fetch
    setTimeout(() => {
      setStats({
        totalAdmins: 53,
        pendingApprovals: 12,
        databaseUsage: 76,
        securityScore: 94,
      });
      setLoadingStats(false);
    }, 1200);
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifying SuperAdmin access...</p>
        </div>
      </div>
    );
  }

  return (
    <>

          {/* Header */}
          <Header text="SuperAdmin Command Center" icon={<FaUserShield className="text-indigo-400" />} />

          {/* Welcome User */}
          <div className="my-8">
            <UserCard user={user} />
          </div>

          {/* 4 Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {loadingStats ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-black backdrop-blur border border-gray-800 rounded-xl p-6 animate-pulse">
                  <SkeletonLoader width="w-14" height="h-14" variant="circle" />
                  <SkeletonLoader width="w-24" height="h-4" className="mt-4" />
                  <SkeletonLoader width="w-20" height="h-10" className="mt-3" />
                </div>
              ))
            ) : (
              <>
                <ProgressCard
                  title="Total Admins"
                  value={stats.totalAdmins}
                  icon={<FaUsers className="text-emerald-400" />}
                  color="red"
                  size="lg"
                />
                <ProgressCard
                  title="Pending Approvals"
                  value={stats.pendingApprovals}
                  icon={<FaClipboardCheck className="text-orange-400" />}
                  color="orange"
                  size="lg"
                />
                <ProgressCard
                  title="Database Usage"
                  value={stats.databaseUsage}
                  icon={<FaDatabase className="text-purple-400" />}
                  color="purple"
                  size="lg"
                />
                <ProgressCard
                  title="Security Score"
                  value={stats.securityScore}
                  icon={<FaShieldAlt className="text-cyan-400" />}
                  color="green"
                  size="lg"
                />
              </>
            )}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">

            {/* Admin Status Pie */}
            <div className="bg-black backdrop-blur border border-gray-800 rounded-xl p-6">
              <Heading title="Admin Status Overview" icon={<FaUsers />} />
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value} admins`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Growth Trends */}
            <div className="bg-black backdrop-blur border border-gray-800 rounded-xl p-6">
              <Heading title="Growth & Activity Trends" icon={<FaChartLine />} />
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Legend />
                  <Line type="monotone" dataKey="logins" stroke="#8B5CF6" strokeWidth={3} dot={{ fill: '#8B5CF6' }} />
                  <Line type="monotone" dataKey="approvals" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981' }} />
                  <Line type="monotone" dataKey="newAdmins" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly Activity Heat */}
            <div className="bg-black backdrop-blur border border-gray-800 rounded-xl p-6">
              <Heading title="Weekly Admin Activity" icon={<FaClock />} />
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={activityData}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                  <Area type="monotone" dataKey="actions" stroke="#EC4899" fill="#EC4899" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* System Performance Radar */}
            <div className="bg-black backdrop-blur border border-gray-800 rounded-xl p-6 xl:col-span-3">
              <Heading title="System Health Radar" icon={<FaServer />} />
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={performanceData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="metric" stroke="#9CA3AF" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9CA3AF" />
                  <Radar name="Performance" dataKey="value" stroke="#06B6D4" fill="#06B6D4" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity Log Placeholder */}
          <div className="bg-black backdrop-blur border border-gray-800 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <FaExclamationTriangle className="text-yellow-400 text-2xl" />
              <Heading title="Recent Admin Actions & Audit Log" titleSize="text-2xl" />
            </div>
            <div className="space-y-4">
              {['Admin John approved 5 new users', 'Security scan completed - 2 warnings', 'Backup successful at 03:00 AM', 'New admin role created: Moderator+'].map((log, i) => (
                <div key={i} className="flex items-center justify-between py-3 px-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <span className="text-gray-300">{log}</span>
                  <span className="text-xs text-gray-500">{['2m ago', '15m ago', '1h ago', '3h ago'][i]}</span>
                </div>
              ))}
            </div>
          </div>

    </>
  );
}