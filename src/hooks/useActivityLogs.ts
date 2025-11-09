// src/hooks/useActivityLogs.ts
'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { usePusher } from '@/providers/PusherProvider';
import { ActivityLog, PaginationInfo } from '@/types/activity';

interface UseActivityLogsProps {
  username?: string;
  limit?: number;
  realTime?: boolean;
  initialLoadCount?: number; // Initial number of logs to show
}

export function useActivityLogs({ 
  username, 
  limit = 20, // Default to 20 for better performance
  realTime = true,
  initialLoadCount = 20
}: UseActivityLogsProps = {}) {
  const { pusher, isConnected } = usePusher();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit,
    total: 0,
    pages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [context, setContext] = useState<{ isSuperAdmin: boolean; filteredUser: string | null }>({
    isSuperAdmin: false,
    filteredUser: null
  });
  const [error, setError] = useState<string | null>(null);
  
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  // Build API URL with filters
  const buildApiUrl = useCallback((page: number = 1, customLimit?: number) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: (customLimit || limit).toString()
    });
    
    if (username) {
      params.append('username', username);
    }
    
    return `/api/admin/activity-logs?${params.toString()}`;
  }, [username, limit]);

  // Fetch logs
  const fetchLogs = useCallback(async (page: number = 1, customLimit?: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const apiUrl = buildApiUrl(page, customLimit);
      console.log('🔍 Fetching activity logs:', { page, limit: customLimit || limit, username });
      
      const res = await fetch(apiUrl);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.status === 'success') {
        console.log('✅ Successfully fetched logs:', data.logs.length);
        
        if (page === 1) {
          // Replace logs for first page
          setLogs(data.logs);
        } else {
          // Append logs for subsequent pages
          setLogs(prev => [...prev, ...data.logs]);
        }
        
        setPagination(data.pagination);
        setContext(data.context || { isSuperAdmin: false, filteredUser: null });
      } else {
        throw new Error(data.message || 'Failed to fetch activity logs');
      }
    } catch (error) {
      console.error('❌ Failed to fetch activity logs:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [buildApiUrl, limit, username]);

  // Initial load with specified count
  useEffect(() => {
    fetchLogs(1, initialLoadCount);
  }, [fetchLogs, initialLoadCount]);

  // Real-time updates
  useEffect(() => {
    if (!pusher || !isConnected || !realTime || isSubscribedRef.current) {
      return;
    }

    console.log('🔔 Subscribing to activity-logs channel for', username || 'all activities');

    try {
      const channel = pusher.subscribe('activity-logs');
      channelRef.current = channel;
      isSubscribedRef.current = true;

      const handleNewActivity = (newLog: ActivityLog) => {
        console.log('📝 New real-time activity:', newLog);
        
        // Only add if it matches our filter
        const shouldInclude = !username || 
          newLog.userId === username || 
          newLog.username === username;

        if (shouldInclude) {
          setLogs(prevLogs => {
            const newLogs = [newLog, ...prevLogs];
            // Keep only the most recent logs (up to limit * 2 for buffer)
            return newLogs.slice(0, limit * 2);
          });
          
          setPagination(prev => ({
            ...prev,
            total: prev.total + 1
          }));
        }
      };

      channel.bind('new-activity', handleNewActivity);
      channelRef.current._boundHandlers = { 'new-activity': handleNewActivity };

    } catch (error) {
      console.error('❌ Error subscribing to activity-logs:', error);
    }

    return () => {
      // Cleanup handled separately
    };
  }, [pusher, isConnected, realTime, username, limit]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (channelRef.current && isSubscribedRef.current) {
        console.log('🧹 Cleaning up activity-logs channel');
        try {
          if (channelRef.current._boundHandlers) {
            channelRef.current.unbind('new-activity', channelRef.current._boundHandlers['new-activity']);
          }
          channelRef.current.unsubscribe();
        } catch (error) {
          // Ignore unsubscribe errors
        }
        isSubscribedRef.current = false;
        channelRef.current = null;
      }
    };
  }, [pusher]);

  const hasMore = pagination.page < pagination.pages;
  const loadMore = () => fetchLogs(pagination.page + 1);

  return { 
    logs, 
    pagination, 
    isLoading, 
    context,
    error,
    refetch: () => fetchLogs(1, initialLoadCount),
    hasMore,
    loadMore
  };
}