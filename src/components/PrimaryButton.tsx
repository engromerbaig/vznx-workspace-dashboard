// components/PrimaryButton.tsx
'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface ButtonProps {
  text?: string;
  className?: string;
  to?: string;
  href?: string;
  onClick?: () => void;
  bgColor?: string;
  textColor?: string;
  hoverColor?: string;
  hoverTextColor?: string;
  rounded?: string;
  showIcon?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  border?: boolean;
  borderWidth?: string;
  borderColor?: string;
  hoverBorderColor?: string;
  shadow?: boolean;
  children?: ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  isLoading?: boolean;
  loadingText?: string;
}

export default function PrimaryButton({
  text,
  className = '',
  to,
  href,
  onClick,
  bgColor = 'bg-primary',
  textColor = 'text-white',
  hoverColor = 'bg-primary/90',
  hoverTextColor,
  rounded = 'rounded-lg',
  showIcon = false,
  icon: Icon,
  iconPosition = 'right',
  border = false,
  borderWidth = 'border',
  borderColor = 'border-transparent',
  hoverBorderColor,
  shadow = false,
  children,
  disabled = false,
  type = 'button',
  isLoading = false,
  loadingText = 'Loading...',
  ...props
}: ButtonProps) {
  const baseClasses = [
    'py-2.5 px-7',
    'flex items-center justify-center gap-1.5',
    'transition-all duration-300',
    'font-semibold',
    'cursor-pointer',
    'group',
    border ? borderWidth : 'border',
    borderColor,
    bgColor,
    textColor,
    `hover:${hoverColor}`,
    hoverTextColor ? `hover:${hoverTextColor}` : '',
    rounded,
    shadow ? 'shadow-md hover:shadow-lg' : '',
    hoverBorderColor ? `hover:${hoverBorderColor}` : '',
    disabled || isLoading ? 'opacity-50 cursor-not-allowed' : '',
    className,
  ].filter(Boolean).join(' ');

  const combinedClassName = baseClasses;

  // Simple loading spinner using Tailwind CSS only
  const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Create content with icon support for both children and text
  const renderContent = () => {
    // Show loading spinner when isLoading is true
    if (isLoading) {
      return (
        <div className="flex items-center justify-center gap-2">
          <LoadingSpinner />
          <span>{loadingText}</span>
        </div>
      );
    }

    // If children are provided, wrap them with icon logic
    if (children) {
      return (
        <span className="flex items-center gap-1.5">
          {/* Left Icon */}
          {showIcon && Icon && iconPosition === 'left' && (
            <span className="text-lg transition-transform duration-300 group-hover:-translate-x-1">
              <Icon />
            </span>
          )}

          {/* Children content */}
          {children}

          {/* Right Icon */}
          {showIcon && Icon && iconPosition === 'right' && (
            <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
              <Icon />
            </span>
          )}
        </span>
      );
    }

    // Original content logic for text-only
    return (
      <span className="flex items-center gap-1.5">
        {/* Left Icon */}
        {showIcon && Icon && iconPosition === 'left' && (
          <span className="text-lg transition-transform duration-300 group-hover:-translate-x-1">
            <Icon />
          </span>
        )}

        {/* Text */}
        <span className={`transition-transform duration-300 ${
          iconPosition === 'left' ? 'group-hover:translate-x-1' : 'group-hover:-translate-x-1'
        }`}>
          {text}
        </span>

        {/* Right Icon (default behavior) */}
        {showIcon && Icon && iconPosition === 'right' && (
          <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">
            <Icon />
          </span>
        )}
      </span>
    );
  };

  const content = renderContent();

  if (to) {
    return (
      <Link href={to} {...props} className={combinedClassName}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} {...props} className={combinedClassName}>
        {content}
      </a>
    );
  }

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled || isLoading}
      {...props} 
      className={combinedClassName}
    >
      {content}
    </button>
  );
}