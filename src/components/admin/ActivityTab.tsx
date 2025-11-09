// src/components/admin/ActivityTab.tsx
import { useState } from 'react';
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { ActivityLogsContainer } from "@/components/activity/ActivityLogsContainer";

const ActivityTab = () => {
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const { logs, pagination, isLoading, context, hasMore, loadMore, refetch } = useActivityLogs({
    limit: 20,
    realTime: true,
    initialLoadCount: 20
  });

  const handleSync = async () => {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setTimeout(() => setIsManualRefreshing(false), 1000);
    }
  };

  const title = context.filteredUser 
    ? `Activity Logs for @${context.filteredUser}` 
    : 'System Activity Logs';

  return (
    <ActivityLogsContainer
      logs={logs}
      pagination={pagination}
      isLoading={isLoading}
      hasMore={hasMore}
      onLoadMore={loadMore}
      onSync={handleSync}
      isSyncing={isManualRefreshing}
      title={title}
      showSyncBadge={true}
      variant="default"
    />
  );
};

export default ActivityTab;