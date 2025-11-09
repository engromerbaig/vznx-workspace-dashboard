// src/components/AuthProviderWrapper.tsx (Updated)
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { useLogout } from '@/context/LogoutContext';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from './ToastProvider';
import { AUTH_CONFIG, getInactivityTimeoutMs, getWarningCountdown } from '@/lib/auth-config';
import InactivityModal from './InactivityModal';
import Loading from '@/app/loading';

export default function AuthProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setUser } = useUser();
  const { handleGlobalLogout } = useLogout();
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const [countdown, setCountdown] = useState<number>(getWarningCountdown());
  
  const inactivityWarningRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const authCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Don't show modal on login page
  const shouldShowModal = showInactivityModal && pathname !== '/' && !!user;

  const isRememberMeEnabled = useCallback(() => {
    if (typeof document === 'undefined') return false;
    
    const rememberMeCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${AUTH_CONFIG.REMEMBER_ME.COOKIE_NAME}=`));
    
    return rememberMeCookie ? rememberMeCookie.split('=')[1] === 'true' : false;
  }, []);

  const handleAutoLogout = useCallback(async () => {
    setShowInactivityModal(false);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    toast.error('Session expired due to inactivity');
    await handleGlobalLogout();
  }, [handleGlobalLogout]);

  const startActivityCheckTimer = useCallback(() => {
    // Clear existing timers
    if (inactivityWarningRef.current) {
      clearTimeout(inactivityWarningRef.current);
      inactivityWarningRef.current = null;
    }
    
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    // Don't set timers on public routes
    if (pathname === '/') {
      return;
    }

    const rememberMeDisabled = !isRememberMeEnabled();
    
    if (rememberMeDisabled && user) {
      const inactivityTimeoutMs = getInactivityTimeoutMs(false);
      
      inactivityWarningRef.current = setTimeout(() => {
        setShowInactivityModal(true);
        setCountdown(getWarningCountdown());
        
        countdownRef.current = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              if (countdownRef.current) clearInterval(countdownRef.current);
              handleAutoLogout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
      }, inactivityTimeoutMs);
    }
  }, [user, isRememberMeEnabled, handleAutoLogout, pathname]);

  const handleUserActive = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    
    setShowInactivityModal(false);
    setCountdown(getWarningCountdown());
    startActivityCheckTimer();
  }, [startActivityCheckTimer]);

  const extendSession = useCallback(async () => {
    try {
      const res = await fetch(AUTH_CONFIG.ENDPOINTS.EXTEND_SESSION, { 
        method: 'POST' 
      });
      
      if (res.ok) {
        handleUserActive();
        toast.success('Session extended');
      } else {
        throw new Error('Failed to extend session');
      }
    } catch (error) {
      toast.error('Failed to extend session');
      // Even if extension fails, keep user logged in for now
      handleUserActive();
    }
  }, [handleUserActive]);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(AUTH_CONFIG.ENDPOINTS.ME);
      const data = await res.json();

      if (data.status === 'success' && data.user) {
        setUser(data.user);
        
        // Redirect logic - only if on login page
        if (pathname === '/') {
          router.push('/dashboard');
        }
      } else {
        setUser(null);
        
        // Only redirect if trying to access protected routes
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/superadmin')) {
          router.push('/');
        }
      }
    } catch (error) {
      setUser(null);
      
      if (pathname.startsWith('/dashboard') || pathname.startsWith('/superadmin')) {
        router.push('/');
      }
    } finally {
      setIsChecking(false);
    }
  }, [setUser, pathname, router]);

  // Handle user activity ONLY when modal is shown
  useEffect(() => {
    if (!shouldShowModal) return;

    const handleUserActivity = () => {
      handleUserActive();
    };

    document.addEventListener('mousemove', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('click', handleUserActivity);
    document.addEventListener('scroll', handleUserActivity);

    return () => {
      document.removeEventListener('mousemove', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('click', handleUserActivity);
      document.removeEventListener('scroll', handleUserActivity);
    };
  }, [shouldShowModal, handleUserActive]);

  // Initial setup
  useEffect(() => {
    checkAuth();
    startActivityCheckTimer();

    authCheckIntervalRef.current = setInterval(checkAuth, 20 * 60 * 1000);

    return () => {
      if (inactivityWarningRef.current) {
        clearTimeout(inactivityWarningRef.current);
      }
      
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      
      if (authCheckIntervalRef.current) {
        clearInterval(authCheckIntervalRef.current);
      }
    };
  }, []);

  // Restart timer when user or pathname changes
  useEffect(() => {
    if (user && !isChecking) {
      startActivityCheckTimer();
    }
  }, [user, isChecking, startActivityCheckTimer, pathname]);

  if (isChecking && (pathname.startsWith('/dashboard') )) {
    return <Loading />;
  }

  return (
    <>
      {children}
      <InactivityModal 
        isOpen={shouldShowModal}
        countdown={countdown}
        onExtend={extendSession}
      />
    </>
  );
}