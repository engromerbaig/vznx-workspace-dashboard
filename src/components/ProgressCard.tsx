// src/components/ProgressCard.tsx
import { ReactNode } from 'react';
import { CgArrowTopRightO } from "react-icons/cg";

interface ProgressCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  color?: 'gray' | 'green' | 'blue' | 'orange' | 'red' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  href?: string; // Optional link
  onClick?: () => void; // Optional click handler
}

export default function ProgressCard({ 
  title, 
  value, 
  icon, 
  color = 'gray',
  size = 'lg', // Default size changed to 'lg'
  href,
  onClick
}: ProgressCardProps) {
  const colorClasses = {
    gray: { 
      bg: 'bg-gradient-to-br from-gray-50 to-gray-100/80', 
      border: 'border-gray-200/80', 
      text: 'text-gray-900', 
      label: 'text-gray-700',
      iconBg: 'from-gray-100 to-gray-200/50',
      hover: 'hover:shadow-gray-200/50'
    },
    green: { 
      bg: 'bg-gradient-to-br from-emerald-50/90 to-green-100/80', 
      border: 'border-emerald-200/80', 
      text: 'text-emerald-900', 
      label: 'text-emerald-800',
      iconBg: 'from-emerald-100 to-green-200/50',
      hover: 'hover:shadow-emerald-200/50'
    },
    blue: { 
      bg: 'bg-gradient-to-br from-blue-50/90 to-sky-100/80', 
      border: 'border-blue-200/80', 
      text: 'text-blue-900', 
      label: 'text-blue-800',
      iconBg: 'from-blue-100 to-sky-200/50',
      hover: 'hover:shadow-blue-200/50'
    },
    orange: { 
      bg: 'bg-gradient-to-br from-amber-50/90 to-orange-100/80', 
      border: 'border-amber-200/80', 
      text: 'text-amber-900', 
      label: 'text-amber-800',
      iconBg: 'from-amber-100 to-orange-200/50',
      hover: 'hover:shadow-amber-200/50'
    },
    red: { 
      bg: 'bg-gradient-to-br from-rose-50/90 to-red-100/80', 
      border: 'border-rose-200/80', 
      text: 'text-rose-900', 
      label: 'text-rose-800',
      iconBg: 'from-rose-100 to-red-200/50',
      hover: 'hover:shadow-rose-200/50'
    },
    purple: { 
      bg: 'bg-gradient-to-br from-violet-50/90 to-purple-100/80', 
      border: 'border-violet-200/80', 
      text: 'text-violet-900', 
      label: 'text-violet-800',
      iconBg: 'from-violet-100 to-purple-200/50',
      hover: 'hover:shadow-violet-200/50'
    }
  };

  const sizeClasses = {
    sm: { 
      padding: 'p-5', 
      text: 'text-3xl font-black',
      label: 'text-sm font-semibold', 
      iconSize: 'text-5xl',
      container: 'min-h-[110px]',
      linkIcon: 'text-lg'
    },
    md: { 
      padding: 'p-6', 
      text: 'text-4xl font-black',
      label: 'text-base font-semibold', 
      iconSize: 'text-6xl',
      container: 'min-h-[130px]',
      linkIcon: 'text-xl'
    },
    lg: { 
      padding: 'p-7', 
      text: 'text-5xl font-black',
      label: 'text-lg font-semibold', 
      iconSize: 'text-7xl',
      container: 'min-h-[180px]',
      linkIcon: 'text-2xl'
    }
  };

  const currentColor = colorClasses[color];
  const currentSize = sizeClasses[size];

  const CardContent = () => (
    <div className={`
      relative 
      ${currentColor.bg} 
      rounded-2xl 
      ${currentSize.padding} 
      border 
      ${currentColor.border} 
      ${currentSize.container}
      shadow-lg 
      ${currentColor.hover}
      hover:shadow-xl 
      hover:scale-[1.02]
      transition-all 
      duration-300 
      overflow-hidden
      group
      cursor-pointer
      flex flex-col justify-center // Ensure vertical centering
    `}>
      {/* Link Icon - Top Right */}
      {(href || onClick) && (
        <div className="absolute top-4 right-4 z-20">
          <CgArrowTopRightO className={`
            ${currentSize.linkIcon} 
            ${currentColor.text} 
            opacity-60 
            group-hover:opacity-100 
            group-hover:scale-110 
            transition-all 
            duration-300
          `} />
        </div>
      )}

      {/* Background Icon with Better Gradient */}
      {icon && (
        <div className={`
          absolute 
          bottom-4 
          right-4 
          ${currentSize.iconSize} 
          ${currentColor.text} 
          opacity-15
          transform 
          group-hover:scale-110 
          group-hover:opacity-25 
          transition-all 
          duration-500
          z-0
        `}>
          {icon}
        </div>
      )}
      
      {/* Enhanced Gradient Overlay */}
      <div className={`
        absolute 
        inset-0 
        bg-gradient-to-br 
        ${currentColor.iconBg} 
        opacity-60
        z-0
      `} />
      
      {/* Content - Always vertically centered */}
      <div className="relative z-10">
        <div className={`${currentSize.text} ${currentColor.text} mb-3 leading-tight drop-shadow-sm`}>
          {value}
        </div>
        <div className={`${currentSize.label} ${currentColor.label} leading-tight font-medium`}>
          {title}
        </div>
      </div>

      {/* Enhanced Hover Effect Border */}
      <div className="
        absolute 
        inset-0 
        rounded-2xl 
        border-2 
        border-transparent 
        group-hover:border-white/40 
        group-hover:shadow-inner
        transition-all 
        duration-300 
        pointer-events-none 
        z-0
      " />
    </div>
  );

  // Render as link if href is provided
  if (href) {
    return (
      <a href={href} className="block no-underline">
        <CardContent />
      </a>
    );
  }

  // Render as button if onClick is provided
  if (onClick) {
    return (
      <button onClick={onClick} className="block w-full text-left border-none bg-transparent p-0">
        <CardContent />
      </button>
    );
  }

  // Default render
  return <CardContent />;
}