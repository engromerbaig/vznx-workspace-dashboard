// hooks/usePusherConnection.ts
'use client';
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';

export function usePusherConnection() {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [pusher, setPusher] = useState<Pusher | null>(null);

  useEffect(() => {
    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    // Connection events
    pusherClient.connection.bind('connected', () => {
      console.log('✅ Pusher connected successfully!');
      setStatus('connected');
    });

    pusherClient.connection.bind('error', (err: any) => {
      console.error('❌ Pusher connection error:', err);
      setStatus('error');
    });

    pusherClient.connection.bind('disconnected', () => {
      console.log('🔌 Pusher disconnected');
      setStatus('connecting');
    });

    setPusher(pusherClient);

    return () => {
      pusherClient.disconnect();
    };
  }, []);

  return { status, pusher };
}