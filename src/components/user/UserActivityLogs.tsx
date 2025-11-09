// src/components/user/UserActivityLogs.tsx
'use client';

import { useState } from 'react';
import { useActivityLogs } from "@/hooks/useActivityLogs";
import { ActivityLogsContainer } from "@/components/activity/ActivityLogsContainer";

interface UserActivityLogsProps {
  username: string;
}

export function UserActivityLogs({ username }: UserActivityLogsProps) {
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const { logs, pagination, isLoading, hasMore, loadMore, refetch } = useActivityLogs({
    username,
    limit: 10,
    realTime: true,
    initialLoadCount: 10
  });

  const handleSync = async () => {
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setTimeout(() => setIsManualRefreshing(false), 1000);
    }
  };

  return (
    <div className="h-[700px] overflow-y-auto custom-scrollbar">
      <ActivityLogsContainer
        logs={logs}
        pagination={pagination}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onSync={handleSync}
        isSyncing={isManualRefreshing}
        title="Your Activity Logs"
        showSyncBadge={true}
        variant="compact"
      />
    </div>
  );
}