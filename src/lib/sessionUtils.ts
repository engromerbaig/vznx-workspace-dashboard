// src/lib/sessionUtils.ts
import crypto from 'crypto';

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function isSessionExpired(sessionCreatedAt: Date, maxAgeInHours: number = 24): boolean {
  const now = new Date();
  const expirationTime = new Date(sessionCreatedAt.getTime() + (maxAgeInHours * 60 * 60 * 1000));
  return now > expirationTime;
}

export function shouldForceLogout(lastActivity: Date, inactivityLimitInHours: number = 2): boolean {
  const now = new Date();
  const inactivityLimit = new Date(lastActivity.getTime() + (inactivityLimitInHours * 60 * 60 * 1000));
  return now > inactivityLimit;
}