// src/lib/server/role-utils.ts
import { 
  ROLES, 
  UserRole,
  hasRole,
  hasExactRole,
  getRoleDisplayName,
  isValidRole,
  getAllRoles
} from '@/lib/roles';

// Re-export directly (no need for server suffix)
export {
  hasRole,
  hasExactRole,
  getRoleDisplayName,
  isValidRole,
  getAllRoles
};

// Specific role checks (for convenience)
export const isSuperAdmin = (userRole: string | undefined): boolean => 
  hasRole(userRole, ROLES.SUPERADMIN);

export const isExactlySuperAdmin = (userRole: string | undefined): boolean => 
  hasExactRole(userRole, ROLES.SUPERADMIN);

export const isManager = (userRole: string | undefined): boolean => 
  hasRole(userRole, ROLES.MANAGER);

export const isExactlyManager = (userRole: string | undefined): boolean => 
  hasExactRole(userRole, ROLES.MANAGER);

export const isUser = (userRole: string | undefined): boolean => 
  hasRole(userRole, ROLES.USER);

export const isExactlyUser = (userRole: string | undefined): boolean => 
  hasExactRole(userRole, ROLES.USER);

export const hasAtLeastManagerRole = (userRole: string | undefined): boolean => 
  hasRole(userRole, ROLES.MANAGER);

export const hasAtLeastUserRole = (userRole: string | undefined): boolean => 
  hasRole(userRole, ROLES.USER);