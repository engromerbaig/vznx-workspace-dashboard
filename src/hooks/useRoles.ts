// src/hooks/useRoles.ts
import { useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { ROLES, hasRole } from '@/lib/roles';

export function useRoles() {
  const { user } = useUser();
  const role = user?.role;

  return useMemo(() => {
    const isSuperAdmin = hasRole(role, ROLES.SUPERADMIN);
    const isManager = hasRole(role, ROLES.MANAGER);
    const isViewer = hasRole(role, ROLES.VIEWER);

    return {
      // Role checks
      isSuperAdmin,
      isManager,
      isViewer,

      // Exact matches
      isExactlySuperAdmin: role === ROLES.SUPERADMIN,
      isExactlyManager: role === ROLES.MANAGER,
      isExactlyViewer: role === ROLES.VIEWER,

      // Hierarchy
      hasAtLeastManagerRole: hasRole(role, ROLES.MANAGER),
      hasAtLeastViewerRole: !!user, // any authenticated user is at least Viewer

      // Raw
      userRole: role as 'superadmin' | 'manager' | 'viewer' | undefined,
      isAuthenticated: !!user,
    };
  }, [role, user]);
}