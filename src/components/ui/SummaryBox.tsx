'use client';

import { ReactNode } from 'react';

export interface SummaryBoxProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  default: {
    bg: 'bg-white',
    border: 'border-gray-200',
    text: 'text-gray-900',
    icon: 'text-gray-500'
  },
  primary: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    icon: 'text-blue-500'
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
    icon: 'text-green-500'
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    icon: 'text-amber-500'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-900',
    icon: 'text-red-500'
  },
  info: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-900',
    icon: 'text-cyan-500'
  }
};

export default function SummaryBox({
  title,
  value,
  description,
  icon,
  variant = 'default',
  trend,
  className = '',
  onClick
}: SummaryBoxProps) {
  const styles = variantStyles[variant];
  const clickableClass = onClick ? 'cursor-pointer hover:shadow-md transition-shadow duration-200' : '';

  return (
    <div 
      className={`border rounded-lg p-6 ${styles.bg} ${styles.border} ${clickableClass} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${styles.text} mb-1`}>
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className={`text-2xl font-bold ${styles.text}`}>
              {value}
            </p>
            {trend && (
              <span className={`text-xs font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            )}
          </div>
          {description && (
            <p className={`text-xs ${styles.text} opacity-75 mt-1`}>
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-2 rounded-lg ${styles.icon} bg-white bg-opacity-50`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// Pre-styled variants for common use cases
interface UserSummaryBoxProps {
  title: string;
  value: number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function UserSummaryBox({ title, value, description, icon, trend }: UserSummaryBoxProps) {
  return (
    <SummaryBox
      title={title}
      value={value}
      description={description}
      icon={icon}
      variant="primary"
      trend={trend}
    />
  );
}

interface StatsSummaryBoxProps {
  title: string;
  value: number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsSummaryBox({ title, value, description, icon, trend }: StatsSummaryBoxProps) {
  return (
    <SummaryBox
      title={title}
      value={value}
      description={description}
      icon={icon}
      variant="info"
      trend={trend}
    />
  );
}

interface OnlineSummaryBoxProps {
  title: string;
  value: number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function OnlineSummaryBox({ title, value, description, icon, trend }: OnlineSummaryBoxProps) {
  return (
    <SummaryBox
      title={title}
      value={value}
      description={description}
      icon={icon}
      variant="success"
      trend={trend}
    />
  );
}