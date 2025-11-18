// src/app/superadmin/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { ROLES, hasRole } from '@/lib/roles';

export default function SuperAdminPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while still loading
    if (isLoading) return;

    // After loading, check authentication
    if (!user) {
      router.replace('/login');
      return;
    }

    if (!hasRole(user.role, ROLES.SUPERADMIN)) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  // Show loading while checking
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <h1 className="text-4xl font-bold text-white">
        This is superadmin protected area!
      </h1>
    </div>
  );
}