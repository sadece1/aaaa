import { CookieOptions } from 'express';

/**
 * Secure Cookie Configuration
 * Implements OWASP and industry best practices for cookie security
 * 
 * Requirements:
 * - Secure: true in production, configurable in development
 * - HttpOnly: Prevents XSS attacks
 * - SameSite: Lax (recommended by security report)
 * - Path: / (root path)
 * 
 * Note: In development, if HTTPS is not available, set ALLOW_INSECURE_COOKIES=true
 * However, for production, secure MUST always be true.
 */
export const getSecureCookieOptions = (maxAge?: number): CookieOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowInsecure = process.env.ALLOW_INSECURE_COOKIES === 'true';
  
  // In production, secure MUST be true
  // In development, secure should be true if HTTPS is available
  // If HTTPS is not available in development, set ALLOW_INSECURE_COOKIES=true
  const secure = isProduction ? true : !allowInsecure;
  
  return {
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: secure, // Require HTTPS (configurable in development only)
    sameSite: 'lax', // CSRF protection - allows top-level navigation
    path: '/', // Available for all routes
    maxAge: maxAge || 7 * 24 * 60 * 60 * 1000, // Default: 7 days
    // Domain is intentionally omitted - cookie only for exact domain
  };
};

/**
 * Cookie options for authentication tokens
 */
export const getAuthCookieOptions = (): CookieOptions => {
  return getSecureCookieOptions(7 * 24 * 60 * 60 * 1000); // 7 days
};

/**
 * Cookie options for refresh tokens (longer expiration)
 */
export const getRefreshTokenCookieOptions = (): CookieOptions => {
  return getSecureCookieOptions(30 * 24 * 60 * 60 * 1000); // 30 days
};

/**
 * Cookie options for session cookies
 */
export const getSessionCookieOptions = (): CookieOptions => {
  return getSecureCookieOptions(24 * 60 * 60 * 1000); // 1 day
};

