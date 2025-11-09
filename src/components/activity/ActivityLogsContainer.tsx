// src/components/activity/ActivityLogsContainer.tsx
'use client';

import { ActivityLog } from '@/types/activity';
import { ActivityLogItem } from './ActivityLogItem';
import { ActivityLogsSkeleton } from './ActivityLogsSkeleton';
import { ActivityLogsHeader } from './ActivityLogsHeader';

interface ActivityLogsContainerProps {
  logs: ActivityLog[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  title?: string;
  showSyncBadge?: boolean;
  onSync?: () => void;
  isSyncing?: boolean;
  variant?: 'default' | 'compact';
}

export function ActivityLogsContainer({
  logs,
  pagination,
  isLoading,
  hasMore,
  onLoadMore,
  title = 'Activity Logs',
  showSyncBadge = true,
  onSync,
  isSyncing = false,
  variant = 'default'
}: ActivityLogsContainerProps) {
  if (isLoading) {
    return <ActivityLogsSkeleton variant={variant} />;
  }

  return (
    <div className='px-4'>
      <ActivityLogsHeader 
        title={title}
        totalEntries={pagination.total}
        showSyncBadge={showSyncBadge}
        onSync={onSync}
        isSyncing={isSyncing}
      />

      <div className="space-y-3">
        {logs.map((log, index) => (
          <ActivityLogItem 
            key={log._id} 
            log={log} 
            index={index}
            variant={variant}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onLoadMore}
            className="px-4 py-2 cursor-pointer bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Load More ({pagination.total - logs.length} remaining)
          </button>
        </div>
      )}

      {logs.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-lg">No activity logs found</p>
          <p className="text-sm text-gray-400 mt-1">
            Activities will appear here as they happen
          </p>
        </div>
      )}
    </div>
  );
}