'use client';

import { useUser } from '@/context/UserContext';
import { PusherTest } from '@/components/PusherTest';

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {process.env.NODE_ENV === 'development' && <PusherTest />}
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">PIECO Import Export</h1>
          <p className="text-gray-600 mt-2">Business Dashboard</p>
        </div>

        {/* Welcome Message with User Info */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-2">Welcome back, {user?.name}!</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Role: <strong className="capitalize">{user?.role}</strong></span>
            <span>•</span>
            <span>Email: {user?.email}</span>
          </div>
        </div>

    

     
      </div>
    </div>
  );
}