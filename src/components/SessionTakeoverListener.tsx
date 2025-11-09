// components/SessionTakeoverListener.tsx
'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useLogout } from '@/context/LogoutContext';

export default function SessionTakeoverListener() {
  const { user } = useUser();
  const { handleGlobalLogout } = useLogout();
  const pathname = usePathname();
  
  const isHandlingTakeover = useRef(false);

  useEffect(() => {
    if (!user) return;



    return () => {
      isHandlingTakeover.current = false;
    };
  }, [user, handleGlobalLogout, pathname]);

  return null;
}