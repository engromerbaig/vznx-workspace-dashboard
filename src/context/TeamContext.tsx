// src/context/TeamContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  maxCapacity: number;
  taskCount: number;
  capacity: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TeamContextType {
  teamMembers: TeamMember[];
  availableMembers: TeamMember[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>; // ← MUST BE HERE
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/team?limit=100');
      const data = await res.json();

      if (data.status === 'success') {
        setTeamMembers(data.teamMembers);
      } else {
        setError(data.message || 'Failed to load team');
      }
    } catch (err) {
        setError('Network error');
        console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchTeam();
  }, []);

  const availableMembers = teamMembers.filter(m => m.isAvailable);

  return (
    <TeamContext.Provider
      value={{
        teamMembers,
        availableMembers,
        loading,
        error,
        refresh: fetchTeam, // ← expose refresh
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) throw new Error('useTeam must be used within TeamProvider');
  return context;
}