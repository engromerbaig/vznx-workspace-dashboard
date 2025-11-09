'use client';

import { FaEdit, FaTrash } from 'react-icons/fa';
import { formatDate, formatTime, formatDateTime, formatRelativeTime } from '@/utils/dateFormatter';
import { BaseUser } from '@/types/user';
import { getOnlineStatus } from '@/utils/badgeStyles';
import { RoleBadge, StatusBadge } from '@/components/ui/Badge';
import SkeletonLoader from '../SkeletonLoader';
import { usePagination } from '@/hooks/usePagination';

interface UsersTabProps {
  users: BaseUser[];
  onDeleteUser: (userId: string, userName: string) => void;
  isLoading?: boolean;
}

const UsersTab = ({ users, onDeleteUser, isLoading = false }: UsersTabProps) => {
  const { visibleItems, hasMore, loadMore } = usePagination(users, 20, 20);

  if (isLoading) {
    return (
      <div className="w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Users</h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 space-y-4">
            {/* Simulate skeleton rows */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-gray-100 pb-3"
              >
                <div className="flex-1 space-y-2">
                  <SkeletonLoader width="w-32" height="h-4" />
                  <SkeletonLoader width="w-48" height="h-3" />
                  <SkeletonLoader width="w-24" height="h-3" />
                </div>
                <SkeletonLoader width="w-20" height="h-4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">System Users</h3>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibleItems.map((user) => {
                const onlineStatus = getOnlineStatus(user.lastActivity ?? undefined);

                return (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-sm text-gray-400">@{user.username}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin ? (
                        <div>
                          <div>{formatDate(user.lastLogin)}</div>
                          <div className="text-xs text-gray-400">{formatTime(user.lastLogin)}</div>
                        </div>
                      ) : (
                        'Never'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastActivity ? (
                        <div>
                          <div>{formatRelativeTime(user.lastActivity)}</div>
                          <div className="text-xs text-gray-400">{formatDateTime(user.lastActivity)}</div>
                        </div>
                      ) : (
                        'No activity'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge
                        isActive={onlineStatus.isOnline}
                        size="sm"
                        className="w-fit"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Edit User"
                        >
                          <FaEdit />
                        </button>
                        {user.role !== 'superadmin' && (
                          <button
                            onClick={() => onDeleteUser(user._id, user.name)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Delete User"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={loadMore}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Load More
              </button>
            </div>
          )}

          {users.length === 0 && (
            <div className="text-center py-8 text-gray-500">No users found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersTab;
