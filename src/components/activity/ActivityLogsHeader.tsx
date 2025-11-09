// src/components/activity/ActivityLogsHeader.tsx
import { FaSync } from "react-icons/fa";

interface ActivityLogsHeaderProps {
  title: string;
  totalEntries: number;
  showSyncBadge?: boolean;
  onSync?: () => void;
  isSyncing?: boolean;
}

export function ActivityLogsHeader({ 
  title, 
  totalEntries, 
  showSyncBadge = true,
  onSync,
  isSyncing = false
}: ActivityLogsHeaderProps) {
  const handleSyncClick = () => {
    if (onSync && !isSyncing) {
      onSync();
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {totalEntries} total entries
        </span>
        {showSyncBadge && (
          <button
            onClick={handleSyncClick}
            disabled={isSyncing}
            className={`
              flex items-center space-x-2 text-sm px-3 py-1 rounded transition-all duration-200
              ${isSyncing 
                ? 'text-primary/60 bg-primary/10 cursor-not-allowed' 
                : 'text-primary bg-primary/20 hover:bg-primary/30 hover:text-primary/90 cursor-pointer'
              }
            `}
          >
            <FaSync className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
          </button>
        )}
      </div>
    </div>
  );
}