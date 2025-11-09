'use client';

import { getBadgeStyle, getBadgeClasses, BadgeVariant, BADGE_STYLES } from '@/utils/badgeStyles';

// Base Badge Component
interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  showBorder?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  title?: string;
}

export default function Badge({ 
  children, 
  variant = 'inactive',
  className = '', 
  showBorder = true, 
  size = 'md',
  onClick,
  title
}: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  const style = getBadgeStyle(variant);
  const baseClasses = getBadgeClasses(style, showBorder);
  const sizeClass = sizeClasses[size];
  const clickableClass = onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : '';

  return (
    <span 
      className={`${baseClasses} ${sizeClass} ${clickableClass} ${className}`}
      onClick={onClick}
      title={title}
    >
      {children}
    </span>
  );
}

// Pre-styled badge variants for common use cases

// Role Badge
interface RoleBadgeProps {
  role: string;
  size?: 'sm' | 'md' | 'lg';
  showBorder?: boolean;
  className?: string;
}

export function RoleBadge({ role, size = 'md', showBorder = true, className = '' }: RoleBadgeProps) {
  // Use the role as variant if it exists, otherwise fallback to 'user'
  const variant = Object.keys(BADGE_STYLES).includes(role) ? role as BadgeVariant : 'user';
  
  return (
    <Badge variant={variant} size={size} showBorder={showBorder} className={className}>
      {role}
    </Badge>
  );
}

// Status Badge (Active/Inactive)
interface StatusBadgeProps {
  isActive: boolean;
  size?: 'sm' | 'md' | 'lg';
  showBorder?: boolean;
  className?: string;
}

export function StatusBadge({ isActive, size = 'md', showBorder = true, className = '' }: StatusBadgeProps) {
  const variant = isActive ? 'active' : 'inactive';
  
  return (
    <Badge variant={variant} size={size} showBorder={showBorder} className={className}>
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
}

// Online Status Badge (Alias for StatusBadge - for consistency)
export const OnlineStatusBadge = StatusBadge;

// Generic Variant Badge (for any predefined variant)
interface VariantBadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showBorder?: boolean;
  className?: string;
}

export function VariantBadge({ variant, children, size = 'md', showBorder = true, className = '' }: VariantBadgeProps) {
  return (
    <Badge variant={variant} size={size} showBorder={showBorder} className={className}>
      {children}
    </Badge>
  );
}

// Export all available variants for easy access
export { BADGE_STYLES };
export type { BadgeVariant };