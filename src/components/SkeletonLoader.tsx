'use client';

import React from 'react';

interface SkeletonLoaderProps {
  width?: string;
  height?: string;
  className?: string;
  count?: number;
  variant?: 'rect' | 'circle' | 'text';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = 'w-full',
  height = 'h-4',
  className = '',
  count = 1,
  variant = 'rect',
}) => {
  const baseStyles = 'bg-gray-200 animate-pulse';
  const shapeStyles = variant === 'circle' ? 'rounded-full' : variant === 'text' ? 'rounded' : 'rounded-lg';
  
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${baseStyles} ${shapeStyles} ${width} ${height} ${className}`}
        />
      ))}
    </>
  );
};

export default SkeletonLoader;