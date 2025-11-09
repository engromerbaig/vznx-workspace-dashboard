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

// ✅ Centralized display names (used by both frontend and backend)
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [ROLES.MANAGER]: 'Manager',
  [ROLES.SUPERADMIN]: 'Super Administrator',
  [ROLES.USER]: 'User',
};

export const hasRole = (userRole: string | undefined, requiredRole: UserRole): boolean => {
  if (!userRole || !isValidRole(userRole)) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

export const hasExactRole = (userRole: string | undefined, requiredRole: UserRole): boolean => {
  return userRole === requiredRole;
};

export const getAllRoles = (): UserRole[] => {
  return Object.values(ROLES);
};

export const getRoleDisplayName = (role: UserRole): string => {
  return ROLE_DISPLAY_NAMES[role] || role;
};

export const isValidRole = (role: string): role is UserRole => {
  return getAllRoles().includes(role as UserRole);
};