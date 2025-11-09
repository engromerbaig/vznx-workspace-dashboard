// src/hooks/useAuth.ts
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

interface UseAuthOptions {
  redirectTo?: string;
  requiredRole?: string;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(false);
  const { redirectTo = '/', requiredRole } = options;

  useEffect(() => {
    const checkAuth = async () => {
      // Prevent multiple simultaneous checks
      if (isChecking) return;
      
      setIsChecking(true);

      try {
        const res = await fetch('/api/auth/me', { 
          method: 'GET',
          // Add caching to prevent excessive calls
          next: { revalidate: 60 } // Cache for 60 seconds
        });
        
        const data = await res.json();
        
        if (data.status === 'success') {
          setUser(data.user);
          
          // Check role requirement
          if (requiredRole && data.user.role !== requiredRole) {
            router.push('/dashboard');
          }
        } else {
          setUser(null);
          router.push(redirectTo);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        router.push(redirectTo);
      } finally {
        setIsChecking(false);
      }
    };

    // Only check if user is null AND we're not already checking
    if (!user && !isChecking) {
      checkAuth();
    } else if (requiredRole && user?.role !== requiredRole) {
      router.push('/dashboard');
    }
  }, [user, setUser, router, redirectTo, requiredRole, isChecking]);

  return { user, isLoading: !user && isChecking };
}