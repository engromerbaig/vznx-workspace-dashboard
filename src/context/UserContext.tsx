// src/context/UserContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { BaseUser } from '@/types/user';

interface UserContextType {
  user: BaseUser | null;
  setUser: (user: BaseUser | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BaseUser | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}