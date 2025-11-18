// src/lib/roles.ts

export const ROLES = {
  SUPERADMIN: 'superadmin',
  MANAGER: 'manager',
  VIEWER: 'viewer',        // ← renamed from 'user'
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES]; 
// 'superadmin' | 'manager' | 'viewer'

// Hierarchy: higher number = more privileges
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [ROLES.VIEWER]: 0,
  [ROLES.MANAGER]: 1,
  [ROLES.SUPERADMIN]: 2,
};

// Human-readable display names
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [ROLES.VIEWER]: 'Viewer',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.SUPERADMIN]: 'Super Administrator',
};

// Permissions per role
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [ROLES.SUPERADMIN]: ['create', 'read', 'update', 'delete'],
  [ROLES.MANAGER]:    ['create', 'read', 'update'],      // or keep 'delete' if needed
  [ROLES.VIEWER]:     ['read'],
};

// ─── Helpers ──────────────────────

const isValidRole = (role: string): role is UserRole =>
  role === ROLES.VIEWER || role === ROLES.MANAGER || role === ROLES.SUPERADMIN;

// Action permission check
export const canPerform = (userRole: string | undefined, action: string): boolean => {
  if (!userRole || !isValidRole(userRole)) return false;
  return ROLE_PERMISSIONS[userRole].includes(action);
};

// Hierarchy-aware role check (≥ required role)
export const hasRole = (userRole: string | undefined, requiredRole: UserRole): boolean => {
  if (!userRole || !isValidRole(userRole)) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

// Exact role match
export const hasExactRole = (userRole: string | undefined, requiredRole: UserRole): boolean => {
  return userRole === requiredRole;
};

// Utility functions
export const getAllRoles = (): UserRole[] => Object.values(ROLES) as UserRole[];
export const getRoleDisplayName = (role: UserRole): string => 
  ROLE_DISPLAY_NAMES[role] ?? role;