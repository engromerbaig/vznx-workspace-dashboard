// components/EmptyState.tsx
import { ReactNode } from 'react';
import PrimaryButton from './PrimaryButton';

export interface EmptyStateProps {
  // Content
  icon?: ReactNode | string;
  title: string;
  description: string;
  
  // Primary Action
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<any>;
    showIcon?: boolean;
  };
  
  // Layout
  size?: 'sm' | 'md' | 'lg';
}

export default function EmptyState({
  icon,
  title,
  description,
  primaryAction,
  size = 'md'
}: EmptyStateProps) {
  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'py-8',
      icon: 'text-3xl mb-2',
      title: 'text-lg',
      description: 'text-sm max-w-sm',
    },
    md: {
      container: 'py-12 sm:py-16',
      icon: 'text-4xl sm:text-5xl mb-3 sm:mb-4',
      title: 'text-lg sm:text-xl',
      description: 'text-sm sm:text-base max-w-md',
    },
    lg: {
      container: 'py-16 sm:py-20',
      icon: 'text-5xl sm:text-6xl mb-4',
      title: 'text-xl sm:text-2xl',
      description: 'text-base sm:text-lg max-w-lg',
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 ${config.container} text-center`}>
      {/* Icon */}
      {icon && (
        <div className={`${config.icon} flex justify-center`}>
          {typeof icon === 'string' ? (
            <span>{icon}</span>
          ) : (
            icon
          )}
        </div>
      )}
      
      {/* Title */}
      <h3 className={`font-semibold text-gray-700 mb-2 ${config.title}`}>
        {title}
      </h3>
      
      {/* Description */}
      <p className={`text-gray-500 mb-6 mx-auto px-4 ${config.description}`}>
        {description}
      </p>
      
      {/* Actions */}
      {primaryAction && (
        <div className="flex justify-center">
          <PrimaryButton
            onClick={primaryAction.onClick}
            showIcon={primaryAction.showIcon}
            icon={primaryAction.icon}
          >
            {primaryAction.label}
          </PrimaryButton>
        </div>
      )}
    </div>
  );
}