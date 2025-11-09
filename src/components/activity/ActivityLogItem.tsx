// src/components/activity/ActivityLogItem.tsx
import { IoMdTime } from "react-icons/io";
import { formatDate, formatTime } from "@/utils/dateFormatter";
import { ActivityLog } from "@/types/activity";
import { VariantBadge } from "@/components/ui/Badge";

const ACTION_VARIANTS: Record<string, string> = {
  LOGIN: 'success',
  LOGOUT: 'inactive',
  LOGIN_BLOCKED: 'error',
  USER_CREATED: 'info',
  DELETE_USER: 'error',
  PROFILE_UPDATED: 'warning',
  SESSION_TAKEOVER: 'warning',
  TRANSACTION_CREATED: 'info',
  INVOICE_GENERATED: 'pending',
  PASSWORD_CHANGED: 'info'
};

interface ActivityLogItemProps {
  log: ActivityLog;
  index: number;
  variant?: 'default' | 'compact';
  animate?: boolean;
  animationDelay?: number;
}

export function ActivityLogItem({ 
  log, 
  index, 
  variant = 'default', 
  animate = true,
  animationDelay = 0 
}: ActivityLogItemProps) {
  // Calculate animation class based on index and delay
  const getAnimationClass = () => {
    if (!animate) return '';
    
    const baseClass = 'fade-in';
    const delayClass = animationDelay > 0 ? `fade-in-delay-${Math.min(Math.floor(animationDelay / 100), 5)}` : '';
    
    return delayClass || baseClass;
  };

  if (variant === 'compact') {
    return (
      <div className={`flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all duration-300 ${getAnimationClass()}`}>
        <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold scale-in">
          {index + 1}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <VariantBadge
                  variant={(ACTION_VARIANTS[log.action] as any) || 'inactive'}
                  size="sm"
                >
                  {log.action.replace('_', ' ')}
                </VariantBadge>
              </div>
              <p className="text-sm text-gray-600">{log.description}</p>
            </div>
            
            <div className="flex items-start space-x-2 text-gray-500 ml-4">
              <IoMdTime className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <div className="text-right">
                <div className="text-xs whitespace-nowrap">{formatDate(log.timestamp)}</div>
                <div className="text-xs text-gray-400">{formatTime(log.timestamp)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md ${getAnimationClass()}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold scale-in">
              {index + 1}
            </div>

            <div className="flex items-center space-x-2 slide-in-left">
              <span className="font-medium text-gray-900">{log.userName}</span>
              {log.username && (
                <>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-500">@{log.username}</span>
                </>
              )}
            </div>

            <VariantBadge
              variant={(ACTION_VARIANTS[log.action] as any) || 'inactive'}
              size="sm"
              className="scale-in"
            >
              {log.action.replace('_', ' ')}
            </VariantBadge>
          </div>

          <p className="text-sm text-gray-600 mb-2 fade-in-quick">{log.description}</p>
        </div>

        <div className="flex items-start space-x-2 ml-4 text-gray-500 slide-in-left">
          <IoMdTime className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="text-right">
            <div className="text-sm whitespace-nowrap">{formatDate(log.timestamp)}</div>
            <div className="text-xs text-gray-400">{formatTime(log.timestamp)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}