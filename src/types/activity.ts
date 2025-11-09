// src/types/activity.ts
export interface ActivityLog {
  _id: string;
  userId: string;
  userName: string;
  username?: string; // Make it optional since it might not always be present
  action: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  metadata?: any;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}