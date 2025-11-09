// src/lib/auth/session.ts
import { randomBytes } from 'crypto';

/**
 * Generate a secure random session token
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Check if a session is expired
 */
export function isSessionExpired(expiresAt: Date): boolean {
  return new Date() >= new Date(expiresAt);
}

/**
 * Get session duration in milliseconds
 */
export const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get session expiry date
 */
export function getSessionExpiry(): Date {
  return new Date(Date.now() + SESSION_DURATION);
}