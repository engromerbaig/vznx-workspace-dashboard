'use client';

import { useUser } from '@/context/UserContext';
import { useRoles } from '@/hooks/useRoles';
import { PusherTest } from '@/components/PusherTest';

export default function DashboardPage() {
  const { user } = useUser();
  const { 
    isSuperAdmin, 
    isManager, 
    isExactlyManager, 
    isExactlySuperAdmin 
  } = useRoles();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {process.env.NODE_ENV === 'development' && <PusherTest />}
        
        {/* Header with Control Panel button */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-gray-800">PIECO Import Export</h1>
            <p className="text-gray-600 mt-2">Business Dashboard</p>
          </div>
          
          {isSuperAdmin() && (
            <a
              href="/superadmin"
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Control Panel
            </a>
          )}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">24</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Revenue</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">$125K</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Pending</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">8</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700">Profit</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">$25K</p>
          </div>
        </div>

        {/* Quick Actions - Different based on role */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/expense" className="bg-blue-100 text-blue-700 p-4 rounded-lg hover:bg-blue-200 transition-colors text-center font-semibold">
              Add Expense
            </a>
            <a href="/parties" className="bg-green-100 text-green-700 p-4 rounded-lg hover:bg-green-200 transition-colors text-center font-semibold">
              Manage Parties
            </a>
            <a href="/passports" className="bg-purple-100 text-purple-700 p-4 rounded-lg hover:bg-purple-200 transition-colors text-center font-semibold">
              Passport Tracking
            </a>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>New shipment created</span>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Payment received</span>
              <span className="text-sm text-gray-500">1 day ago</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span>Order completed</span>
              <span className="text-sm text-gray-500">2 days ago</span>
            </div>
          </div>
        </div>

        {/* Manager Only Section - Only for exact manager role */}
        {isManager() && (
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-xl font-bold mb-2 text-yellow-800">Manager Tools</h2>
            <p className="text-yellow-700 mb-4">Access your management tools and reports.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="/reports" className="bg-yellow-100 text-yellow-800 p-4 rounded-lg hover:bg-yellow-200 transition-colors text-center font-semibold">
                View Reports
              </a>
              <a href="/team" className="bg-yellow-100 text-yellow-800 p-4 rounded-lg hover:bg-yellow-200 transition-colors text-center font-semibold">
                Team Management
              </a>
            </div>
          </div>
        )}

        {/* Superadmin Only Section */}
        {isExactlySuperAdmin() && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-xl font-bold mb-2 text-red-800">Super Administrator Tools</h2>
            <p className="text-red-700 mb-4">Advanced system administration and user management.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="/superadmin" className="bg-red-100 text-red-800 p-4 rounded-lg hover:bg-red-200 transition-colors text-center font-semibold">
                System Administration
              </a>
              <a href="/audit-logs" className="bg-red-100 text-red-800 p-4 rounded-lg hover:bg-red-200 transition-colors text-center font-semibold">
                Audit Logs
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}