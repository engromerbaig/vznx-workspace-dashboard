// src/components/GlobalLogoutLoader.tsx
'use client';

import { useLogout } from '@/context/LogoutContext';
import Loader from './Loader';

export default function GlobalLogoutLoader() {
  const { isLoggingOut } = useLogout();

  if (!isLoggingOut) return null;

  return (
    <>
        <Loader text='Logging Out...'/>
    </>
  );
}