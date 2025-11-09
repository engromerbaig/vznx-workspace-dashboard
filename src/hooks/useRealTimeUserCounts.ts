// src/hooks/useRealTimeUserCounts.ts
'use client';
import { useEffect, useState } from 'react';
import { usePusher } from '@/providers/PusherProvider'; // Updated import

interface UserCounts {
  totalUsers: number;
  totalSuperadmins: number;
  totalManagers: number;
  totalOnline: number;
}

export function useRealTimeUserCounts() {
  const { pusher, isConnected } = usePusher(); // Use global Pusher
  const [counts, setCounts] = useState<UserCounts>({
    totalUsers: 0,
    totalSuperadmins: 0,
    totalManagers: 0,
    totalOnline: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch('/api/admin/users/counts');
        const data = await res.json();
        
        if (data.status === 'success') {
          setCounts(data.counts);
        }
      } catch (error) {
        console.error('Failed to fetch user counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    if (!pusher || !isConnected) {
      console.log('⏳ Pusher not ready for user counts');
      return;
    }

    console.log('🔔 Subscribing to user-counts channel');

    const channel = pusher.subscribe('user-counts');
    
    channel.bind('counts-updated', (newCounts: UserCounts) => {
      console.log('📊 Real-time counts update:', newCounts);
      setCounts(newCounts);
    });

    const userChannel = pusher.subscribe('user-updates');
    
    const refetchCounts = () => {
      fetch('/api/admin/users/counts')
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setCounts(data.counts);
          }
        });
    };

    userChannel.bind('user-created', refetchCounts);
    userChannel.bind('user-deleted', refetchCounts);
    userChannel.bind('user-logged-in', refetchCounts);
    userChannel.bind('user-logged-out', refetchCounts);

    return () => {
      console.log('🧹 Unsubscribing from user channels');
      channel.unbind_all();
      channel.unsubscribe();
      userChannel.unbind_all();
      userChannel.unsubscribe();
    };
  }, [pusher, isConnected]);

  return { counts, isLoading };
}