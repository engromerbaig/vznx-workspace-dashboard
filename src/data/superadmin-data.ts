// data/superadmin-data.ts
import { FaUsers, FaHistory, FaUserPlus } from 'react-icons/fa';

export interface TabConfig {
  id: 'users' | 'activity' | 'create';
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const superAdminTabs: TabConfig[] = [
  { id: 'users', name: 'Users', icon: FaUsers },
  { id: 'activity', name: 'Activity Logs', icon: FaHistory },
  { id: 'create', name: 'Create User', icon: FaUserPlus },
];