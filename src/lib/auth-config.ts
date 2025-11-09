// src/lib/auth-config.ts

// Central configuration for authentication settings
export const AUTH_CONFIG = {
  // Inactivity timeout in minutes (1 minute for testing)
  INACTIVITY_TIMEOUT: 30, // Change to 10 for production
  
  // Warning settings
  WARNING: {
    COUNTDOWN: 30, // 30 seconds countdown
  },
  
  // Remember me settings
  REMEMBER_ME: {
    // Extended session duration for "Remember Me" (7 days)
    EXTENDED_TIMEOUT: 7 * 24 * 60, // 7 days in minutes
    // Cookie name for remember me preference
    COOKIE_NAME: 'remember_me',
  },
  
  // Session settings
  SESSION: {
    // Cookie name
    COOKIE_NAME: 'session_token',
    // HTTP-only cookie for security
    HTTP_ONLY: true,
    // Secure cookie in production
    SECURE: process.env.NODE_ENV === 'production',
    // SameSite policy
    SAME_SITE: 'strict' as const,
  },
  
  // API endpoints
  ENDPOINTS: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
    EXTEND_SESSION: '/api/auth/extend-session',
  },
} as const;

// Helper function to get timeout in milliseconds
export const getInactivityTimeoutMs = (rememberMe: boolean = false): number => {
  const timeoutMs = rememberMe 
    ? AUTH_CONFIG.REMEMBER_ME.EXTENDED_TIMEOUT * 60 * 1000 
    : AUTH_CONFIG.INACTIVITY_TIMEOUT * 60 * 1000;
  
  console.log(`⏰ Calculated timeout: ${timeoutMs}ms (${timeoutMs/1000/60} minutes)`);
  return timeoutMs;
}

// Helper to get warning countdown
export const getWarningCountdown = (): number => {
  console.log(`⏰ Warning countdown: ${AUTH_CONFIG.WARNING.COUNTDOWN} seconds`);
  return AUTH_CONFIG.WARNING.COUNTDOWN;
}