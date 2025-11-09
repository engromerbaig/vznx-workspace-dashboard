// src/providers/PusherProvider.tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import Pusher from 'pusher-js';

interface PusherContextType {
  pusher: Pusher | null;
  isConnected: boolean;
}

const PusherContext = createContext<PusherContextType>({
  pusher: null,
  isConnected: false
});

export function PusherProvider({ children }: { children: React.ReactNode }) {
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const appKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    if (!appKey || !cluster) {
      console.error('❌ Pusher credentials missing');
      return;
    }

    console.log('🔌 Initializing global Pusher instance...');

    const pusherClient = new Pusher(appKey, {
      cluster: cluster,
      forceTLS: true,
    });

    pusherClient.connection.bind('connected', () => {
      console.log('✅ Global Pusher connected!');
      setIsConnected(true);
      setPusher(pusherClient);
    });

    pusherClient.connection.bind('disconnected', () => {
      console.log('🔌 Global Pusher disconnected');
      setIsConnected(false);
    });

    pusherClient.connection.bind('error', (error: any) => {
      console.error('❌ Global Pusher error:', error);
    });

    setPusher(pusherClient);

    return () => {
      console.log('🧹 Cleaning up global Pusher instance');
      pusherClient.disconnect();
    };
  }, []);

  return (
    <PusherContext.Provider value={{ pusher, isConnected }}>
      {children}
    </PusherContext.Provider>
  );
}

export const usePusher = () => useContext(PusherContext);