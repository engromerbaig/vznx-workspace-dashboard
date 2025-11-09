// Badge style utilities for consistent styling across the application

export interface BadgeStyle {
  background: string;
  text: string;
  border?: string;
}

// Centralized badge style definitions
export const BADGE_STYLES = {
  // Role badges
  superadmin: {
    background: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200'
  },
  admin: {
    background: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
  manager: {
    background: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200'
  },
  user: {
    background: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  
  // Status badges
  active: {
    background: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-200'
  },
  inactive: {
    background: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  },
  
  // Common status variants
  online: {
    background: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-200'
  },
  offline: {
    background: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200'
  },
  pending: {
    background: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200'
  },
  warning: {
    background: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200'
  },
  error: {
    background: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200'
  },
  success: {
    background: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  info: {
    background: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  }
} as const;

// Type for available badge variants
export type BadgeVariant = keyof typeof BADGE_STYLES;

// Get badge style by variant
export const getBadgeStyle = (variant: BadgeVariant): BadgeStyle => {
  return BADGE_STYLES[variant] || BADGE_STYLES.inactive;
};

// Utility function to generate badge classes
export const getBadgeClasses = (style: BadgeStyle, showBorder: boolean = true): string => {
  const baseClasses = `inline-flex items-center rounded-full font-medium ${style.background} ${style.text}`;
  const borderClass = showBorder ? `border ${style.border}` : '';
  return `${baseClasses} ${borderClass}`.trim();
};

// Utility function to get online status based on last activity
export const getOnlineStatus = (lastActivity?: string): { isOnline: boolean; text: string } => {
  if (!lastActivity) {
    return { isOnline: false, text: 'Inactive' };
  }

  const lastActive = new Date(lastActivity);
  const now = new Date();
  const minutesSinceActivity = (now.getTime() - lastActive.getTime()) / (1000 * 60);

  // Active if activity within last 5 minutes
  return minutesSinceActivity < 5 
    ? { isOnline: true, text: 'Active' } 
    : { isOnline: false, text: 'Inactive' };
};