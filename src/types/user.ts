// src/types/user.ts
import { UserDocument } from '@/lib/models/User';
import { Types } from 'mongoose';

// 🔹 Convert Mongo Date fields → string
type DateToString<T> = {
  [K in keyof T]: T[K] extends Date | null | undefined ? string | null : T[K];
};

// 🔹 Derive a frontend-friendly BaseUser
export type BaseUser = DateToString<
  Omit<UserDocument, 'passwordHash' | 'sessionToken' | 'sessionCreatedAt' | 'sessionExpiresAt'>
> & {
  lastLogin?: string | null;
  createdBy: string; // The creator's name
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
};

// 🔹 For user creation (frontend sends this)
export type CreateUserData = Pick<
  UserDocument,
  'email' | 'username' | 'name' | 'role'
> & { 
  password: string;
};

// 🔹 For backend user creation (what the API receives + adds)
export type CreateUserInput = CreateUserData & {
  createdBy?: string | Types.ObjectId;
};

export interface UsersResponse {
  status: 'success' | 'error';
  users: BaseUser[];
  message?: string;
}

export interface CreateUserResponse {
  status: 'success' | 'error';
  user?: BaseUser;
  message?: string;
}