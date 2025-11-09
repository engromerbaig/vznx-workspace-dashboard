// hooks/usePusher.ts
'use client';
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';

export function usePusher() {
  const [pusher, setPusher] = useState<Pusher | null>(null);

  useEffect(() => {
    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    
    setPusher(pusherClient);

    return () => {
      pusherClient.disconnect();
    };
  }, []);

  return pusher;
}