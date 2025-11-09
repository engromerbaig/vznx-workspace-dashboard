// src/components/activity/ActivityLogsSkeleton.tsx
import SkeletonLoader from "@/components/SkeletonLoader";

interface ActivityLogsSkeletonProps {
  variant?: 'default' | 'compact';
  count?: number;
}

export function ActivityLogsSkeleton({ 
  variant = 'default', 
  count = 6 
}: ActivityLogsSkeletonProps) {
  if (variant === 'compact') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-gray-300"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <SkeletonLoader width="w-48" height="h-6" />
        <div className="flex space-x-3">
          <SkeletonLoader width="w-24" height="h-6" />
          <SkeletonLoader width="w-16" height="h-6" />
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <SkeletonLoader width="w-24" height="h-4" />
                  <SkeletonLoader width="w-16" height="h-4" />
                </div>
                <SkeletonLoader width="w-3/4" height="h-3" className="mb-2" />
                <SkeletonLoader width="w-1/4" height="h-3" />
              </div>
              <SkeletonLoader width="w-16" height="h-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}