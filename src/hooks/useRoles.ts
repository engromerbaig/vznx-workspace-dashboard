// src/hooks/useRoles.ts
import { useUser } from '@/context/UserContext';
import { ROLES, hasRole } from '@/lib/roles';

export function useRoles() {
  const { user } = useUser();

  const isSuperAdmin = () => hasRole(user?.role, ROLES.SUPERADMIN);
  const isManager = () => hasRole(user?.role, ROLES.MANAGER);
  const isUser = () => hasRole(user?.role, ROLES.USER);
  
  // For exact role matching (if needed)
  const isExactlySuperAdmin = () => user?.role === ROLES.SUPERADMIN;
  const isExactlyManager = () => user?.role === ROLES.MANAGER;
  const isExactlyUser = () => user?.role === ROLES.USER;

  // Check if user has at least a certain role (hierarchy)
  const hasAtLeastManagerRole = () => hasRole(user?.role, ROLES.MANAGER);
  const hasAtLeastUserRole = () => hasRole(user?.role, ROLES.USER);

  return {
    // Role checks
    isSuperAdmin,
    isManager, 
    isUser,
    
    // Exact role checks
    isExactlySuperAdmin,
    isExactlyManager,
    isExactlyUser,
    
    // Hierarchy checks
    hasAtLeastManagerRole,
    hasAtLeastUserRole,
    
    // Raw data
    userRole: user?.role,
    isAuthenticated: !!user
  };
}