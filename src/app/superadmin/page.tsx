// src/app/superadmin/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRoles } from '@/hooks/useRoles';

export default function SuperAdminPage() {
  const { isSuperAdmin, isAuthenticated } = useRoles();
  const router = useRouter();

  // Redirect if not authenticated or not superadmin
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (!isSuperAdmin()) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isSuperAdmin, router]);

  // Show nothing while redirecting
  if (!isAuthenticated || !isSuperAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <h1 className="text-4xl font-bold text-white">
        This is superadmin protected area!
      </h1>
    </div>
  );
}