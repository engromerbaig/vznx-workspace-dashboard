// components/SessionTakeoverListener.tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { usePusher } from '@/providers/PusherProvider';
import { useUser } from '@/context/UserContext';
import { useLogout } from '@/context/LogoutContext';
import { toast } from '@/components/ToastProvider';

export default function SessionTakeoverListener() {
  const { user } = useUser();
  const { pusher } = usePusher();
  const { handleGlobalLogout } = useLogout();
  const pathname = usePathname();
  
  const isHandlingTakeover = useRef(false);

  useEffect(() => {
    if (!pusher || !user) return;

    console.log('🔐 Setting up session takeover listener for user:', user._id);

    const channel = pusher.subscribe(`user-${user._id}`);
    
    const handleSessionTakeover = async (data: any) => {
      if (isHandlingTakeover.current) {
        console.log('🛑 Session takeover already being handled, skipping...');
        return;
      }

      isHandlingTakeover.current = true;
      console.log('🚨 Session takeover detected:', data);

      // Don't show takeover notification on login page
      if (pathname !== '/') {
        toast.custom(
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-sm font-bold">!</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-red-800 font-semibold">Session Taken Over</h3>
                <p className="text-red-700 text-sm mt-1">
                  Your account was logged in from another location. You will be logged out for security.
                </p>
              </div>
            </div>
          </div>,
          { 
            duration: 5000,
            position: 'top-center'
          }
        );
      }

      setTimeout(async () => {
        try {
          console.log('🚪 Executing session takeover logout...');
          await handleGlobalLogout();
        } catch (error) {
          console.error('Error during session takeover logout:', error);
          window.location.href = '/';
        } finally {
          setTimeout(() => {
            isHandlingTakeover.current = false;
          }, 1000);
        }
      }, pathname === '/' ? 0 : 2000);
    };

    const handleForceLogout = async (data: { reason: string; timestamp: string }) => {
      if (isHandlingTakeover.current) return;
      
      isHandlingTakeover.current = true;
      console.log('🚨 Force logout detected:', data);

      if (pathname !== '/') {
        toast.custom(
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-sm font-bold">!</span>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-orange-800 font-semibold">Session Terminated</h3>
                <p className="text-orange-700 text-sm mt-1">
                  {data.reason || 'Your session has been terminated by an administrator.'}
                </p>
              </div>
            </div>
          </div>,
          { 
            duration: 5000,
            position: 'top-center'
          }
        );
      }

      setTimeout(async () => {
        try {
          console.log('🚪 Executing force logout...');
          await handleGlobalLogout();
        } catch (error) {
          console.error('Error during force logout:', error);
          window.location.href = '/';
        } finally {
          setTimeout(() => {
            isHandlingTakeover.current = false;
          }, 1000);
        }
      }, pathname === '/' ? 0 : 2000);
    };

    // Bind event listeners
    channel.bind('session-takeover', handleSessionTakeover);
    channel.bind('force-logout', handleForceLogout);

    channel.bind('pusher:subscription_succeeded', () => {
      console.log('✅ Session takeover listener subscribed successfully');
    });

    channel.bind('pusher:subscription_error', (error: any) => {
      console.error('❌ Session takeover subscription error:', error);
    });

    // Cleanup on unmount ONLY - don't unsubscribe on user changes
    return () => {
      console.log('🧹 Cleaning up session takeover listener (unmount only)');
      if (channel) {
        channel.unbind('session-takeover', handleSessionTakeover);
        channel.unbind('force-logout', handleForceLogout);
        channel.unbind('pusher:subscription_succeeded');
        channel.unbind('pusher:subscription_error');
        // DON'T unsubscribe here - let Pusher manage the connection
      }
      isHandlingTakeover.current = false;
    };
  }, [pusher, user, handleGlobalLogout, pathname]);

  return null;
}