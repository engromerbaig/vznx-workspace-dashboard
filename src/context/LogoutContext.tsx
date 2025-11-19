// src/context/LogoutContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useUser } from './UserContext';

interface LogoutContextType {
  isLoggingOut: boolean;
  handleGlobalLogout: () => Promise<void>;
}

const LogoutContext = createContext<LogoutContextType | undefined>(undefined);

export function LogoutProvider({ children }: { children: React.ReactNode }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { setUser } = useUser();

const handleGlobalLogout = useCallback(async () => {
  if (isLoggingOut) return;
  
  setIsLoggingOut(true);
  
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    // Clear user state
    setUser(null);

  
    if (!response.ok) {
      console.warn('Logout API returned non-200 status');
    }

    // Force full page reload to ensure clean state
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
    
  } catch (err) {
    console.error('Global logout error:', err);
    setUser(null);
    setTimeout(() => {
      window.location.href = '/';
    }, 500);
  }
}, [isLoggingOut, setUser]);


  return (
    <LogoutContext.Provider value={{ isLoggingOut, handleGlobalLogout }}>
      {children}
    </LogoutContext.Provider>
  );
}

export function useLogout() {
  const context = useContext(LogoutContext);
  if (context === undefined) {
    throw new Error('useLogout must be used within a LogoutProvider');
  }
  return context;
}