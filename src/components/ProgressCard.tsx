// src/components/ProgressCard.tsx
import { ReactNode } from 'react';

interface ProgressCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  color?: 'gray' | 'green' | 'blue' | 'orange' | 'red' | 'purple';
  size?: 'sm' | 'md' | 'lg';
}

export default function ProgressCard({ 
  title, 
  value, 
  icon, 
  color = 'gray',
  size = 'md'
}: ProgressCardProps) {
  const colorClasses = {
    gray: { 
      bg: 'bg-gradient-to-br from-gray-50 to-gray-100', 
      border: 'border-gray-200', 
      text: 'text-gray-800', 
      label: 'text-gray-600',
      iconBg: 'from-gray-200/30 to-gray-300/20'
    },
    green: { 
      bg: 'bg-gradient-to-br from-green-50 to-emerald-100', 
      border: 'border-green-200', 
      text: 'text-green-700', 
      label: 'text-green-800',
      iconBg: 'from-green-200/40 to-emerald-300/30'
    },
    blue: { 
      bg: 'bg-gradient-to-br from-blue-50 to-sky-100', 
      border: 'border-blue-200', 
      text: 'text-primary', 
      label: 'text-primary/90',
      iconBg: 'from-blue-200/40 to-sky-300/30'
    },
    orange: { 
      bg: 'bg-gradient-to-br from-orange-50 to-amber-100', 
      border: 'border-orange-200', 
      text: 'text-orange-700', 
      label: 'text-orange-800',
      iconBg: 'from-orange-200/40 to-amber-300/30'
    },
    red: { 
      bg: 'bg-gradient-to-br from-red-50 to-rose-100', 
      border: 'border-red-200', 
      text: 'text-red-700', 
      label: 'text-red-800',
      iconBg: 'from-red-200/40 to-rose-300/30'
    },
    purple: { 
      bg: 'bg-gradient-to-br from-purple-50 to-violet-100', 
      border: 'border-purple-200', 
      text: 'text-purple-700', 
      label: 'text-purple-800',
      iconBg: 'from-purple-200/40 to-violet-300/30'
    },
  };

  const sizeClasses = {
    sm: { 
      padding: 'p-4', 
      text: 'text-2xl font-bold', 
      label: 'text-sm font-semibold', 
      iconSize: 'text-4xl',
      container: 'min-h-[100px]'
    },
    md: { 
      padding: 'p-5', 
      text: 'text-3xl font-bold', 
      label: 'text-base font-semibold', 
      iconSize: 'text-5xl',
      container: 'min-h-[120px]'
    },
    lg: { 
      padding: 'p-6', 
      text: 'text-4xl font-bold', 
      label: 'text-lg font-semibold', 
      iconSize: 'text-6xl',
      container: 'min-h-[140px]'
    },
  };

  const currentColor = colorClasses[color];
  const currentSize = sizeClasses[size];

  return (
    <div className={`
      relative 
      ${currentColor.bg} 
      rounded-xl 
      ${currentSize.padding} 
      border 
      ${currentColor.border} 
      ${currentSize.container}
      shadow-sm 
      hover:shadow-md 
      transition-all 
      duration-300 
      overflow-hidden
      group
    `}>
      {/* Background Icon with Gradient */}
      {icon && (
        <div className={`
          absolute 
          -bottom-2 
          -right-2 
          ${currentSize.iconSize} 
          ${currentColor.text} 
          opacity-40 
          transform 
          group-hover:scale-110 
          group-hover:opacity-60 
          transition-all 
          duration-500
          z-0
        `}>
          {icon}
        </div>
      )}
      
      {/* Subtle Pattern Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentColor.iconBg} z-0`} />
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center">
        <div className={`${currentSize.text} ${currentColor.text} mb-2 leading-none`}>
          {value}
        </div>
        <div className={`${currentSize.label} ${currentColor.label} leading-tight`}>
          {title}
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-white/30 transition-all duration-300 pointer-events-none" />
    </div>
  );
}