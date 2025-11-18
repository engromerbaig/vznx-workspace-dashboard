// src/lib/roles.ts

export const ROLES = {
  SUPERADMIN: 'superadmin',
  MANAGER: 'manager',
  USER: 'user',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const ROLE_HIERARCHY: Record<UserRole, number> & Record<string, number> = {
  [ROLES.MANAGER]: 1,
  [ROLES.SUPERADMIN]: 2,
  [ROLES.USER]: 0,
};

// Centralized display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [ROLES.MANAGER]: 'Manager',
  [ROLES.SUPERADMIN]: 'Super Administrator',
  [ROLES.USER]: 'User',
};

// Global permissions
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [ROLES.SUPERADMIN]: ['create', 'read', 'update', 'delete'],
  [ROLES.MANAGER]: ['create', 'read'],
  [ROLES.USER]: ['read']
};

// Check if user has permission
export const canPerform = (userRole: string | undefined, action: string): boolean => {
  if (!userRole || !isValidRole(userRole)) return false;
  return ROLE_PERMISSIONS[userRole].includes(action);
};

// Compare role hierarchy
export const hasRole = (userRole: string | undefined, requiredRole: UserRole): boolean => {
  if (!userRole || !isValidRole(userRole)) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

export const hasExactRole = (userRole: string | undefined, requiredRole: UserRole): boolean => {
  return userRole === requiredRole;
};

export const getAllRoles = (): UserRole[] => Object.values(ROLES);
export const getRoleDisplayName = (role: UserRole): string => ROLE_DISPLAY_NAMES[role] || role;
export const isValidRole = (role: string): role is UserRole => getAllRoles().includes(role as UserRole);
