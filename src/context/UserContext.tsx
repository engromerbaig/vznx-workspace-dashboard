// context/UserContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  _id: string;
  username: string;
  email: string;
  name: string;
  role: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 STEP 1 — Hydrate instantly from localStorage (NO FLICKER)
  useEffect(() => {
    const savedUser = localStorage.getItem("vz_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser)); // instant user
    }
  }, []);

  // 🔥 STEP 2 — Verify session from backend as fallback
  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await fetch('/api/auth/verify-session', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);

          // Sync with localStorage again
          localStorage.setItem("vz_user", JSON.stringify(data.user));
        } else {
          setUser(null);
          localStorage.removeItem("vz_user");
        }
      } catch (error) {
        console.error('Session verification failed:', error);
        setUser(null);
        localStorage.removeItem("vz_user");
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
