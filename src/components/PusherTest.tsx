// components/PusherStatus.tsx
'use client';
import { usePusherConnection } from '@/hooks/usePusherConnection';

export function PusherTest() {
  const { status } = usePusherConnection();
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
        status === 'connected' ? 'bg-green-100 text-green-800' :
        status === 'error' ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {status === 'connected' ? '🟢 Live' :
         status === 'error' ? '🔴 Offline' :
         '🟡 Connecting...'}
      </div>
    </div>
  );
}